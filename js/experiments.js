
const experimentsConfigPath = `${bucketPath}/json/experiments.json`;
const experimentsAssetsPath = `${bucketPath}/assets/experiments`;

async function loadPage() {
    try {
        const response = await fetch(experimentsConfigPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const expContainer = document.getElementById("experiment-grid");

        for (const expName in data) {
            const expData = data[expName];

            const template = document.getElementById("exp-template").content.cloneNode(true);
            const img = template.querySelector("img")
            const link = template.querySelector(".img-link")
            const title = template.querySelector(".title");
            const summary = template.querySelector(".summary");
            const date = template.querySelector(".date");
            const topics = template.querySelector(".topics");

            img.src = `${experimentsAssetsPath}/${expName}/1.png`;
            title.innerHTML = expData["title"];
            summary.innerHTML = expData["summary"];
            topics.innerHTML = expData["info"]["topics"].join(' ~ ');
            date.innerHTML = expData["info"]["date"];

            expContainer.appendChild(template);
        }
    }
    catch (error) {
        console.error('Error fetching or processing projects.json:', error);
    }
}
