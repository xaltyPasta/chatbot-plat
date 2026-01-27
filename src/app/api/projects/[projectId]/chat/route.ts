import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { chatModel } from "@/lib/gemini/client";

/**
 * GET: Fetch chat history for the project
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    const { projectId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) return NextResponse.json([], { status: 401 });

    const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!dbUser) return NextResponse.json([], { status: 401 });

    const messages = await prisma.chatMessage.findMany({
        where: {
            chatSession: {
                projectId: projectId,
                userId: dbUser.id
            }
        },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            role: true,
            content: true,
        }
    });

    return NextResponse.json(messages);
}

/**
 * POST: Send message and include the latest uploaded file context
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    const { projectId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Capture 'hasFile' from the frontend request
    const { message, hasFile } = await req.json();

    if (!message?.trim()) {
        return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    try {
        // 1. Resolve or Create Chat Session
        let chatSession = await prisma.chatSession.findFirst({
            where: { projectId, userId: dbUser.id }
        });

        if (!chatSession) {
            chatSession = await prisma.chatSession.create({
                data: { projectId, userId: dbUser.id }
            });
        }

        // 2. Save User Message to DB
        await prisma.chatMessage.create({
            data: {
                chatSessionId: chatSession.id,
                role: "user",
                content: message,
            }
        });

        // 3. Construct Multi-modal parts
        const promptParts: any[] = [{ text: message }];

        /**
         * LOGIC CHANGE: 
         * Only fetch and attach the file if the user explicitly uploaded one 
         * with this specific message (hasFile === true).
         */
        if (hasFile) {
            const latestFile = await prisma.projectFileReference.findFirst({
                where: { projectId: projectId },
                orderBy: { createdAt: "desc" },
            });

            if (latestFile) {
                promptParts.push({
                    fileData: {
                        mimeType: latestFile.mimeType,
                        fileUri: latestFile.geminiFileId,
                    },
                });
            }
        }

        // 4. Generate Response
        // Note: If hasFile is false, Gemini only receives the text.
        const result = await chatModel.generateContent({
            contents: [{ role: "user", parts: promptParts }],
        });

        const reply = result.response.text();

        // 5. Save Assistant Message
        await prisma.chatMessage.create({
            data: {
                chatSessionId: chatSession.id,
                role: "assistant",
                content: reply,
            }
        });

        return NextResponse.json({ reply });

    } catch (error: any) {
        console.error("Chat Error:", error);
        return NextResponse.json(
            { error: "Failed to process chat", details: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE: Clear all file references for this project
 */
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    const { projectId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await prisma.projectFileReference.deleteMany({
            where: { projectId: projectId }
        });

        return NextResponse.json({ success: true, message: "Files cleared" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to clear files" }, { status: 500 });
    }
}