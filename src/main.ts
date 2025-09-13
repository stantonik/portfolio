/*
 * main.ts
 * Copyright (C) 2025 stantonik <stantonik@stantonik-mba.local>
 *
 * Distributed under terms of the MIT license.
 */

import './css/style.css'
import { handleRoute } from "./router";

// Listen for initial load and hash/url changes
window.addEventListener("DOMContentLoaded", () => {
    handleRoute(location.pathname);
});

window.addEventListener("popstate", () => {
    handleRoute(location.pathname);
});

document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    if (target.matches("a[data-link]")) {
        e.preventDefault();
        const href = target.getAttribute("href");
        if (href) {
            history.pushState(null, "", href);
            handleRoute(href);
        }
    }
});
