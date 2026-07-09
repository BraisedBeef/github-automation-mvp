import { PRIMARY_COLOR, GREEN_COLOR, RED_COLOR, YELLOW_COLOR, BLUE_COLOR, GREY_COLOR } from '@/views/cvm/disk/config'
import t from '@/utils/i18n'
import { mapToKeyValueArray, generateRamArray } from '@/views/cvm/utils'
import csTimeCost from '@/assets/images/cvm/cs-time-cost.png'
import csFlowCost from '@/assets/images/cvm/cs-flow-cost.png'
import { permMap } from '@/hooks/permission/use-cvm-and-network-permission'

// 默认请求的实例状态
export const INS_DEFAULT_STATES = [
  'BUILD',
  'LAUNCH_FAILED',
  'STOPPING',
  'STOPPED',
  'STARTING',
  'RUNNING',
  'BAND_SSH_ING',
  'UNBAND_SSH_ING',
  'REBOOTING',
  'REBUILDING',
  'RESIZE',
  'TERMINATING',
  'REFUNDING',
  'CHANGE_PWD_ING',
]

// 所有实例状态
export const INS_STATE_MAP = {
  BUILD: t('ins.config.BUILD'), // 创建中
  LAUNCH_FAILED: t('ins.config.LAUNCH_FAILED'), // 创建失败
  STOPPING: t('ins.config.STOPPING'), // 关机中
  STOPPED: t('ins.config.STOPPED'), //已关机
  STARTING: t('ins.config.STARTING'), //开机中
  RUNNING: t('ins.config.RUNNING'), //运行中
  BAND_SSH_ING: t('ins.config.BAND_SSH_ING'), //绑定秘钥中
  UNBAND_SSH_ING: t('ins.config.UNBAND_SSH_ING'), //解绑秘钥中
  REBOOTING: t('ins.config.REBOOTING'), //重启中
  REBUILDING: t('ins.config.REBUILDING'), //重置中
  REBUILDING_SPECIFICATIONS: t('ins.config.REBUILDING_SPECIFICATIONS'), //重装规格中 =>阿发说去掉该状态 调整配置还是会有该状态
  RESIZE: t('ins.config.RESIZE'), //变更规格中
  DELETED: t('ins.config.DELETED'), //实例已被删除
  SHUTDOWN: t('ins.config.SHUTDOWN'), //停止待销毁（待回收）
  TERMINATING: t('ins.config.TERMINATING'), //销毁中
  REFUNDING: t('ins.config.REFUNDING'), //退还中
  CHANGE_PWD_ING: t('ins.config.CHANGE_PWD_ING'), //重置密码中
}

// 实例状态
export const INS_STATE_FILTER_MAP = {
  BUILD: t('ins.config.BUILD'), // 创建中
  STOPPING: t('ins.config.STOPPING'), // 关机中
  STOPPED: t('ins.config.STOPPED'), //已关机
  RUNNING: t('ins.config.RUNNING'), //运行中
  REBOOTING: t('ins.config.REBOOTING'), //重启中
  REBUILDING: t('ins.config.REBUILDING'), //重置中
  RESIZE: t('ins.config.RESIZE'), //变更规格中
  REFUNDING: t('ins.config.REFUNDING'), //退还中
  CHANGE_PWD_ING: t('ins.config.CHANGE_PWD_ING'), //重置密码中
}

// 实例状态
export const INS_STATE_ARR_MAP = [
  {
    text: t('ins.config.BUILD'), // 创建中
    color: PRIMARY_COLOR,
    value: 'BUILD',
  },
  {
    text: t('ins.config.LAUNCH_FAILED'), // 创建失败
    color: PRIMARY_COLOR,
    value: 'LAUNCH_FAILED',
  },
  {
    text: t('ins.config.STOPPING'), // 关机中
    color: PRIMARY_COLOR,
    value: 'STOPPING',
  },
  {
    text: t('ins.config.STOPPED'), // 已关机
    color: GREY_COLOR,
    value: 'STOPPED',
  },
  {
    text: t('ins.config.STARTING'), // 开机中
    color: PRIMARY_COLOR,
    value: 'STARTING',
  },
  {
    text: t('ins.config.RUNNING'),
    color: GREEN_COLOR,
    value: 'RUNNING',
  },
  {
    text: t('ins.config.BAND_SSH_ING'),
    color: PRIMARY_COLOR,
    value: 'BAND_SSH_ING',
  },
  {
    text: t('ins.config.UNBAND_SSH_ING'),
    color: YELLOW_COLOR,
    value: 'UNBAND_SSH_ING',
  },
  {
    text: t('ins.config.REBOOTING'),
    color: YELLOW_COLOR,
    value: 'REBOOTING',
  },
  {
    text: t('ins.config.REBUILDING'),
    color: YELLOW_COLOR,
    value: 'REBUILDING',
  },
  {
    text: t('ins.config.REBUILDING_SPECIFICATIONS'),
    color: PRIMARY_COLOR,
    value: 'REBUILDING_SPECIFICATIONS', // =>阿发说去掉该状态 调整配置还是会有该状态
  },
  {
    text: t('ins.config.RESIZE'),
    color: PRIMARY_COLOR,
    value: 'RESIZE',
  },
  {
    text: t('ins.config.DELETED'),
    color: RED_COLOR,
    value: 'DELETED',
  },
  {
    text: t('ins.config.SHUTDOWN'),
    color: BLUE_COLOR,
    value: 'SHUTDOWN',
  },
  {
    text: t('ins.config.TERMINATING'),
    color: YELLOW_COLOR,
    value: 'TERMINATING',
  },
  {
    text: t('ins.config.REFUNDING'),
    color: YELLOW_COLOR,
    value: 'REFUNDING',
  },
  {
    text: t('ins.config.CHANGE_PWD_ING'),
    color: YELLOW_COLOR,
    value: 'CHANGE_PWD_ING',
  },
]

