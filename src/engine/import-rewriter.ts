// Utility for rewriting import specifiers to use virtual paths

// Function to rewrite import specifiers to use virtual paths
export function rewriteSpecifiers(js: string, ownerPath: string): string {
  // ownerPath is like "components/button/index.js" (used to resolve ../)
  const ownerDir = ownerPath.replace(/[^/]+$/, ""); // dirname

  // resolve "./" and "../" against ownerDir into a normalized path
  const resolveRel = (rel: string) => {
    const parts = (ownerDir + rel).split("/");
    const out: string[] = [];
    for (const p of parts) {
      if (!p || p === ".") continue;
      if (p === "..") out.pop();
      else out.push(p);
    }
    let resolved = out.join("/");
    
    // Ensure .js extension for virtual paths since that's what will be in the import map
    if (resolved && !resolved.endsWith('.js') && !resolved.endsWith('.ts')) {
      resolved += '.js';
    } else if (resolved.endsWith('.ts')) {
      resolved = resolved.replace(/\.ts$/, '.js');
    }
    
    return resolved;
  };

  // replace in static imports/exports
  js = js.replace(
    /\bfrom\s+(['"])(\.{1,2}\/[^'"]+)\1/g,
    (_m, q, rel) => `from ${q}virtual:/${resolveRel(rel)}${q}`
  );

  // bare side-effect imports: import './x.js'
  js = js.replace(
    /\bimport\s+(['"])(\.{1,2}\/[^'"]+)\1/g,
    (_m, q, rel) => `import ${q}virtual:/${resolveRel(rel)}${q}`
  );

  // dynamic imports: import('./x.js')
  js = js.replace(
    /\bimport\(\s*(['"])(\.{1,2}\/[^'"]+)\1\s*\)/g,
    (_m, q, rel) => `import(${q}virtual:/${resolveRel(rel)}${q})`
  );

  return js;
}