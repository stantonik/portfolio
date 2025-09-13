/*
 * utils.ts
 * Copyright (C) 2025 stantonik <stantonik@stantonik-mba.local>
 *
 * Distributed under terms of the MIT license.
 */

export function getAssetUrl(path: string): string {
    const isLocal = import.meta.env.VITE_LOCAL_ASSET === "true";

    if (isLocal) {
        const base = import.meta.env.VITE_LOCAL_ASSET_BASE;
        return `${base}/${path}`
    } 
    else {
        const base = import.meta.env.VITE_CDN_ASSET_BASE;
        return `${base}?file=${encodeURIComponent(path)}`
    }
}  
