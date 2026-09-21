/**
 * A minimal React renderer for the dsh-notch smoke tests.
 *
 * Why this exists: the capsule mounts the vendored mascot engine from a
 * useEffect that needs its container ref attached first. A React stub whose
 * createElement merely returns a descriptor never invokes child components, so
 * IdleRobot's effect never runs — and a smoke test would pass while the
 * mascot silently never painted. That is a false green.
 *
 * This renderer walks the element tree, invokes function components, creates
 * real (stubbed) DOM nodes, attaches refs, and then runs the effects those
 * components queued — matching React's "refs before effects" ordering.
 *
 * It is deliberately small: enough to render one static tree and flush its
 * effects once. It is not a reconciler and does not re-render.
 */

/** The Fragment sentinel; jsx() emits it for every `<>...</>`. */
const FRAGMENT = Symbol.for('dsh-notch.smoke.fragment')

/** React's internal element shape produced by jsx()/createElement(). */
function isElement(value) {
  return value !== null && typeof value === 'object' && 'type' in value
}

/**
 * Build a renderer bound to one document stub.
 * @param document - the DOM stub from createDocument().
 * @returns hooks, render(), and diagnostics.
 */
export function createRenderer(document) {
  const state = {
    /** Hook storage for the component currently being invoked. */
    slots: [],
    index: 0,
    /** Effects queued by the component currently being invoked. */
    pending: [],
    /** Errors thrown by component bodies or effects. */
    errors: [],
    /** Disposers returned by effects. */
    disposers: [],
  }

  function resetHooks() {
    state.slots = []
    state.index = 0
    state.pending = []
  }

  /** Run one hook cell, creating it on first use. */
  function cell(factory) {
    const i = state.index++
    if (!(i in state.slots)) state.slots[i] = factory()
    return state.slots[i]
  }

  const hooks = {
    useState: (init) => {
      const value = cell(() => (typeof init === 'function' ? init() : init))
      return [value, (next) => { void next }]
    },
    useReducer: (reducer, init) => [cell(() => init), () => {}],
    useEffect: (fn) => { state.pending.push(fn) },
    useLayoutEffect: (fn) => { state.pending.push(fn) },
    useInsertionEffect: (fn) => { state.pending.push(fn) },
    useMemo: (fn) => cell(fn),
    useCallback: (fn) => cell(() => fn),
    useRef: (init) => cell(() => ({ current: init })),
    useImperativeHandle: () => {},
    useContext: () => ({}),
    useId: () => 'stub-id',
    useDebugValue: () => {},
    useSyncExternalStore: (_sub, get) => get(),
    useTransition: () => [false, (fn) => { if (typeof fn === 'function') fn() }],
    useDeferredValue: (v) => v,
    useEffectEvent: (fn) => fn,
  }

  /** Flush the effects queued since the last flush. */
  function flushEffects() {
    const batch = state.pending
    state.pending = []
    for (const effect of batch) {
      try {
        const stop = effect()
        if (typeof stop === 'function') state.disposers.push(stop)
      } catch (error) {
        state.errors.push(error)
      }
    }
  }

  /**
   * Render one node into parentDom.
   * @returns the created DOM node, or null for text/void nodes.
   */
  function renderNode(node, parentDom) {
    if (node === null || node === undefined || typeof node === 'boolean') return null
    if (typeof node === 'string' || typeof node === 'number') {
      const text = document.createTextNode(String(node))
      if (parentDom) {
        // appendChild links parentNode; tolerate a text stub without it.
        parentDom.appendChild(text)
        if (text.parentNode === undefined) text.parentNode = parentDom
      }
      return text
    }
    if (Array.isArray(node)) {
      for (const child of node) renderNode(child, parentDom)
      return null
    }
    if (!isElement(node)) return null

    const { type, props } = node

    // A Fragment is transparent: render its children into the same parent.
    if (type === FRAGMENT || (typeof type === 'symbol' && String(type).includes('Fragment'))) {
      const rawFragment = props?.children
      renderNode(Array.isArray(rawFragment) ? rawFragment : rawFragment === undefined ? [] : [rawFragment], parentDom)
      return null
    }
    // createElement() puts children in a third argument array; the automatic
    // JSX runtime puts them in props.children. Accept both.
    const raw = node.children !== undefined ? node.children : props?.children
    const children = Array.isArray(raw) ? raw : raw === undefined ? [] : [raw]

    // Function component: invoke it, then render what it returned, then run any
    // effects it queued (refs are attached by then, matching React ordering).
    if (typeof type === 'function') {
      const outerSlots = state.slots
      const outerIndex = state.index
      resetHooks()
      let produced
      try {
        produced = type({ ...(props ?? {}), children })
      } catch (error) {
        state.errors.push(error)
      }
      const innerSlots = state.slots
      if (produced !== undefined) renderNode(produced, parentDom)
      flushEffects()
      state.slots = outerSlots
      state.index = outerIndex
      void innerSlots
      return null
    }

    // Host element.
    if (typeof type !== 'string') return null
    const dom = document.createElement(type)
    for (const [key, value] of Object.entries(props ?? {})) {
      if (key === 'ref') {
        if (value && typeof value === 'object') value.current = dom
        continue
      }
      if (key === 'key' || key === 'children') continue
      if (key === 'style' && value && typeof value === 'object') { dom.style = { ...value }; continue }
      if (key === 'className') { dom.setAttribute('class', String(value)); continue }
      if (typeof value === 'function') continue
      if (value === false || value === null || value === undefined) continue
      if (value === true) { dom.setAttribute(key, ''); continue }
      dom.setAttribute(key, String(value))
    }
    if (parentDom) parentDom.appendChild(dom)
    renderNode(children, dom)
    return dom
  }

  return {
    hooks,
    /**
     * Render a tree into a container.
     * @param element - the root element.
     * @param container - DOM node to append into.
     * @returns diagnostics: created DOM node, errors, disposers.
     */
    render(element, container) {
      state.errors = []
      resetHooks()
      const node = renderNode(element, container)
      flushEffects()
      return { node, errors: [...state.errors], disposers: state.disposers }
    },
    /** Run every effect disposer collected so far. */
    unmount() {
      const stops = [...state.disposers]
      state.disposers = []
      for (const stop of stops) {
        try { stop() } catch (error) { state.errors.push(error) }
      }
      return [...state.errors]
    },
  }
}