// 实例状态
export const INS_STATE_FILTER_ARR_MAP = mapToKeyValueArray(INS_STATE_FILTER_MAP)

// 快速创建=>实例机型类型名称
export const INS_TYPE_NAME_MAP = {
  1: t('ins.config.base'), // 基础
  2: t('ins.config.standard'), // 标准
  3: t('ins.config.major'), // 专业
}

// 自定义创建=>计费模式
export const COST_TYPE_CONFIG_LIST = [
  {
    icon: csTimeCost,
    labelMain: t('ins.custom.timeCost'), // 包年包月
    labelSub: t('ins.custom.timeCostDesc'),
    value: 2,
  },
  {
    icon: csFlowCost,
    labelMain: t('ins.custom.flowCost'), // 按量计费
    labelSub: t('ins.custom.flowCostDesc'),
    value: 1,
  },
]

// 自定义创建=>安全组
export const SECURITY_GROUP_CONFIG_LIST = [
  {
    label: t('ins.custom.createSecurityGroup'), // 新建安全组
    value: 1,
  },
  {
    label: t('ins.custom.existSecurityGroup'), // 已有安全组
    value: 2,
  },
]

// 自定义创建=>登录方式
export const LOGIN_CONFIG_LIST = [
  {
    label: t('ins.custom.setPwd'), // 设置密码
    value: 1,
  },
  {
    label: t('ins.custom.associatePwd'), // 立即关联密码
    value: 2,
  },
  {
    label: t('ins.custom.autoPwd'), // 自动生成密码
    value: 3,
  },
]

// 自定义创建=>宽带计费模式
export const PUBLIC_IP_CONFIG_LIST = [
  {
    label: t('ins.custom.timeCostpublicIp'), // 按带宽计费
    value: 2,
    costType: [2], // 实例计费模式
  },
  {
    label: t('ins.custom.flowCostpublicIp'), // 按流量计费
    value: 1,
    costType: [1, 2],
  },
  {
    label: t('ins.custom.sharedTrafficPackage'), // 共享流量包
    value: 3,
    costType: [1, 2],
  },
]

// 实例系统盘大小
export const INS_SYS_SIZE = 50

// 实例系统svg
export const INS_STATE_SVG_MAP = {
  BUILD: 'cs-ins-BUILD', // 创建中
  STOPPED: 'cs-ins-STOPPED', //已关机
  RUNNING: 'cs-ins-RUNNING', //运行中
  REBOOTING: 'cs-ins-REBOOTING', //重启中
  SHUTDOWN: 'cs-ins-SHUTDOWN', //停止待销毁（待回收）
}

// 实例系统svg
export const INS_SYS_SVG_MAP = {
  CentOS: {
    default: 'cs-cent-os',
    actived: 'cs-cent-os-actived',
  },
  Windows: {
    default: 'cs-window',
    actived: 'cs-window-actived',
  },
  Ubuntu: {
    default: 'cs-ubuntu',
    actived: 'cs-ubuntu-actived',
  },
  Debian: {
    default: 'cs-debian',
    actived: 'cs-debian-actived',
  },
  'Huawei Cloud EulerOS': {
    default: 'cs-huawei-cloud-euler-os',
    actived: 'cs-huawei-cloud-euler-os-actived',
  },
  SUSE: {
    default: 'cs-suse',
    actived: 'cs-suse-actived',
  },
  EulerOS: {
    default: 'cs-euler-os',
    actived: 'cs-euler-os-actived',
  },
  OpenSUSE: {
    default: 'cs-open-suse',
    actived: 'cs-open-suse-actived',
  },
  KylinSec: {
    default: 'cs-kylin-sec',
    actived: 'cs-kylin-sec-actived',
  },
  KylinOS: {
    default: 'cs-kylin-os',
    actived: 'cs-kylin-os-actived',
  },
  AlmaLinux: {
    default: 'cs-alma-linux',
    actived: 'cs-alma-linux-actived',
  },
  'Rocky Linux': {
    default: 'cs-rocky-linux',
    actived: 'cs-rocky-linux-actived',
  },
  UnionTechOS: {
    default: 'cs-union-tech-os',
    actived: 'cs-union-tech-os-actived',
  },
  'CentOS Stream': {
    default: 'cs-cent-os-stream',
    actived: 'cs-cent-os-stream-actived',
  },
  openEuler: {
    default: 'cs-open-euler',
    actived: 'cs-open-euler-actived',
  },
  TencentOS: {
    default: 'cs-tencent-os',
    actived: 'cs-tencent-os-actived',
  },
  OpenCloudOS: {
    default: 'cs-open-cloud-os',
    actived: 'cs-open-cloud-os-actived',
  },
  'Red Hat': {
    default: 'cs-red-hat',
    actived: 'cs-red-hat-actived',
  },
  CoreOS: {
    default: 'cs-core-os',
    actived: 'cs-core-os-actived',
  },
  FreeBSD: {
    default: 'cs-free-bsd',
    actived: 'cs-free-bsd-actived',
  },
  Fedora: {
    default: 'cs-fedora',
    actived: 'cs-fedora-actived',
  },
  UOS: {
    default: 'cs-uos',
    actived: 'cs-uos-actived',
  },
  Linux: {
    default: 'cs-linux',
    actived: 'cs-linux-actived',
  },
  SUSESAP: {
    default: 'cs-susesap',
    actived: 'cs-susesap-actived',
  },
  Rocky: {
    // Rocky和rocky-linux一样的
    default: 'cs-rocky-linux',
    actived: 'cs-rocky-linux-actived',
  },
}

