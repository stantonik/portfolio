/*
 * home.ts
 * Copyright (C) 2025 stantonik <stantonik@stantonik-mba.local>
 *
 * Distributed under terms of the MIT license.
 */

import '../css/home.css'
import { getAssetUrl } from '../utils';

export default async function Home(): Promise<HTMLElement> {
    const container = document.createElement("div");

    // Title
    const presSection = document.createElement("section");
    const asciiArt = `
   .-'''-. ,---------.    ____    ,---.   .--.  .---.       .-''-.     ____     __  
  / _     \\\\          \\ .'  __ \`. |    \\  |  |  | ,_|     .'_ _   \\    \\   \\   /  / 
 (\`' )/\\\`--' \`--.  ,---'/   '  \\  \\|  ,  \\ |  |,-./  )    / ( \` )   '    \\  _. /  '  
(_ o _).       |   \\   |___|  /  ||  |\\_ \\|  |\\  '_ '\`) . (_ o _)  |     _( )_ .'   
 (_,_). '.     :_ _:      _.-\`   ||  _( )_\\  | > (_)  ) |  (_,_)___| ___(_ o _)'    
.---.  \\  :    (_I_)   .'   _    || (_ o _)  |(  .  .-' '  \\   .---.|   |(_,_)'     
\\    \`-'  |   (_(=)_)  |  _( )_  ||  (_,_)\  | \`-'\`-'|___\\  \`-'    /|   \`-'  /      
 \\       /     (_I_)   \\ (_ o _) /|  |    |  |  |        \\\\       /  \\      /       
  \`-...-'      '---'    '.(_,_).' '--'    '--'  \`--------\` \`'-..-'    \`-..-'        
`;

    const title = document.createElement("pre");
    title.id = "title";
    title.textContent = asciiArt;

    presSection.appendChild(title);

    // Projects list
    const projectSection = document.createElement("section");
    const res = await fetch(getAssetUrl("projects/projects.json"));
    const json = await res.json();
    for (const name in json) {
        const data = json[name];
        if (data.title == null) {
            continue;
        }
        const projectDiv = document.createElement("div");
        const link = document.createElement("a");
        link.textContent = data.title;
        link.href = "/project?name=" + name;
        projectDiv.appendChild(link);
        projectSection.appendChild(projectDiv);
    }

    container.appendChild(presSection);
    container.appendChild(projectSection);

    return container;
}  
