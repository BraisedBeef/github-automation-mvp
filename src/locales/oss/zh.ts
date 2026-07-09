import { appNameMap } from '@/config/base-config'

export default {
  oss: {
    bucketList: '存储桶列表',
    resourcePackM: '资源包管理',
    createBucket: '创建存储桶',
    bucketName: '存储桶名称',
    usageStatistics: '使用统计',
    serviceOverview: '服务概览',
    // 标签
    tag: '标签',
    // 请输入存储桶名称
    pleaseEnterBucketName: '请输入存储桶名称',
    // 标签键和标签值需通过分号分隔
    tagKeyAndValueSeparatedBySemicolon: '标签键和标签值需通过分号分隔',
    // 购买资源包
    buyPackage: '购买资源包',
    // 批量设置权限
    batchSetPermissions: '批量设置权限',
    // 存储桶不支持改名
    bucketRenameNotSupported: '存储桶不支持改名',
    // 标签数量
    tagCount: '标签数量',
    // 访问权限
    accessPermissions: '访问权限',
    // 所属地域
    region: '所属地域',
    // 创建时间
    createTime: '创建时间',
    // 全部
    all: '全部',
    // 日本东京
    日本东京: '日本东京',
    // 存储量
    storage: '存储量',
    // 存储量非实时数据，每日统计一次，仅作为参考
    storageTip: '存储量非实时数据，每日统计一次，仅作为参考',
    // 操作
    operation: '操作',
    // 配置管理
    configManagement: '配置管理',
    // 设置标签
    setTag: '设置标签',
    // 清空数据
    clearData: '清空数据',
    // 删除
    delete: '删除',
    // 自定义列表字段
    customListFields: '自定义列表字段',
    // 清除缓存或更换浏览器，自定义列表将失效。
    customListFieldsTip: '清除缓存或更换浏览器，自定义列表将失效。',
    // 导出存储桶列表
    exportBucketList: '导出存储桶列表',
    // 导出范围
    exportRange: '导出范围',
    // 导出全部存储桶列表
    exportAllBucketList: '导出全部存储桶列表',
    // 仅导出选中存储桶列表
    exportSelectedBucketList: '仅导出选中存储桶列表',
    // 创建后地域无法修改，
    regionTip1: '创建后地域无法修改，',
    regionTip2: '请谨慎选择。',
    // 名称
    name: '名称',
    // 创建后名称无法修改。
    nameTip: '创建后名称无法修改。',
    // 存储桶名称创建后无法修改
    bucketNameTip: '存储桶名称创建后无法修改',
    // 还能输入{0}个字符，支持小写字母、数字和-；
    nameTip1: '还能输入{0}个字符，',
    nameTip2: '支持小写字母、数字和-；',
    nameTip3: '存储桶名称由【自定义名称】-【APPID】构成。',
    // 私有读写
    privateReadWrite: '私有读写',
    // 公有读私有写
    publicReadPrivateWrite: '公有读私有写',
    // 公有读写
    publicReadWrite: '公有读写',
    // 在完成身份验证后，用户将获得对象的访问权限。您可以通过 设置访问权限 来给用户授权。
    readWriteTip1: '在完成身份验证后，用户将获得对象的访问权限。您可以通过 设置访问权限 来给用户授权。',
    readWriteTip2: '无需身份验证，即可读取您存储桶中的数据，安全风险高，不推荐此配置。 写操作需要进行身份验证。',
    readWriteTip3: '无需身份验证，即可读取、写入您存储桶中的数据，安全风险高，不推荐此配置。',
    readWriteTip4: '开启公有读权限可能产生预期外的外网下行流量费用。',
    readWriteTip5: '若您必须使用公有读权限，建议采取措施避免产生预期外的费用，如配置防盗链。',
    // 默认警告
    defaultWarning: '默认警告',
    // 当检测到1分钟内外网下行流量大于5000MB时，会进行告警通知。
    defaultWarningTip: '当检测到1分钟内外网下行流量大于5000MB时，会进行告警通知。',
    // 请求域名
    requestDomain: '请求域名',
    // 创建完成后，您可以使用该域名对存储桶进行访问
    requestDomainTip1: '创建完成后，您可以使用该域名对存储桶进行访问',
    requestDomainTip2: '默认域名存在安全风险，建议您创建完存储桶后前往配置自定义域名。',
    // 版本控制
    versionControl: '版本控制',
    // 开启版本控制后可以恢复因覆盖或误删丢失的数据。
    versionControlTip1: '开启版本控制后可以恢复因覆盖或误删丢失的数据。',
    versionControlTip2: '在相同存储桶中保留对象的多个版本，将产生存储容量费用。',
    // 服务端加密
    serverEncryption: '服务端加密',
    // 不加密
    noEncryption: '不加密',
    // SSE-COS加密
    sseCosEncryption: 'SSE-OSS加密',
    // 使用COS托管的密钥进行AES-256服务端加密
    sseCosEncryptionTip: '使用OSS托管的密钥进行AES-256服务端加密',
    // 当文件上传至COS时，自动对其进行加密存储。
    sseCosEncryptionTip1: '当文件上传至OSS时，自动对其进行加密存储。',
    // （创建后不支持修改）
    notModifyAfterCreation: '（创建后不支持修改）',
    // 开启
    open: '开启',
    // 关闭
    close: '关闭',
    // 取消
    cancel: '取消',
    // 确定
    confirm: '确定',
    // 创建
    create: '创建',
    // 编辑
    edit: '编辑',
    // 重试
    retry: '重试',
    // 启动
    start: '启动',
    // 暂停
    pause: '暂停',
    // 清除记录
    clearRecord: '清除记录',
    // 查看详情
    viewDetails: '查看详情',
    // 保存
    save: '保存',
    // 上一步
    previousStep: '上一步',
    // 下一步
    nextStep: '下一步',
    // 基本信息
    basicInformation: '基本信息',
    // 高级可选配置
    advancedOptionalConfiguration: '高级可选配置',
    // 确认配置
    confirmConfiguration: '确认配置',
    // 仅支持小写英文字母、数字和中划线
    nameRule: '仅支持小写英文字母、数字和中划线',
    nameRule1: '存储桶名称不能以“-”开头或结尾',
    nameRule2: '请求域名字符不超过{0}个字符，当前存储桶名称长度超出限额',
    nameCheckError: '存储桶名称已存在，请重新输入',
    // 高风险
    highRisk: '高风险',
    highRiskTip: '默认域名存在安全风险，建议您创建完存储桶后前往配置自定义域名',
    createSuccess: '存储桶创建成功',
    // 计费
    billing: '计费',
    // 注意
    attention: '注意',
    // 当前已达最大存储桶数量限额
    maxBucketCount: '当前已达最大存储桶数量限额',

    buyResourcePack: '购买资源包',
    // 手动续费
    manualRenewal: '手动续费',
    // 自动续费
    autoRenewal: '自动续费',
    // 资源包
    buyPack: {
      title: '对象存储 OSS',
      // 包年包月组合包
      tab1: '包年包月组合包',
      tab2: '加量资源包',
      region1: '中国香港及海外通用',
      region2: '中国大陆通用',
      categoryLabel1: '存储容量',
      categoryLabel2: '流量',
      categoryLabel3: '读写请求',
      categoryDesc1:
        '存储容量指用户的文件数据上传到 OSS 后所占用的存储空间，存储容量费用按照存储容量和存储时长进行计算。',
      categoryDesc2:
        '流量是指用户在使用和访问 OSS 数据时，产生数据流量，流量费用按照用户实际消耗的流量累计值进行计算。',
      categoryDesc3:
        '读写请求是用户使用 API、SDK 或控制台等方式，在 OSS 上进行数据上传、下载、查询、删除等操作产生的。',
      effective1: '立即生效',
      effective2: '指定时间生效',
      effectiveDesc1: '资源包将在您支付完成后当天生效，生效日期自当天开始',
      effectiveDesc2: '如果支付时间晚于指定生效时间，资源包将在支付后立即生效',
      // {0}年
      year: '{0}年',
      // {0}个月
      month: '{0}个月',
      column1: '资源包名称/订单号',
      column2: '生效地域',
      column3: '来源',
      column4: '计费项',
      column5: '规格',
      column6: '资源包用量',
      column7: '续费类型',
      column8: '生效时间',
      column9: '到期时间',
      columnDesc1: '表示一个周期内的总量',
      columnDesc2: '流量包与读写次数包自生效之日起，一个月为一个周期，用量为一个周期内的用量。',
      columnDesc3: '存储容量包用量：根据当前实际存储占用情况，从此容量包中已抵扣的用量。',
      renewType: '续费',
      renewType1: '设为自动续费',
      // 有效资源包
      validPack: '有效资源包',
      // 无效资源包
      invalidPack: '无效资源包',
      // 标准存储容量包
      standardStoragePack: '标准存储容量包',
      // 公网下行流量包
      publicDownstreamTrafficPack: '公网下行流量包',
      // 全球加速流量包
      globalAccelerationTrafficPack: '全球加速流量包',
      // 标准存储请求包
      standardStorageRequestPack: '标准存储请求包',
      // 预付费
      prePay: '预付费',
      // 平台赠送
      platformGift: '平台赠送',
    },
    // 购买页
    buyPage: {
      // 购买须知
      notice: '购买须知',
      // 使用说明
      instructions: '使用说明',
      noticeDesc1: '组合包需同时包含存储容量、外网流量、请求次数三项。资源包为预付费，不可跨地域抵扣。',
      noticeDesc2: '存储桶是数据存储空间，与资源包没有直接绑定关系，资源包本身不存储数据。',
      // 计费规则
      billingRules: '计费规则',
      billingRulesDesc1:
        '组合资源包购买后立即生效，到期或额度用尽时不再抵扣，且对应功能会受到限制（流量包不足：数据无法通过公网下载；容量包不足：数据无法新增写入；请求包不足：相关操作可能失败）；资源包不可跨地域使用。',
      billingRulesDesc2:
        '资源包类型包括：流量包、容量包、请求包。资源包购买后立即生效或指定时间生效，到期或额度用尽时不再抵扣，且对应功能会受到限制（流量包不足：数据无法通过公网下载；容量包不足：数据无法新增写入；请求包不足：相关操作可能失败）桶内数据在资源包到期或用尽后，于宽限期内重新购买或续费资源包后可恢复使用。资源包不可跨地域使用。',
      // 其他说明
      otherInstructions: '其他说明',
      otherInstructionsDesc1: '资源包仅限对象存储OSS服务使用，不可转让、退款或延期。',
      // 配置组合资源包
      configureComboPack: '配置组合资源包',
      // 使用须知
      usageNotes: '使用须知',
      usageNotesDesc1: '资源包规格可叠加',
      usageNotesDesc2: '不可抵扣已产生的用量',
      usageNotesDesc3: '组合包购买后立即生效，资源包当前周期未使用完，不累计到下一周期',
      usageNotesDesc4: '资源包当前周期未使用完，不累计到下一周期',
      // 生效地域
      effectiveRegion: '生效地域',
      effectiveRegionChoice: '请选择与存储桶 所属地域 相对应的通用地域',
      eRTip: '中国大陆地域资源建设中，敬请期待',
      // 有效期
      validityPeriod: '有效期',
      attentionDesc1:
        '建议勾选“到期自动续费”，可避免因资源到期停机或释放而影响业务。按月购买的资源包自动续费周期为1个月；按年购买的资源包自动续费周期为1年。',
      // 到期自动续费
      autoRenewal: '到期自动续费',
      // 配置资源包类型及规格
      configurePackType: '配置资源包类型及规格',
      // 必选
      required: '必选',
      // 存储容量包
      storageCapacityPack: '存储容量包',
      storageCapacityPackDesc: '存储容量指用户的文件数据上传到 OSS 后所占用的存储空间，按占用空间与时间计费',
      // 类型
      type: '类型',
      // 标准存储容量
      standardStorageCapacity: '标准存储容量',
      standardStorageCapacityDesc: '用于抵扣数据存储时产生的标准存储容量费用',
      // 流量
      traffic: '流量',
      // 购买数量
      buyCount: '购买数量',
      // 读写请求包
      readWriteRequestPack: '读写请求包',
      readWriteRequestPackDesc:
        '读写请求是用户使用API、SDK或控制台等方式，在OSS上进行数据上传、下载、查询、删除等操作产生的。',
      // 标准存储请求
      standardStorageRequest: '标准存储请求',
      standardStorageRequestDesc: '*用于抵扣数据在OSS上进行的读写请求，仅针对标准存储类型的数据',
      // 选择资源包
      selectResourcePack: '选择资源包',
      // 计费项分类
      billingItemCategory: '计费项分类',
      // 资源包类型
      ResourcePackType: '资源包类型',
      // 资源包规格
      resourcePackSpecifications: '资源包规格',
      // 生效时间
      effectiveTime: '生效时间',
      // 用于抵扣数据通过互联网下载到本地所产生的外网下行流量费用。
      publicDownstreamTrafficDesc: '用于抵扣数据通过互联网下载到本地所产生的外网下行流量费用。',
      // 用于抵扣开启全球加速功能后，以全球加速域名将数据通过互联网上传或下载，所产生的全球加速流量费用。
      globalAccelerationTrafficDesc:
        '用于抵扣开启全球加速功能后，以全球加速域名将数据通过互联网上传或下载，所产生的全球加速流量费用。',
      // 用于抵扣数据在OSS上进行的读写请求，仅针对标准存储类型的数据。
      standardStorageCapacityDesc1: '用于抵扣数据存储时产生的标准存储容量费用',
      // 流量包
      trafficPack: '流量包',
      trafficPackDesc: '流量是指用户在使用和访问 OSS 数据时，产生数据流量，按照用户实际消耗的流量累计值进行计算。',
      // 公网下行流量
      publicDownstreamTraffic: '公网下行流量',
      // 全球加速流量
      globalAccelerationTraffic: '全球加速流量',
      // 当前费用
      currentCost: '当前费用',
      // 配置费用明细
      configureCostDetails: '配置费用明细',
      // 实际优惠金额请以下单页为准
      actualDiscountAmount: '实际优惠金额请以下单页为准',
      // 计费项
      billingItem: '计费项',
      // 价格
      price: '价格',
      // 原价
      originalPrice: '原价',
      // 立即购买
      buyNow: '立即购买',
      // 资源包购买提示
      inquiryIncompleteError: '当前时长暂不支持「存储+流量+读写请求」组合包，建议选择其他时长购买',
      inquiryIncompleteError1: '当前时长暂不支持「存储+流量+读写请求」组合包，点击前往  {0} 单独购买',
    },
    fileList: {
      accessDesc: '在完成身份验证后，用户将获得对象的访问权限。您可以通过 {0} 来给用户授权。',
      // 确认重名提示
      confirmRenameDesc: '当前路径存在同名文件 {0} 重命名后将直接覆盖该同名文件，确认继续吗？',
      // 任务中心
      taskCenter: '任务中心',
      // 执行中
      taskInProgress: '执行中（{0}）',
      // 执行成功
      taskSuccess: '执行成功（{0}）',
      // 执行失败
      taskFailed: '执行失败（{0}）',
      // 确定删除当前所选的存储桶？
      confirmDeleteBucket: '确定删除当前所选的存储桶？',
      deleteBucketTip: '注:删除前需要对存储桶内的资源进行检测,保证存储桶下的资源已经清空和 关闭后才可进行删除操作。{0}',
      // 删除存储桶后数据不可恢复和访问。
      deleteBucketTip1: '删除存储桶后数据不可恢复和访问。',
      // 文件/历史版本
      fileHistory: '文件/历史版本',
      // 正在检测…
      checking: '正在检测…',
      // 已删除存储桶内的文件/历史版本
      deletedFileHistory: '已删除存储桶内的文件/历史版本',
      // 请删除存储桶内未清理的文件/历史版本。
      pleaseDeleteFileHistory: '请删除存储桶内未清理的文件/历史版本。',
      // 去清空存储桶
      goClearBucket: '去清空存储桶',
      // 文件碎片
      fileFragments: '文件碎片',
      // 已删除存储桶内所有文件碎片
      deletedFileFragments: '已删除存储桶内所有文件碎片',
      // 请删除存储桶内所有文件碎片
      pleaseDeleteFileFragments: '请删除存储桶内所有文件碎片',
      // 绑定的CDN加速域名
      boundCdnDomain: '绑定的CDN加速域名',
      // 已关闭默认CDN加速域名、自定义CDN加速域名。
      closedCdnDomain: '已关闭默认CDN加速域名、自定义CDN加速域名。',
      // 去关闭
      goClose: '去关闭',
      // 删除存储桶
      deleteBucket: '删除存储桶',
      // 重新检测
      recheck: '重新检测',
      // 正在删除存储桶
      deletingBucket: '正在删除存储桶',
      // 存储桶删除成功
      deleteBucketSuccess: '存储桶删除成功',
      // 确定清空当前所选的存储桶？
      confirmClearBucket: '确定清空当前所选的存储桶？',
      // 清空存储桶将删除您存储中的所有文件、历史版本、文件碎片，删除后数据不可恢复和访问。
      clearBucketWarning: '清空存储桶将删除您存储中的所有文件、历史版本、文件碎片，删除后数据不可恢复和访问。',
      // 请输入存储桶名称
      enterBucketName: '请输入存储桶名称',
      // 以确认执行清空操作
      confirmClearOperation: '以确认执行清空操作',
      // 确认清空
      confirmClear: '确认清空',
      // 确定要清空存储桶?
      confirmClearBucketOperation: '确定要清空存储桶？',
      // 确认清空桶提示
      confirmClearBucketTip:
        '清空存储桶将清空您桶内的所有对象，包括对象的历史版本和未完成上传碎片{0}，如您确认清空存储桶，请点击确认按钮执行。',
      // （清空后数据无法恢复）
      clearBucketTip: '（清空后数据无法恢复）',
      // 存储桶已清空
      bucketCleared: '存储桶已清空',
      // 删除对象任务-{0}
      deleteObjectTask: '删除对象任务-{0}',
      // 修改访问权限任务-{0}
      modifyAccessPermissionTask: '修改访问权限任务-{0}',
      // 正在清空存储桶
      clearingBucket: '正在清空存储桶',
      // 返回存储桶列表
      backToBucketList: '返回存储桶列表',
      // 概览
      overview: '概览',
      // 文件列表
      fileList: '文件列表',
      // 配置管理
      configManagement: '配置管理',
      // 数据监控
      dataMonitoring: '数据监控',
      // 安全管理
      safetyManagement: '安全管理',
      // 权限管理
      permissionManagement: '权限管理',
      // 域名管理
      DomainConfig: '域名管理',
      // 上传文件
      uploadFile: '上传文件',
      // 新建文件夹
      createFolder: '新建文件夹',
      // 碎片管理
      fragmentManagement: '碎片管理',
      // 清空存储桶
      clearBucket: '清空存储桶',
      // 只支持搜索当前虚拟目录下的对象
      searchFileTip: '只支持搜索当前虚拟目录下的对象',
      // 只支持搜索当前虚拟目录及其子目录下的对象
      searchFileTip1: '只支持搜索当前虚拟目录及其子目录下的对象',
      // 前缀搜索
      prefixSearch: '前缀搜索',
      // 模糊搜索
      fuzzySearch: '模糊搜索',
      // 文件名称
      fileName: '文件名称',
      // 重命名对象
      renameObject: '重命名对象',
      // 虚拟目录不支持改名
      virtualDirectoryRenameNotSupported: '虚拟目录不支持改名',
      // 文件大小
      fileSize: '文件大小',
      // 存储类型
      StorageType: '存储类型',
      // 详情
      details: '详情',
      // 下载
      download: '下载',
      // 修改访问权限
      modifyAccessPermission: '修改访问权限',
      // 设置权限
      setPermission: '设置权限',
      // 确认删除以下1个对象吗？
      confirmDeleteObject: '确认删除以下1个对象吗？',
      // 确认删除该文件夹吗？
      confirmDeleteFolder: '确认删除该文件夹吗？',
      // 确定对以下文件/文件夹进行删除操作吗？
      confirmDeleteFilesFolders: '确定对以下文件/文件夹进行删除操作吗？',
      // 删除后文件将无法恢复，请谨慎操作。
      deleteWarning: '删除后文件将无法恢复，请谨慎操作。',
      // 1.如果选择了要删除的文件夹，则该文件夹中的所有对象都将被删除，并且在执行删除操作期间添加的任何新对象也可能被删除。
      deleteWarningTip1:
        '1.如果选择了要删除的文件夹，则该文件夹中的所有对象都将被删除，并且在执行删除操作期间添加的任何新对象也可能被删除。',
      // 2.如果选择了要删除的对象，则在删除操作完成之前上传的任何相同名称的新对象也将被删除。
      deleteWarningTip2: '2.如果选择了要删除的对象，则在删除操作完成之前上传的任何相同名称的新对象也将被删除。',
      // 3.删除操作将无法恢复。确定执行删除吗？
      deleteWarningTip3: '3.删除操作将无法恢复。确定执行删除吗？',
      // 修改时间
      modifiedTime: '修改时间',
      // 公共权限
      publicPermission: '公共权限',
      // 继承权限
      inheritedPermission: '继承权限',
      // 该文件的访问权限以存储桶访问权限为准。
      inheritedPermissionTip: '该文件的访问权限以存储桶访问权限为准。',
      // 设置访问权限
      setAccessPermission: '设置访问权限',
      // 无需身份验证，即可读取您存储桶中的数据，安全风险高，不推荐此配置。写操作需要进行身份验证。
      noAuthReadWarning: '无需身份验证，即可读取您存储桶中的数据，安全风险高，不推荐此配置。写操作需要进行身份验证。',
      // 创建文件夹
      createNewFolder: '创建文件夹',
      // 文件夹名称不能为空
      createNewFolderRuleTip1: '文件夹名称不能为空',
      // 文件夹名称不能以 / 开头
      createNewFolderRuleTip2: '文件夹名称不能以 / 开头',
      // 文件夹名称不能包含连续的 /
      createNewFolderRuleTip3: '文件夹名称不能包含连续的 /',
      // 文件夹名称不能为 ..
      createNewFolderRuleTip4: '文件夹名称不能为 ..',
      // 文件夹名称只能包含数字、中英文和可见字符
      createNewFolderRuleTip5: '文件夹名称只能包含数字、中英文和可见字符',
      // 文件夹名
      folderName: '文件夹名称',
      // 1. 可用数字、中英文和可见字符的组合
      folderNameTip1: '1. 可用数字、中英文和可见字符的组合',
      // 2. 用 / 分割路径，可快速创建子目录
      folderNameTip2: '2. 用 / 分割路径，可快速创建子目录',
      // 3. 不允许: 文件夹为空；连续 / ；以 / 开头
      folderNameTip3: '3. 不允许: 文件夹为空；连续 / ；以 / 开头',
      // 4. 不允许以 .. 作为文件夹名称
      folderNameTip4: '4. 不允许以 .. 作为文件夹名称',
      // 请输入文件夹名称
      enterFolderName: '请输入文件夹名称',
      // 您即将重命名 {0} 为：
      renameObjectTip: '您即将重命名 {0} 为：',
      // 文件名不可带斜杠“/”
      fileNameCannotContainSlash: '文件名不可带斜杠“/”',
      // 当前路径存在同名文件
      sameFileNameExists: '当前路径存在同名文件',
      // 标准存储
      standardStorage: '标准存储',
      // 低频存储
      infrequentAccess: '低频存储',
      // 归档存储
      archiveStorage: '归档存储',
      // 正在删除
      deleting: '正在删除',
      // 删除成功
      deleteSuccess: '删除成功',
      // 访问权限修改成功
      accessPermissionModifiedSuccessfully: '访问权限修改成功',
      // 文件夹创建成功
      folderCreatedSuccessfully: '文件夹创建成功',
      // 重命名成功
      renameSuccess: '重命名成功',
      // 名称长度不能超过850字节
      renameRuleTip: '名称长度不能超过850字节',
      // 名称不能以/或\\开头
      renameRuleTip1: '名称不能以/或\\开头',
      // 名称不能包含控制字符
      renameRuleTip2: '名称不能包含控制字符',
      // 正在下载文件
      downloadingFile: '正在下载文件',
      // 获取下载地址失败
      getDownloadUrlFailed: '获取下载地址失败',
      // 上传至
      uploadTo: '上传至',
      // 选择文件
      selectFile: '选择文件',
      // 选择文件夹
      selectFolder: '选择文件夹',
      uploadTip:
        '1、若上传路径中存在同名文件，将被新上传的文件覆盖。如您想要保留多个版本的文件/文件夹，请开启版本控制。',
      uploadTip1: '2、上传操作将产生请求次数和上行流量，其中请求按万次收费，上行流量免费。',
      uploadTip2: '将文件/文件夹拖拽到此区域上传，或选择文件/文件夹。单个文件的大小不能超过5GB',
      // 文件/文件夹
      fileFolder: '文件/文件夹',
      // 大小
      size: '大小',
      // 状态
      status: '状态',
      // 进度
      progress: '进度',
      // 已添加
      added: '已添加',
      // 文件大小超出限制，未添加
      fileSizeExceedsLimitNotAdded: '文件大小超出限制，未添加',
      // 移除
      remove: '移除',
      // 文件数：{0}
      fileCount: '文件数：{0}',
      // 总计大小： {0}
      totalSize: '总计大小： {0}',
      // 高级设置(可选)
      advancedSettings: '高级设置(可选)',
      // 文件访问权限
      fileAccessPermission: '文件访问权限',
      // 上传
      upload: '上传',
      // 正在上传文件
      uploadingFile: '正在上传文件',
      // 文件上传失败，请稍后重试
      fileUploadFailed: '文件上传失败，请稍后重试',
      // 上传任务-{0}
      uploadTask: '上传任务-{0}',
      // 文件碎片管理
      fileFragmentManagement: '文件碎片管理',
      // 清空碎片
      clearFragments: '清空碎片',
      // 请输入文件名(对象路径)
      enterFileName: '请输入文件名(对象路径)',
      // 碎片文件名称
      fragmentFileName: '碎片文件名称',
      // 上传任务ID
      uploadTaskId: '上传任务ID',
      // 更多信息
      moreInfo: '更多信息',
      // 分块上传信息
      multipartUploadInfo: '分块上传信息',
      // 对象路径
      objectPath: '对象路径',
      // 已上传大小
      uploadedSize: '已上传大小',
      // 已上传分块数
      uploadedFragmentCount: '已上传分块数',
      // 确定删除路径为
      confirmDeletePath: '确定删除路径为',
      // 的文件碎片吗？
      confirmDeletePathTip: '的文件碎片吗？',
      // 确定要清空该存储桶下所有的文件碎片吗？
      ensureClearAllFragments: '确定要清空该存储桶下所有的文件碎片吗？',
      // 删除文件碎片
      deleteFileFragments: '删除文件碎片',
      // 正在清空碎片
      clearingFragments: '正在清空碎片',
      // 文件详情
      fileDetails: '文件详情',
      // 对象名称
      objectName: '对象名称',
      // 对象大小
      objectSize: '对象大小',
      // 指定域名
      specifyDomainName: '指定域名',
      // 若已配置或添加相关域名，选择不同域名，对象地址会有相应的改变。
      specifyDomainNameTip: '若已配置或添加相关域名，选择不同域名，对象地址会有相应的改变。',
      // 默认源站域名
      defaultOriginDomainName: '默认源站域名',
      // 对象地址
      objectUrl: '对象地址',
      // 若已设置存储桶或对象公共访问权限，可直接复制对象地址下载对象。
      objectUrlTip: '若已设置存储桶或对象公共访问权限，可直接复制对象地址下载对象。',
      // 暂不支持预览
      previewNotSupported: '暂不支持预览',
      // 对象访问权限
      objectAccessPermission: '对象访问权限',
      // 加密方式
      encryptionMethod: '加密方式',
      // 获取上传凭证失败
      getUploadCredentialsFailed: '获取上传凭证失败',
      // 任务列表
      taskList: '任务列表',
      // 刷新或关闭浏览器会取消当前所有任务，并清除全部记录。
      taskListTip: '刷新或关闭浏览器会取消当前所有任务，并清除全部记录。',
      // 修改加密方式任务-{0}
      modifyEncryptionMethodTask: '修改加密方式任务-{0}',
      // 复制任务-{0}
      copyTask: '复制任务-{0}',
      // 任务名称
      taskName: '任务名称',
      // 任务状态
      taskStatus: '任务状态',
      // 完成任务数量
      completedTaskCount: '完成任务数量',
      // 上传失败，建议检查网络连接，或稍后重新尝试。
      uploadFailed: '上传失败，建议检查网络连接，或稍后重新尝试。',
      // 设置失败，建议检查网络连接，或稍后重新尝试。
      setFailed: '设置失败，建议检查网络连接，或稍后重新尝试。',
      // 执行中
      executing: '执行中',
      // 已暂停
      paused: '已暂停',
      // 执行失败
      executionFailed: '执行失败',
      // 执行成功
      executionSuccess: '执行成功',
    },
    s6: {
      // 该存储桶已开启SSE-OSS加密，已加密对象无法设置不加密，请关闭存储桶加密后重新设置。
      sseOssEncrypted: '该存储桶已开启SSE-OSS加密，已加密对象无法设置不加密，请关闭存储桶加密后重新设置。',
      // 复制
      copy: '复制',
      // 复制文件
      copyFile: '复制文件',
      // 复制成功
      copySuccess: '复制文件成功，可前往目标路径粘贴',
      // 粘贴文件已完成
      copyFileCompleted: '粘贴文件已完成',
      // 粘贴文件
      pasteFile: '粘贴文件',
      // 将要复制 {0} 个文件，目标路径已经包含以下同名文件/文件夹，请确认操作。
      confirmCopy: '将要复制 {0} 个文件，目标路径已经包含以下同名文件/文件夹，请确认操作。',
      // 跳过
      skip: '跳过',
      // 覆盖
      overwrite: '覆盖',
      // 不允许在原位置粘贴
      notAllowPaste: '不允许在原位置粘贴',
      // 不允许将父目录粘贴到子目录
      notAllowPasteToChild: '不允许将父目录粘贴到子目录',
      // 用量趋势
      usageTrend: '用量趋势',
      // 存储用量趋势（GB）
      storageUsageTrend: '存储用量趋势（GB）',
      // 流量趋势（MB）
      trafficTrend: '流量趋势（MB）',
      // 请求数趋势（次）
      requestCountTrend: '请求数趋势（次）',
      // 用量概览
      usageOverview: '用量概览',
      // 用量数据非实时，存在一定延迟，不作为计费计量数据，仅作参考。
      usageOverviewTip: '用量数据非实时，存在一定延迟，不作为计费计量数据，仅作参考。',
      bucketUsageOverviewTip: '用量概览数据非计费计量数据，延迟约2小时，仅供参考。',
      goToBillingDetails: '如需计费计量数据，请前往费用中心查看用量明细。',
      comparedWithYesterday: '较昨天',
      comparedWithLastMonth: '较上月同期',
      lastMonthInternetTraffic: '上月外网下行流量',
      lastMonthReadRequests: '上月读请求数',
      bucketConfiguration: '存储桶配置',
      multiAZFeature: '多AZ特性',
      crossDomainAccess: '跨域访问',
      originPull: '回源',
      inventory: '清单',
      lifecycle: '生命周期',
      logManagement: '日志管理',
      metadataAcceleration: '元数据加速',
      bucketEncryption: '存储桶加密',
      antiLeech: '防盗链',
      bucketReplication: '存储桶复制',
      enabled: '已开启',
      notEnabled: '未开启',
      notConfigured: '未配置',
      ruleCount: '{count}条规则',
      // 默认域名
      defaultDomainName: '默认域名',
      // 存储容量
      storageCapacity: '存储容量',
      // 存储桶数量
      bucketCount: '存储桶数量',
      // 对象数量
      objectCount: '对象数量',
      // 对象总数
      totalObjectCount: '对象总数',
      // 本月日均标准存储容量
      monthlyAverageStandardStorageCapacity: '本月日均标准存储容量',
      // 当前存储桶总量
      currentBucketTotal: '当前存储桶总量',
      // 数据统计截止时间点： {0}
      dataStatisticsDeadline: '数据统计截止时间点： {0}',
      // 本月外网下行流量
      internetTraffic: '本月外网下行流量',
      // 本月读请求数
      readRequestCount: '本月读请求数',
      // 个
      count: '个',
      // 次
      times: '次',
      // 本月
      currentMonth: '本月',
      // 近7日
      last7Days: '近7日',
      // 近30日
      last30Days: '近30日',
      // 存储桶访问权限
      bucketAccessPermission: '存储桶访问权限',
      // 访问管理CAM
      accessManagementCAM: '访问管理CAM',
      // 当前状态
      currentStatus: '当前状态',
      // 访问管理（Cloud Access Management，CAM）是猫云提供的统一权限控制服务，用于安全管理账号下云资源的访问权限。用户可创建和管理角色，并通过策略控制其访问范围，实现权限分配，降低越权与账号风险。
      accessManagementCAMTip: `访问管理（Cloud Access Management，CAM）是${appNameMap.zh}提供的统一权限控制服务，用于安全管理账号下云资源的访问权限。用户可创建和管理角色，并通过策略控制其访问范围，实现权限分配，降低越权与账号风险。`,
      // 前往CAM控制台
      goCAMConsole: '前往CAM控制台',
      // 防盗链设置
      antiLeechSetting: '防盗链设置',
      // 服务端加密用于在数据写入存储时自动执行加密处理，确保数据的安全性，无需用户额外操作。
      serverSideEncryption: '服务端加密用于在数据写入存储时自动执行加密处理，确保数据的安全性，无需用户额外操作。',
      // 防盗链是一种安全措施，通过配置黑/白名单，防止外部网站或程序未经授权引用资源，避免流量被盗刷。
      antiLeechSettingTip:
        '防盗链是一种安全措施，通过配置黑/白名单，防止外部网站或程序未经授权引用资源，避免流量被盗刷。',
      // 源站类型
      sourceType: '类型',
      // 空Referer
      emptyReferer: '空Referer',
      // http请求header为空referer（即:不带referer字段或referer字段为空）
      emptyRefererTip: 'http请求header为空referer（即:不带referer字段或referer字段为空）',
      // 配置状态
      configStatus: '配置状态',
      // 请输入域名或IP地址
      pleaseEnterDomainOrIP: '请输入域名或IP地址',
      // 最多只能输入10行
      maxInput10Lines: '最多只能输入10行',
      // 最大字符数不超过200
      maxCharacter200: '最大字符数不超过200',
      // 无需填写协议 http(s)://
      noNeedProtocol: '无需填写协议 http(s)://',
      // 域名或IP格式不正确
      domainOrIPFormatError: '域名或IP格式不正确',
      //  填写域名或IP地址，支持多行，最多10行，支持通配符 *，如: *.test.com；无需填写协议 http(s)://
      pleaseEnterDomainOrIPTip:
        '填写域名或IP地址，支持多行，最多10行，支持通配符 *，如: *.test.com；无需填写协议 http(s)://',
      // 允许
      allow: '允许',
      // 拒绝
      reject: '拒绝',
      // 白名单
      whiteList: '白名单',
      // 黑名单
      blackList: '黑名单',
      // 资源包
      resourcePackage: '资源包',
      // 修改加密方式
      modifyEncryptionMethod: '修改加密方式',
      // 生效中
      effective: '生效中',
      // 即将过期
      willExpire: '即将过期',
      // 7天内即将过期的资源包
      resourcePackageWillExpire: '7天内即将过期的资源包',
      // 最近访问桶
      recentAccessBucket: '最近访问桶',
      viewMore: '查看更多',
      learnMore: '了解更多',
      gettingStarted: '新手入门',
      createBucketGuide: '存储桶是对象的容器，可存放任何格式类型的数据。您可通过控制台、API、SDK等多种方式操作。',
      manageObjects: '管理对象',
      manageObjectsGuide: '对象是对象存储的基本单元。可以进行上传、下载、复制、预览、编辑等操作，高效管理您的业务。',
      viewUsageStatistics: '查看使用统计',
      viewUsageStatisticsGuide: '查看数据监控以及对应存储类型的使用统计，便于及时了解资源的使用状态。',
      buyResourcePackageGuide: '资源包是对象存储推出的预付费优惠套餐，可根据实际需求选购。',
      helpDocs: '帮助文档',
      productOverview: '产品概述',
      productOverviewSummary: '简介：对象存储是一个基于对象的海量存储服务',
      basicConcepts: '基本概念',
      basicConceptsSummary: '存储桶：存储空间是用户用于存储对象的容器',
      mainFeatures: '主要功能',
      mainFeaturesSummary: '基础操作：提供多种对象管理能力',
      productAdvantages: '产品优势',
      productAdvantagesSummary: '安全可靠，支持 HTTPS/SSL 安全协议',
      // 标准存储容量
      standardStorageCapacity: '标准存储容量',
      // 公网下行流量
      internetTrafficOut: '公网下行流量',
      // CDN回源流量
      cdnTraffic: 'CDN回源流量',
      // 读请求数
      totalReadRequestCount: '读请求数',
      // 写请求数
      writeRequestCount: '写请求数',
    },
    s7: {
      // 自定义域名
      customDomainName: '自定义域名',
      // 配置自定义域名，指将您的自有域名绑定至文件所在的存储桶，实现通过自有域名访问存储在存储桶中的对象。
      customDomainNameTip:
        '配置自定义域名，指将您的自有域名绑定至文件所在的存储桶，实现通过自有域名访问存储在存储桶中的对象。',
      // 请前往您的域名解析服务商处配置CNAME记录，将域名以CNAME方式指向您的存储桶
      pleaseGoToYourDomainNameResolver: '请前往您的域名解析服务商处配置CNAME记录，将域名以CNAME方式指向您的存储桶',
      // 添加域名
      addDomainName: '添加域名',
      // 当前未检测到指向当前存储桶的有效 CNAME 记录，请确认已在业务相关区域正确配置 CNAME 记录。
      noValidCnameRecord: '当前未检测到指向当前存储桶的有效 CNAME 记录，请确认已在业务相关区域正确配置 CNAME 记录。',
      // 上线
      online: '上线',
      // 下线
      offline: '下线',
      // 删除域名前，请先修改域名为下线状态
      pleaseModifyDomainNameToOfflineStatus: '删除域名前，请先修改域名为下线状态',
      // 添加自定义域名
      addCustomDomainName: '添加自定义域名',
      // 域名
      domainName: '域名',
      // 请输入域名
      pleaseEnterDomainName: '请输入域名',
      // 仅支持绑定具体域名（如cdn.example.com），不支持泛域名（*.example.com）或包含协议（http://、https://）、端口、路径的地址。
      pleaseEnterDomainNameTip:
        '仅支持绑定具体域名（如cdn.example.com），不支持泛域名（*.example.com）或包含协议（http://、https://）、端口、路径的地址。',
      // 已绑定存储桶
      boundBucket: '已绑定存储桶',
      // 确认删除域名？
      confirmDeleteDomainName: '确认删除域名？',
      deleteDomainTip: '确定要删除自定义域名 {0} 吗？ 删除后将无法通过该域名访问存储桶。',
      // 域名不能包含空格、下划线或中文字符
      pleaseEnterDomainNameTip1: '域名不能包含空格、下划线或中文字符',
      // 请输入纯域名，不要包含协议、端口或路径
      pleaseEnterDomainNameTip2: '请输入纯域名，不要包含协议、端口或路径',
      // 不支持泛域名
      pleaseEnterDomainNameTip3: '不支持泛域名',
      // 请输入完整的域名，如 example.com
      pleaseEnterDomainNameTip4: '请输入完整的域名，如 example.com',
      // 自定义域名配置成功，约30分钟内生效
      customDomainNameConfigSuccess: '自定义域名配置成功，约30分钟内生效',
      // 域名绑定成功，请前往 DNS 服务商配置 CNAME 解析以完成生效
      domainNameBindingSuccess: '域名绑定成功，请前往 DNS 服务商配置 CNAME 解析以完成生效',
      // 域名未备案
      domainNameNotRegistered: '域名未备案',
      // 您的域名尚未备案，无法绑定到中国大陆地区的存储桶，请在备案后再尝试绑定。若已完成备案,由于存在一定数据延迟,请等待1-2小时后重试
      domainNameNotRegisteredTip:
        '您的域名尚未备案，无法绑定到中国大陆地区的存储桶，请在备案后再尝试绑定。若已完成备案,由于存在一定数据延迟,请等待1-2小时后重试',
      // 添加失败
      addFailed: '添加失败',
      // 该域名已被本平台的其他存储桶绑定。同一域名仅支持绑定一个存储桶，请更换域名或解除原有绑定后重试。
      addFailedTip: '该域名已被本平台的其他存储桶绑定。同一域名仅支持绑定一个存储桶，请更换域名或解除原有绑定后重试。',
      // 添加失败，域名已存在
      addFailedTip1: '添加失败，域名已存在',
      // 跨域访问设置
      crossDomainAccessSetting: '跨域访问设置',
      // 跨域资源共享（Cross-Origin Resource Sharing，CORS）简称跨域访问，允许Web应用服务器进行跨域访问控制，确保跨域数据传输的安全性。
      crossDomainAccessSettingTip:
        '跨域资源共享（Cross-Origin Resource Sharing，CORS）简称跨域访问，允许Web应用服务器进行跨域访问控制，确保跨域数据传输的安全性。',
      // 跨域规则生效有延迟，将在设置成功 15 分钟内生效。如果新增或更新后，列表未更新，请稍后重新刷新页面。
      crossDomainAccessSettingTip1:
        '跨域规则生效有延迟，将在设置成功 15 分钟内生效。如果新增或更新后，列表未更新，请稍后重新刷新页面。',
      // 添加规则
      addRule: '添加规则',
      // 编辑规则
      editRule: '编辑规则',
      // 设置成功
      setSuccess: '设置成功',
      // 设置失败，请稍后重试
      setFailed: '设置失败，请稍后重试',
      // 每行一个Origin，支持如下格式域名: http://www.example.com、http://*.example.com、http://www.example.com:8080(不支持直接设置通配符）
      addRuleTip:
        '每行一个Origin，支持如下格式域名: http://www.example.com、http://*.example.com、http://www.example.com:8080(不支持直接设置通配符）',
      // 域名以 http://或 https:// 开头，每行一个，一行最多一个通配符 *
      addRuleTip1: '域名以 http://或 https:// 开头，每行一个，一行最多一个通配符 *',
      // 推荐填写*；支持多行输入
      addRuleTip2: '推荐填写*；支持多行输入',
      // 在发送 OPTIONS 请求时告知服务端，接下来的请求可以使用哪些自定义的 HTTP 请求头部，例如：x-cos-meta-md5
      addRuleTip3:
        '在发送 OPTIONS 请求时告知服务端，接下来的请求可以使用哪些自定义的 HTTP 请求头部，例如：x-cos-meta-md5',
      // 支持多行输入
      addRuleTip4: '支持多行输入',
      // Expose-Headers 里返回的是 OSS 的常用Header
      addRuleTip5: 'Expose-Headers 里返回的是 OSS 的常用Header',
      // OPTIONS 请求得到结果的有效期，需为正整数，不超过8位数
      addRuleTip6: 'OPTIONS 请求得到结果的有效期，需为正整数，不超过8位数',
      // 来源 Origin
      sourceOrigin: '来源 Origin',
      // 操作 Methods
      operationMethods: '操作 Methods',
      // 超时 Max-Age
      timeoutMaxAge: '超时 Max-Age',
      // 删除跨域规则
      deleteCrossDomainRule: '删除跨域规则',
      // 确定删除该行跨域设置规则吗？
      confirmDeleteCrossDomainRule: '确定删除该行跨域设置规则吗？',
      // 请输入来源
      pleaseEnterSource: '请输入来源',
      // 最多只能输入500行
      maxInput500: '最多只能输入500行',
      // 请输入正确格式域名，域名以 http://或 https:// 开头，每行一个，一行最多一个通配符 *
      pleaseEnterCorrectDomainName:
        '请输入正确格式域名，域名以 http://或 https:// 开头，每行一个，一行最多一个通配符 *',
      // Origin 不能包含空格
      pleaseEnterCorrectDomainName1: 'Origin 不能包含空格',
      // 请输入正确的域名格式
      pleaseEnterCorrectDomainName2: '请输入正确的域名格式',
      // 请选择至少一个 Method
      pleaseSelectAtLeastOneMethod: '请选择至少一个 Method',
      // 请输入 Allow-Headers
      pleaseEnterAllowHeaders: '请输入 Allow-Headers',
      // Allow-Headers 不能包含空格
      pleaseEnterAllowHeaders1: 'Allow-Headers 不能包含空格',
      // Allow-Headers 只能包含字母、数字、“-”、“*”
      pleaseEnterAllowHeaders2: 'Allow-Headers 只能包含字母、数字、“-”、“*”',
      // Max-age必须为正整数
      pleaseEnterPositiveInteger: 'Max-age必须为正整数',
      // Max-age不能超过8位数
      pleaseEnterMaxAge: 'Max-age不能超过8位数',
      // 粘贴失败，需在浏览器设置中开启剪贴板权限
      pasteFailed: '粘贴失败，需在浏览器设置中开启剪贴板权限',
      // 请检查网络连接或跨域访问设置
      checkNetworkOrCrossDomainSettings: '请检查网络连接或跨域访问设置',
      // 开始批量修改访问权限
      startBatchModifyAccessPermission: '开始批量修改访问权限',
      // 开始批量修改加密方式
      startBatchModifyEncryptionMethod: '开始批量修改加密方式',
      // 开始粘贴文件
      startBatchCopyFiles: '开始粘贴文件',
      // 修改中...
      modifying: '修改中...',
      // completedTaskCount
      completedTaskCount: '（成功：{0}，失败：{1}）',
      // 网络连接失败请刷新页面后后重试
      networkConnectionFailed: '网络连接失败请刷新页面后后重试',
    },
  },
}
