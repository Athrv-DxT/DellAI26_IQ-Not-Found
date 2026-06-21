"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiResponse {
  detail?: string;
  title?: string;
  [key: string]: unknown;
}

export default function SubmitProjectPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams ? searchParams.get("event_id") ?? "" : "";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [track, setTrack] = useState("");
  const [tags, setTags] = useState("");
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

    if (!title.trim()) {
      setError("Project title is required.");
      return;
    }

    const token = typeof window !== "undefined" ? window.localStorage.getItem("access_token") : null;
    if (!token) {
      setError("Please log in before submitting.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      github_url: githubUrl.trim() || undefined,
      demo_url: demoUrl.trim() || undefined,
      video_url: videoUrl.trim() || undefined,
      track: track.trim() || undefined,
      tags: tags
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    };

    const response = await fetch(`${API_BASE}/submit/${eventId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json()) as ApiResponse;
      setError(body.detail || "Project submission failed.");
      return;
    }

    const result = (await response.json()) as ApiResponse;
    setMessage(`Project submitted: ${result.title || "your project"}`);
      setTitle("");
      setDescription("");
      setGithubUrl("");
      setDemoUrl("");
      setVideoUrl("");
      setTrack("");
      setTags("");
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold mb-4">Submit Your Project</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Project Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="Project name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border px-3 py-2"
            rows={4}
            placeholder="Short project description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">GitHub URL</label>
          <input
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="https://github.com/your-team/repo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Demo URL</label>
          <input
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            const [validationError, setValidationError] = useState("");
            className="w-full rounded border px-3 py-2"
            placeholder="https://example.com/demo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Video URL</label>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="https://youtu.be/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Track</label>
          <input
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="AI / Sustainability / FinTech"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tech Stack Tags</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="python, react, flask"
          />
        </div>

        <button
          type="submit"
          className="rounded bg-slate-900 px-4 py-2 text-white"
        >
          Submit Project
        </button>
      </form>

      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}