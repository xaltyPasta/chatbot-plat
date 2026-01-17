"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function UserDropdown() {
    const { data: session, status } = useSession();

    // Don't render if not authenticated
    if (status !== "authenticated" || !session?.user) return null;

    // Get the first letter of the name (alias)
    const userAlias = session.user.name?.charAt(0).toUpperCase() || "U";

    return (
        <div className="dropdown position-fixed top-0 end-0 m-2 m-md-3" style={{ zIndex: 1100 }}>
            <button
                className="btn d-flex align-items-center border-0 p-0 shadow-none"
                type="button"
                id="userDropdownMenu"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                {/* Round Icon with User Alias */}
                <div
                    className="rounded-circle d-flex align-items-center justify-content-center shadow-sm hover-shadow transition-all text-white fw-bold"
                    style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "#0d6efd", // Professional primary blue
                        fontSize: "1.1rem",
                        transition: "transform 0.2s ease",
                        border: "2px solid white"
                    }}
                >
                    {userAlias}
                </div>
            </button>

            <ul
                className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 p-2"
                aria-labelledby="userDropdownMenu"
                style={{
                    minWidth: "240px",
                    borderRadius: "12px",
                    animation: "fadeIn 0.2s ease-out"
                }}
            >
                {/* User Info Header */}
                <li className="px-3 py-2 mb-2 border-bottom">
                    <div className="text-dark fw-bold text-truncate" style={{ fontSize: "0.95rem" }}>
                        {session.user.name}
                    </div>
                    <div className="text-muted text-truncate" style={{ fontSize: "0.8rem" }}>
                        {session.user.email}
                    </div>
                </li>

                {/* Action Items */}
                <li>
                    <button
                        className="dropdown-item rounded-2 py-2 d-flex align-items-center text-danger"
                        onClick={() => signOut({ callbackUrl: "/" })}
                    >
                        <span className="me-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0v2z" />
                                <path fillRule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3z" />
                            </svg>
                        </span>
                        Logout
                    </button>
                </li>
            </ul>

            <style jsx>{`
                .hover-shadow:hover {
                    transform: scale(1.08);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}