// TypeScript compilation worker
import * as ts from 'typescript';

interface FileData {
  name: string;
  content: string;
}

self.onmessage = function(e) {
  const { id, files } = e.data as { id: number; files: FileData[] };
  
  try {
    // Add timeout protection
    const startTime = Date.now();
    const TIMEOUT_MS = 5000; // 5 second timeout
    
    // Check for reasonable input size (limit to 50KB total)
    const totalSize = files.reduce((sum, file) => sum + file.content.length, 0);
    if (totalSize > 50000) {
      throw new Error('Code input too large (max 50KB total)');
    }
    
    // Create a virtual file system for import resolution
    const fileMap = new Map<string, string>();
    files.forEach(file => {
      fileMap.set(file.name, file.content);
    });
    
    // Compile options
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ES2020,
      strict: true,
      removeComments: false,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
    };
    
    // Simple approach: compile each file individually but resolve imports
    const result: Record<string, string> = {};
    const compilationErrors: string[] = [];
    
    // Helper function to resolve import paths
    const resolveImportPath = (importPath: string, currentFile: string): string[] => {
      const candidates: string[] = [];
      
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        // Handle relative imports
        let resolvedPath = importPath.startsWith('./') ? importPath.substring(2) : importPath;
        
        // Try different extensions
        candidates.push(resolvedPath);
        if (!resolvedPath.endsWith('.js') && !resolvedPath.endsWith('.ts')) {
          candidates.push(resolvedPath + '.ts', resolvedPath + '.js');
        }
      } else {
        // Handle absolute imports (treat as relative to root)
        candidates.push(importPath);
        if (!importPath.endsWith('.js') && !importPath.endsWith('.ts')) {
          candidates.push(importPath + '.ts', importPath + '.js');
        }
      }
      
      return candidates;
    };

    // First pass: validate imports exist
    for (const file of files) {
      const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"];?/g;
      let match;
      
      while ((match = importRegex.exec(file.content)) !== null) {
        const importPath = match[1];
        const candidates = resolveImportPath(importPath, file.name);
        
        // Check if any candidate exists
        const foundModule = candidates.find(candidate => fileMap.has(candidate));
        
        if (!foundModule) {
          compilationErrors.push(`${file.name}: Cannot find module '${importPath}' (tried: ${candidates.join(', ')})`);
        }
      }
    }
    
    // If there are import errors, throw them
    if (compilationErrors.length > 0) {
      throw new Error(compilationErrors.join('\n'));
    }
    
    // Second pass: compile each file
    for (const file of files) {
      try {
        const emitResult = ts.transpileModule(file.content, {
          compilerOptions,
        });
        
        // Check for compilation diagnostics
        if (emitResult.diagnostics && emitResult.diagnostics.length > 0) {
          const errors = emitResult.diagnostics.map(diagnostic => {
            const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            const line = diagnostic.start && file.content
              ? file.content.substring(0, diagnostic.start).split('\n').length
              : 0;
            return `${file.name}:${line} - ${message}`;
          }).join('\n');
          
          if (errors) {
            compilationErrors.push(errors);
          }
        }
        
        // Normalize output filename - always use .js extension
        const jsFileName = file.name.replace(/\.(ts|js)$/, '.js');
        result[jsFileName] = emitResult.outputText;
        
      } catch (error) {
        compilationErrors.push(`${file.name}: ${(error as Error).message}`);
      }
    }
    
    // If there are compilation errors, throw them
    if (compilationErrors.length > 0) {
      throw new Error(compilationErrors.join('\n'));
    }
    
    // Check if compilation took too long
    if (Date.now() - startTime > TIMEOUT_MS) {
      throw new Error('Compilation timeout');
    }
    
    // Send success result back to main thread
    self.postMessage({
      id,
      success: true,
      result: JSON.stringify(result),
      error: null
    });
    
  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      id,
      success: false,
      result: null,
      error: (error as Error).message || 'Compilation failed'
    });
  }
};