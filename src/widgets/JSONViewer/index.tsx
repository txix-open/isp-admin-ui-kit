import RefParser from '@apidevtools/json-schema-ref-parser'
import { Alert, Spin } from 'antd'
import JSONSchemaView from 'json-schema-view-js'
import cloneDeep from 'lodash.clonedeep'
import { FC, useContext, useEffect, useRef, useState } from 'react'

import { ensureSchemaBrowserCompatibility } from '@utils/schemaBrowserCompatibility'

import { Context } from '@stores/index'

import 'json-schema-view-js/dist/style.min.css'

interface JsonSchemaViewerProps {
  schema: object
}

const JsonSchemaViewer: FC<JsonSchemaViewerProps> = ({ schema }) => {
  const { changeTheme } = useContext(Context)
  const myRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    const container = myRef.current
    let disposed = false
    setStatus('loading')
    container?.replaceChildren()
    const render = async () => {
      try {
        ensureSchemaBrowserCompatibility()
        const resolved = await RefParser.dereference(cloneDeep(schema), {
          dereference: { circular: true }
        })
        if (disposed || !container) return
        const view = new JSONSchemaView(resolved, 3, {
          theme: changeTheme ? 'dark' : ''
        })
        container.replaceChildren(view.render())
        setStatus('ready')
      } catch {
        if (!disposed) setStatus('error')
      }
    }
    void render()
    return () => {
      disposed = true
      container?.replaceChildren()
    }
  }, [schema, changeTheme])

  return (
    <>
      {status === 'loading' && (
        <div role="status">
          <Spin size="small" /> Загрузка схемы…
        </div>
      )}
      {status === 'error' && (
        <Alert
          type="error"
          showIcon
          title="Не удалось отобразить схему"
          description="Проверьте структуру схемы и доступность её ссылок."
        />
      )}
      <div ref={myRef} />
    </>
  )
}

export default JsonSchemaViewer
