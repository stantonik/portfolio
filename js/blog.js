

const blogAssetsPath = `${bucketPath}/assets/blog`;
const blogMdPath = `${bucketPath}/md/blog`;

let istoc = false;

async function loadPage() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    const relPageUrl = decodeURIComponent(params.get("page"));

    let pageUrl = relPageUrl;
    try {
        if (!pageUrl || pageUrl.length <= 0) {
            throw new Error();
        }

        pageUrl = `${blogMdPath}/${pageUrl}.md`;

        if (!await checkUrlExists(pageUrl)) {
            throw new Error();
        }
    }
    catch (error) {
        pageUrl = `${blogMdPath}/toc.md`;
        updateQueryParam("page", "toc");
    }

    await loadMarkdown(pageUrl);

    if (pageUrl.includes("toc.md")) {
        istoc = true;

        const links = document.querySelectorAll("#content a");
        for (const link of links) {
            const filePath = link.getAttribute("href").replace("./", "").replace(".md", "");
            const encodePath = encodeURIComponent(filePath);
            link.setAttribute("href", `${url.pathname}?page=${encodePath}`);
        }
    }
    else {
        istoc = false;

        // document.title = `${project["title"]} - blog`;

        addSrcPrefix(`${blogAssetsPath}/${relPageUrl}/`, document.getElementById("content"));

        addTocLinkEvent();
        createAndAttachModal();
    }
}

