import Editor, { useMonaco } from '@monaco-editor/react'
import { IDisposable } from 'monaco-editor'
import { FC, useContext, useEffect, useState } from 'react'

import { ConfigurationEditorPropsType } from '@pages/ConfigurationEditorPage/ConfigurationEditor.type.ts'
import { ConfigType } from '@pages/ModulesPage/module.type.ts'

import variablesApi from '@services/variablesService.ts'

import { Context } from '@stores/index.tsx'

const ConfigurationEditorCode: FC<ConfigurationEditorPropsType> = ({
  setDisableBtn = () => {},
  bufConfig,
  setBufConfig,
  jsonSchema
}) => {
  const editorValue = JSON.stringify(bufConfig?.data, null, '\t')
  const [completionDisposable, setCompletionDisposable] =
    useState<IDisposable>()
  const { data: variables = [] } = variablesApi.useGetAllVariablesQuery()
  const { changeTheme } = useContext(Context)
  const monaco = useMonaco()
  const arrayValues = variables.map((word) => word.name)

  useEffect(() => {
    if (monaco && jsonSchema) {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
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
  }, [monaco, jsonSchema])

  useEffect(() => {
    return () => {
      if (typeof completionDisposable?.dispose === 'function') {
        completionDisposable?.dispose()
      }
    }
  }, [completionDisposable])

  const handleChange = (data: string | undefined) => {
    if (monaco) {
      setCompletionDisposable(
        monaco.languages.registerCompletionItemProvider('json', {
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
                  kind: monaco.languages.CompletionItemKind.Variable,
                  insertText: insertText,
                  insertTextRules:
                    monaco.languages.CompletionItemInsertTextRule
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
      <Editor
        onMount={(editor) => {
          const provider = monaco?.languages.registerCompletionItemProvider(
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
        value={editorValue}
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
    </div>
  )
}

export default ConfigurationEditorCode
