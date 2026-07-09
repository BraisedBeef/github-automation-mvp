import { defineStore } from 'pinia'
import { CVM_INS_FAST_CREATE_STORE } from '@/config/constant-config'

/**
 * @desc 快速创建实例
 * @desc 创建实例的部分state会直接修改 不使用action等api修改
 */
export interface AreaType {
  id: number
  locationId: number
  [key: string]: any
}
export interface ZoneConfigType {
  list: any[]
  cur: any
  [key: string]: any
}

export interface SysConfigType {
  list: any[]
  imagesList: any[]
  cur: any
  imageCur: string
}

export interface InsConfigType {
  list: any[]
  cur: any
}

interface NetConfigType {
  vpcList: any[]
  subnetList: any[]
  vpcCur: string | number
  subnetCur: string | number
}

export interface PublicIpConfigType {
  list: any[]
  size: number
  min: number
  max: number
  marks: {
    [x: number]: any
  }
  checked: boolean
  chargeTypeCur: number
  lineTypeCur: number
  lineTypeList: any[]
  pkgIdCur: string | number
  pkgList: any[]
}

interface AutoRenewConfigType {
  checked: boolean
}

interface AgreeConfigType {
  checked: boolean
}

interface InsCountConfigType {
  num: number
  min: number
  max: number
}

export const initState = () => ({
  region: {
    id: 0,
    locationId: 0,
  } as AreaType, // 地域
  zoneConfig: {
    list: [], // 列表
    cur: {}, // 选中
  } as ZoneConfigType, // 可用区
  sysConfig: {
    list: [], // 列表
    imagesList: [], // 镜像列表
    cur: {}, // 选中系统
    imageCur: '', // 选中镜像
  } as SysConfigType, // 系统
  insConfig: {
    list: [], // 列表
    cur: {}, // 选中
  } as InsConfigType, // 实例
  netConfig: {
    vpcList: [], // vpc列表
    subnetList: [], // 子网列表
    vpcCur: '', // 选中vpc
    subnetCur: '', // 选中子网
  } as NetConfigType, // 网络
  publicIpConfig: {
    list: [], // 当前地域下支持的宽带计费模式
    size: 1, // 大小
    min: 1,
    max: 100,
    marks: {
      // 0: '0GBI',
      // 1: '1Mbps',
      1: {
        style: {
          marginLeft: '10px',
          // left: '10%'
        },
        label: '1Mbps',
      },
      20: '20Mbps',
      40: '40Mbps',
      100: {
        style: {
          marginLeft: '-25px',
        },
        label: '100Mbps',
      },
    },
    checked: true,
    chargeTypeCur: 2,
    lineTypeCur: 0,
    lineTypeList: [], // 线路列表
    pkgIdCur: '',
    pkgList: [], // 共享包列表
  } as PublicIpConfigType, // 公网ip
  autoRenewConfig: {
    checked: false,
  } as AutoRenewConfigType, // 自动续费
  agreeConfig: {
    checked: false,
  } as AgreeConfigType, // 协议
  insCountConfig: {
    num: 1,
    min: 1,
    max: 10,
  } as InsCountConfigType, // 购买数量
  periodNum: 1 as number, // 购买时长
  password: '' as string, // 服务器密码
})

export default defineStore(CVM_INS_FAST_CREATE_STORE, {
  state: () => {
    return initState()
  },
  getters: {},
  actions: {
    clear() {
      const state = initState()
      for (const key of Object.keys(state)) {
        this[key] = state[key]
      }
    },
    setState(state?: any) {
      for (const key of Object.keys(state)) {
        this[key] = state[key]
      }
    },
  },
  persist: {
    storage: sessionStorage,
  },
})
