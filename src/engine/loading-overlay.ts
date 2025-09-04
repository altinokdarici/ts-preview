// Loading overlay functionality for preview environment
import loadingTemplateHtml from './loading-overlay.html?raw';

let loadingShadowHost: HTMLDivElement | null = null;
let loadingShadow: ShadowRoot | null = null;

function createLoadingOverlay(): void {
  // Create shadow host element
  loadingShadowHost = document.createElement("div");
  loadingShadowHost.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999999;
  `;
  
  loadingShadow = loadingShadowHost.attachShadow({ mode: "closed" });

  // Set the imported template content
  loadingShadow.innerHTML = loadingTemplateHtml;

  document.body.appendChild(loadingShadowHost);
}

export function showLoading(): void {
  if (!loadingShadowHost) {
    createLoadingOverlay();
  }
  if (loadingShadowHost) {
    loadingShadowHost.style.display = "block";
  }
}

export function hideLoading(): void {
  if (loadingShadowHost) {
    loadingShadowHost.style.display = "none";
  }
}

