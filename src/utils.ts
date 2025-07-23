
import YAML from 'yaml'

export function cdnFileToUrl(name: string) {
    return `${import.meta.env.VITE_PROXY_URL}?file=${name}`
}

export async function getMarkdown(url: string): Promise<{ md: string; meta: Record<string, any> }> {
    const response = await fetch(url);

    if (!response.ok) {
        return { md: "", meta: {} }
    }

    const data = await response.text();

    // Regex to extract YAML front matter from start of file
    const yamlRegex = /^---\n([\s\S]*?)\n---\n?/;

    const match = data.match(yamlRegex);

    let meta: Record<string, any> = {};
    let md = data;

    if (match) {
        try {
            meta = YAML.parse(match[1]);
        } catch { }
        md = data.slice(match[0].length);
    }

    return { md, meta };
}
