
const projectConfigPath = `${bucketPath}/json/projects.json`;
const projectAssetsPath = `${bucketPath}/assets/projects`;

let projectHeading;
window.addEventListener('scroll', () => {
    let currentScrollPos = window.scrollY;
    let threshold = window.innerHeight * 0.8;

    let opacity = 1 - Math.min(currentScrollPos / threshold, 1);

    projectHeading.style.opacity = opacity;
});

window.addEventListener('scroll', updateVisibleProjects);
window.addEventListener('resize', updateVisibleProjects);

window.addEventListener("load", () => { 
    projectHeading = document.getElementById("projects-heading"); 
})

let previousAspectRatio = window.innerWidth / window.innerHeight;
window.addEventListener("resize", () => {
    const currentAspectRatio = window.innerWidth / window.innerHeight;
    const threshold = 10/9;

    if (previousAspectRatio <= threshold && currentAspectRatio > threshold) {
        populateProject();
    } 
    else if (previousAspectRatio > threshold && currentAspectRatio <= threshold) {
        populateProject();
    }

    previousAspectRatio = currentAspectRatio;
});

function populateProject() {
    const projectContainer = document.getElementById("projects-container");
    projectContainer.innerHTML = "";

    let centered = false;
    let templateID = "project-template-center";

    if (window.innerWidth / window.innerHeight <= 10/9) {
        centered = true;
    }

    fetch(projectConfigPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            let i = 0;
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    const project = data[key];

                    if (!centered) {
                        templateID = `project-template-${i % 2 === 0 ? "right" : "left"}`;
                    }
                    const template = document.getElementById(templateID).content.cloneNode(true);
                    const img = template.querySelector("img")
                    const link = template.querySelector("a")
                    const title = template.querySelector(".title");
                    const summary = template.querySelector(".summary");
                    const date = template.querySelector(".date");
                    const topics = template.querySelector(".topics");

                    if (project["img"].includes("http")) {
                        img.src = project["img"];
                    }
                    else {
                        img.src = `${projectAssetsPath}/${key}/${project["img"]}`;
                    }
                    link.href = `pages/project.html?name=${key}`;
                    title.innerHTML = project["title"];
                    summary.innerHTML = project["summary"];

                    topics.innerHTML = project["info"]["topics"].join(' ~ ');
                    date.innerHTML = project["info"]["date"];

                    projectContainer.appendChild(template);
                }
                i++;
            }

            updateVisibleProjects();
        })
        .catch(error => {
            console.error('Error fetching or processing projects.json:', error);
        });
}

function updateVisibleProjects() {
    const projects = document.querySelectorAll("#projects-container .project");

    for (const project of projects) {
        const rect = project.getBoundingClientRect();
        if (rect.top < window.innerHeight - rect.height / 8) {
            project.classList.add("show");
        }
        else {
            project.classList.remove("show");
        }
    }
}
