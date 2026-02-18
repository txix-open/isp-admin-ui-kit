import { FC } from 'react'

import Modal from '@widgets/Modal'

import { SaveModalPropsType } from '@components/SaveModal/save-modal.type'

import './save-modal.scss'

const SaveModal: FC<SaveModalPropsType> = ({
  open,
  onClose,
  onOk,
  changes
}) => {
  return (
    <div className="save-modal">
      <Modal
        title="Сохранить"
        open={open}
        onClose={onClose}
        onOk={onOk}
        footer={{ onCanselText: 'Отмена', onOkText: 'Подтвердить изменения' }}
      >
        <div className="save-modal__changes-list">
          {changes.allowed.length > 0 && (
            <div className="save-modal__changes-list__changes-section">
              <h3 className="text-allowed">Разрешили:</h3>
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
              <h3 className="text-denied">Запретили:</h3>
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