// 实例时长
export const INS_DURATION_MAP = [
  {
    value: 1,
    label: t('ins.config.1month'), // 1个月
    more: '',
  },
  {
    value: 2,
    label: t('ins.config.2month'), // 2个月
    more: '',
  },
  {
    value: 3,
    label: t('ins.config.3month'), // 3个月
    more: '',
  },
  {
    value: 4,
    label: t('ins.config.4month'), // 4个月
    more: '',
  },
  {
    value: 5,
    label: t('ins.config.5month'), // 5个月
    more: '',
  },
  {
    value: 6,
    label: t('ins.config.6month'), // 6个月
    more: '',
  },
  {
    value: 7,
    label: t('ins.config.7month'), // 7个月
    more: '',
  },
  {
    value: 8,
    label: t('ins.config.8month'), // 8个月
    more: '',
  },
  {
    value: 9,
    label: t('ins.config.9month'), // 9个月
    more: '',
  },
  {
    value: 10,
    label: t('ins.config.10month'), // 10个月
    more: '',
  },
  {
    value: 11,
    label: t('ins.config.11month'), // 11个月
    more: '',
  },
  {
    value: 12,
    label: t('ins.config.1year'), // 1年
    more: '',
  },
  {
    value: 24,
    label: t('ins.config.2year'), // 2年
    more: '',
  },
  {
    value: 36,
    label: t('ins.config.3year'), // 3年
    more: '',
  },
]

export const INS_PWD_LEN_MIN = 16 // 最小长度
export const INS_PWD_LEN_MAX = 20 // 最大长度

// 实例密码判断
export const isValidInsPwd = (platformDefaultName: string, password: string, platform: string) => {
  return (
    isValidInsPwdLen(password) &&
    isValidInsPwdChar(password) &&
    isValidInsPwdPlatformDefaultName(platformDefaultName, password, platform) &&
    isValidInsPwdFirst(password)
  )
}

// 实例密码字符类型判断=>只能包含大写字母、小写字母、数字和特殊字符(!@%-_=+[]:./?)且至少包含四种字符中的三种
export const isValidInsPwdChar = (password: string) => {
  // 检查是否包含大写字母、小写字母、数字和特殊字符
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  let hasSpecialChar = false

  //
  const specialCharArr = password?.replace(/[a-zA-Z0-9]/g, '')?.split('') || []

  if (specialCharArr.length) {
    const res = specialCharArr.every(el => '!@%-_=+[]:./?'.includes(el))
    if (!res) {
      return false
    } else {
      hasSpecialChar = true
      // 计算至少包含三种字符类型的条件
      const charTypeCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length
      // 返回是否至少包含三种字符类型的结果
      return charTypeCount >= 3
    }
  } else {
    hasSpecialChar = false
    // 计算至少包含三种字符类型的条件
    const charTypeCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length
    // 返回是否至少包含三种字符类型的结果
    return charTypeCount >= 3
  }
}

// 实例密码字符长度判断=>长度为 16-20 个字符
export const isValidInsPwdLen = (password: string) => {
  if (password.length < INS_PWD_LEN_MIN || password.length > INS_PWD_LEN_MAX) {
    return false
  }

  return true
}

// 实例密码字符平台判断
export const isValidInsPwdPlatformDefaultName = (platformDefaultName: string, password: string, platform: string) => {
  if (!platformDefaultName || !password) return false // 确保输入有效

  const reversedUsername = platformDefaultName.split('').reverse().join('') // 获取用户名的逆序

  // Windows密码不能包含用户名或用户名的逆序，不能包含用户名中超过两个连续字符的部分。
  if (platform === WINDOWS) {
    // 是否包含用户名中超过两个连续字符的部分
    const hasIllegalStr = (password: string, platformDefaultName: string) => {
      // 遍历 platformDefaultName，检查密码中是否包含连续三个字符
      for (let i = 0; i < platformDefaultName.length - 2; i++) {
        const subStr = platformDefaultName.substring(i, i + 3) // 获取三个连续字符
        if (password.includes(subStr)) {
          // 包含超过两个连续字符的部分
          return true
        }
      }
      return false
    }
    const res1 = hasIllegalStr(password, platformDefaultName)
    console.log(`hasIllegalStr==>`, res1)

    const res2 = password.includes(platformDefaultName)
    const res3 = password.includes(reversedUsername)

    const resCount =
      password.length > 2 ? [res1, res2, res3].filter(Boolean).length : [res2, res3].filter(Boolean).length
    return resCount > 0 ? false : true
  } else {
    // 检查密码是否包含用户名或用户名的逆序
    return !(password.includes(platformDefaultName) || password.includes(reversedUsername))
  }
}

// 实例密码首字符判断=>不能以“/”开头
export const isValidInsPwdFirst = (password: string) => {
  return password[0] !== '/'
}

