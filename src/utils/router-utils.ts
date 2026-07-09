import { _deepClone } from '@/utils/collection-utils'

export const _filterRoutes = (_routes: any[]) => {
  const routes = _deepClone(_routes)
  const filterRoutes = routes.filter(item => {
    if (item.children && !item.meta?.notMenu) {
      item.children = _filterRoutes(item.children)
      if (item.children.length === 0) {
        delete item.children
      }
      return item
    } else {
      return !item.meta?.notMenu
    }
  })
  return import.meta.env.MODE === 'prod' ? filterRoutes.filter(item => item.name !== 'Test') : filterRoutes
}

export const _flatRoutes = (arr: any[]) => {
  const resultArr: any[] = []
  const flat = (insertArr: any[]) => {
    insertArr.forEach(item => {
      resultArr.push({
        path: item.path,
        name: item.name,
        meta: item.meta || {},
      })
      if (item.children) {
        flat(item.children)
      }
    })
  }
  flat(arr)
  return resultArr
}
