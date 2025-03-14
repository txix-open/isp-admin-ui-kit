import { UIDataType } from '@pages/ProfilePage/profile-page.type.ts'

const drawSVG = (color: string) =>
  `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" fill="${color}"><path d="M24 19h-1v-2.2c-1.853 4.237-6.083 7.2-11 7.2-6.623 0-12-5.377-12-12h1c0 6.071 4.929 11 11 11 4.66 0 8.647-2.904 10.249-7h-2.249v-1h4v4zm-11.036 0h-1.886c-.34-.957-.437-1.571-1.177-1.878h-.001c-.743-.308-1.251.061-2.162.494l-1.333-1.333c.427-.899.804-1.415.494-2.163-.308-.74-.926-.839-1.878-1.177v-1.886c.954-.339 1.57-.437 1.878-1.178.308-.743-.06-1.248-.494-2.162l1.333-1.333c.918.436 1.421.801 2.162.494l.001-.001c.74-.307.838-.924 1.177-1.877h1.886c.34.958.437 1.57 1.177 1.877l.001.001c.743.308 1.252-.062 2.162-.494l1.333 1.333c-.435.917-.801 1.421-.494 2.161v.001c.307.739.915.835 1.878 1.178v1.886c-.953.338-1.571.437-1.878 1.178-.308.743.06 1.249.494 2.162l-1.333 1.333c-.92-.438-1.42-.802-2.157-.496-.746.31-.844.926-1.183 1.88zm-.943-4.667c-1.289 0-2.333-1.044-2.333-2.333 0-1.289 1.044-2.334 2.333-2.334 1.289 0 2.333 1.045 2.333 2.334 0 1.289-1.044 2.333-2.333 2.333zm-8.021-5.333h-4v-4h1v2.2c1.853-4.237 6.083-7.2 11-7.2 6.623 0 12 5.377 12 12h-1c0-6.071-4.929-11-11-11-4.66 0-8.647 2.904-10.249 7h2.249v1z"></path></svg>`

export const createSVG = (color: string) => {
  const svgString = drawSVG(color)
  return btoa(svgString) // base64
}

export const initSVG = (color: string) => {
  const favicon = document.createElement('link')
  favicon.id = 'favicon'
  favicon.rel = 'shortcut icon'
  favicon.type = 'image/x-icon'
  favicon.href = `data:image/svg+xml;base64,${createSVG(color)}`
  return favicon
}

export const initUI = (ui: UIDataType) => {
  let favicon = document.getElementById('favicon')
  favicon = initSVG(ui.primaryColor)
  const titles = document.getElementsByTagName('title')
  document.head.insertBefore(favicon, titles[0])
  document.title = ui.name
}