// 实例cpu
export const INS_CPU_MAP = [
  {
    value: '',
    label: t('ins.custom.allCpu'), // 全部CPU
  },
  {
    value: 1,
    label: t('ins.config.cores', [1]), // 1核
  },
  {
    value: 2,
    label: t('ins.config.cores', [2]), // 2核
  },
  {
    value: 4,
    label: t('ins.config.cores', [4]), // 4核
  },
  {
    value: 8,
    label: t('ins.config.cores', [8]), // 8核
  },
  {
    value: 16,
    label: t('ins.config.cores', [16]), // 16核
  },
  {
    value: 32,
    label: t('ins.config.cores', [32]), // 32核
  },
  {
    value: 64,
    label: t('ins.config.cores', [64]), // 64核
  },
]

export const INS_RAM_MAP = generateRamArray(2, 128) // 实例内存

// 安全组规则选项配置
export const SECURITY_GROUP_CHECK_LIST = [
  {
    value: 1,
    label: t('ins.config.securityGroupRule1'),
  },
  {
    value: 2,
    label: t('ins.config.securityGroupRule2'),
  },
  {
    value: 3,
    label: t('ins.config.securityGroupRule3'),
  },
  {
    value: 4,
    label: t('ins.config.securityGroupRule4'),
  },
  {
    value: 5,
    label: t('ins.config.securityGroupRule5'),
  },
  {
    value: 6,
    label: t('ins.config.securityGroupRule6'),
  },
]

// 安全组出站默认规则
export const SECURITY_GROUP_EGRESS_RULES = [
  {
    action: 'allow',
    description: '',
    direction: 'egress',
    ethertype: 'ipv4',
    cid: 1,
    multiport: 'all',
    priority: 1,
    protocol: 'tcp',
    remoteAddressGroupId: '0',
    remoteGroupId: '0',
    remoteIpPrefix: 'all',
    templateId: 1187466383296,
    type: 1,
  },
]

// 安全组入站默认规则
export const SECURITY_GROUP_INGRESS_RULES = [
  {
    action: 'allow',
    description: t('ins.config.windowRuleDesc'),
    direction: 'ingress',
    ethertype: 'ipv4',
    cid: 3,
    multiport: '3389',
    priority: 1,
    protocol: 'tcp',
    remoteAddressGroupId: '0',
    remoteGroupId: '0',
    remoteIpPrefix: 'all',
    templateId: 1187466383296,
    type: 1,
  },
  {
    action: 'allow',
    description: t('ins.config.linuxRuleDesc'),
    direction: 'ingress',
    ethertype: 'ipv4',
    cid: 2,
    multiport: '22',
    priority: 1,
    protocol: 'tcp',
    remoteAddressGroupId: '0',
    remoteGroupId: '0',
    remoteIpPrefix: 'all',
    templateId: 1187466383296,
    type: 1,
  },
  {
    action: 'allow',
    description: t('ins.config.httpRuleDesc'),
    direction: 'ingress',
    ethertype: 'ipv4',
    cid: 4,
    multiport: '80',
    priority: 1,
    protocol: 'tcp',
    remoteAddressGroupId: '0',
    remoteGroupId: '0',
    remoteIpPrefix: 'all',
    templateId: 1187466383296,
    type: 1,
  },
  {
    action: 'allow',
    description: t('ins.config.httpsRuleDesc'),
    direction: 'ingress',
    ethertype: 'ipv4',
    cid: 5,
    multiport: '443',
    priority: 1,
    protocol: 'tcp',
    remoteAddressGroupId: '0',
    remoteGroupId: '0',
    remoteIpPrefix: 'all',
    templateId: 1187466383296,
    type: 1,
  },
  {
    action: 'allow',
    description: t('ins.config.publicNetRuleDesc'),
    direction: 'ingress',
    ethertype: 'ipv4',
    cid: 1,
    multiport: 'all',
    priority: 1,
    protocol: 'icmp',
    remoteAddressGroupId: '0',
    remoteGroupId: '0',
    remoteIpPrefix: 'all',
    templateId: 1187466383296,
    type: 1,
  },
  {
    action: 'allow',
    description: t('ins.config.privateNetRuleDesc'),
    direction: 'ingress',
    ethertype: 'ipv4',
    cid: 6,
    multiport: 'all',
    priority: 1,
    protocol: 'tcp',
    remoteAddressGroupId: '0',
    remoteGroupId: '0',
    remoteIpPrefix: '10.0.0.0/8',
    templateId: 1187466383296,
    type: 1,
  },
  {
    action: 'allow',
    description: t('ins.config.privateNetRuleDesc'),
    direction: 'ingress',
    ethertype: 'ipv4',
    cid: 6,
    multiport: 'all',
    priority: 1,
    protocol: 'tcp',
    remoteAddressGroupId: '0',
    remoteGroupId: '0',
    remoteIpPrefix: '172.16.0.0/12',
    templateId: 1187466383296,
    type: 1,
  },
  {
    action: 'allow',
    description: t('ins.config.privateNetRuleDesc'),
    direction: 'ingress',
    ethertype: 'ipv4',
    cid: 6,
    multiport: 'all',
    priority: 1,
    protocol: 'tcp',
    remoteAddressGroupId: '0',
    remoteGroupId: '0',
    remoteIpPrefix: '192.168.0.0/16',
    templateId: 1187466383296,
    type: 1,
  },
]

