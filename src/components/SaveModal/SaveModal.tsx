import { FC } from 'react'

import Modal from '@widgets/Modal'

import { SaveModalPropsType } from '@components/SaveModal/save-modal.type'

import './save-modal.scss'

const SaveModal: FC<SaveModalPropsType> = ({
  open,
  onClose,
  onOk,
  changes,
  loading
}) => {
  return (
    <div className="save-modal">
      <Modal
        title="Сохранить изменения доступа?"
        loading={loading}
        confirmDisabled={!changes.allowed.length && !changes.denied.length}
        open={open}
        onClose={onClose}
        onOk={onOk}
        footer={{ onCanselText: 'Отмена', onOkText: 'Подтвердить изменения' }}
      >
        <div className="save-modal__changes-list">
          {changes.allowed.length > 0 && (
            <div className="save-modal__changes-list__changes-section">
              <h3 className="text-allowed">Будет разрешено</h3>
              <ul>
                {changes.allowed.map((allowItem: string, i: number) => (
                  <li className="text-allowed" key={i}>
                    {allowItem}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {changes.denied.length > 0 && (
            <div className="save-modal__changes-list__changes-section">
              <h3 className="text-denied">Будет запрещено</h3>
              <ul>
                {changes.denied.map((deniedItem: string, i: number) => (
                  <li className="text-denied" key={i}>
                    {deniedItem}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default SaveModal
