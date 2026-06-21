"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiResponse {
  detail?: string;
  name?: string;
  [key: string]: unknown;
}

export default function RegistrationPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams ? searchParams.get("event_id") ?? "" : "";
  const [teamName, setTeamName] = useState("");
  const [memberIds, setMemberIds] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!eventId) {
      setError("Missing event ID in URL query string.");
      return;
    }

    if (!teamName.trim()) {
      setError("Team name is required.");
      return;
    }

    const token = typeof window !== "undefined" ? window.localStorage.getItem("access_token") : null;
    if (!token) {
      setError("Please log in before registering.");
      return;
    }

    const payload = {
      name: teamName.trim(),
      members: memberIds
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    };

    const response = await fetch(`${API_BASE}/register/${eventId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json()) as ApiResponse;
      setError(body.detail || "Registration failed.");
      return;
    }

    const result = (await response.json()) as ApiResponse;
    setMessage(`Registered successfully: team ${result.name || "your team"}`);
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold mb-4">Event Registration</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Team Name</label>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="My Hackathon Team"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Additional Member IDs (comma separated)
          </label>
          <input
            value={memberIds}
            onChange={(e) => setMemberIds(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="uuid1, uuid2"
          />
        </div>

        <button
          type="submit"
          className="rounded bg-slate-900 px-4 py-2 text-white"
        >
          Register for Event
        </button>
      </form>

      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}