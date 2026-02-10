import { Spin } from 'antd'
import type { IDisposable } from 'monaco-editor'
import type * as Monaco from 'monaco-editor'
import { FC, lazy, Suspense, useContext, useEffect, useState } from 'react'

import { ConfigurationEditorPropsType } from '@pages/ConfigurationEditorPage/ConfigurationEditor.type'
import { ConfigType } from '@pages/ModulesPage/module.type'

import variablesApi from '@services/variablesService'

import { Context } from '@stores/index'

const MonacoEditor = lazy(() => import('@monaco-editor/react'))

const ConfigurationEditorCode: FC<ConfigurationEditorPropsType> = ({
  setDisableBtn = () => {},
  bufConfig,
  setBufConfig,
  jsonSchema
}) => {
  const editorValue = JSON.stringify(bufConfig?.data, null, '\t')
  const [completionDisposable, setCompletionDisposable] =
    useState<IDisposable>()
  const [monacoInstance, setMonacoInstance] = useState<typeof Monaco | null>(
    null
  )
  const { data: variables = [] } = variablesApi.useGetAllVariablesQuery()
  const { changeTheme } = useContext(Context)
  const arrayValues = variables.map((word) => word.name)

  useEffect(() => {
    if (monacoInstance && jsonSchema) {
      const jsonDefaults = (monacoInstance.languages as any).json.jsonDefaults
      jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
          {
            uri: 'schema://model/schema.json',
            fileMatch: ['*'],
            schema: jsonSchema.schema
          }
        ]
      })
    }
  }, [monacoInstance, jsonSchema])

  useEffect(() => {
    return () => {
      if (typeof completionDisposable?.dispose === 'function') {
        completionDisposable?.dispose()
      }
    }
  }, [completionDisposable])

  const handleChange = (data: string | undefined) => {
    if (monacoInstance) {
      setCompletionDisposable(
        monacoInstance.languages.registerCompletionItemProvider('json', {
          triggerCharacters: ['"', '(', ')', ':'],
          provideCompletionItems: (model, position) => {
            const currentLineText = model.getLineContent(position.lineNumber)
            const cursorPos = position.column - 1

            const textBeforeCursor = currentLineText.substring(0, cursorPos)
            const textAfterCursor = currentLineText.substring(cursorPos)

            const quotesBefore = (textBeforeCursor.match(/"/g) || []).length
            const isInsideQuotes = quotesBefore % 2 === 1
            const hasClosingQuote = textAfterCursor.includes('"')
            const hasClosingBracket = textAfterCursor.includes(')')

            const isVarContext =
              textBeforeCursor.includes('_Var(') ||
              textBeforeCursor.includes('_Var()')

            const word = model.getWordUntilPosition(position)
            const range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
            }

            if (isVarContext) {
              const values = arrayValues.map((item: string) => {
                let insertText = `_Var(${item}`

                if (!hasClosingBracket) {
                  insertText += ')'
                }

                const needsQuotes = !isInsideQuotes
                const needsClosingQuote = isInsideQuotes && !hasClosingQuote

                if (needsQuotes) {
                  insertText = `"${insertText}"`
                }

                if (needsClosingQuote) {
                  insertText += '"'
                }

                return {
                  label: item,
                  kind: monacoInstance.languages.CompletionItemKind.Variable,
                  insertText: insertText,
                  insertTextRules:
                    monacoInstance.languages.CompletionItemInsertTextRule
                      .InsertAsSnippet,
                  range: range,
                  filterText: `_Var(${item})`,
                  documentation: `Insert ${item} value`,
                  commitCharacters: ['"', ')', ',']
                }
              })

              return { suggestions: values }
            }

            return { suggestions: [] }
          }
        })
      )
    }

    if (data) {
      try {
        const newData = {
          ...bufConfig,
          data: { ...JSON.parse(data) }
        } as ConfigType
        setDisableBtn(false)
        setBufConfig(newData)
      } catch (error) {
        setDisableBtn(true)
      }
    }
  }

  return (
    <div>
      <Suspense fallback={<Spin />}>
        <MonacoEditor
          onMount={(editor, monaco) => {
            setMonacoInstance(monaco as typeof Monaco)
            const provider = monaco.languages.registerCompletionItemProvider(
              'json',
              {
                triggerCharacters: ['"', '(', ')'],
                provideCompletionItems: () => {
                  return { suggestions: [] }
                }
              }
            )

            editor.onDidChangeModelContent(() => {
              const position = editor.getPosition()
              if (!position) return

              const model = editor.getModel()
              if (!model) return

              const lineContent = model.getLineContent(position.lineNumber)
              const textBeforeCursor = lineContent.substring(
                0,
                position.column - 1
              )

              if (
                textBeforeCursor.includes('"_Var(') &&
                !lineContent.includes('"_Var()"')
              ) {
                setTimeout(() => {
                  editor.trigger('', 'editor.action.triggerSuggest', {})
                }, 100)
              }
            })
            return () => provider?.dispose()
          }}
          width="auto"
          height="100vh"
          language="json"
          theme={changeTheme ? 'vs-dark' : 'vs-white'}
          defaultValue={editorValue}
          onChange={(value) => handleChange(value)}
          options={{
            quickSuggestions: {
              strings: true
            },
            minimap: {
              enabled: false
            },
            fontSize: 16
          }}
        />
      </Suspense>
    </div>
  )
}

export default ConfigurationEditorCode
