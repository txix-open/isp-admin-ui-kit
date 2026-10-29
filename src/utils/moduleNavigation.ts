// Контекст возврата хранится в истории браузера, без записи в настройки.
export const getModuleScrollState = () => ({
  moduleScrollTop:
    document.querySelector<HTMLElement>('.modules-page__content')?.scrollTop ??
    0
})
