/*
 * cdn-proxy.ts
 * Copyright (C) 2025 stantonik <stantonik@stantonik-mba.local>
 *
 * Distributed under terms of the MIT license.
 */

import fetch from "node-fetch";

// --- Cache manifest in memory with TTL ---
let assetManifest: Record<string, string> = {};
let manifestTimestamp = 0; // in milliseconds
const MANIFEST_TTL = 10 * 60 * 1000; // 10 minute

const ALLOWED_ORIGINS = [
    "http://localhost:8000",
    "https://stanleyarnaud.vercel.app"
];

async function getManifest(): Promise<Record<string, string>> {
    const now = Date.now();
    if (assetManifest && now - manifestTimestamp < MANIFEST_TTL) {
        return assetManifest;
    }

    const CDN_BASE = process.env.CDN_BASE_URL!;
    const CDN_AUTH_TOKEN = process.env.CDN_AUTH_TOKEN!;
    const res = await fetch(`${CDN_BASE}/assets-manifest.json`, {
        headers: {
            "x-cdn-auth-token": `${CDN_AUTH_TOKEN}`,
        },
    });

    if (!res.ok) throw new Error("Failed to fetch assets-manifest.json");

    assetManifest = await res.json() as Record<string, string>;;
    manifestTimestamp = now;
    return assetManifest;
}

export default async function handler(req: any, res: any) {
    // --- Dynamic CORS ---
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    const file = req.query.file;
    if (!file || typeof file !== "string") {
        return res.status(400).json({ error: "Missing 'file' query parameter" });
    }

    try {
        const manifest = await getManifest();
        const hashedFile = manifest[file];
        if (!hashedFile) {
            return res.status(404).json({ error: "File not found in manifest" });
        }

        const CDN_BASE = process.env.CDN_BASE_URL!;
        const CDN_AUTH_TOKEN = process.env.CDN_AUTH_TOKEN!;
        const targetUrl = `${CDN_BASE}/${hashedFile}`;

        // Prepare request headers
        const headers: Record<string, string> = {
            ...req.headers,
            "x-cdn-auth-token": CDN_AUTH_TOKEN,
        } as any;
        delete headers.host;
        delete headers.connection;

        // 🚀 Use node-fetch with compress: false
        const response = await fetch(targetUrl, {
            method: req.method,
            headers,
            compress: false, // keep gzip/br intact
        });

        // Forward status
        res.status(response.status);

        // Forward headers (skip ones that break streaming)
        response.headers.forEach((value: string, key: string) => {
            if (!["transfer-encoding", "content-length"].includes(key.toLowerCase())) {
                res.setHeader(key, value);
            }
        });

        // Override cache control for Vercel
        const MAX_VERSEL_TTL = 31536000; // 1 year
        res.setHeader("Cache-Control", `s-maxage=${MAX_VERSEL_TTL}, stale-while-revalidate=60`);

        // Stream body untouched
        if (response.body) {
            response.body.pipe(res);
        } else {
            res.status(204).end();
        }
    } catch (err) {
        console.error("CDN Proxy error:", err);
        res.status(500).json({ error: "Failed to fetch asset" });
    }
}

