
const projectConfigPath = `${bucketPath}/json/projects.json`;
const projectAssetsPath = `${bucketPath}/assets/projects`;
const projectMdPath = `${bucketPath}/md/projects`;

async function populatePage() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    const projectName = params.get("name");

    let githubUrl;

    try {
        const response = await fetch(projectConfigPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const project = data[projectName];
        if (project.hasOwnProperty("github")) {
            githubUrl = project["github"];
        } 

        document.title = `${project["title"]} - project`;

        // Description
        const descriptionDiv = document.getElementById("description");
        const summaryDiv = document.getElementById("summary");

        const date = descriptionDiv.querySelector("#date");
        const topics = descriptionDiv.querySelector("#topics");

        const subtitle = summaryDiv.querySelector("h3");
        const summary = summaryDiv.querySelector("p");

        if (project.hasOwnProperty("sub-title")) {
            subtitle.innerHTML = project["sub-title"];
            summary.innerHTML = project["summary"];
        }
        date.innerHTML = project["info"]["date"];
        topics.innerHTML = project["info"]["topics"].join(' | ');

        // Gallery
        if (project.hasOwnProperty("gallery")) {
            const gallery = document.querySelector(".gallery");
            for (const imgPath of project["gallery"]) {
                const image = document.createElement("img");
                image.src = `${projectAssetsPath}/${projectName}/${imgPath}`;
                image.alt = `gallery-img`;
                gallery.appendChild(image);
            }
        }
    }
    catch (error) {
        console.error('Error fetching or processing projects.json:', error);
    }

    if (githubUrl) {
        await loadMarkdown(`${githubUrl}/README.md`);
        addSrcPrefix(`${githubUrl}/`, document.getElementById("content"));
    } 
    else {
        await loadMarkdown(`${projectMdPath}/${projectName}.md`);
        addSrcPrefix(`${projectAssetsPath}/${projectName}/`, document.getElementById("content"));
    }

    addTocLinkEvent();
    createAndAttachModal();
}
