import { Spin } from 'antd'
import { FC, lazy, memo, ReactNode, Suspense, useContext, useMemo } from 'react'

import Modal from '@widgets/Modal'
import { ModalPropsType } from '@widgets/Modal/modal.type'

import { sortObject } from '@utils/objectUtils'

import { Context } from '@stores/index'

import '../CompareVersionModal/compare-version-modal.scss'

interface JsonDiffModalProps extends Omit<
  ModalPropsType,
  'title' | 'children'
> {
  original: Record<string, unknown>
  modified: Record<string, unknown>
  originalLabel: string
  modifiedLabel: string
  title: string
  configName?: string
  toolbar?: ReactNode
}

const DiffEditor = lazy(() =>
  import('@monaco-editor/react').then((mod) => ({ default: mod.DiffEditor }))
)

const JsonDiffModal: FC<JsonDiffModalProps> = ({
  open,
  onClose,
  original,
  modified,
  originalLabel,
  modifiedLabel,
  title,
  configName,
  toolbar
}) => {
  const { changeTheme } = useContext(Context)
  const originalValue = useMemo(
    () => JSON.stringify(sortObject(original), null, 2),
    [original]
  )
  const modifiedValue = useMemo(
    () => JSON.stringify(sortObject(modified), null, 2),
    [modified]
  )

  const handleDiffMount = (editor: any) => {
    const revealFirstDiff = () => {
      const changes = editor?.getLineChanges?.()
      if (!changes?.length) return

      const first = changes[0]
      const line =
        first?.modifiedStartLineNumber ?? first?.originalStartLineNumber ?? 1

      const modifiedEditor = editor?.getModifiedEditor?.()
      modifiedEditor?.revealLineInCenter(line)
      modifiedEditor?.setPosition({ lineNumber: line, column: 1 })
    }

    const disposable = editor?.onDidUpdateDiff?.(() => {
      revealFirstDiff()
      disposable?.dispose?.()
    })

    revealFirstDiff()
  }

  return (
    <Modal
      title={title}
      open={open}
      onClose={onClose}
      width={1440}
      className="compare-version-modal"
    >
      <div className="compare-version-modal__content">
        {configName && (
          <p className="compare-version-modal__description">{configName}</p>
        )}
        {toolbar && (
          <div className="compare-version-modal__toolbar">{toolbar}</div>
        )}
        <div className="compare-version-modal__header">
          <span>{originalLabel}</span>
          <span>{modifiedLabel}</span>
        </div>
        {originalValue === modifiedValue && (
          <p className="compare-version-modal__description" role="status">
            Различий нет
          </p>
        )}
        <div className="compare-version-modal__editor">
          <Suspense
            fallback={
              <div className="compare-version-modal__loading" role="status">
                <Spin />
                Загрузка сравнения…
              </div>
            }
          >
            <DiffEditor
              onMount={handleDiffMount}
              height="100%"
              language="json"
              original={originalValue}
              modified={modifiedValue}
              theme={changeTheme ? 'vs-dark' : 'light'}
              options={{
                readOnly: true,
                domReadOnly: true,

                wordWrap: 'on',
                scrollBeyondLastLine: false,

                renderSideBySide: true,
                ignoreTrimWhitespace: true,
                diffAlgorithm: 'advanced',

                renderIndicators: true,
                renderOverviewRuler: true,

                minimap: { enabled: false },

                hideUnchangedRegions: {
                  enabled: true,
                  contextLineCount: 4,
                  minimumLineCount: 3
                },

                maxComputationTime: 5000
              }}
            />
          </Suspense>
        </div>
      </div>
    </Modal>
  )
}

export default memo(JsonDiffModal)
