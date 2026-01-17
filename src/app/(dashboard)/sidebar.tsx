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
    const [isOpen, setIsOpen] = useState(false); // Controls mobile visibility

    const router = useRouter();
    const pathname = usePathname();

    const fetchProjects = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/projects");
            if (res.status === 401) {
                setProjects([]);
                return;
            }
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setProjects(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading projects:", error);
            setProjects([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
        const handler = () => fetchProjects();
        window.addEventListener("projects-updated", handler);
        return () => window.removeEventListener("projects-updated", handler);
    }, [fetchProjects]);

    // Close sidebar automatically when navigating on mobile
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const renameProject = async (projectId: string) => {
        const projectToUpdate = projects.find((p) => p.id === projectId);
        if (!tempName.trim() || tempName === projectToUpdate?.name) {
            setEditingId(null);
            return;
        }

        const previousProjects = [...projects];
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
            window.dispatchEvent(new Event("projects-updated"));
        } catch (error) {
            console.error("Rename failed:", error);
            setProjects(previousProjects);
            alert("Failed to rename project.");
        }
    };

    return (
        <>
            {/* Mobile Toggle Button (Three Lines) */}
            <button
                className="btn btn-dark d-md-none position-fixed"
                style={{ top: "10px", left: "10px", zIndex: 1100, borderRadius: "8px" }}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? "✕" : "☰"}
            </button>

            {/* Sidebar Overlay (Mobile only - clicks to close) */}
            {isOpen && (
                <div
                    className="position-fixed w-100 h-100 d-md-none"
                    style={{ background: "rgba(0,0,0,0.5)", zIndex: 1080, top: 0, left: 0 }}
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div
                className={`border-end p-3 d-flex flex-column bg-light transition-all position-fixed position-md-relative h-100`}
                style={{
                    width: 260,
                    zIndex: 1090,
                    left: isOpen ? 0 : "-260px", // Hidden by default on mobile
                    transition: "left 0.3s ease",
                }}
            >
                {/* Desktop and mobile inner spacing for the button */}
                <div className="d-md-none mb-4" style={{ height: "40px" }} />

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
                                className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between ${active ? "active" : ""}`}
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
                                            className="btn btn-sm p-0 opacity-50"
                                            onClick={(e) => {
                                                e.stopPropagation();
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
                </div>
            </div>

            {/* Injected CSS for Desktop view */}
            <style jsx>{`
                @media (min-width: 768px) {
                    div.position-fixed {
                        position: relative !important;
                        left: 0 !important;
                    }
                }
            `}</style>
        </>
    );
}