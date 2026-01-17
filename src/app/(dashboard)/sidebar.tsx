"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

type Project = {
    id: string;
    name: string;
};

export default function Sidebar() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempName, setTempName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const pathname = usePathname();

    // 1. Memoized fetch function to prevent unnecessary re-renders
    const fetchProjects = useCallback(async () => {
        try {
            const res = await fetch("/api/projects");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setProjects(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading projects:", error);
            setProjects([]);
        }
    }, []);

    // 2. Setup Event Listeners
    useEffect(() => {
        fetchProjects();

        const handler = () => fetchProjects();
        window.addEventListener("projects-updated", handler);

        return () => window.removeEventListener("projects-updated", handler);
    }, [fetchProjects]);

    // 3. Rename with Optimistic UI Update
    const renameProject = async (projectId: string) => {
        const projectToUpdate = projects.find((p) => p.id === projectId);

        // Validation: Don't save if empty or unchanged
        if (!tempName.trim() || tempName === projectToUpdate?.name) {
            setEditingId(null);
            return;
        }

        // Capture old state for rollback in case of error
        const previousProjects = [...projects];

        // OPTIMISTIC UPDATE: Change UI immediately
        setProjects((prev) =>
            prev.map((p) => (p.id === projectId ? { ...p, name: tempName } : p))
        );
        setEditingId(null);

        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: tempName }),
            });

            if (!res.ok) throw new Error("Server failed to update");

            // Notify other components that data has changed
            window.dispatchEvent(new Event("projects-updated"));

        } catch (error) {
            console.error("Rename failed:", error);
            // ROLLBACK: Revert to previous state if API fails
            setProjects(previousProjects);
            alert("Failed to rename project. Please try again.");
        } finally {
            setTempName("");
        }
    };

    return (
        <div
            className="border-end p-3 d-flex flex-column"
            style={{ width: 260, background: "#f8f9fa", height: "100vh" }}
        >
            <button
                className="btn btn-primary mb-3 w-100"
                onClick={() => router.push("/projects")}
            >
                + New Project
            </button>

            <div className="list-group list-group-flush overflow-auto flex-grow-1">
                {projects.map((p) => {
                    const active = pathname === `/projects/${p.id}`;

                    return (
                        <div
                            key={p.id}
                            className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between ${active ? "active" : ""
                                }`}
                            style={{ cursor: "pointer", borderRadius: "4px", marginBottom: "2px" }}
                        >
                            {editingId === p.id ? (
                                <input
                                    className="form-control form-control-sm"
                                    autoFocus
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    onBlur={() => renameProject(p.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") renameProject(p.id);
                                        if (e.key === "Escape") setEditingId(null);
                                    }}
                                />
                            ) : (
                                <>
                                    <span
                                        className="text-truncate flex-grow-1 me-2"
                                        onClick={() => router.push(`/projects/${p.id}`)}
                                    >
                                        {p.name}
                                    </span>

                                    <button
                                        className="btn btn-sm p-0 opacity-50 hover-opacity-100"
                                        title="Rename"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent navigation
                                            setEditingId(p.id);
                                            setTempName(p.name);
                                        }}
                                    >
                                        ✏️
                                    </button>
                                </>
                            )}
                        </div>
                    );
                })}

                {projects.length === 0 && !isLoading && (
                    <div className="text-muted small px-2 mt-2">No projects yet</div>
                )}
            </div>
        </div>
    );
}