import dns from './dns/en.js'
import cdn from './cdn/en.js'
import accountSystem from './account-system/en.js'
import costCenter from './cost-center/en.js'
import login from './login/en.js'
import product from './product/en.js'
import home from './home/en.js'
import network from './network/en.js'
import cvm from './cvm/en.js'
import domain from './domain/en.js'
import sslCert from './ssl-certificate/en.js'
import oss from './oss/en.js'
import { appNameMap } from '@/config/base-config'

export default {
  BATCH_ADD_DOMAIN: 'Batch add domains',
  BATCH_DELETE_DOMAIN: 'Batch delete domains',
  BATCH_ADD_ANALYSIS: 'Batch add records',
  BATCH_MODIFY_ANALYSIS: 'Batch modify records',
  DOWNLOAD_ANALYSIS_TASK: 'Export records',
  model: {
    cdn: 'Content delivery Network CDN',
    dns: 'Cloud resolution DNS',
    domain: 'Domain Registration',
    oss: 'Object storage',
    user: 'User System',
    cost: 'Cost Center',
    product: 'All Cloud products',
    latelyProduct: 'Recently visited products',
    cvm: 'Cloud Server CVM',
    network: 'Network and Security',
    home: 'Console Overview',
    certificate: 'SSL Certificate',
  },
  // 通用
  common: {
    add: 'Add', //添加
    delete: 'Delete', //删除
    edit: 'Edit', //编辑
    change: 'Change', //修改
    lock: 'Lock', //锁定
    unlock: 'Unlock', //解锁
    locked: 'Locked', //已锁定
    unlocked: 'Unlocked', //未锁定
    toUnlock: 'Unlock', //解除锁定
    notLock: 'Lock', // 锁定域名
    operation: 'Operation', //操作
    settings: 'Settings', //设置
    batchOperation: 'Batch operation', //批量操作
    confirm: 'Confirm', //确定
    cancel: 'Cancel', //取消
    reset: 'Reset',
    back: 'Back', //返回
    loading: 'Loding', //加载中
    isLoading: 'Loading', // 正在加载
    refresh: 'Refresh', //刷新
    pause: 'Pause', //暂停
    start: 'Start', //开启
    remark: 'Remark', //备注
    save: 'Save', //保存
    open: 'Open',
    closed: 'Closed',
    pickup: 'retract',
    help: 'help',
    exchange: 'change',
    second: 'second(s)',

    addSuccess: 'Added successfully ', //添加成功
    deleteSuccess: 'Delete successfully', //删除成功
    changeSuccess: 'Change successful', //修改成功
    operationSuccess: 'The operation succeeded.', //操作成功
    operationSuccessTip: 'Verify Successfully',
    operationErrorTip: 'Verification failed, please try again',
    updateSuccess: 'Update successful', //更新成功

    getCode: 'Get a CAPTCHA', //获取验证码
    codeThen: 'Get after {time} second | Get after {time} seconds', //{time}秒后再获取
    codeSent: 'The CAPTCHA is sent', //验证码已发送

    zh: 'Chinese', //中文
    en: 'English', //英文
    ja: 'Japanese', //日文

    logout: 'Log out', //退出登录
    accountId: 'Account ID:', //账号ID

    addDomains: 'Add domains', //添加域名
    batchAdd: 'Batch Add', //批量添加

    noData: 'No data', //暂无数据
    success: 'Successful', //成功
    processing: 'In processing',
    fail: 'Failed', //失败
    all: 'All',

    plsEnter: 'Please enter', //请输入
    default: 'Default', //默认
    notFound: "There's nothing here", //这里还是一片荒芜~
    backHome: 'Return to Home Page', //返回首页
    formatErr: 'Wrong format!', //格式有误！
    next: 'Next', //下一步
    submit: 'Submit', //提交
    docHelper: 'Help documentation', //帮助文档
    accountInfo: 'Account Information', //账号信息
    d: '{d} day | {d} days', //天
    h: '{h} hour | {h} hours', //小时
    m: '{m} minute | {m} minutes', //分钟
    s: '{s} second | {s} seconds', //秒
    site_china: 'China Site',
    site_world: 'International Site',
    error_cs: 'Network error, please try again',
    error_cd:
      'Operation failed, please try again later or contact the operation and maintenance personnel for assistance',
    true: 'Confirm',
    console: 'Overview',
    contact: 'After sales customer service',
    contact_desc: 'Scan the QR code below to add customer service Telegram',
    contact_desc1: 'Purchase with peace of mind, discounts easily accessible',
    contact_desc2: 'Abnormal alerts, no key information missed',
    contact_desc3: 'Resource dynamics, real-time control',
    contact_desc4: 'High cost-performance, flexible, stable, and reliable',
    time_zone_desc: `Note: ${appNameMap.en} currently uses China Standard Time (UTC+8) as the unified standard time.`,
    select_time: 'Select Time',
    endTimeBeforeStartTips: 'The end time cannot be earlier than the start time',
  },

  // 路由
  routes: {
    myDomains: 'My Domains', //我的域名
    monitorTask: 'Monitor Tasks', //监控任务
    batchOperation: 'Batch Operation', //批量操作
    recordMana: 'Record Mana', //记录管理
    domainSetting: 'Domain Setting', //域名设置
    dataStatistics: 'data Statistics', //数据统计
    addDomains: 'Add Domains', //添加域名
    addRecords: 'Add Records', //添加记录
    modifyRecords: 'Modify Records', //修改记录
    importRecords: 'Import Records', //导入记录
    exportRecords: 'Export Records', //导出记录
    deleteDomains: 'Delete Domains', //删除域名
    operationLog: 'Operation Logs', //操作日志
    fileList: 'Download List', //文件下载列表
  },

  // 表格
  columns: {
    domain: 'Domain', //域名
    takeStatus: 'State of takeover', //接管状态
    records: 'Records', //记录数
    domainGroup: 'Group', //域名分组
    lastUpdated: 'Last updated', //最后操作时间
    remark: 'Remark', //备注
    operation: 'Operation', //操作
    hostRecord: 'Host Record', //主机记录
    recordType: 'Record Type', //记录类型
    recordValue: 'Record Value', //记录值
    lineType: 'Line Type', //线路类型
    weights: 'Weights', //权重
    mx: 'Mx', //优先级
    ttl: 'TTL', //TTL
    monitor: 'Monitor', //监控
    X: 'M Optimization', //M优化
    status: 'Status', //状态
    port: 'Port', //端口
    monitorMethod: 'Monitor mode', //监控方式
    monitorType: 'Monitor Type', //监控类型
    alarmRules: 'Alarm rules', //报警规则
    alarmTrigger: 'Alarm trigger', //报警触发
    noticeMethod: 'Notification method', //通知方式
    monitorProject: 'Monitor project', //监控项目
    errIp: 'Faulty IP', //故障IP
    startTime: 'Start time', //开始时间
    recoveryTime: 'Recovery time', //恢复时间
    duration: 'Duration', //持续时间
    optMession: 'Operation tasks', //操作任务
    optTime: 'Operation time', //操作时间
    optResult: 'Operation results', //操作结果
    fileType: 'File Type', //文件类型
    fileName: 'File name', //文件名
    createTime: 'Create time', //创建时间
    comleteTime: 'Completion time', //完成时间
    counter: 'count', //数量

    origin: 'Origin',
  },

  // 组件
  components: {
    // CatDialog
    confirm: 'Confirm', // 确认
    cancel: 'Cancel', // 取消
    // DnsDomainFilter
    recordTypePlaceholder: 'Record type', //记录类型
    lineTypePlaceholder: 'Type of line', // 线路类型
    hostPlaceholder: "for example: www 或 {'@'}", //如：www 或 {'@'}
    host: 'Host record', //主机记录
    recordValuePlaceholder: 'for example: 1.1.1.1', //如：1.1.1.1
    recordValue: 'Record value', //记录值
    query: 'Query', // 查询
    clear: 'Reset', // 清空
    // DnsDomainTextarea
    domainEmpty: 'Please enter the domain name to add!', //请输入要添加的域名!
    domainMax10:
      'The maximum number of domain names added at one time is 10, please reduce the number and add it multiple times.', //单次添加域名数量最多 10 个，请减少数量分多次添加
    domainFormatErr: 'Incorrectly formatted: {domains}!', //{domains}格式有误!
    // DnsDomainTransfer
    selectDomain: 'Domain(s)', //域名
    search: 'Domain name search', //域名搜索
    selected: 'Selected', // 已选择
    clearAll: 'Clear all', //清除所有
    // DnsUpload
    reUpload: 're-upload', //重新上传
    // CatPagination
    total: '{total} in total', // 共 {total} 项
    eachSize: 'Display {pageSize} line per page | Display {pageSize} lines per page', //每页显示 {pageSize} 行
    // PwdPanel
    save: 'Safety degree', //安全程度
    weak: 'Weak',
    general: 'General', // 一般
    complex: 'Complex', // 强
    pwdPanel2: '6 to 20 characters', //6-20位字符
    pwdPanel3: 'Contain lowercase letters, Numbers, punctuation except (space)', //只包含大小写字母、数字以及标点符号（空格除外）
    pwdPanel4: 'There are at least two types of uppercase letters, lowercase letters and punctuation marks', //大写字母、小写字母和标点符号至少包含2种
    // cdnDomainTransfer
    selectDomainPlaceholder: 'Select domains here',
    selectedDomains: '{count} has been selected | {count} have been selected',
    deleted: 'Deleted',
  },

  header: {
    accountInfo: 'Account Information', // "账号信息",
    labelMana: 'Label management', //"标签管理",
    orderMana: 'Order management', // "订单管理",
    billMama: 'Bill management', //"账单管理",
    repayMana: 'Renewal management', //"续费管理",
    invoiceMana: 'Invoice management', //"发票管理",
    incomeExpenditure: 'Income and expenditure details', // "收支明细",
    couponsMana: 'Coupon management', //"优惠券管理",
    primaryAccount: 'main account',
    bypassAccount: 'sub account',
    availableCost: 'Available limit',
    toCost: 'Recharge',
    discountCoupon: 'Coupon',
    invokable: 'Invoice amount',
    unpaid: '{orderNum} Pending payment',
  },

  error: {
    badRequest: 'Invalid request parameters',
    unauthorized: 'Unauthorized',
    forbidden: 'You do not have permission to access this resource',
    notFound: 'The requested resource does not exist',
    serverError: 'Internal server error',
    requestFailedWithStatus: 'Request failed, status code: {0}',
    networkError: 'Network error, please check your connection',
    requestError: 'Request error',
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
