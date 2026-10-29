// Runs only in the offline browser fixture; never opens the application or calls its API.
window.layoutTest.check = () => {
  const assert = (condition, message) => {
    if (!condition) throw new Error(message)
  }
  const visible = (element) =>
    element && element.getBoundingClientRect().height > 0
  const verifyScroll = (element, header) => {
    if (!visible(element)) return
    const top = header?.getBoundingClientRect().top
    const previous = element.scrollTop
    element.scrollTop = 600
    if (element.scrollHeight > element.clientHeight + 1) {
      assert(
        element.scrollTop > 0,
        'The content does not scroll inside its own panel'
      )
    }
    if (header)
      assert(
        header.getBoundingClientRect().top === top,
        'The panel header moved with its content'
      )
    element.scrollTop = previous
  }
  const metrics = window.layoutTest.metrics()
  verifyScroll(
    document.querySelector('.page-layout__body'),
    document.querySelector('.page-layout > .page-header')
  )
  assert(
    document.documentElement.scrollHeight <= innerHeight + 1,
    'The document scrolls vertically'
  )
  assert(
    document.documentElement.scrollWidth <= innerWidth + 1,
    'The document scrolls horizontally'
  )

  if (innerWidth < 768) {
    for (const page of document.querySelectorAll(
      '.modules-page, .roles-page'
    )) {
      const selected = page.dataset.selected === 'true'
      const list = page.querySelector(':scope > .column')
      const details = page.querySelector(
        '.modules-page__detail-panel, .roles-page__content'
      )
      const back = page.querySelector(
        '.modules-page__back-to-list, .roles-page__back-to-list, [data-cy="roles-content__cancel-create"]'
      )
      assert(
        visible(list) === !selected,
        'The mobile list visibility does not match the selection'
      )
      assert(
        visible(details) === selected,
        'The mobile details visibility does not match the selection'
      )
      if (selected)
        assert(
          visible(back),
          'The mobile details have no visible return to the list'
        )
    }
  }

  const column = document.querySelector('.column')
  if (visible(column)) {
    verifyScroll(
      document.querySelector('.column__items .simplebar-content-wrapper'),
      document.querySelector('.column__header')
    )
    assert(
      column.getBoundingClientRect().bottom <= innerHeight + 1,
      'The column extends below the viewport'
    )
  }
  verifyScroll(
    document.querySelector('.modules-page__content'),
    document.querySelector('.modules-page .ant-tabs-nav')
  )

  const form = document.querySelector('.user-editor__content__wrap')
  if (form) {
    assert(
      form.getBoundingClientRect().width <= 1041,
      'The user form is too wide on a large screen'
    )
    const columns = getComputedStyle(form).gridTemplateColumns.split(' ').length
    assert(
      columns === (innerWidth < 768 ? 1 : 2),
      'The form does not switch between one and two columns'
    )
    for (const field of form.querySelectorAll('.kit-base-field')) {
      const rect = field.getBoundingClientRect()
      assert(
        rect.left >= 0 && rect.right <= innerWidth + 1,
        'A form field overflows horizontally'
      )
    }
    verifyScroll(
      document.querySelector('.user-editor__content'),
      document.querySelector('.user-editor__header')
    )
  }

  const role = document.querySelector('.roles-content')
  const variable = document.querySelector('.variable-editor-form__fields')
  if (visible(variable)) {
    assert(
      variable.getBoundingClientRect().width <= 1041,
      'The variable form is too wide'
    )
    assert(
      variable.getBoundingClientRect().right <= innerWidth + 1,
      'The variable form overflows horizontally'
    )
    verifyScroll(
      document.querySelector('.variable-editor-form'),
      document.querySelector('.variable-editor-header')
    )
    const save = document.querySelector(
      '[data-testid="variable-editor-header__save-btn"]'
    )
    if (save)
      assert(
        save.getBoundingClientRect().bottom <= innerHeight + 1,
        'The variable save action is outside the viewport'
      )
  }
  if (visible(role)) {
    assert(
      role.getBoundingClientRect().width <= 1201,
      'The role form is too wide on a large screen'
    )
    verifyScroll(
      document.querySelector('.roles-content__permissions'),
      document.querySelector('.roles-content__header')
    )
  }
  for (const button of document.querySelectorAll(
    '[data-cy$="save-button"], [data-cy="user-editor__header__btn"]'
  )) {
    const rect = button.getBoundingClientRect()
    assert(
      rect.top >= 0 && rect.bottom <= innerHeight + 1,
      'The save action is outside the viewport'
    )
  }
  assert(scrollY === 0, 'Scrolling a panel moved the document')
  return { passed: true, ...metrics }
}
