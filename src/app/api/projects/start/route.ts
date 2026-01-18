import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { NextResponse } from "next/server";
import { chatModel } from "@/lib/gemini/client";
import { runGeminiChat } from "@/services/chat.service";
import { uploadFileToGemini } from "@/services/file.service";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /**
   * 🔒 Resolve DB user explicitly
   */
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!dbUser) {
    return NextResponse.json(
      { error: "User not found in database" },
      { status: 401 }
    );
  }

  const formData = await req.formData();
  const message = formData.get("message") as string | null;
  const file = formData.get("file") as File | null;

  if (!message || !message.trim()) {
    return NextResponse.json(
      { error: "Message required" },
      { status: 400 }
    );
  }

  /**
   * 🧠 1️⃣ Generate project name using Gemini
   */
  let projectName = "New Project";

  try {
    const titleResult = await chatModel.generateContent([
      {
        text: `Message: "${message}" \n\n Generate a 3-word title for a project based on the message above. Output ONLY the title text.`,
      },
    ]);

    const rawTitle = titleResult.response.text();

    if (rawTitle) {
      projectName = rawTitle
        .replace(/["'.*#]/g, "") // Clean markdown and punctuation
        .trim()
        .slice(0, 50);
    }
  } catch (err: any) {
    console.error("Gemini Title API Error:", err.message);
  }

  /**
   * 2️⃣ Create Project
   */
  const project = await prisma.project.create({
    data: {
      userId: dbUser.id,
      name: projectName,
      systemPrompt: "You are a helpful assistant.",
    },
  });

  /**
   * 3️⃣ Handle File Upload to Gemini & DB
   */
  let geminiFileUri: string | undefined;
  let fileMimeType: string | undefined;

  if (file && file.size > 0) {
    try {
      fileMimeType = file.type || "application/octet-stream";
      // Upload via your file service
      geminiFileUri = await uploadFileToGemini(file);

      // Save reference to DB using your exact schema fields
      await prisma.projectFileReference.create({
        data: {
          projectId: project.id,
          geminiFileId: geminiFileUri,
          originalFilename: file.name,
          mimeType: fileMimeType,
        },
      });
    } catch (uploadErr: any) {
      console.error("File handling failed:", uploadErr.message);
      // We continue even if file fails so the project is still created
    }
  }

  /**
   * 4️⃣ Trigger Gemini for the first message
   */
  try {
    await runGeminiChat({
      projectId: project.id,
      userId: dbUser.id,
      message: message,
      fileUri: geminiFileUri, // Pass the URI to the service
      fileMime: fileMimeType,
    });
  } catch (err: any) {
    console.error("Error generating first AI response:", err.message);

    // Fallback: If AI fails, create the session so the page isn't broken
    const chat = await prisma.chatSession.create({
      data: { projectId: project.id, userId: dbUser.id }
    });
    await prisma.chatMessage.create({
      data: { chatSessionId: chat.id, role: "user", content: message }
    });
  }

  return NextResponse.json({ projectId: project.id });
}