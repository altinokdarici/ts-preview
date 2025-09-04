// Inline TypeScript transpilation utility
import * as ts from 'typescript';

export function transpileTypeScript(fileName: string, source: string): string {
  try {
    console.log('[Transpiler] Transpiling:', fileName);

    // Don't transform import statements - keep .js extensions for import map resolution
    console.log('[Transpiler] Source (no transformation):', source.substring(0, 200) + '...');

    // Determine if this is a JSX/TSX file
    const isJsxFile = fileName.endsWith('.jsx') || fileName.endsWith('.tsx');
    
    // Transpile TypeScript to JavaScript
    const jsCode = ts.transpile(source, {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ES2020,
      strict: true,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      jsx: isJsxFile ? ts.JsxEmit.React : ts.JsxEmit.None,
      jsxFactory: 'React.createElement',
      jsxFragmentFactory: 'React.Fragment'
    });

    console.log('[Transpiler] Transpiled JS:', jsCode.substring(0, 200) + '...');
    
    return jsCode;
  } catch (error: any) {
    console.error('[Transpiler] Transpilation error:', error);
    // Return source with error comment as fallback
    return `console.error('TypeScript transpilation error: ${error.message}');\n${source}`;
  }
}