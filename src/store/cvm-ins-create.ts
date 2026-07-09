import { defineStore } from 'pinia'
import { CVM_INS_CREATE_STORE } from '@/config/constant-config'
import { SECURITY_GROUP_EGRESS_RULES, SECURITY_GROUP_INGRESS_RULES } from '@/views/cvm/ins/config'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'

/**
 * @desc 自定义创建实例
 * @desc 创建实例的部分state会直接修改 不使用action等api修改
 */
export interface CostTypeConfigType {
  cur: number
}

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

export interface InsConfigType extends IPagination {
  list: any[]
  familyCur: any
  typeList: any[]
  typeCur: any
  tableData: any[]
  rowCur: any
  vcpus: number | string
  ram: number | string
}

export interface SysConfigType {
  imageTypeCur: number
  list: any[]
  imagesList: any[]
  platformCur: any
  imageCur: string | number
}

export interface SysFormType {
  diskType: number | string
  size: number
  diskCount: number
}

export interface DataForm {
  diskType: number | string
  size: number
  diskCount: number
  snapshot: any
}

interface DataFormConfigItem {
  tableData: any[]
  formRef: any
  formRefKey: string | number
}

type DataFormList = DataFormConfigItem[]

interface NetConfigType {
  vpcList: any[]
  subnetList: any[]
  vpcCur: string | number
  subnetCur: string | number
}

interface PublicIpConfigType {
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

interface SecurityGroupConfigCreateType {
  egressRules: any[]
  ingressRules: any[]
  checked: any[]
  tabs: any[]
  tabCur: number
  isShow: boolean
}

interface SecurityGroupConfigAlreadyType {
  list: any[]
  checked: any[]
}

interface SecurityGroupConfigType {
  cur: number
  create: SecurityGroupConfigCreateType
  already: SecurityGroupConfigAlreadyType
}

interface LoginFormType {
  password: string
  confirmPassword?: string
}

interface LoginSshFormType {
  keyNameId: string
}

interface LoginConfigType {
  cur: number
  form1: LoginFormType
  form2: LoginSshFormType
  form3: LoginFormType
  sshList: any[]
}

interface ProjectConfigType {
  list: any[]
  cur: string | number
}

interface MonitorConfigType {
  checked: boolean
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
  changeStep: false, // 是否进入下一步
  step: 'a' as string,
  tab: 2 as number,
  costTypeConfig: {
    cur: 2, // 实例计费类型 1 按量计费 2 包年包月
  } as CostTypeConfigType, // 计费模式
  region: {
    id: 0,
    locationId: 0,
  } as AreaType, // 地域
  zoneConfig: {
    list: [], // 列表
    cur: {}, // 选中
  } as ZoneConfigType, // 可用区
  insConfig: {
    list: [], // 实例族列表
    familyCur: {}, // 选中实例族
    typeList: [], // 实例类型列表
    typeCur: {}, // 选中实例类型
    tableData: [], // 实例规格列表
    rowCur: {}, // 选中实例配置
    vcpus: '', //cpu
    ram: '', // 内存
    pagination: {
      pageSize: 10,
      page: 1,
    },
    total: 0,
  } as InsConfigType, // 实例
  sysConfig: {
    imageTypeCur: 1, // 镜像类型: 公共 自定义
    list: [], // 列表
    imagesList: [], // 镜像列表
    platformCur: {}, // 选中系统
    imageCur: '', // 选中镜像
  } as SysConfigType, // 镜像
  sysDiskForm: {
    diskType: '',
    size: 50,
    diskCount: 1,
  } as SysFormType,
  dataDiskForm: {
    diskType: '',
    size: 50,
    diskCount: 1,
    snapshot: {},
  } as DataForm,
  dataDiskFormList: [] as DataFormList,
  netConfig: {
    vpcList: [], // vpc列表
    subnetList: [], // 子网列表
    vpcCur: '', // 选中vpc
    subnetCur: '', // 选中子网
  } as NetConfigType, // 网络
  publicIpConfig: {
    list: [], // 当前地域下支持的宽带计费模式
    size: 1,
    min: 1,
    max: 100,
    marks: {
      // 1: '1Mbps',
      1: {
        style: {
          marginLeft: '10px',
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
  securityGroupConfig: {
    cur: 2,
    create: {
      egressRules: SECURITY_GROUP_EGRESS_RULES,
      ingressRules: SECURITY_GROUP_INGRESS_RULES,
      checked: [1, 2, 3, 6],
      tabs: [
        { label: t('ins.custom.egressRule'), value: 1 }, // 入站规则
        { label: t('ins.custom.ingressRule'), value: 2 }, // 出站规则
      ],
      tabCur: 1,
      isShow: false,
    },
    already: {
      list: [],
      checked: [],
    },
  } as SecurityGroupConfigType, // 安全组
  instanceName: '' as string, // 实例名称
  loginConfig: {
    cur: 2,
    form1: {
      password: '',
      confirmPassword: '',
    }, // 设置密码
    form2: {
      keyNameId: '',
    }, // 立即关联密码
    form3: {
      password: '',
    }, // 自动生成密码
    sshList: [], // 密钥对
  } as LoginConfigType, // 登录方式
  projectConfig: {
    list: [],
    cur: '',
  } as ProjectConfigType, // 项目
  monitorConfig: {
    checked: false,
  } as MonitorConfigType, // 云监控
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
})

export default defineStore(CVM_INS_CREATE_STORE, {
  state: () => {
    return initState()
  },
  getters: {},
  actions: {
    setStep(active: string) {
      console.log(`setStep===>`, active)
      this.step = active
      this.changeStep = true
    },
    setTab(tab: number) {
      console.log(`setTab===>`, tab)
      this.tab = tab
    },
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
