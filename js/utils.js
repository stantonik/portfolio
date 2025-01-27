function updateQueryParam(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    history.replaceState(null, "", url);
}

async function checkUrlExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

const renderer = new marked.Renderer();

renderer.heading = (element) => {
    const slug = element.text.toLowerCase().replace(/[\s]+/g, '-');
    if (element.depth === 2) {
        return `<h2 id="${slug}">${element.text}</h2>`;
    }
    return `<h${element.depth}>${element.text}</h${element.depth}>`;
};

async function loadMarkdown(file) {

    marked.setOptions({
        highlight: function (code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        },
        langPrefix: 'hljs language-',
        renderer: renderer
    });

    try {
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error('Markdown file not found');
        }
        const markdown = await response.text();
        const html = marked.parse(markdown);
        document.getElementById('content').innerHTML = html;

        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

        return true;
    } catch (err) {
        document.getElementById('content').innerHTML = `<p>Error loading content: ${err.message}</p>`;
        return false;
    }
}

function addSrcPrefix(prefix, srcDiv = document) {
    const elementsWithSrc = srcDiv.querySelectorAll('[src]');

    elementsWithSrc.forEach(element => {
        const src = element.getAttribute('src');
        const newSrc = prefix + src;
        element.setAttribute('src', newSrc);
    });
}

function addTocLinkEvent() {
    const tocLinks = document.querySelectorAll('a');
    tocLinks.forEach(link => {
        if (link.getAttribute("href").charAt(0) === '#') {
            link.addEventListener('click', function(event) {
                event.preventDefault();

                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    });
}
