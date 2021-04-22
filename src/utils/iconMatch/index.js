import localIcon  from './local'
import remoteIcon from './remote'

export default async (pwd, item, action) => {
    if (action === 'local')  return localIcon(pwd, item)
    if (action === 'remote') return remoteIcon(item)
}
