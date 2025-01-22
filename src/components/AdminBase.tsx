import Routers from '@routes/Routers'

import './admin-base.scss'

const AdminBase = ({ customRouters }: any) => {
  return <Routers customRouters={customRouters} />
}

export default AdminBase
