const getContrastTextColor = (bgColor: string): string => {
  const hex = bgColor.replace(/^#/, '')
  if (!/^(?:[\da-f]{3}|[\da-f]{6})$/i.test(hex)) return '#FFFFFF'

  const color = hex.length === 3 ? hex.replace(/./g, '$&$&') : hex
  const [red, green, blue] = [0, 2, 4].map((index) => {
    const channel = parseInt(color.slice(index, index + 2), 16) / 255
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue
  const contrastWithBlack = (luminance + 0.05) / 0.05
  const contrastWithWhite = 1.05 / (luminance + 0.05)

  return contrastWithBlack >= contrastWithWhite ? '#000000' : '#FFFFFF'
}

export { getContrastTextColor }
