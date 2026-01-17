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
    const [isOpen, setIsOpen] = useState(false);

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

    const deleteProject = async (projectId: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;

        try {
            const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
            if (res.ok) {
                setProjects(projects.filter(p => p.id !== projectId));
                if (pathname === `/projects/${projectId}`) router.push("/projects");
            }
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                className="btn btn-light d-md-none position-fixed shadow-sm"
                style={{ top: "15px", left: "15px", zIndex: 1100, borderRadius: "50%", width: "45px", height: "45px" }}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? "✕" : "☰"}
            </button>

            {isOpen && (
                <div
                    className="position-fixed w-100 h-100 d-md-none"
                    style={{ background: "rgba(0,0,0,0.3)", zIndex: 1080, top: 0, left: 0, backdropFilter: "blur(4px)" }}
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div
                className={`d-flex flex-column transition-all position-fixed position-md-relative h-100 shadow-sm`}
                style={{
                    width: 280,
                    zIndex: 1090,
                    left: isOpen ? 0 : "-280px",
                    transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    backgroundColor: "#f9f9f9",
                    borderRight: "1px solid #e5e5e5"
                }}
            >
                {/* Brand Header */}
                <div className="p-4 d-flex align-items-center">
                    <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center me-2" style={{ width: "32px", height: "32px" }}>
                        <span className="text-white fw-bold">C</span>
                    </div>
                    <h5 className="mb-0 fw-bold text-dark">Chatbot Platform</h5>
                </div>

                <div className="px-3 mb-4">
                    <button
                        className="btn btn-white border shadow-sm w-100 d-flex align-items-center justify-content-center py-2"
                        style={{ borderRadius: "10px", fontWeight: "500", backgroundColor: "#fff" }}
                        onClick={() => router.push("/projects")}
                    >
                        <span className="me-2" style={{ fontSize: "1.2rem" }}>+</span> New Project
                    </button>
                </div>

                <div className="flex-grow-1 overflow-auto px-2">
                    <small className="text-muted ps-3 mb-2 d-block text-uppercase fw-bold" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>
                        Recent Projects
                    </small>
                    <div className="list-group list-group-flush">
                        {projects.map((p) => {
                            const active = pathname === `/projects/${p.id}`;
                            return (
                                <div
                                    key={p.id}
                                    className={`list-group-item list-group-item-action d-flex align-items-center border-0 px-3 py-2 mb-1 rounded-3 transition-all ${active ? "bg-white shadow-sm border" : "bg-transparent text-secondary"}`}
                                    style={{ cursor: "pointer", fontSize: "0.9rem" }}
                                    onClick={() => router.push(`/projects/${p.id}`)}
                                >
                                    {editingId === p.id ? (
                                        <input
                                            className="form-control form-control-sm border-primary"
                                            autoFocus
                                            value={tempName}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => setTempName(e.target.value)}
                                            onBlur={() => renameProject(p.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") renameProject(p.id);
                                                if (e.key === "Escape") setEditingId(null);
                                            }}
                                        />
                                    ) : (
                                        <>
                                            <span className={`text-truncate flex-grow-1 ${active ? "fw-bold text-dark" : ""}`}>
                                                {p.name}
                                            </span>

                                            <div className="options-hover">
                                                <button
                                                    className="btn btn-sm p-0 me-2 text-muted hover-primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingId(p.id);
                                                        setTempName(p.name);
                                                    }}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn btn-sm p-0 text-muted hover-danger"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteProject(p.id);
                                                    }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .hover-bg-light:hover { background-color: #f1f1f1; }
                .hover-primary:hover { color: #0d6efd !important; }
                .hover-danger:hover { color: #dc3545 !important; }
                
                @media (min-width: 768px) {
                    div.position-fixed {
                        position: relative !important;
                        left: 0 !important;
                    }
                }

                .options-hover {
                    display: none;
                }

                .list-group-item:hover .options-hover {
                    display: flex;
                }

                .list-group-item.active .options-hover {
                    display: flex;
                }
            `}</style>
        </>
    );
}