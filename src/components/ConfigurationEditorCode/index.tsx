import { Alert } from 'antd'
import type { IDisposable } from 'monaco-editor'
import type * as Monaco from 'monaco-editor'
import {
  FC,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

import { PageLoading } from '@components/PageLayout'

import { ConfigurationEditorPropsType } from '@pages/ConfigurationEditorPage/ConfigurationEditor.type'

import variablesApi from '@services/variablesService'

import { Context } from '@stores/index'

const MonacoEditor = lazy(() => import('@monaco-editor/react'))

const ConfigurationEditorCode: FC<ConfigurationEditorPropsType> = ({
  setDisableBtn = () => {},
  bufConfig,
  setBufConfig,
  jsonSchema,
  disabled = false
}) => {
  const editorValue = JSON.stringify(bufConfig?.data, null, '\t')
  const contentSubscription = useRef<IDisposable>()
  const suggestionTimer = useRef<ReturnType<typeof setTimeout>>()
  const [parseError, setParseError] = useState(false)
  const [monacoInstance, setMonacoInstance] = useState<typeof Monaco | null>(
    null
  )
  const { data: variables = [] } = variablesApi.useGetAllVariablesQuery()
  const { changeTheme } = useContext(Context)

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
    if (monacoInstance) {
      const arrayValues = variables.map((word) => word.name)
      const provider = monacoInstance.languages.registerCompletionItemProvider(
        'json',
        {
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
        }
      )
      return () => provider.dispose()
    }
  }, [monacoInstance, variables])

  useEffect(
    () => () => {
      contentSubscription.current?.dispose()
      clearTimeout(suggestionTimer.current)
    },
    []
  )

  const handleChange = (value: string | undefined) => {
    if (disabled) return
    try {
      const data = JSON.parse(value ?? '')
      if (data === null || typeof data !== 'object')
        throw new Error('Expected JSON object')
      setDisableBtn(false)
      setParseError(false)
      setBufConfig((previous) => (previous ? { ...previous, data } : previous))
    } catch {
      setDisableBtn(true)
      setParseError(true)
    }
  }

  return (
    <div className="configuration-editor-page__code">
      {parseError && (
        <Alert
          type="error"
          showIcon
          title="Некорректный JSON"
          description="Исправьте JSON, чтобы сохранить конфигурацию или переключить режим. Введённый текст остаётся в редакторе."
        />
      )}
      <div className="configuration-editor-page__code-surface">
        <Suspense fallback={<PageLoading label="Загрузка редактора…" />}>
          <MonacoEditor
            onMount={(editor, monaco) => {
              setMonacoInstance(monaco as typeof Monaco)
              contentSubscription.current = editor.onDidChangeModelContent(
                () => {
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
                    clearTimeout(suggestionTimer.current)
                    suggestionTimer.current = setTimeout(() => {
                      editor.trigger('', 'editor.action.triggerSuggest', {})
                    }, 100)
                  }
                }
              )
            }}
            width="auto"
            height="100%"
            language="json"
            theme={changeTheme ? 'vs-dark' : 'vs-white'}
            defaultValue={editorValue}
            onChange={(value) => handleChange(value)}
            options={{
              readOnly: disabled,
              automaticLayout: true,
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
    </div>
  )
}

export default ConfigurationEditorCode
