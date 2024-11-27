
async function populateExperiments()
{
        const schoolProjects = await fetch("./static/experiments/school/config.json").then(res => res.json());

        const template = document.getElementById("exp-template");
        const schoolGrid = document.getElementById("school").querySelector(".photo-grid");

        for (const name of Object.keys(schoolProjects)) {
                const project = schoolProjects[name];

                let projDiv = document.createElement("div");
                projDiv.appendChild(template.content.cloneNode(true));
                projDiv.classList = template.classList;

                projDiv.querySelector("h3").innerHTML = project.title;
                projDiv.querySelector("p span.year").innerHTML = project.year;
                projDiv.querySelector("p span.topics").innerHTML = project.topics.join(', ');
                projDiv.querySelector("p.summary").innerHTML = project.summary;

                const img_dir = `./static/experiments/school/${name}/`;
                const img = projDiv.querySelector("img");
                img.src = `${img_dir}0.webp`;

                projDiv.addEventListener("mousemove", (event) => {
                        var rect = event.target.getBoundingClientRect();
                        xpos = (event.clientX - rect.left) / rect.width;

                        let img_id = Math.max(Math.floor(xpos * project.img_cnt), 0);

                        img.src = `${img_dir}${img_id}.webp`;
                })

                schoolGrid.appendChild(projDiv);
        }
}

