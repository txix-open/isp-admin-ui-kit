import mermaid from 'mermaid'
import { RefObject, useCallback, useEffect, useRef } from 'react'

const MERMAID_START_PATTERN =
  /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|stateDiagram-v2|erDiagram|journey|gantt|pie|mindmap|timeline|gitGraph|quadrantChart|requirementDiagram|C4Context)\b/

export const useRedocEnhancements = (
  contentRef: RefObject<HTMLDivElement>,
  parsedSpec: object | null,
  isDark: boolean
) => {
  const isRenderingMermaidRef = useRef(false)

  const scrollToHash = useCallback(() => {
    const container = contentRef.current
    const hash = decodeURIComponent(window.location.hash.slice(1))

    if (!container || !hash) {
      return
    }

    const el = container.querySelector(`[data-section-id="${hash}"]`)

    if (!el) {
      return
    }

    const top =
      el.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop

    container.scrollTo({ top, behavior: 'smooth' })
  }, [contentRef])

  const renderMermaidBlocks = useCallback(async () => {
    const container = contentRef.current

    if (!container || isRenderingMermaidRef.current) {
      return
    }

    const codeBlocks = Array.from(container.querySelectorAll('pre > code'))
      .filter((codeBlock): codeBlock is HTMLElement => {
        const text = codeBlock.textContent?.trim() || ''
        const language = codeBlock.className.toLowerCase()

        return language.includes('mermaid') || MERMAID_START_PATTERN.test(text)
      })
      .filter((codeBlock) => {
        const pre = codeBlock.closest('pre') as HTMLElement | null
        return pre && !pre.dataset.mermaidRendered
      })

    if (!codeBlocks.length) {
      return
    }

    isRenderingMermaidRef.current = true

    try {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: isDark ? 'dark' : 'default'
      })

      for (const [index, codeBlock] of codeBlocks.entries()) {
        const pre = codeBlock.closest('pre') as HTMLElement | null
        const source = codeBlock.textContent?.trim()

        if (!pre || !source) {
          continue
        }

        pre.dataset.mermaidRendered = 'true'

        try {
          const { svg } = await mermaid.render(
            `swagger-mermaid-${Date.now()}-${index}`,
            source
          )
          const wrapper = document.createElement('div')
          wrapper.className = 'swagger-page__mermaid'
          wrapper.innerHTML = svg
          pre.replaceWith(wrapper)
        } catch {
          pre.classList.add('swagger-page__mermaid-error')
        }
      }
    } finally {
      isRenderingMermaidRef.current = false
    }
  }, [contentRef, isDark])

  useEffect(() => {
    if (!contentRef.current || !parsedSpec) {
      return
    }

    const orig = history.pushState.bind(history)
    history.pushState = (...args) => {
      orig(...args)
      scrollToHash()
    }

    return () => {
      history.pushState = orig
    }
  }, [contentRef, parsedSpec, scrollToHash])

  useEffect(() => {
    if (!contentRef.current || !parsedSpec) {
      return
    }

    renderMermaidBlocks()

    const observer = new MutationObserver(() => {
      renderMermaidBlocks()
    })

    observer.observe(contentRef.current, {
      childList: true,
      subtree: true
    })

    return () => {
      observer.disconnect()
    }
  }, [contentRef, parsedSpec, renderMermaidBlocks])
}
