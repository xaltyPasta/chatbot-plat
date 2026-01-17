import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import Sidebar from "./sidebar";
import UserDropdown from "./UserDropDown";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    // Server-side protection
    if (!session?.user) redirect("/login");

    return (
        <div className="d-flex vh-100 overflow-hidden">
            {/* 1. The Collapsible Sidebar */}
            <Sidebar />

            {/* 2. Main Content Area */}
            <main className="flex-grow-1 position-relative overflow-auto h-100">
                {/* UserDropdown is 'position-fixed' in its own file, 
                   so it will stay in the top-right corner of the viewport.
                */}
                <UserDropdown />

                {/* Add padding-top on mobile (pt-5) so the children don't 
                   overlap with the hamburger menu button (☰).
                */}
                <div className="p-3 p-md-4 pt-5 pt-md-4">
                    {children}
                </div>
            </main>
        </div>
    );
}