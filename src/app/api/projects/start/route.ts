import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { NextResponse } from "next/server";
import { chatModel } from "@/lib/gemini/client";
import { runGeminiChat } from "@/services/chat.service"; // ✅ Added import

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

    // CHECK 1: See the raw response object
    console.log("Gemini Raw Result:", JSON.stringify(titleResult, null, 2));

    // CHECK 2: Check if it was blocked by safety
    const safety = titleResult.response.promptFeedback;
    if (safety?.blockReason) {
      console.warn("Gemini blocked the prompt:", safety.blockReason);
    }

    const rawTitle = titleResult.response.text();
    console.log("Gemini Returned Text:", rawTitle);

    if (rawTitle) {
      projectName = rawTitle
        .replace(/["'.*#]/g, "") // Clean markdown and punctuation
        .trim()
        .slice(0, 50);
    }
  } catch (err: any) {
    // CHECK 3: Catch API Errors (Invalid Keys, Network, etc)
    console.error("Gemini API Error:", err.message);
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
   * 3️⃣ Trigger Gemini for the first message
   * This handles creating the ChatSession and saving both the 
   * user message and the assistant's reply.
   */
  try {
    await runGeminiChat({
      projectId: project.id,
      userId: dbUser.id,
      message: message,
    });
  } catch (err: any) {
    console.error("Error generating first AI response:", err.message);

    // Fallback: If AI fails, at least create the session so the page isn't broken
    const chat = await prisma.chatSession.create({
      data: { projectId: project.id, userId: dbUser.id }
    });
    await prisma.chatMessage.create({
      data: { chatSessionId: chat.id, role: "user", content: message }
    });
  }

  /**
   * 5️⃣ File handling (Gemini File API later)
   */
  if (file) {
    // placeholder — Gemini File API integration
  }

  return NextResponse.json({ projectId: project.id });
}