import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";
import { uploadFileToGemini } from "@/services/file.service";

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
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            userId: dbUser.id,
        },
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
        return NextResponse.json({ error: "File required" }, { status: 400 });
    }

    try {
        // ☁️ upload to Gemini (Returns the file URI)
        const geminiFileId = await uploadFileToGemini(file);

        // 💾 Store reference with MIME TYPE
        await prisma.projectFileReference.create({
            data: {
                projectId: project.id,
                geminiFileId,
                originalFilename: file.name,
                mimeType: file.type, // 👈 CRITICAL: Gemini needs 'application/pdf'
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("File Upload Error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}

/**
 * DELETE: Clear files for this project 
 * Used for the "Cancel/Clear" functionality
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

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to clear files" }, { status: 500 });
    }
}