"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react"; // 1. Import Suspense

function SignupForm() { // 2. Move logic into a sub-component
    const params = useSearchParams();
    const router = useRouter();

    const [name, setName] = useState("");
    // We move the default email check inside the component
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
                onChange={(e) => setEmail(e.target.value)}
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

// 3. Export the page wrapped in Suspense
export default function SignupPage() {
    return (
        <Suspense fallback={<div className="text-center mt-5">Loading...</div>}>
            <SignupForm />
        </Suspense>
    );
}