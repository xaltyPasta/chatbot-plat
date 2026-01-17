import { chatModel } from "@/lib/gemini/client";
import { prisma } from "@/lib/db/prisma";
import type { Content, Part } from "@google/generative-ai";

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

  // 4️⃣ Build Gemini contents (TYPE SAFE)
  interface SystemPromptContent extends Content {
    role: "system";
    parts: [{ text: string }];
  }

  interface MessageContent extends Content {
    role: "user" | "assistant";
    parts: [{ text: string }];
  }

  interface FileContent extends Content {
    role: "user";
    parts: [{ fileData: { fileUri: string; mimeType: string } }];
  }

  const contents: (SystemPromptContent | MessageContent | FileContent)[] = [
    {
      role: "system",
      parts: [{ text: project.systemPrompt }],
    } as SystemPromptContent,

    ...chat.messages.map((m: { role: string; content: any; }): MessageContent => ({
      role: m.role as "user" | "assistant",
      parts: [{ text: m.content }],
    })),

    ...files.map((f: { geminiFileId: any; }): FileContent => ({
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
    } as MessageContent,
  ];

  // 5️⃣ Call Gemini (NO `files` FIELD)
  const result = await chatModel.generateContent({ contents });

  console.log(
    "GEMINI RESPONSE:",
    JSON.stringify(result.response, null, 2)
  );

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
