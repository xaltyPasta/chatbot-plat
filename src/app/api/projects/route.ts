import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json([], { status: 401 });
  }

  /**
   * 🔒 Resolve DB user explicitly
   */
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!dbUser) {
    return NextResponse.json([], { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: dbUser.id }, // ✅ DB USER ID
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
    },
  });

  return NextResponse.json(projects);
}

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
      { error: "User not found" },
      { status: 401 }
    );
  }

  const { name, description } = await req.json();

  if (!name || !name.trim()) {
    return NextResponse.json(
      { error: "Name required" },
      { status: 400 }
    );
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      systemPrompt: "You are a helpful assistant.",
      userId: dbUser.id, // ✅ DB USER ID
    },
    select: {
      id: true,
      name: true,
    },
  });

  return NextResponse.json(project);
}
