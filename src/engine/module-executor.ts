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
    console.log("[Module Executor] Received modules:", Object.keys(modules));

    // Clean up previous blob URLs
    cleanupBlobUrls();

    // Step 1: Transpile all modules to JavaScript and rewrite imports
    const transpiledModules: Record<string, string> = {};
    for (const [fileName, source] of Object.entries(modules)) {
      console.log(`[Module Executor] Processing ${fileName}`);

      let transpiledContent: string;
      let jsFileName: string;

      // Transpile TypeScript files, keep JS files as-is
      if (fileName.endsWith(".ts")) {
        transpiledContent = transpileTypeScript(fileName, source);
        jsFileName = fileName.replace(/\.ts$/, ".js");
      } else {
        transpiledContent = source;
        jsFileName = fileName;
      }

      // Rewrite import specifiers to use virtual paths for both TS and JS files
      const rewrittenContent = rewriteSpecifiers(transpiledContent, jsFileName);
      transpiledModules[jsFileName] = rewrittenContent;

      console.log(`[Module Executor] Processed ${fileName} -> ${jsFileName}`);
      console.log(
        `[Module Executor] Content after rewrite:`,
        rewrittenContent.substring(0, 200) + "..."
      );
    }

    // Step 2: Create blob URLs and virtual import map with app:/ prefix
    const importMap: Record<string, string> = {};
    const moduleBlobs: Record<string, string> = {};

    for (const [jsFileName, transpiledContent] of Object.entries(
      transpiledModules
    )) {
      console.log(`[Module Executor] Creating blob for ${jsFileName}`);
      console.log(
        `[Module Executor] Content preview:`,
        transpiledContent.substring(0, 100) + "..."
      );

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

      console.log(
        `[Module Executor] Created virtual mapping: virtual:/${jsFileName} -> ${blobUrl}`
      );
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

    console.log("[Module Executor] Entry point name:", entryPointName);
    console.log(
      "[Module Executor] Entry point virtual path:",
      `virtual:/${entryPointName}`
    );

    if (!entryPointName) {
      console.warn(
        "No entry point found. Expected index.js, main.js, or any module file"
      );
      return;
    }

    // Step 4: Execute entry point using virtual import path
    console.log(
      "[Module Executor] Creating inline module script for entry point:",
      `virtual:/${entryPointName}`
    );
    console.log(
      "[Module Executor] Current import maps in DOM:",
      document.querySelectorAll('script[type="importmap"]').length
    );

    // Create an inline module script that can use the import map
    const moduleScript = document.createElement("script");
    moduleScript.type = "module";
    moduleScript.textContent = `
        console.log('[Inline Module] Loading entry point: virtual:/${entryPointName}');
        try {
          const module = await import('virtual:/${entryPointName}');
          console.log('[Inline Module] Module loaded successfully');
          
          // Call default export if it's a function
          if (typeof module.default === 'function') {
            console.log('[Inline Module] Calling default export function');
            module.default();
          } else if (module.default !== undefined) {
            console.log('[Inline Module] Default export:', 
              typeof module.default === 'object'
                ? JSON.stringify(module.default, null, 2)
                : String(module.default)
            );
          } else {
            console.log('[Inline Module] No default export found, but module executed');
          }
        } catch (error) {
          console.error('[Inline Module] Error importing entry module:', error);
        }
      `;

    // Add the script to the document
    document.head.appendChild(moduleScript);
    console.log("[Module Executor] Inline module script added to DOM");
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
