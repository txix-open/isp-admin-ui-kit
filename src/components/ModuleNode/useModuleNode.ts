import { theme } from 'antd'
import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useMemo
} from 'react'

import {
  DEFAULT_EDGE_COLOR,
  MODULE_NODE_DEFAULT_BORDER_COLOR,
  MODULE_NODE_RELATED_SHADOW
} from '@constants/modulesRelationsDiagram'

import { type ModuleNodeDataType } from '@components/ModuleNode/module-node.type'

const getBorderColor = (
  data: ModuleNodeDataType,
  token: ReturnType<typeof theme.useToken>['token']
) => {
  if (data.isSelected) {
    return token.colorPrimary
  }

  if (data.isConnected) {
    return DEFAULT_EDGE_COLOR
  }

  if (data.isDimmed) {
    return token.colorBorder
  }

  return MODULE_NODE_DEFAULT_BORDER_COLOR
}

const getBoxShadow = (
  data: ModuleNodeDataType,
  token: ReturnType<typeof theme.useToken>['token']
) => {
  if (data.isSelected) {
    return `0 0 0 3px ${token.colorPrimaryBg}, 0 8px 20px ${token.colorPrimaryBgHover}`
  }

  if (data.isConnected) {
    return MODULE_NODE_RELATED_SHADOW
  }

  return `0 2px 8px ${token.colorBgContainer}`
}

export const useModuleNode = (data: ModuleNodeDataType) => {
  const { token } = theme.useToken()
  const handleSelect = useCallback(() => {
    data.onSelect?.(data.id)
  }, [data.id, data.onSelect])
  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation()
      handleSelect()
    },
    [handleSelect]
  )
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      handleSelect()
    },
    [handleSelect]
  )

  const borderColor = getBorderColor(data, token)
  const boxShadow = getBoxShadow(data, token)
  const handleStyle = useMemo<CSSProperties>(
    () => ({ width: 8, height: 8, opacity: data.isDimmed ? 0.35 : 1 }),
    [data.isDimmed]
  )
  const containerStyle = useMemo<CSSProperties>(
    () => ({
      background: token.colorBgContainer,
      borderColor,
      boxShadow,
      opacity: data.isDimmed ? 0.35 : 1
    }),
    [borderColor, boxShadow, data.isDimmed, token.colorBgContainer]
  )
  const headerStyle = useMemo<CSSProperties>(
    () => ({ borderBottomColor: token.colorBorder }),
    [token.colorBorder]
  )
  const metaStyle = useMemo<CSSProperties>(
    () => ({ color: token.colorTextSecondary }),
    [token.colorTextSecondary]
  )

  return {
    containerStyle,
    handleClick,
    handleKeyDown,
    handleStyle,
    headerStyle,
    metaStyle
  }
}
