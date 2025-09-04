// Module execution and preview logic
import { setupConsoleOverride } from "./console-override.ts";
import { transpileTypeScript } from "./transpiler.ts";
import { rewriteSpecifiers } from "./import-rewriter.ts";

// Setup console overrides
setupConsoleOverride();

// Store blob URLs for cleanup
let currentBlobUrls: string[] = [];

// List of libraries to create shims for
const externalLibraries = [
  "react",
  "react-dom",
  "@fluentui/react-components",
  "lodash",
];

// Main execution function
export function executeModules(modules: Record<string, string>): void {
  try {
    // Clean up previous blob URLs
    cleanupBlobUrls();

    // Step 1: Transpile all modules to JavaScript and rewrite imports
    const transpiledModules: Record<string, string> = {};
    for (const [fileName, source] of Object.entries(modules)) {
      let transpiledContent: string;
      let jsFileName: string;

      // Transpile TypeScript/TSX files, keep JS files as-is
      if (fileName.endsWith(".ts") || fileName.endsWith(".tsx")) {
        transpiledContent = transpileTypeScript(fileName, source);
        jsFileName = fileName.replace(/\.tsx?$/, ".js");
      } else {
        transpiledContent = source;
        jsFileName = fileName;
      }

      // Rewrite import specifiers to use virtual paths for both TS and JS files
      const rewrittenContent = rewriteSpecifiers(transpiledContent, jsFileName);
      transpiledModules[jsFileName] = rewrittenContent;
    }

    // Step 2: Create blob URLs and virtual import map with app:/ prefix
    const importMap: Record<string, string> = {
      react: "/static/react.named.js",
      "react-dom/client": "/static/react-dom/client.named.js",
      "react-dom": "/static/react-dom/client.named.js",
      "@fluentui/react-components":
        "/static/@fluentui/react-components.named.js",
      "@griffel/react": "/static/@griffel/react.named.js",
    };
    const moduleBlobs: Record<string, string> = {};

    for (const [jsFileName, transpiledContent] of Object.entries(
      transpiledModules
    )) {
      // Create blob URL
      const blob = new Blob([transpiledContent], {
        type: "application/javascript",
      });
      const blobUrl = URL.createObjectURL(blob);

      // Store blob URL for cleanup
      currentBlobUrls.push(blobUrl);
      moduleBlobs[jsFileName] = blobUrl;

      // Create virtual import map entries using virtual:/ prefix
      importMap[`virtual:/${jsFileName}`] = blobUrl;
    }

    // Create and inject new import map
    const importMapScript = document.createElement("script");
    importMapScript.type = "importmap";
    importMapScript.textContent = JSON.stringify(
      { imports: importMap },
      null,
      2
    );
    document.head.appendChild(importMapScript);

    // Step 3: Find entry point (use module name for virtual path)
    const entryPointName =
      Object.keys(moduleBlobs).find((name) => name === "index.js") ||
      Object.keys(moduleBlobs).find((name) => name === "main.js") ||
      Object.keys(moduleBlobs)[0];

    if (!entryPointName) {
      console.warn(
        "No entry point found. Expected index.js, main.js, or any module file"
      );
      return;
    }

    // Step 4: Execute entry point using virtual import path

    // Create an inline module script that can use the import map
    const moduleScript = document.createElement("script");
    moduleScript.type = "module";
    moduleScript.textContent = `
        try {
           await import('virtual:/${entryPointName}');
        } catch (error) {
          console.error('[Inline Module] Error importing entry module:', error);
        }
      `;

    // Add the script to the document
    document.head.appendChild(moduleScript);
  } catch (error: any) {
    console.error("Setup error: " + error.message);
  }
}

// Clean up blob URLs
function cleanupBlobUrls(): void {
  currentBlobUrls.forEach((url) => {
    URL.revokeObjectURL(url);
  });
  currentBlobUrls = [];
}

// Clean up on page unload
window.addEventListener("beforeunload", cleanupBlobUrls);
