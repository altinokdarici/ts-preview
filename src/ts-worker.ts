// TypeScript compilation worker
import * as ts from 'typescript';

self.onmessage = function(e) {
  const { id, code, options } = e.data;
  
  try {
    // Add timeout protection
    const startTime = Date.now();
    const TIMEOUT_MS = 5000; // 5 second timeout
    
    // Check for reasonable input size (limit to 50KB)
    if (code.length > 50000) {
      throw new Error('Code input too large (max 50KB)');
    }
    
    // Compile the TypeScript code
    const result = ts.transpile(code, {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ES2020,
      strict: true,
      removeComments: false,
      ...options
    });
    
    // Check if compilation took too long
    if (Date.now() - startTime > TIMEOUT_MS) {
      throw new Error('Compilation timeout');
    }
    
    // Send success result back to main thread
    self.postMessage({
      id,
      success: true,
      result,
      error: null
    });
    
  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      id,
      success: false,
      result: null,
      error: error.message || 'Compilation failed'
    });
  }
};