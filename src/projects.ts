import { cdnFileToUrl, getMarkdown } from "./utils";

interface ProjectMeta {
    title: string;
    desc: string;
    date: { month: number, year: number };
    tags: string[];
    thumbnail: string;
}

function parseProjectMeta(data: Record<string, any>): ProjectMeta {
    return {
        title: String(data.title ?? ""),
        desc: String(data.desc ?? ""),
        date: {
            month: Number(data.date?.month ?? 1),
            year: Number(data.date?.year ?? 1970),
        },
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        thumbnail: String(data.thumbnail ?? ""),
    };
}

export async function createProjectItem(name: string, _layout: string): Promise<HTMLElement | null> {
    const project_dir = `projects/${name}`;

    // Extract project metadata from md file
    let projMetaRaw;

    try {
        const result = await getMarkdown(cdnFileToUrl(`${project_dir}/${name}.md`));
        projMetaRaw = result.meta;
    }
    catch {
        return null;
    }

    const projMeta = parseProjectMeta(projMetaRaw);

    // Create HTML element
    const container = document.createElement("div");
    container.classList.add("projectContainer");
    // container.style.flexDirection = layout ? "row-reverse" : "row";

    const img = document.createElement("img");
    img.src = projMeta.thumbnail;
    img.alt = projMeta.title;

    const textContainer = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = projMeta.title;

    const desc = document.createElement("p");
    desc.textContent = projMeta.desc;

    textContainer.appendChild(title);
    textContainer.appendChild(desc);

    container.appendChild(img);
    container.appendChild(textContainer);

    return container;
}

export async function populateProjects(): Promise<HTMLElement> {
    const container = document.createElement("section");
    container.classList.add("projectSection");

    // Extract project list
    const response = await fetch(cdnFileToUrl("projects/projects.json"));
    if (!response.ok) {
        return container;
    }
    const raw = await response.json();

    const projectList: string[] = Array.isArray(raw) && raw.every(i => typeof i === "string") ? raw : [];

    // Populate the page

    const placeholders: HTMLElement[] = [];
    for (let i = 0; i < projectList.length; i++) {
        const placeholder = document.createElement('div');
        container.appendChild(placeholder);
        placeholders.push(placeholder);
    }

    // Populate in parallel
    projectList.forEach((name, index) => {
        createProjectItem(name, "caca").then(projDiv => {
            if (projDiv) {
                placeholders[index].replaceWith(projDiv);
                placeholders[index] = projDiv;
            }
        });
    });

    return container
}
