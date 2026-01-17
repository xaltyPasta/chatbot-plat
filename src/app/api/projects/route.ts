import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

/**
 * Force Next.js to treat this route as dynamic. 
 * This is crucial to prevent the server from caching one user's project 
 * list and showing it to another user.
 */
export const dynamic = "force-dynamic";

/**
 * GET: Fetch only the projects belonging to the authenticated user
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  // 1. Check if session exists
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Resolve the unique database User ID from the session email
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User record not found" }, { status: 404 });
    }

    // 3. Fetch projects where userId matches the logged-in user's ID
    const projects = await prisma.project.findMany({
      where: {
        userId: dbUser.id // 🔒 This ensures strict data isolation
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true, // Included in case sidebar needs tooltips
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET_PROJECTS_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST: Create a new project for the authenticated user
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    // Create the project specifically linked to this user
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description || "",
        systemPrompt: "You are a helpful assistant.",
        userId: dbUser.id, // 🔒 Explicitly link to the DB User
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("CREATE_PROJECT_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}