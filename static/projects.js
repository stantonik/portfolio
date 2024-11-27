var projects = []

class Project {
        constructor(id, config) {
                this.id = id;
                this.path = `./static/projects/${id}/`;
                this.config = config;
                this.projectSection = document.getElementById("projects");
        }

        writeDemo ()
        {
                const count = projects.length;

                const template = document.getElementById("project-template");
                let projSum = document.createElement("div");
                projSum.appendChild(template.content.cloneNode(true));

                if (count % 2 != 0)
                {
                        projSum.insertBefore(projSum.children[1], projSum.children[0]);
                        projSum.style.justifyContent = "flex-end";
                        projSum.children[0].style.textAlign = "right";
                }

                projSum.id = "project-" + String(count);
                projSum.classList = template.classList;
                let elmt = projSum.querySelector("#img");
                elmt.src = this.path + "demo.webp";
                elmt.id = "";

                elmt = projSum.querySelector("#title");
                elmt.innerHTML = this.config.name;
                elmt.id = "";

                elmt = projSum.querySelector("#description");
                elmt.innerHTML = this.config.summary;
                elmt.id = "";

                elmt = projSum.querySelector("#year");
                elmt.innerHTML = this.config.info.year;
                elmt.id = "";

                elmt = projSum.querySelector(".image-container");
                elmt.addEventListener("click", () => {
                        window.location.href = "project.html?id=" + this.id;
                })

                this.projectSection.appendChild(projSum); 
        }
}

async function populateProjects()
{
        let projectConfigs = await fetch("./static/projects/config.json").then(res => res.json())

        for (const projectName of Object.keys(projectConfigs)) {
                const config = projectConfigs[projectName];

                let proj = new Project(projectName, config);
                proj.writeDemo();
                projects.push(proj);
        }
}

async function writeProject()
{
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const id = params.get("id");

        let config = await fetch("./static/projects/config.json").then(res => res.json()).then(data => data[id]);
        const proj = new Project(id, config);

        document.title += " | " + proj.config.name;

        const info = document.getElementById("info");
        info.querySelector("#info-name").innerHTML = proj.config.name;
        info.querySelector("#info-year").innerHTML = proj.config.info.year;
        info.querySelector("#info-topics").innerHTML = proj.config.info.topics.join(' ');
        info.querySelector("#info-title").innerHTML = proj.config.title;
        info.querySelector("#info-summary").innerHTML = proj.config.summary;

        const main = document.getElementsByTagName("main")[0];

        for (const sectionName of Object.keys(proj.config.sections)) {
                const sectionData = proj.config.sections[sectionName];

                const template = document.getElementById("section-template");
                let sectionDiv = document.createElement("div");
                sectionDiv.appendChild(template.content.cloneNode(true));
                sectionDiv.classList = template.classList;

                const gallery = sectionDiv.querySelector(".gallery");
                const title = sectionDiv.querySelector("h2");
                const text = sectionDiv.querySelector("p");

                for (let i = 0; i < parseInt(sectionData.picture_cnt); i++) {
                        const image = document.createElement("img");
                        image.src = `${proj.path}${sectionName.toLowerCase().split(' ').join('_')}${i + 1}.webp`;
                        image.alt = `Image ${i + 1}`;
                        gallery.appendChild(image);
                }

                title.innerHTML = sectionName;
                text.innerHTML = sectionData.text;

                main.appendChild(sectionDiv);
        }
}
