/**
 * dsh-companion — build script.
 *
 * Two bundles from esbuild:
 *
 *   lib/index.js   host half    ESM,  node platform,  self-contained
 *                  (mobile-plus lib/* + pill host, all local sources)
 *   lib/client.js  browser half CJS,  browser platform, wrapped in the
 *                  `window.__ModuleLoader__.load` factory contract
 *                  (pill tsx + converted mobile-plus client)
 *
 * The host half must stay **resolvable from an installed location**, i.e. from
 * inside `~/.dsh/profiles/<p>/node_modules/`. That rules out importing most
 * `@deepseek-ai/*` packages at runtime: DSH ships those as source only (their
 * `lib/` holds `.d.ts` plus a couple of hand-built entries, no `lib/index.js`),
 * and resolves them at runtime through tsx + `tsconfig.base.json` `paths`.
 * tsx only applies `paths` to importers *outside* node_modules, so a plugin
 * that was installed with `dsh plugin add` gets plain node resolution and
 * lands on a missing file.
 *
 * This plugin's host half has NO runtime @deepseek-ai/* imports at all
 * (all `import type` are erased by esbuild), so the bundle is fully
 * self-contained — see assertHostExternals().
 *
 * Mobile web assets (`public/`) are NOT bundled: lib/routes logic resolves
 * them via import.meta relative paths (`<pkg>/lib` -> `<pkg>/public`),
 * identical before and after bundling. `public/` ships alongside `lib/`
 * (see package.json `files`) and must stay at the package root.
 *
 * Usage: node build.mjs
 */

import { createRequire } from 'node:module'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve, dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const DSH_CHECKOUT = process.env.DSH_CHECKOUT ?? 'D:/AI/deepseek-harness'
const PLUGIN_ID = 'dsh-companion'

/** Resolve esbuild (own node_modules → DSH checkout pnpm store → error). */
function loadEsbuild() {
  const localRequire = createRequire(resolve(HERE, 'package.json'))
  try {
    return localRequire('esbuild')
  } catch {
    // Not installed locally; fall through to the checkout scan.
  }

  const store = join(DSH_CHECKOUT, 'node_modules', '.pnpm')
  const candidates = []
  if (existsSync(store)) {
    for (const entry of readdirSync(store)) {
      if (!entry.startsWith('esbuild@')) continue
      candidates.push(join(store, entry, 'node_modules', 'esbuild'))
    }
  }
  if (candidates.length > 0) {
    const pick = candidates.sort().at(-1)
    return createRequire(resolve(pick, 'package.json'))(pick)
  }

  throw new Error(
    'dsh-companion: cannot find esbuild.\n'
    + '  Run `pnpm install` in this directory (esbuild is a devDependency).\n'
    + `  Or set DSH_CHECKOUT to a DSH checkout to borrow its copy (currently: ${DSH_CHECKOUT}).`,
  )
}

const esbuild = loadEsbuild()

/** Platform packages + react come from the DSH module table at runtime. */
const CLIENT_EXTERNAL = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
]

/** Browser half: one CJS factory registered with the host module loader. */
const clientBundle = {
  entryPoints: [resolve(HERE, 'src/client/index.ts')],
  outfile: resolve(HERE, 'lib/client.js'),
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: ['es2020'],
  jsx: 'automatic',
  sourcemap: true,
  logLevel: 'info',
  external: CLIENT_EXTERNAL,
  // Everything under @deepseek-ai/ stays a runtime require.
  plugins: [{
    name: 'companion-external-platform',
    setup(build) {
      build.onResolve({ filter: /^@deepseek-ai\// }, args => ({ path: args.path, external: true }))
    },
  }],
  banner: {
    js: [
      `window.__ModuleLoader__.load({ id: ${JSON.stringify(PLUGIN_ID)}, factory: (require) => {`,
      'var module = { exports: {} };',
      'var exports = module.exports;',
      'Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });',
    ].join('\n'),
  },
  footer: {
    js: 'return module.exports; } });',
  },
}

/** Host half: ESM, self-contained except node builtins. */
const hostBundle = {
  entryPoints: [resolve(HERE, 'src/host/index.js')],
  outfile: resolve(HERE, 'lib/index.js'),
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node22',
  // No host sourcemap: DSH never enables --enable-source-maps, pure disk/git cost.
  sourcemap: false,
  logLevel: 'info',
  external: [],
  plugins: [{
    name: 'companion-external-platform',
    setup(build) {
      build.onResolve({ filter: /^(@deepseek-ai\/|node:)/ }, args => ({ path: args.path, external: true }))
    },
  }],
}

/** Fail the build if the host bundle still hands an unresolvable specifier. */
function assertHostExternals(outfile) {
  const source = readFileSync(outfile, 'utf8')
  const specifiers = new Set()
  for (const m of source.matchAll(/(?:^|[;\n])\s*(?:import|export)[\s\S]*?from\s*["']([^"']+)["']/g)) {
    specifiers.add(m[1])
  }
  for (const m of source.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g)) {
    specifiers.add(m[1])
  }

  const violations = [...specifiers].filter((spec) => {
    if (spec.startsWith('node:')) return false
    return true
  })

  if (violations.length > 0) {
    throw new Error(
      'dsh-companion: host bundle imports packages that an installed plugin cannot resolve.\n'
      + violations.map(v => `  - ${v}`).join('\n')
      + '\n\n'
      + 'DSH ships @deepseek-ai/* as source only; a plugin inside a profile\'s\n'
      + 'node_modules gets plain node resolution and finds no lib/index.js.\n'
      + 'Vendor the module or remove the import.',
    )
  }
  return [...specifiers]
}

await Promise.all([esbuild.build(clientBundle), esbuild.build(hostBundle)])
const hostExternals = assertHostExternals(resolve(HERE, 'lib/index.js'))
console.log('[dsh-companion] built lib/index.js + lib/client.js')
console.log(`[dsh-companion] host runtime imports: ${hostExternals.length === 0 ? '(none)' : hostExternals.join(', ')}`)
