/*
 * cdn-proxy.js
 * Copyright (C) 2025 stantonik <stantonik@stantonik-mba.local>
 *
 * Distributed under terms of the MIT license.
 */

export default async function handler(req, res) {
    const { file } = req.query;

    // Validate environment variables early
    const { CDN_URL, CDN_AUTH_TOKEN } = process.env;
    if (!CDN_URL || !CDN_AUTH_TOKEN) {
        return res.status(500).send('Missing CDN environment variables');
    }

    if (!file) {
        return res.status(400).send('Missing file parameter');
    }

    // Sanitize `file`
    if (!/^[a-zA-Z0-9_\-./]+$/.test(file)) {
        return res.status(400).send('Invalid file parameter');
    }

    const fileUrl = `${CDN_URL}/${file}`;

    try {
        const cdnResponse = await fetch(fileUrl, {
            headers: {
                'x-cdn-auth-token': CDN_AUTH_TOKEN,
            },
        });

        if (!cdnResponse.ok) {
            return res.status(cdnResponse.status).send('Failed to fetch from CDN');
        }

        const headersToForward = [
            'content-type',
            'content-length',
            'content-disposition',
            'access-control-allow-origin',
        ];

        for (const header of headersToForward) {
            // Case-insensitive fetch of header value
            const value = [...cdnResponse.headers.entries()]
                .find(([key]) => key.toLowerCase() === header.toLowerCase())?.[1];

            if (value) {
                res.setHeader(header, value);
            }
        }

        // Add immutable caching header to improve performance
        res.setHeader('cache-control', 'public, max-age=600, immutable');

        const buffer = await cdnResponse.arrayBuffer();
        res.end(Buffer.from(buffer));
    } catch (error) {
        console.error('CDN Proxy Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

