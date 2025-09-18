/*
 * project.ts
 * Copyright (C) 2025 stantonik <stantonik@stantonik-mba.local>
 *
 * Distributed under terms of the MIT license.
 */

import markdownit from 'markdown-it'
import markdownItContainer from 'markdown-it-container'
import markdownItMedia from '@gotfeedback/markdown-it-media';
import hljs from 'highlight.js'
import matter from 'front-matter';

import { getAssetUrl } from "../utils";

import 'highlight.js/styles/github-dark.css';
import '../css/markdown.css'

type LinterType = "error" | "warning"
type LinterMessages = {
    [header: string]: string[]
}

function createLinterMessages(messages: LinterMessages, type: LinterType = "error"): HTMLElement {
    const div = document.createElement("div");
    for (const header in messages) {
        const container = document.createElement("div")
        container.className = `linter ${type}`

        // Header
        const headerEl = document.createElement("div")
        headerEl.className = "linter-header"
        headerEl.textContent = header + ":"
        container.appendChild(headerEl)

        // Messages as <ol>
        const list = document.createElement("ol")
        messages[header].forEach(msgText => {
            const item = document.createElement("li")
            item.textContent = msgText
            list.appendChild(item)
        })
        container.appendChild(list)
        div.appendChild(container)
    }
    return div;
}

export default async function Project(): Promise<HTMLElement> {
    const container = document.createElement("div");

    // Markdown init
    const md = markdownit({
        highlight: function(str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(str, { language: lang }).value;
                } catch (__) { }
            }

            return '';
        }
    });
    // Insert media plugin (mp4...)
    md.use(markdownItMedia, { controls: true });
    // Use custom container for layout (aka :::)
    md.use(markdownItContainer, 'inline');
    md.use(markdownItContainer, 'gallery');

    // Get project name
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');

    const projectDir = "projects/" + name;
    const projectMarkdownPath = `${projectDir}/${name}.md`;

    // Fetch and parse Markdown
    const url = getAssetUrl(projectMarkdownPath);
    const res = await fetch(url);
    if (!res.ok || !res.headers.get("Content-Type")?.includes("text/markdown")) {
        throw new Error(`Asset not found: ${url}`);
    }
    const raw = await res.text();
    const { attributes, body } = matter(raw) as any;
    const html = md.render(body);

    // Create metadata header div
    const headerDiv = document.createElement("div");
    {
        console.log(attributes.date);
        const date = new Date(attributes.date["year"], attributes.date["month"] - 1);
        console.log(date);
        const message: LinterMessages = {
            "Description": [attributes.desc, date.toLocaleString("en-US", { month: "short", year: "numeric" }) + " [" + attributes.status + "]"],
            "Tags": attributes.tags,
            "Links": attributes.links
        }
        headerDiv.appendChild(createLinterMessages(message, "error"));
    }

    // Create markdown div
    const markdownDiv = document.createElement("div");
    markdownDiv.id = "markdownContainer";
    markdownDiv.innerHTML = html;

    // Fix [src] attributes for relative paths
    const elements = markdownDiv.querySelectorAll('[src]:not([src^="http"])');
    elements.forEach(el => {
        const cleanedSrc = el.getAttribute("src")!.trim().replace(/^(\.\/|\/)+/, '');
        const url = getAssetUrl(`${projectDir}/${cleanedSrc}`);
        el.setAttribute("src", url);
    });

    markdownDiv.querySelectorAll('.gallery > p').forEach(p => {
        p.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== '') {
                const span = document.createElement('span');
                span.textContent = node.textContent;
                node.replaceWith(span);
            }
        });
    });

    // Create footer
    const footer = document.createElement("footer");
    footer.className = "vim-bar";

    // Left section
    const left = document.createElement("div");
    left.className = "vim-left";
    left.textContent = "NORMAL";

    // Center section
    const center = document.createElement("div");
    center.className = "vim-center";
    center.textContent = attributes.title.replace(/ /g, "_") + ".md";

    // Right section
    const right = document.createElement("div");
    right.className = "vim-right";
    right.textContent = "unix utf-8 100% 1:1";

    // Append children
    footer.appendChild(left)
    footer.appendChild(center)
    footer.appendChild(right)

    container.appendChild(headerDiv);
    container.appendChild(markdownDiv);
    container.appendChild(footer);


    return container;
}
