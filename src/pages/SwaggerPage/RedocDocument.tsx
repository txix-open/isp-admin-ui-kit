import { RefObject, useLayoutEffect } from 'react'
import { AppStore, Redoc } from 'redoc'

/** ReDoc expects window scrolling; bind its public navigation service to our workspace instead. */
const RedocDocument = ({
  store,
  containerRef
}: {
  store: AppStore
  containerRef: RefObject<HTMLDivElement>
}) => {
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const { menu } = store
    const { scroll } = menu
    const original = {
      scrollY: scroll.scrollY,
      isElementAbove: scroll.isElementAbove,
      isElementBellow: scroll.isElementBellow,
      scrollIntoView: scroll.scrollIntoView,
      scrollIntoViewBySelector: scroll.scrollIntoViewBySelector
    }
    menu.dispose()
    scroll.dispose()
    scroll.scrollY = () => container.scrollTop
    scroll.isElementAbove = (element) =>
      element
        ? element.getBoundingClientRect().top <=
          container.getBoundingClientRect().top + 1
        : undefined
    scroll.isElementBellow = (element) =>
      element
        ? element.getBoundingClientRect().top >
          container.getBoundingClientRect().top + 1
        : undefined
    scroll.scrollIntoView = (element) => {
      if (!element || !container.contains(element)) return
      const top =
        element.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop
      container.scrollTo({ top, behavior: 'auto' })
    }
    scroll.scrollIntoViewBySelector = (selector) => {
      try {
        scroll.scrollIntoView(container.querySelector(selector))
      } catch {
        /* Ignore malformed anchors in a specification. */
      }
    }
    container.addEventListener('scroll', scroll.handleScroll, { passive: true })
    menu.subscribe()
    menu.updateOnHistory()
    return () => {
      container.removeEventListener('scroll', scroll.handleScroll)
      menu.dispose()
      Object.assign(scroll, original)
    }
  }, [store, containerRef])
  return <Redoc store={store} />
}

export default RedocDocument
