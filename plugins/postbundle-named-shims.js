// plugins/postbundle-named-shims.js
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const req = createRequire(import.meta.url);
const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function safeKeys(obj, exclude = []) {
  if (!obj) return [];
  const reserved = new Set(['default', '__esModule', 'prototype', 'then', ...exclude]);
  const keys = new Set([...Object.keys(obj), ...Object.getOwnPropertyNames(obj)]);
  return [...keys].filter((k) => IDENT.test(k) && !reserved.has(k));
}

async function loadNamespace(spec) {
  try {
    return req(spec); // CJS
  } catch {
    const resolved = req.resolve(spec);
    const mod = await import(pathToFileURL(resolved).href); // ESM
    return Object.keys(mod).length ? mod : mod.default;
  }
}

// helpers
function pickBestChunk(candidates, spec, resolvedId) {
  // 1) exact facade match to resolved id
  const exact = candidates.find(c =>
    c.facadeModuleId && path.normalize(c.facadeModuleId) === path.normalize(resolvedId)
  );
  if (exact) return exact;

  // 2) prefer entry chunks
  const entries = candidates.filter(c => c.isEntry);
  if (entries.length) {
    return entries.sort((a, b) => a.fileName.length - b.fileName.length)[0];
  }

  // 3) fallback: shortest filename
  return candidates.sort((a, b) => a.fileName.length - b.fileName.length)[0];
}

function isChunkForSpec(chunk, spec, resolvedId) {
  if (chunk.type !== 'chunk') return false;

  // strong signals
  if (chunk.facadeModuleId &&
      path.normalize(chunk.facadeModuleId) === path.normalize(resolvedId)) return true;

  // name / fileName heuristics
  const specUnderscore = spec.replace(/\//g, '_');
  if (chunk.name === spec) return true;
  if (chunk.fileName.startsWith(spec + '/')) return true;        // e.g. react-dom/client.js
  if (chunk.fileName.startsWith(specUnderscore)) return true;     // e.g. react-dom_client.js
  if (chunk.fileName.endsWith(`${spec}.js`)) return true;

  // scan module graph (handles \0commonjs-proxy:* etc.)
  if (chunk.modules) {
    for (const id of Object.keys(chunk.modules)) {
      if (path.normalize(id) === path.normalize(resolvedId)) return true;
      if (id.includes(`/node_modules/${spec}`)) return true;
      if (spec === 'react-dom/client' && /commonjs-proxy:react-dom/.test(id)) return true;
      if (spec === 'react' && /commonjs-proxy:react/.test(id)) return true;
    }
  }
  return false;
}

export default function postbundleNamedShims(opts = {}) {
  const {
    specifiers = ['react', 'react-dom/client'],
    exclude = {},
    shimSuffix = '.named.js',
  } = opts;

  const namesMap = new Map();
  const resolvedMap = new Map();

  // ✅ NEW: de-dupe guards
  const emittedByFile = new Set();   // fileName -> emitted once
  const emittedBySpec = new Set();   // specifier -> emitted once

  return {
    name: 'postbundle-named-shims',

    async buildStart() {
      for (const spec of specifiers) {
        const resolved = req.resolve(spec);
        resolvedMap.set(spec, resolved);
        const ns = await loadNamespace(spec);
        namesMap.set(spec, safeKeys(ns, exclude[spec] || []));
      }
    },

    generateBundle(_, bundle) {
      for (const spec of specifiers) {
        if (emittedBySpec.has(spec)) continue; // already emitted shim for this spec

        const resolvedId = resolvedMap.get(spec);

        // collect all candidates first
        const candidates = Object.values(bundle)
          .filter((o) => isChunkForSpec(o, spec, resolvedId));

        if (candidates.length === 0) {
          this.warn(`[named-shims] No emitted chunk for ${spec} — maybe externalized?`);
          continue;
        }

        const entry = pickBestChunk(candidates, spec, resolvedId);

        const shimFileName = entry.fileName.replace(/\.js$/i, shimSuffix);
        if (emittedByFile.has(shimFileName)) {
          // already emitted (e.g., if other candidate matched earlier)
          emittedBySpec.add(spec);
          continue;
        }

        const fromDir = path.posix.dirname(shimFileName);
        const relRaw = path.posix.relative(fromDir, entry.fileName);
        const relImport = relRaw.startsWith('.') ? relRaw : `./${relRaw}`;

        const names = namesMap.get(spec) || [];
        const code =
`// AUTO-GENERATED shim after bundle for "${spec}"
import NS from '${relImport}';
export default NS.default ?? NS;${names.length ? `

export const { ${names.join(', ')} } = NS;
` : '\n'}`;

        this.emitFile({ type: 'asset', fileName: shimFileName, source: code });
        emittedByFile.add(shimFileName);
        emittedBySpec.add(spec);
      }
    },
  };
}
