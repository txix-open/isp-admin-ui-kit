import mermaid from 'mermaid'
import { RefObject, useEffect } from 'react'

const MERMAID_START_PATTERN =
  /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|stateDiagram-v2|erDiagram|journey|gantt|pie|mindmap|timeline|gitGraph|quadrantChart|requirementDiagram|C4Context)\b/

export const useRedocEnhancements = (
  contentRef: RefObject<HTMLDivElement>,
  parsedSpec: object | null,
  isDark: boolean
) => {
  useEffect(() => {
    const container = contentRef.current
    if (!container) return
    const resize = () =>
      container.style.setProperty(
        '--swagger-viewport-height',
        `${container.clientHeight}px`
      )
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    return () => observer.disconnect()
  }, [contentRef])

  useEffect(() => {
    const container = contentRef.current
    if (!container || !parsedSpec) return
    let disposed = false
    let running = false
    let pending = false
    let frame = 0
    const render = async () => {
      if (disposed) return
      const search = container.querySelector<HTMLInputElement>(
        'input[aria-label="Search"]'
      )
      if (search) {
        search.placeholder = 'Поиск по API'
        search.setAttribute('aria-label', 'Поиск по API')
      }
      if (running) {
        pending = true
        return
      }
      const blocks = Array.from(
        container.querySelectorAll<HTMLElement>('pre > code')
      ).filter((block) => {
        const pre = block.closest('pre')
        return (
          pre &&
          !pre.dataset.mermaidRendered &&
          (block.className.toLowerCase().includes('mermaid') ||
            MERMAID_START_PATTERN.test(block.textContent?.trim() || ''))
        )
      })
      if (!blocks.length) return
      running = true
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: isDark ? 'dark' : 'default'
      })
      try {
        for (const [index, block] of blocks.entries()) {
          if (disposed) break
          const pre = block.closest('pre')
          const source = block.textContent?.trim()
          if (!pre || !source) continue
          pre.dataset.mermaidRendered = 'true'
          try {
            const { svg } = await mermaid.render(
              `swagger-mermaid-${Date.now()}-${index}`,
              source
            )
            if (disposed || !container.contains(pre)) continue
            const wrapper = document.createElement('div')
            wrapper.className = 'swagger-page__mermaid'
            wrapper.innerHTML = svg
            pre.replaceWith(wrapper)
          } catch {
            if (!disposed) pre.classList.add('swagger-page__mermaid-error')
          }
        }
      } finally {
        running = false
        if (pending && !disposed) {
          pending = false
          schedule()
        }
      }
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        void render()
      })
    }
    schedule()
    const observer = new MutationObserver(schedule)
    observer.observe(container, { childList: true, subtree: true })
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [contentRef, parsedSpec, isDark])
}
