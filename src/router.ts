/*
 * router.ts
 * Copyright (C) 2025 stantonik <stantonik@stantonik-mba.local>
 *
 * Distributed under terms of the MIT license.
 */

type RouteHandler = () => Promise<HTMLElement> | HTMLElement;

const routes: Record<string, RouteHandler> = {
    "/": () => import("./views/home").then(m => m.default()),
};

export async function handleRoute(path: string): Promise<void> {
    const app = document.querySelector("#app")!;
    const render = routes[path] || routes["/"];
    const view = await render();
    app.innerHTML = "";
    app.appendChild(view);
}

