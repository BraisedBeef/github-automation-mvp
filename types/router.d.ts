import type { RouteRecordRaw } from 'vue-router'

declare global {
  type MetaConfig = {
    icon?: string
    rightIcon?: string
    title?: string
    notMenu?: boolean
    permissions?: string[] | string
    public?: boolean
    product?: boolean
    dynamicRoute?: boolean
    hidePageHeaderInV1?: boolean
    hidePageHeaderInV2?: boolean
  } & ({ notMenu: true; notMenuRedirect: string } | { notMenu?: false | undefined; notMenuRedirect?: never })

  type PlusRouteRecordRaw = RouteRecordRaw & {
    name: string
    path: string
    children?: PlusRouteRecordRaw[]
    redirect?: string
    meta?: MetaConfig
  }
}

export {}
