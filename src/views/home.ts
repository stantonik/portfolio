
import '../css/projects.css'

import { populateProjects } from '../projects'

export default function Home(): HTMLElement {
    const container = document.createElement("div");

    const presSection = document.createElement("section");
    presSection.innerHTML = `
        <h1>Stanley Arnaud</h1>
    `;
    container.appendChild(presSection);

    populateProjects().then(projSection => {
        container.appendChild(projSection);
    });

    return container;
}
