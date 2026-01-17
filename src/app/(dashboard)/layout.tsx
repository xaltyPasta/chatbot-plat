import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import Sidebar from "./sidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    return (
        <div className="d-flex vh-100">
            <Sidebar />
            <main className="flex-grow-1 p-4 overflow-auto">
                {children}
            </main>
        </div>
    );
}
