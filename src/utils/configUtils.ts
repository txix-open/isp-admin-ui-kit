declare global {
  interface Window {
    config: { [key: string]: any }
    AppVersion: string
  }
}

export const getConfigProperty = (property: string, defaultValue: any) => {
  if (
    window.config &&
    Object.prototype.hasOwnProperty.call(window.config, property)
  ) {
    return window.config[property]
  }
  return defaultValue
}