// 网络计费模式
export const INS_NETWORK_CHANGE_TYPE_MAP = {
  1: t('ins.config.flowCost'), // 按量计费
  2: t('ins.config.timeCost'), // 包年包月
  3: t('publicIp.flowPacket'), // 共享流量包
}

// 网络计费模式
export const INS_NETWORK_CHANGE_TYPE_FILTER_ARR_MAP = mapToKeyValueArray(INS_NETWORK_CHANGE_TYPE_MAP, true)

// 实例系统用户名
export const INS_SYS_USER_NAME = {
  CentOS: 'root',
  Windows: 'Administrator',
  Ubuntu: 'ubuntu',
  Debian: 'user',
}

// 实例计费类型
export const COST_TYPE_MAP = {
  1: t('ins.config.flowCost'), // 按量计费
  2: t('ins.config.timeCost'), // 包年包月
}

// 实例计费类型
export const COST_TYPE_FILTER_ARR_MAP = mapToKeyValueArray(COST_TYPE_MAP, true)

// 实例更多操作
export const INS_MORE_OPTS = [
  {
    value: 'setName',
    label: t('ins.config.setName'), // 修改名称
    perm: permMap.ins.RENAME_VM,
  },
  // {
  //   value: 'setProject',
  //   label: t('ins.config.setProject'), // 分配至项目
  // },
  {
    value: 'setAutoRenew',
    label: t('ins.config.setAutoRenew'), // 设置自动续费
    perm: permMap.ins.SET_VM_AUTO_RENEW,
  },
  {
    value: 'setSnapshot',
    label: t('ins.config.setSnapshot'), // 设置定时快照策略
    perm: permMap.ins.SET_TIMING_SNAPSHOT_TACTICS,
  },
  {
    value: 'setSshKey',
    label: t('ins.config.setSshKey'), // 加载密钥
    perm: permMap.ins.LOAD_KEY,
  },
  {
    value: 'setResource',
    label: t('ins.config.setResource'), // 资源调整
    children: [
      // {
      //   value: 'setConfig',
      //   label: t('调整配置'),
      // },
      {
        value: 'setNetwork',
        label: t('ins.config.setNetwork'), // 调整网络
        perm: permMap.ins.CVM_UPDATE_NETWORK,
      },
      // {
      //   value: 'setPrivateNetwork',
      //   label: t('切换私有网络'),
      // },
    ],
  },
  {
    value: 'joinSecurityGroup',
    label: t('ins.config.joinSecurityGroup'), // 加入安全组
    perm: permMap.ins.CVM_CONFIGURE_SECURITY_GROUP,
  },
]

// 实例修改配置
export const INS_MODIFY_CONFIG_OPTS = [
  {
    value: 'insSameConfig',
    label: t('ins.config.otherBuy'), // 购买相同配置
    costType: [1, 2], // 实例计费模式
    perm: permMap.ins.CLONE_VM,
  },
  {
    value: 'insState',
    label: t('ins.config.insState'), // 实例状态
    costType: [1, 2],
    children: [
      {
        value: 'powerOn',
        label: t('ins.config.powerOn'), // 开机
        costType: [1, 2],
        perm: permMap.ins.START_VM, // 权限标识
      },
      {
        value: 'shutdown',
        label: t('ins.config.shutdown'), // 关机
        costType: [1, 2],
        perm: permMap.ins.STOP_VM,
      },
      {
        value: 'restart',
        label: t('ins.config.restart'), // 重启
        costType: [1, 2],
        perm: permMap.ins.REBOOT_VM,
      },
      {
        value: 'destruction',
        label: t('ins.config.destruction'), // 销毁/退还
        costType: [1, 2],
        perm: permMap.ins.DELETE_VM,
      },
    ],
  },
  {
    value: 'setIns',
    label: t('ins.config.setIns'), // 实例设置
    costType: [1, 2],
    children: [
      {
        value: 'setName',
        label: t('ins.config.setName'), // 修改名称
        costType: [1, 2],
        perm: permMap.ins.RENAME_VM,
      },
      // {
      //   value: 'setProject',
      //   label: t('ins.config.setProject'), // 分配至项目
      // },
      {
        value: 'setAutoRenew',
        label: t('ins.config.setAutoRenew'), // 设置自动续费
        costType: [2],
        perm: permMap.ins.SET_VM_AUTO_RENEW,
      },
      {
        value: 'flowToTime',
        label: t('ins.config.flowToTime'), // 按量转包年包月
        costType: [1],
        perm: permMap.ins.CONVERT_BILLING,
      },
      // {
      //   value: 'timeToFlow',
      //   label: t('ins.config.timeToFlow'), // 包年包月转按量
      //   costType: [2],
      //   // perm: permMap.ins.SET_VM_AUTO_RENEW,
      // },
      {
        value: 'setSnapshot',
        label: t('ins.config.setSnapshot'), // 设置定时快照策略
        costType: [1, 2],
        perm: permMap.ins.SET_TIMING_SNAPSHOT_TACTICS,
      },
    ],
  },
  {
    value: 'pwd',
    label: t('ins.config.pwd'), // 密码/密钥
    costType: [1, 2],
    children: [
      {
        value: 'setPwd',
        label: t('ins.config.setPwd'), // 重置密码
        costType: [1, 2],
        perm: permMap.ins.RESET_VM_PWD,
      },
      {
        value: 'setSshKey',
        label: t('ins.config.setSshKey'), // 加载密钥
        costType: [1, 2],
        perm: permMap.ins.LOAD_KEY,
      },
    ],
  },
  {
    value: 'image',
    label: t('ins.config.image'), // 镜像
    costType: [1, 2],
    children: [
      {
        value: 'setSystem',
        label: t('ins.config.setSystem'), // 重装系统
        costType: [1, 2],
        perm: permMap.ins.RESET_VM_SYSTEM,
      },
      {
        value: 'changeSystem',
        label: t('ins.config.changeSystem'), // 切换系统
        costType: [1, 2],
        perm: permMap.ins.CHANGE_VM_IMAGE,
      },
      {
        value: 'createCustomImage',
        label: t('ins.config.createCustomImage'), // 创建自定义镜像
        costType: [1, 2],
        perm: permMap.ins.CREATE_VM_IMAGE,
      },
    ],
  },
  {
    value: 'setResource',
    label: t('ins.config.setResource'), // 资源调整
    costType: [1, 2],
    children: [
      {
        value: 'setConfig',
        label: t('ins.config.setConfig'), // 调整配置
        costType: [1, 2],
        perm: permMap.ins.RESET_VM_UNIT,
      },
      {
        value: 'expans',
        label: t('ins.config.expans'), // 云硬盘扩容
        costType: [1, 2],
        perm: permMap.ins.EXPAND_DISK_SIZE,
      },
      {
        value: 'setNetwork',
        label: t('ins.config.setNetwork'), // 调整网络
        costType: [1, 2],
        perm: permMap.ins.CVM_UPDATE_NETWORK,
      },
      // {
      //   value: 'setPrivateNetwork',
      //   label: t('切换私有网络'),
      // },
    ],
  },
  {
    value: 'netsecure',
    label: t('ins.config.netsecure'), // 网络/安全组
    costType: [1, 2],
    children: [
      {
        value: 'bindIP',
        label: t('ins.config.bindIP'), // 绑定弹性IP
        costType: [1, 2],
        perm: permMap.ins.CVM_BIND_EIP,
      },
      {
        value: 'unBindIP',
        label: t('ins.config.unBindIP'), // 解绑弹性IP
        costType: [1, 2],
        perm: permMap.ins.CVM_UNBIND_EIP,
      },
      {
        value: 'bindNetworkCard',
        label: t('ins.config.bindNetworkCard'), // 绑定弹性网卡
        costType: [1, 2],
        perm: permMap.ins.CVM_BIND_ENI,
      },
      {
        value: 'unBindNetworkCard',
        label: t('ins.config.unBindNetworkCard'), // 解绑弹性网卡
        costType: [1, 2],
        perm: permMap.ins.CVM_UNBIND_ENI,
      },
      {
        value: 'setSecurityGroup',
        label: t('ins.config.setSecurityGroup'), // 配置安全组
        costType: [1, 2],
        perm: permMap.ins.CVM_CONFIGURE_SECURITY_GROUP,
      },
    ],
  },
]

