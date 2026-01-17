import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// app/api/projects/[projectId]/route.ts

// app/api/projects/[projectId]/route.ts

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Get User
        const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 401 });

        // 2. Delete the project ensuring it belongs to this user
        // We use deleteMany so we can include the userId filter for security
        const deleteOp = await prisma.project.deleteMany({
            where: {
                id: projectId,
                userId: dbUser.id,
            },
        });

        if (deleteOp.count === 0) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API DELETE ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> } // 1. Define as a Promise
) {
    // 2. Await the params before using them
    const { projectId } = await params;

    if (!projectId) {
        return NextResponse.json({ error: "Missing Project ID" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 401 });

    const { name } = await req.json();

    try {
        // Use update instead of updateMany for better safety
        const updatedProject = await prisma.project.update({
            where: {
                id: projectId,
                userId: dbUser.id,
            },
            data: {
                name: name.trim(),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}