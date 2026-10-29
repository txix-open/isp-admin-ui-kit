import { RefObject, useLayoutEffect } from 'react'

/** Aligns controls by the tallest natural label in each grid row, including multiline labels. */
const useAlignedFormLabels = (
  gridRef: RefObject<HTMLDivElement>,
  properties: unknown
) => {
  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const fields = Array.from(grid.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement &&
        !child.classList.contains('config-form__field--complex')
    )
    const labelsFor = (field: HTMLElement) =>
      Array.from(
        field.querySelectorAll<HTMLElement>('.ant-form-item-label')
      ).filter((label) => label.closest('.config-form__grid') === grid)
    const align = () => {
      const rows = new Map<number, { fields: HTMLElement[]; height: number }>()
      for (const field of fields) {
        const top = Math.round(field.getBoundingClientRect().top)
        const row = rows.get(top) ?? { fields: [], height: 0 }
        row.fields.push(field)
        for (const label of labelsFor(field)) {
          const text = label.querySelector('label')
          if (!text) continue
          const style = getComputedStyle(label)
          const height =
            text.getBoundingClientRect().height +
            (parseFloat(style.paddingTop) || 0) +
            (parseFloat(style.paddingBottom) || 0)
          row.height = Math.max(row.height, Math.ceil(height))
        }
        rows.set(top, row)
      }
      for (const row of rows.values()) {
        for (const field of row.fields) {
          const height = `${row.height}px`
          if (
            field.style.getPropertyValue('--config-form-label-height') !==
            height
          )
            field.style.setProperty('--config-form-label-height', height)
        }
      }
    }
    align()
    const observer = new ResizeObserver(align)
    observer.observe(grid)
    for (const field of fields) {
      for (const label of labelsFor(field)) {
        const text = label.querySelector('label')
        if (text) observer.observe(text)
      }
    }
    return () => observer.disconnect()
  }, [gridRef, properties])
}

export default useAlignedFormLabels
