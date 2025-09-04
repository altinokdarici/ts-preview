// Inline TypeScript transpilation utility
import * as ts from 'typescript';

export function transpileTypeScript(fileName: string, source: string): string {
  try {
    console.log('[Transpiler] Transpiling:', fileName);

    // Don't transform import statements - keep .js extensions for import map resolution
    console.log('[Transpiler] Source (no transformation):', source.substring(0, 200) + '...');

    // Transpile TypeScript to JavaScript
    const jsCode = ts.transpile(source, {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ES2020,
      strict: true,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
    });

    console.log('[Transpiler] Transpiled JS:', jsCode.substring(0, 200) + '...');
    
    return jsCode;
  } catch (error: any) {
    console.error('[Transpiler] Transpilation error:', error);
    // Return source with error comment as fallback
    return `console.error('TypeScript transpilation error: ${error.message}');\n${source}`;
  }
}