import { chatModel } from "@/lib/gemini/client";
import { prisma } from "@/lib/db/prisma";
import type { Content } from "@google/generative-ai";

const MAX_HISTORY_MESSAGES = 10;

export async function runGeminiChat({
  projectId,
  userId,
  message,
}: {
  projectId: string;
  userId: string;
  message: string;
}) {
  // 1️⃣ Fetch project
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // 2️⃣ Fetch or create chat session
  let chat = await prisma.chatSession.findFirst({
    where: { projectId, userId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: MAX_HISTORY_MESSAGES,
      },
    },
  });

  if (!chat) {
    chat = await prisma.chatSession.create({
      data: { projectId, userId },
      include: { messages: true },
    });
  }

  // 3️⃣ Fetch Gemini file references
  const files = await prisma.projectFileReference.findMany({
    where: { projectId },
  });

  // 4️⃣ Build Gemini contents (Correctly mapping assistant -> model)
  const contents: Content[] = [
    {
      role: "user",
      parts: [{ text: `System Instruction: ${project.systemPrompt}` }],
    },
    ...chat.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    ...files.map((f) => ({
      role: "user",
      parts: [
        {
          fileData: {
            fileUri: f.geminiFileId,
            mimeType: "application/octet-stream",
          },
        },
      ],
    })),
    {
      role: "user",
      parts: [{ text: message }],
    },
  ];

  // 5️⃣ Call Gemini
  const result = await chatModel.generateContent({ contents });

  const assistantReply =
    result.response.candidates?.[0]?.content?.parts?.[0]?.text ??
    "Sorry, I couldn't generate a response.";

  // 6️⃣ Persist messages
  await prisma.chatMessage.createMany({
    data: [
      {
        chatSessionId: chat.id,
        role: "user",
        content: message,
      },
      {
        chatSessionId: chat.id,
        role: "assistant",
        content: assistantReply,
      },
    ],
  });

  return assistantReply;
}