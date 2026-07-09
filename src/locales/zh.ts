import dns from './dns/zh.js'
import cdn from './cdn/zh.js'
import accountSystem from './account-system/zh.js'
import costCenter from './cost-center/zh.js'
import login from './login/zh.js'
import product from './product/zh.js'
import home from './home/zh.js'
import network from './network/zh.js'
import cvm from './cvm/zh.js'
import domain from './domain/zh.js'
import sslCert from './ssl-certificate/zh.js'
import oss from './oss/zh.js'
import { appNameMap } from '@/config/base-config'

export default {
  BATCH_ADD_DOMAIN: '批量添加域名',
  BATCH_DELETE_DOMAIN: '批量删除',
  BATCH_ADD_ANALYSIS: '批量添加记录',
  BATCH_MODIFY_ANALYSIS: '批量修改记录',
  DOWNLOAD_ANALYSIS_TASK: '导出解析记录',
  model: {
    cdn: '内容分发网络 CDN',
    dns: '云解析 DNS',
    domain: '域名注册',
    oss: '对象存储',
    user: '用户系统',
    cost: '费用中心',
    product: '全部云产品',
    latelyProduct: '最近访问产品',
    cvm: '云服务器 CVM',
    network: '网络与安全',
    home: '控制台总览',
    certificate: 'SSL证书',
  },

  // 通用
  common: {
    add: '添加',
    delete: '删除',
    edit: '编辑',
    change: '修改',
    lock: '锁定',
    unlock: '解锁',
    locked: '已锁定',
    unlocked: '未锁定',
    toUnlock: '解除锁定',
    notLock: '锁定域名',
    operation: '操作',
    settings: '设置',
    batchOperation: '批量操作',
    confirm: '确定',
    cancel: '取消',
    reset: '重置',
    back: '返回',
    loading: '加载中',
    isLoading: '正在加载',
    refresh: '刷新',
    pause: '暂停',
    start: '开启',
    remark: '备注',
    save: '保存',
    open: '已开启',
    closed: '未开启',
    pickup: '收起',
    help: '帮助',
    exchange: '切换',
    second: '秒',

    addSuccess: '添加成功',
    deleteSuccess: '删除成功',
    changeSuccess: '修改成功',
    operationSuccess: '操作成功',
    operationSuccessTip: '验证成功',
    operationErrorTip: '验证失败，请重试',
    updateSuccess: '更新成功',

    getCode: '获取验证码',
    codeThen: '{time}秒后再获取',
    codeSent: '验证码已发送',

    zh: '中文',
    en: '英文',
    ja: '日文',

    logout: '退出登录',
    accountId: '账号ID：',

    addDomains: '添加域名',
    batchAdd: '批量添加',

    noData: '暂无数据',
    success: '成功',
    fail: '失败',
    processing: '执行中',
    all: '全部',

    plsEnter: '请输入',
    default: '默认',
    notFound: '这里还是一片荒芜~',
    backHome: '返回首页',
    formatErr: '格式有误！',
    next: '下一步',
    submit: '提交',
    docHelper: '帮助文档',
    accountInfo: '账号信息',
    d: '{d}天',
    h: '{h}小时',
    m: '{m}分钟',
    s: '{s}秒',
    site_china: '中国站',
    site_world: '国际站',
    error_cs: '网络出错，请重试',
    error_cd: '操作失败, 请稍后重试或联系运维人员处理',
    true: '确认',
    console: '总览',
    contact: '售后客服',
    contact_desc: '扫描下方二维码添加客服Telegram',
    contact_desc1: '购续省心，优惠触手可得',
    contact_desc2: '异常预警，关键信息不遗漏',
    contact_desc3: '资源动态，实时尽在掌握',
    contact_desc4: '高性价比，灵活稳定可靠',
    time_zone_desc: `注：${appNameMap.zh}当前采用东八时区的区时作为统一的标准时间`,
    select_time: '选择时间',
    endTimeBeforeStartTips: '结束时间不能早于开始时间',
  },

  // 路由
  routes: {
    myDomains: '我的域名',
    monitorTask: '监控任务',
    batchOperation: '批量操作',
    recordMana: '记录管理',
    domainSetting: '域名设置',
    dataStatistics: '数据统计',
    addDomains: '添加域名',
    addRecords: '添加记录',
    modifyRecords: '修改记录',
    importRecords: '导入记录',
    exportRecords: '导出记录',
    deleteDomains: '删除域名',
    operationLog: '操作日志',
    fileList: '文件下载列表',
  },

  // 表格
  columns: {
    domain: '域名',
    takeStatus: '接管状态',
    records: '记录数',
    domainGroup: '域名分组',
    lastUpdated: '最后操作时间',
    remark: '备注',
    operation: '操作',
    hostRecord: '主机记录',
    recordType: '记录类型',
    recordValue: '记录值',
    lineType: '线路类型',
    weights: '权重',
    mx: '优先级',
    ttl: 'TTL',
    monitor: '监控',
    X: 'M优化',
    status: '状态',
    port: '端口',
    monitorMethod: '监控方式',
    monitorType: '监控类型',
    alarmRules: '报警规则',
    alarmTrigger: '报警触发',
    noticeMethod: '通知方式',
    monitorProject: '监控项目',
    errIp: '故障IP',
    startTime: '开始时间',
    recoveryTime: '恢复时间',
    duration: '持续时间',
    optMession: '操作任务',
    optTime: '操作时间',
    optResult: '操作结果',
    fileType: '文件类型',
    fileName: '文件名',
    createTime: '创建时间',
    comleteTime: '完成时间',
    counter: '数量',
    origin: '源站地址',
  },

  // 组件
  components: {
    // CatDialog
    confirm: '确定',
    cancel: '取消',
    // DnsDomainFilter
    recordTypePlaceholder: '记录类型',
    lineTypePlaceholder: '线路类型',
    hostPlaceholder: "如：www 或 {'@'}",
    host: '主机记录',
    recordValuePlaceholder: '如：1.1.1.1',
    recordValue: '记录值',
    query: '查询',
    clear: '清空',
    // DnsDomainTextarea
    domainEmpty: '请输入要添加的域名!',
    domainMax10: '单次添加域名数量最多 10 个，请减少数量分多次添加',
    domainFormatErr: '{domains}格式有误!',
    // DnsDomainTransfer
    selectDomain: '选择域名',
    search: '域名搜索',
    selected: '已选择',
    clearAll: '清除所有',
    // DnsUpload
    reUpload: '重新上传',
    // CatPagination
    total: '共 {total} 项',
    eachSize: '每页显示 {pageSize} 行',
    // PwdPanel
    save: '安全程度',
    weak: '弱',
    general: '一般',
    complex: '强',
    pwdPanel2: '6-20位字符',
    pwdPanel3: '只包含大小写字母、数字以及标点符号（空格除外）',
    pwdPanel4: '大写字母、小写字母和标点符号至少包含2种',
    // cdnDomainTransfer
    selectDomainPlaceholder: '请选择域名',
    selectedDomains: '已选中{count}个域名',
    deleted: '已删除',
  },

  // 头部
  header: {
    accountInfo: '账号信息',
    labelMana: '标签管理',
    orderMana: '订单管理',
    billMama: '账单管理',
    repayMana: '续费管理',
    invoiceMana: '发票管理',
    incomeExpenditure: '收支明细',
    couponsMana: '优惠券管理',
    primaryAccount: '主账号',
    bypassAccount: '子账号',
    availableCost: '可用额度',
    toCost: '去充值',
    discountCoupon: '优惠券(张)',
    invokable: '可开发票',
    unpaid: '待支付{orderNum}笔',
  },

  // error
  error: {
    badRequest: '请求参数错误',
    unauthorized: '未授权',
    forbidden: '没有权限访问该资源',
    notFound: '请求的资源不存在',
    serverError: '服务器内部错误',
    requestFailedWithStatus: '请求失败，状态码：{0}',
    networkError: '网络异常，请检查网络连接',
    requestError: '请求出错',
  },

  // dns
  ...dns,
  // cdn
  ...cdn,
  // 登录
  ...login,
  // 用户系统
  ...accountSystem,
  // 费用中心
  ...costCenter,
  // 产品
  ...product,
  // 首页
  ...home,
  // 网络与安全
  ...network,
  // 云服务器
  ...cvm,
  // 域名注册
  ...domain,
  // SSL证书
  ...sslCert,
  // 对象存储
  ...oss,
}
