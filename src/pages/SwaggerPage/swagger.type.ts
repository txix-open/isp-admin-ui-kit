import { RefObject } from 'react'

export interface RedocViewPropsType {
  spec: object
  isDark: boolean
  containerRef: RefObject<HTMLDivElement>
}