// 实例监控指标
export const INS_MONITER_METRIC_MAP = {
  cpuUtil: 'cpu_util',
  cpuUsage: 'cpu_usage',
  loadAvg1m: 'load_avg_1m',
  loadAvg5m: 'load_avg_5m',
  loadAvg15m: 'load_avg_15m',
  memUsage: 'mem_usage',
  memUsageValue: 'mem_usage_value',
  diskUtil: 'disk_util',
  netInPacket: 'net_in_packet',
  netOutPacket: 'net_out_packet',
  tcpConnection: 'tcp_connection',
  netInBandwidth: 'net_in_bandwidth',
  netOutBandwidth: 'net_out_bandwidth',
  serverUtcNtpDiff: 'server_utc_ntp_diff',
  netInPacketExternal: 'net_in_packet_external',
  netOutPacketExternal: 'net_out_packet_external',
  netOutFlow: 'net_out_flow',
  netOutBandwidthWsage: 'net_out_bandwidth_usage',
  netInBandwidthExternal: 'net_in_bandwidth_external',
  netOutBandwidthExternal: 'net_out_bandwidth_external',
  diskReadIops: 'disk_read_iops',
  diskWriteIops: 'disk_write_iops',
  diskIoWaitTime: 'disk_io_wait_time',
  diskIoServiceTime: 'disk_io_service_time',
  diskIoBusyRatio: 'disk_io_busy_ratio',
  serverConnection: 'server_connection',
}

// 实例名称 1到64字符，特殊符号-_.=>兼容腾讯华为厂商命名规则
export const INS_NAME_LEN_MIN = 1
export const INS_NAME_LEN_MAX = 64
export const INS_NAME_REG = new RegExp(`^[a-zA-Z0-9\u4e00-\u9fa5-_\.]{${INS_NAME_LEN_MIN},${INS_NAME_LEN_MAX}}$`)

export const NETWORK_TYPE_MAP = {
  1: t('ins.config.mainNetCard'), // 主网卡
  2: t('ins.config.subNetCard'), // 拓展网卡
}

// 是否能修改名称
export const isSetName = (state: string) => {
  return ['STOPPED', 'RUNNING', 'STARTING', 'REBOOTING'].includes(state)
}

// 是否能修改名称(批量)
export const isSetNameBatch = (stateList: string[]) => {
  return stateList.length ? stateList.every(el => isSetName(el)) : false
}

// 是否能分配至项目
export const isSetProject = (state: string) => {
  return ['STOPPED', 'RUNNING', 'STARTING', 'REBOOTING'].includes(state)
}

