import { chatModel } from "@/lib/gemini/client";
import { prisma } from "@/lib/db/prisma";
import type { Content, Part } from "@google/generative-ai";

const MAX_HISTORY_MESSAGES = 10;

export async function runGeminiChat({
  projectId,
  userId,
  message,
  fileUri,
  fileMime,
}: {
  projectId: string;
  userId: string;
  message: string;
  fileUri?: string;
  fileMime?: string;
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

  // 3️⃣ Fetch Gemini file references (previously uploaded files)
  const existingFiles = await prisma.projectFileReference.findMany({
    where: { projectId },
  });

  // 4️⃣ Build the current message parts
  const currentMessageParts: Part[] = [{ text: message }];

  // If a file was just uploaded in this request, add it to the active prompt
  if (fileUri) {
    currentMessageParts.push({
      fileData: {
        fileUri: fileUri,
        mimeType: fileMime || "application/octet-stream",
      },
    });
  }

  // 5️⃣ Build Gemini contents
  const contents: Content[] = [
    {
      role: "user",
      parts: [{ text: `System Instruction: ${project.systemPrompt}` }],
    },
    // Historical messages
    ...chat.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    // All project file references for context
    ...existingFiles
      .filter(f => f.geminiFileId !== fileUri) // Avoid duplicating the file if it's the current one
      .map((f) => ({
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: f.geminiFileId,
              mimeType: f.mimeType,
            },
          },
        ],
      })),
    // The latest user message + any newly uploaded file
    {
      role: "user",
      parts: currentMessageParts,
    },
  ];

  // 6️⃣ Call Gemini
  const result = await chatModel.generateContent({ contents });

  const assistantReply =
    result.response.text() || "Sorry, I couldn't generate a response.";

  // 7️⃣ Persist messages
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