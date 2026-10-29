import { FC, memo } from 'react'

import JsonDiffModal from '@components/JsonDiffModal'

import { CompareVersionModalPropsType } from './compare-version-modal.type'

const CompareVersionModal: FC<CompareVersionModalPropsType> = ({
  versions,
  ...props
}) => {
  const [first, second] = versions
  const [original, modified] =
    first.configVersion <= second.configVersion
      ? [first, second]
      : [second, first]
  return (
    <JsonDiffModal
      {...props}
      title="Сравнение версий"
      original={original.data}
      modified={modified.data}
      originalLabel={`Слева: версия ${original.configVersion}`}
      modifiedLabel={`Справа: версия ${modified.configVersion}`}
    />
  )
}

export default memo(CompareVersionModal)
