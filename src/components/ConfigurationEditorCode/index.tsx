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
            uri: 'http://myserver/foo-schema.json',
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

  useEffect(() => {
    if (monaco) {
      setCompletionDisposable(
        monaco.languages.registerCompletionItemProvider('json', {
          provideCompletionItems: (model, position) => {
            const textUntilPosition = model.getValueInRange({
              startLineNumber: position.lineNumber,
              startColumn: 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column
            })
            const word = model.getWordUntilPosition(position)
            const range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
            }

            if (
              textUntilPosition.includes('_Var(') &&
              arrayValues &&
              arrayValues.length > 0
            ) {
              const values = arrayValues.map((item: string) => {
                return {
                  label: item,
                  kind: monaco.languages.CompletionItemKind.Variable,
                  insertText: '"_Var(' + item + ')"',
                  insertTextRules:
                    monaco.languages.CompletionItemInsertTextRule
                      .InsertAsSnippet,
                  range: range,
                  filterText: '_Var(' + item
                }
              })
              return {
                suggestions: values
              }
            }
          }
        })
      )
    }
  }, [monaco, variables])

  const handleChange = (data: string | undefined) => {
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
        width="auto"
        height="100vh"
        language="json"
        theme={changeTheme ? 'vs-dark' : 'vs-white'}
        value={editorValue}
        onChange={handleChange}
        options={{
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
