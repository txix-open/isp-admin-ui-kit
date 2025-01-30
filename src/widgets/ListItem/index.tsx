import { List, Tooltip } from 'antd'
import { FC } from 'react'

import { ListItemProps } from '@widgets/ListItem/list-item.type.ts'

const ListItem: FC<ListItemProps> = ({ item }) => {
  return (
    <List.Item>
      <Tooltip mouseEnterDelay={1} title={item.name}>
        <List.Item.Meta
          title={item.name}
          description={<span>id: {item.id}</span>}
        />
      </Tooltip>
    </List.Item>
  )
}

export default ListItem
