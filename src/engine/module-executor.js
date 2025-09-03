// Module execution and preview logic

// Capture console methods and send to parent
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info
};

function getPreviewBadge(type) {
  const colors = {
    log: 'blue',
    error: 'red', 
    warn: 'orange',
    info: 'teal'
  };
  
  const color = colors[type] || 'gray';
  const style = `background: ${color}; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;`;
  
  return ["%c[PREVIEW]", style];
}

function sendConsoleToParent(type, ...args) {
  // Send console message to parent window
  window.parent.postMessage({
    type: 'CONSOLE_MESSAGE',
    level: type,
    args: args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    )
  }, '*');
}

console.log = (...args) => {
  originalConsole.log(...getPreviewBadge('log'), ...args);
  sendConsoleToParent('log', ...args);
};

console.error = (...args) => {
  originalConsole.error(...getPreviewBadge('error'), ...args);
  sendConsoleToParent('error', ...args);
};

console.warn = (...args) => {
  originalConsole.warn(...getPreviewBadge('warn'), ...args);
  sendConsoleToParent('warn', ...args);
};

console.info = (...args) => {
  originalConsole.info(...getPreviewBadge('info'), ...args);
  sendConsoleToParent('info', ...args);
};

// Main execution function
export function executeModules(modules) {
  try {
    const moduleUrls = {};
    const importMap = { imports: {} };
    
    // Transform modules to replace relative imports with absolute ones, then create blob URLs
    Object.entries(modules).forEach(([fileName, moduleCode]) => {
      // Transform relative imports to absolute imports that can be resolved by import maps
      const transformedCode = moduleCode.replace(
        /import\s+([^'"]*)\s+from\s+['"]\.\/([^'"]+)['"];?/g,
        (match, imports, path) => {
          // Convert './ui.js' -> 'ui.js', './ui' -> 'ui.js'
          let moduleName = path;
          if (!moduleName.endsWith('.js')) {
            moduleName += '.js';
          }
          return `import ${imports} from '${moduleName}';`;
        }
      );
      
      const blob = new Blob([transformedCode], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      moduleUrls[fileName] = url;
      
      // Create import map entries for the transformed absolute imports
      const baseName = fileName.replace(/\.(js|ts)$/, '');
      importMap.imports[fileName] = url;
      importMap.imports[baseName] = url;
    });
    
    const importMapScript = document.createElement('script');
    importMapScript.type = 'importmap';
    importMapScript.textContent = JSON.stringify(importMap);
    document.head.appendChild(importMapScript);
    
    console.log('Import Map Created:', importMap);
    
    // Execute the entry point
    executeEntry(moduleUrls);
    
    function executeEntry(moduleUrls) {
      // Wait for import map to be processed, then execute entry point
      setTimeout(async () => {
        try {
          // Find entry point: index.js, main.js, or first module
          const entryModuleUrl = moduleUrls['index.js'] || 
                               moduleUrls['main.js'] || 
                               Object.values(moduleUrls)[0];
          
          if (entryModuleUrl) {
            const module = await import(entryModuleUrl);
            
            // If the module has a default export, log it
            if (module.default !== undefined) {
              sendConsoleToParent('log', '← ' + (typeof module.default === 'object' ? 
                JSON.stringify(module.default, null, 2) : String(module.default)));
            }
            
            // Clean up blob URLs after a delay to ensure modules are loaded
            setTimeout(() => {
              Object.values(moduleUrls).forEach(url => {
                if (url.startsWith('blob:')) {
                  URL.revokeObjectURL(url);
                }
              });
            }, 1000);
          } else {
            sendConsoleToParent('warn', 'No entry point found. Expected index.js, main.js, or any .js file');
          }
        } catch (error) {
          sendConsoleToParent('error', 'Module execution error: ' + error.message);
          console.error('Full error:', error);
        }
      }, 10);
    }
    
  } catch (error) {
    sendConsoleToParent('error', 'Setup error: ' + error.message);
  }
}