// 是否能分配至项目(批量)
export const isSetProjectBatch = (stateList: string[]) => {
  return stateList.length ? stateList.every(el => isSetProject(el)) : false
}

// 是否能设置自动续费
export const isSetAutoRenew = (costType: number, state: string) => {
  if (costType === 2) {
    return ['STOPPED', 'RUNNING', 'STARTING', 'REBOOTING'].includes(state)
  } else {
    return false
  }
}

// 是否能设置自动续费(批量)
export const isSetAutoRenewBatch = (costTypeList, stateList: string[]) => {
  if (costTypeList.length && stateList.length) {
    const costTypeRes = costTypeList.every(el => el === 2)
    const stateRes = stateList.every(el => ['STOPPED', 'RUNNING', 'STARTING', 'REBOOTING'].includes(el))

    return costTypeRes && stateRes
  } else {
    return false
  }
}

// 是否能按量转包年包月
export const isFlowToTime = (costType: number, state: string) => {
  if (costType === 2) {
    return false
  } else {
    return ![
      'BUILD',
      'LAUNCH_FAILED',
      'REBUILDING',
      'REBUILDING_SPECIFICATIONS',
      'DELETED',
      'REFUNDING',
      'SHUTDOWN',
      'TERMINATING',
    ].includes(state)
  }
}

// 是否能设置定时快照策略
export const isSetSnapshot = (diskState: number) => {
  return ![1, 3, 5, 7, 9, 10, 12, 15, 99].includes(diskState)
}

// 是否能加载密钥
export const isSetSshKey = (state: string, platform) => {
  return ['STOPPED', 'RUNNING'].includes(state) && platform !== WINDOWS
}

// 是否能加载密钥(批量)
export const isSetSshKeyBatch = (stateList: string[], platformList: string[]) => {
  if (stateList.length && platformList.length) {
    const platformBool = platformList.every(el => el !== WINDOWS)
    const stopedBool = stateList.every(el => el === 'STOPPED')
    const runningBool = stateList.every(el => el === 'RUNNING')
    const res = platformBool && (stopedBool || runningBool)

    return res
  } else {
    return false
  }
}

// 是否能调整配置
export const isSetConfig = (state: string) => {
  return ['STOPPED', 'RUNNING'].includes(state)
}

// 是否能调整配置(批量)
export const isSetConfigBatch = (stateList: string[]) => {
  if (stateList.length) {
    const stopedBool = stateList.every(el => el === 'STOPPED')
    const runningBool = stateList.every(el => el === 'RUNNING')
    const res = stopedBool || runningBool

    return res
  } else {
    return false
  }
}

// 是否能购买相同配置
export const isOtherBuy = () => {
  return true
}

// 是否能开机
export const isPowerOn = (state: string) => {
  return ['STOPPED'].includes(state)
}

// 是否能开机(批量)
export const isPowerOnBatch = (stateList: string[]) => {
  return stateList.length ? stateList.every(el => isPowerOn(el)) : false
}

// 是否能关机
export const isShutdown = (state: string) => {
  return ['RUNNING'].includes(state)
}

// 是否能关机(批量)
export const isShutdownBatch = (stateList: string[]) => {
  return stateList.length ? stateList.every(el => isShutdown(el)) : false
}

// 是否能重启
export const isRestart = (state: string) => {
  return ['RUNNING'].includes(state)
}

// 是否能重启(批量)
export const isRestartBatch = (stateList: string[]) => {
  return stateList.length ? stateList.every(el => isRestart(el)) : false
}

// 是否能续费
export const isRenew = (costType: number, state: string) => {
  return isTimeCost(costType) && ['STOPPED', 'RUNNING', 'SHUTDOWN'].includes(state)
}

// 是否能续费(批量)
export const isRenewBatch = (costTypeList: number[], stateList: string[]) => {
  if (costTypeList.length && stateList.length) {
    const costTypeBool = isTimeCostBatch(costTypeList)
    const stateBool = stateList.every(el => ['STOPPED', 'RUNNING', 'SHUTDOWN'].includes(el))
    const res = costTypeBool && stateBool

    return res
  } else {
    return false
  }
}

// 是否为包年包月
export const isTimeCost = (costType: number) => {
  return [2].includes(costType)
}

// 是否为按量计费
export const isFlowCost = (costType: number) => {
  return [1].includes(costType)
}

// 是否为包年包月(批量)
export const isTimeCostBatch = (costTypeList: number[]) => {
  return costTypeList.length ? costTypeList.every(el => isTimeCost(el)) : false
}

// 是否能销毁/退还
export const isDestruction = (state: string) => {
  return ['STOPPED', 'RUNNING'].includes(state)
}

// 是否能销毁/退还(批量)
export const isDestructionBatch = (stateList: string[]) => {
  return stateList.length ? stateList.every(el => isDestruction(el)) : false
}

// 是否能重置密码
export const isSetPwd = (state: string) => {
  return ['STOPPED', 'RUNNING'].includes(state)
}

// 是否能重置密码(批量)
export const isSetPwdBatch = (stateList: string[]) => {
  return stateList.length ? stateList.every(el => isSetPwd(el)) : false
}

// 是否能重装系统
export const isSetSystem = (state: string) => {
  return ['STOPPED', 'RUNNING'].includes(state)
}

// 是否能切换系统
export const isChangeSystem = (state: string) => {
  return ['STOPPED', 'RUNNING'].includes(state)
}

