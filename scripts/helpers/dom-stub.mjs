/**
 * Shared DOM stub for the dsh-notch smoke tests and unit tests.
 *
 * The vendored OpenBotMotion engine paints real SVG through createElementNS,
 * so a DOM stub that lacks it would make the mascot silently no-op — and a
 * smoke test that only checks 'apply() did not throw' would still pass. That
 * is a false green, so this stub implements the subset the engine actually
 * uses and the tests assert on the painted SVG.
 *
 * Element semantics mimic the DOM where the engine depends on them:
 *  - children is a real array the engine appends into;
 *  - firstElementChild / lastElementChild / lastChild reflect that array;
 *  - innerHTML = '' clears children (the engine only writes it for an SVG
 *    filter definition body and for clearing the container on destroy).
 */
const SVG_NS = 'http://www.w3.org/2000/svg'

function makeElement(tag, ns) {
  const el = {
    tagName: String(tag).toUpperCase(),
    namespaceURI: ns ?? 'http://www.w3.org/1999/xhtml',
    children: [],
    attributes: {},
    style: {},
    dataset: {},
    parentNode: null,
    _html: '',

    setAttribute(name, value) { el.attributes[name] = String(value) },
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(el.attributes, name) ? el.attributes[name] : null
    },
    removeAttribute(name) { delete el.attributes[name] },
    hasAttribute(name) { return Object.prototype.hasOwnProperty.call(el.attributes, name) },

    appendChild(child) {
      if (child.parentNode) child.parentNode.removeChild(child)
      el.children.push(child)
      child.parentNode = el
      return child
    },
    insertBefore(child, reference) {
      if (child.parentNode) child.parentNode.removeChild(child)
      const index = reference === null || reference === undefined ? -1 : el.children.indexOf(reference)
      if (index < 0) el.children.push(child)
      else el.children.splice(index, 0, child)
      child.parentNode = el
      return child
    },
    removeChild(child) {
      const index = el.children.indexOf(child)
      if (index >= 0) el.children.splice(index, 1)
      child.parentNode = null
      return child
    },
    replaceChildren(...nodes) {
      el.children = []
      for (const node of nodes) el.appendChild(node)
    },
    remove() { if (el.parentNode) el.parentNode.removeChild(el) },
    contains() { return false },
    compareDocumentPosition() { return 0 },
    getRootNode() { return undefined },
    getBoundingClientRect() {
      return { x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }
    },

    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return true },
    focus() {},
    click() {},
    querySelector() { return null },
    querySelectorAll() { return [] },

    getTotalLength() { return 0 },
    getPointAtLength() { return { x: 0, y: 0 } },
  }

  Object.defineProperty(el, 'firstElementChild', { get: () => el.children[0] ?? null })
  Object.defineProperty(el, 'lastElementChild', {
    get: () => el.children[el.children.length - 1] ?? null,
  })
  Object.defineProperty(el, 'lastChild', { get: () => el.children[el.children.length - 1] ?? null })
  Object.defineProperty(el, 'firstChild', { get: () => el.children[0] ?? null })
  Object.defineProperty(el, 'childElementCount', { get: () => el.children.length })
  Object.defineProperty(el, 'classList', {
    get: () => ({ add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false }),
  })
  Object.defineProperty(el, 'innerHTML', {
    get: () => el._html,
    set: (value) => {
      el._html = String(value)
      if (String(value) === '') el.children = []
    },
  })
  Object.defineProperty(el, 'textContent', {
    get: () => el._html,
    set: (value) => { el._html = String(value) },
  })

  return el
}

/**
 * Build a fresh document stub.
 * @returns the stub, exposing documentElement/head/body and createElementNS.
 */
export function createDocument() {
  const documentElement = makeElement('html')
  const head = makeElement('head')
  const body = makeElement('body')
  documentElement.appendChild(head)
  documentElement.appendChild(body)

  const doc = {
    documentElement,
    head,
    body,
    createElement: (tag) => makeElement(tag),
    createElementNS: (ns, tag) => makeElement(tag, ns),
    createTextNode: (text) => ({ nodeType: 3, textContent: String(text), children: [] }),
    getElementById: (id) => {
      // Text nodes have no `children`, so every walk over the tree must tolerate
      // childless nodes — otherwise a rendered text node makes this throw.
      const walk = (node) => {
        for (const child of node.children ?? []) {
          if (child.attributes?.id === id) return child
          const found = walk(child)
          if (found) return found
        }
        return null
      }
      return walk(documentElement)
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementsByTagName: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    hasFocus: () => true,
  }
  return doc
}

/** Every descendant element of root (depth-first), excluding root itself. */
export function descendants(root) {
  const out = []
  const walk = (node) => {
    for (const child of node.children ?? []) {
      out.push(child)
      walk(child)
    }
  }
  walk(root)
  return out
}

export { SVG_NS, makeElement }
