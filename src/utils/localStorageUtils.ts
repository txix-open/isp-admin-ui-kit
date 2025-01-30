export const LocalStorage = {
  set(key: string, value: any): void {
    const item = typeof value === 'string' ? value : JSON.stringify(value)
    localStorage.setItem(key, item)
  },
  get(key: string): any | null {
    const value = localStorage.getItem(key)
    try {
      return value ? JSON.parse(value) : null
    } catch (error) {
      return value
    }
  },
  remove(key: string): void {
    localStorage.removeItem(key)
  },
  clear(): void {
    localStorage.clear()
  }
}
