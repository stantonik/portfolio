/*
 * home.ts
 * Copyright (C) 2025 stantonik <stantonik@stantonik-mba.local>
 *
 * Distributed under terms of the MIT license.
 */

import '../css/home.css'
import { getAssetUrl } from '../utils';

export default function Home(): HTMLElement {
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
    fetch(getAssetUrl("projects/projects.json"))
      .then((res) => {
        if (res.ok) {
          return res.text();
        } else {
          throw new Error("Failed to fetch JSON");
        }
      })
      .then((text) => {
        projectSection.innerText = text;
      })
      .catch((err) => {
        console.error(err);
      });

    container.appendChild(presSection);
    container.appendChild(projectSection);

    return container;
}  