// 是否能创建自定义镜像
export const isCreateCustomImage = (state: string) => {
  return ['STOPPED', 'RUNNING'].includes(state)
}

// 是否能扩容=>实例状态
export const isExpans = (insState: string) => {
  return ['STOPPED', 'RUNNING'].includes(insState)
}

// 是否为待回收
export const isRecovery = (state: string) => {
  return ['SHUTDOWN'].includes(state)
}

// 是否能调整网络
export const isSetNetwork = (state, networkInfo) => {
  if (['BUILD', 'REFUNDING', 'LAUNCH_FAILED', 'DELETED', 'SHUTDOWN', 'TERMINATING'].includes(state)) return false
  // ------------未绑定弹性公网ip的不能调整------------------
  if (!networkInfo) return false
  const eipBindFlag = networkInfo.eipBindFlag
  if (!eipBindFlag) return false
  const eipItem = networkInfo.eips[0]
  if (!eipItem) return false
  if (eipItem.chargeType === 3) return false // 不能调整共享流量包类型的宽带
  return true
}

// 是否能调整网络(批量)
export const isSetNetworkBatch = (selectList: any[], stateList: string[]) => {
  // ----------------- 必须都是按量计费或都是包年包月，必须都绑定了弹性公网ip才能调整(包年包月只能增不能减，需要跟产品确认一下) -----------------------
  // 添加：未绑定弹性公网ip的不能调整
  let key = false
  // 以下状态的不能进行调整网络
  if (stateList.every(el => ['BUILD', 'REFUNDING', 'LAUNCH_FAILED', 'DELETED', 'SHUTDOWN', 'TERMINATING'].includes(el)))
    return (key = true)
  const chargeTypeList: number[] = []
  selectList.forEach(item => {
    const networkInfo = (item?.networkInfos || []).find(item => item.primaryType === 1)
    if (!networkInfo || !networkInfo.eipBindFlag) return (key = true)
    const eipItem = networkInfo.eips[0]
    if (!eipItem) return (key = true)
    chargeTypeList.push(eipItem.chargeType)
  })
  console.log(chargeTypeList, '当前筛选实例的绑定EIP类型集合')
  console.log(key, '当前key')
  if (chargeTypeList.filter(val => val === 3).length > 0) return true // 不能调整共享流量包类型的宽带
  if (chargeTypeList.filter(val => val === 2).length > 1) return true // 不能同时调整两个包年包月的宽带，因为最小值不好设置
  if (Array.from(new Set(chargeTypeList)).length > 1) return true
  return key
}

// 是否能切换私有网络
export const isSetPrivateNetwork = () => {
  return true
}

// 是否能切换私有网络(批量)
export const isSetPrivateNetworkBatch = () => {
  return true
}

// ------------------------ 网络与安全 ------------------------
// 是否能绑定弹性IP
export const isBindIP = (eipBindState: number, state: string) => {
  // eipBindState状态( 1 创建中  2 未绑定  3 绑定中  4 已绑定 5 解绑中 6 释放中 99 已释放)
  return (
    eipBindState === 2 && !['BUILD', 'REFUNDING', 'LAUNCH_FAILED', 'DELETED', 'SHUTDOWN', 'TERMINATING'].includes(state)
  )
}

// 是否能解绑弹性IP
export const isUnBindIP = (eipBindState: number, state: string) => {
  // eipBindState状态( 1 创建中  2 未绑定  3 绑定中  4 已绑定 5 解绑中 6 释放中 99 已释放)
  return (
    eipBindState === 4 && !['BUILD', 'REFUNDING', 'LAUNCH_FAILED', 'DELETED', 'SHUTDOWN', 'TERMINATING'].includes(state)
  )
}

// 是否能绑定弹性网卡
export const isBindNetworkCard = (state: string) => {
  return !['BUILD', 'REFUNDING', 'LAUNCH_FAILED', 'DELETED', 'SHUTDOWN', 'TERMINATING'].includes(state)
}

// 是否能解绑弹性网卡
export const isUnBindNetworkCard = (state: string) => {
  return !['BUILD', 'REFUNDING', 'LAUNCH_FAILED', 'DELETED', 'SHUTDOWN', 'TERMINATING'].includes(state)
}

// 是否能配置安全组
export const isSetSecurityGroup = (state: string) => {
  return !['BUILD', 'REFUNDING', 'LAUNCH_FAILED', 'DELETED', 'SHUTDOWN', 'TERMINATING'].includes(state)
}

// 是否能加入安全组
export const isJoinSecurityGroup = (state: string) => {
  return !['BUILD', 'REFUNDING', 'LAUNCH_FAILED', 'DELETED', 'SHUTDOWN', 'TERMINATING'].includes(state)
}

// 是否能加入安全组(批量操作)
export const isJoinSecurityGroupBatch = (stateList: string[]) => {
  return !stateList.every(el =>
    ['BUILD', 'REFUNDING', 'LAUNCH_FAILED', 'DELETED', 'SHUTDOWN', 'TERMINATING'].includes(el),
  )
}

// 用户名 => 镜像为 Windows时，用户名显示为 Administrator；Ubuntu 系统默认用户名为 ubuntu、其他版本 Linux 系统默认为 root
export const getPlatformDefaultName = (platform: string) => {
  if (platform === WINDOWS) {
    return 'Administrator'
  } else if (platform === 'Ubuntu') {
    return 'ubuntu'
  } else {
    return 'root'
  }
}

export const WINDOWS = 'Windows'
