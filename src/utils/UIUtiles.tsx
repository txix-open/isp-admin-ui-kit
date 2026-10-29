import { UIDataType } from '@pages/ProfilePage/profile-page.type'

const defaultColor = '#1677ff'
const defaultTitle = 'Панель управления'
let configuredTitle = defaultTitle

/** Keep the last configured name when a refresh returns an empty or missing name. */
export const initUITitle = (name?: string) => {
  if (typeof name === 'string' && name.trim()) configuredTitle = name.trim()
  document.title = configuredTitle
}

// Canvas normalizes CSS colors without interpolating configuration into SVG markup.
const getIconColors = (color: string) => {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d')
  if (!context) return { background: defaultColor, foreground: '#ffffff' }
  context.fillStyle = defaultColor
  context.fillStyle =
    (typeof color === 'string' && color.trim()) || defaultColor
  context.fillRect(0, 0, 1, 1)
  const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data
  if (!alpha) return { background: defaultColor, foreground: '#ffffff' }
  const opacity = alpha / 255
  const rgb = [red, green, blue].map((value) =>
    Math.round(value * opacity + 255 * (1 - opacity))
  )
  const luminance = rgb
    .map((value) => {
      const channel = value / 255
      return channel <= 0.04045
        ? channel / 12.92
        : Math.pow((channel + 0.055) / 1.055, 2.4)
    })
    .reduce(
      (sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index],
      0
    )
  return {
    background: `rgb(${rgb.join(',')})`,
    foreground: luminance > 0.3 ? '#101828' : '#ffffff'
  }
}

const drawSVG = (color: string) => {
  const { background, foreground } = getIconColors(color)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs><linearGradient id="sheen" x2="0" y2="1"><stop stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".08"/></linearGradient></defs>
  <rect x="2" y="2" width="60" height="60" rx="16" fill="${background}"/>
  <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#sheen)"/>
  <rect x="2.5" y="2.5" width="59" height="59" rx="15.5" fill="none" stroke="${foreground}" stroke-opacity=".16"/>
  <g stroke="${foreground}" stroke-width="4" stroke-linecap="round" opacity=".6"><path d="M16 21h32M16 32h32M16 43h32"/></g>
  <g fill="${foreground}" stroke="${background}" stroke-width="3"><rect x="23" y="15" width="8" height="12" rx="4"/><rect x="37" y="26" width="8" height="12" rx="4"/><rect x="19" y="37" width="8" height="12" rx="4"/></g>
</svg>`
}

export const createSVG = (color: string) => btoa(drawSVG(color))

export const initSVG = (color: string) => {
  const favicon = document.createElement('link')
  favicon.id = 'favicon'
  favicon.rel = 'icon'
  favicon.type = 'image/svg+xml'
  favicon.sizes.add('any')
  favicon.href = `data:image/svg+xml;base64,${createSVG(color)}`
  return favicon
}

export const initUI = (ui: UIDataType) => {
  initUITitle(ui.name)
  const favicon = initSVG(ui.primaryColor)
  const existing = document.head.querySelectorAll('link[rel~="icon"]')
  existing.forEach((icon) => icon.remove())
  document.getElementById('favicon')?.remove()
  document.head.append(favicon)
}
