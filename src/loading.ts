/*
 * loading.ts
 * Copyright (C) 2025 stantonik <stantonik@stantonik-mba.local>
 *
 * Distributed under terms of the MIT license.
 */

const loadingOverlay = document.getElementById("loading-overlay")!;
const loadingText = document.getElementById("loading-text")!;

let spinnerInterval: number;

const spinnerChars = ["-", "\\", "|", "/"];
let spinnerIndex = 0;

export function showLoading() {
    loadingOverlay.classList.add("active");
    spinnerInterval = window.setInterval(() => {
        loadingText.textContent = `loading${spinnerChars[spinnerIndex % spinnerChars.length]}`;
        spinnerIndex++;
    }, 100); // change every 100ms
}

export function hideLoading() {
    loadingOverlay.classList.remove("active");
    clearInterval(spinnerInterval);
}
