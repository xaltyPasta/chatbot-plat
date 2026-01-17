"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
    const params = useSearchParams();
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState(params.get("email") || "");
    const [password, setPassword] = useState("");

    const handleSignup = async () => {
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        if (res.ok) {
            router.push("/login");
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: 420 }}>
            <h3 className="mb-3">Create Account</h3>

            <input
                className="form-control mb-2"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <input
                className="form-control mb-2"
                placeholder="Email"
                value={email}
                onChange={(e)=> setEmail(e.target.value)}
            />

            <input
                className="form-control mb-3"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button className="btn btn-success w-100" onClick={handleSignup}>
                Sign Up
            </button>
        </div>
    );
}
