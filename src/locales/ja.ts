import dns from './dns/ja.js'
import cdn from './cdn/ja.js'
import accountSystem from './account-system/ja.js'
import costCenter from './cost-center/ja.js'
import login from './login/ja.js'
import product from './product/ja.js'
import home from './home/ja.js'
import network from './network/ja.js'
import cvm from './cvm/ja.js'
import domain from './domain/ja.js'
import sslCert from './ssl-certificate/ja.js'
import oss from './oss/ja.js'
import { appNameMap } from '@/config/base-config'

export default {
  BATCH_ADD_DOMAIN: 'ドメインの一括追加', //Batch add domains
  BATCH_DELETE_DOMAIN: 'ドメインの一括削除', //Batch delete domains
  BATCH_ADD_ANALYSIS: '一括追加レコード', //Batch add records
  BATCH_MODIFY_ANALYSIS: '一括変更レコード', //Batch modify records
  DOWNLOAD_ANALYSIS_TASK: 'レコードのエクスポート', //Export records
  model: {
    cdn: 'コンテンツ配信ネットワークCDN',
    dns: 'クラウド解析DNS',
    domain: 'ドメイン名の登録',
    oss: 'オブジェクトストレージ',
    user: 'ユーザシステム',
    cost: 'コストセンタ',
    product: 'すべてのクラウド製品',
    latelyProduct: '最新アクセス製品',
    cvm: 'クラウドサーバーCVM',
    network: 'ネットワークとセキュリティ',
    home: 'コンソールの概要',
    certificate: 'SSL证书',
  },
  // 通用
  common: {
    add: '追加', //添加
    delete: '削除', //删除
    edit: '変更', //编辑
    change: '変更', //修改
    lock: 'ロック', //锁定
    unlock: 'ロック解除', //解锁
    locked: 'ロックされている', //已锁定
    unlocked: 'ロック解除', //未锁定
    toUnlock: 'ロック解除', //解除锁定
    notLock: 'ドメイン名のロック', // 锁定域名
    operation: '操作', //操作
    settings: '設定', //设置
    batchOperation: '一括アクション', //批量操作
    confirm: 'を選択して、', //确定
    cancel: 'キャンセル', //取消
    reset: 'リセット',
    back: 'リターンマッチ', //返回
    loading: 'ロード中', //加载中
    isLoading: 'ロード中',
    refresh: 'リフレッシュ', //刷新
    pause: '一時停止', //暂停
    start: 'オープン', //开启
    remark: 'コメント', //备注
    save: '保存', //保存
    open: 'オープン',
    closed: '閉じる',
    pickup: 'やめる',
    help: 'ヘルプ',
    exchange: '切り替え',
    second: '秒',

    addSuccess: '追加成功', //添加成功
    deleteSuccess: '削除に成功しました', //删除成功
    changeSuccess: '変更に成功しました', //修改成功
    operationSuccess: '操作が成功しました', //操作成功
    operationSuccessTip: '検証に成功した',
    operationErrorTip: '検証に失敗しました。もう一度お試しください',
    updateSuccess: '更新に成功しました', //更新成功
    getCode: '認証コードの取得', //获取验证码
    codeThen: '{time}秒後に取得', //{time}秒后再获取
    codeSent: '認証コードが送信されました', //验证码已发送
    zh: '中文', //中文
    en: '英語', //英文
    ja: '日本語', //日文
    logout: 'ログオンの終了', //退出登录
    accountId: 'アカウントID：', //账号ID
    addDomains: 'ドメイン名の追加', //添加域名
    batchAdd: '一括追加', //批量添加
    noData: 'データが一時的にありません', //暂无数据
    success: '成功', //成功
    fail: 'に失敗', //失败
    processing: '実行中', // 执行中
    all: 'すべて', //全部
    plsEnter: '入力してください', //请输入
    default: 'デフォルト', //默认
    notFound: 'ここには何もありません~', //这里还是一片荒芜~
    backHome: 'トップページに戻る', //返回首页
    formatErr: 'フォーマットが間違っています！', //格式有误！
    next: '次のステップ', //下一步
    submit: '送信', //提交
    docHelper: 'ヘルプドキュメント', //帮助文档
    accountInfo: 'アカウント情報', //账号信息

    d: '{d}日',
    h: '{h}時間',
    m: '{m}分',
    s: '{s}秒',

    site_china: '中国サイト',
    site_world: '国際サイト',
    error_cs: 'ネットワークエラーが発生しました。もう一度試してください。',
    error_cd: '操作が失敗しました。後でもう一度やり直すか、運用管理担当者に連絡してください。',
    true: '確認する',
    console: '概要',
    contact: 'アフターサービス',
    contact_desc: '下のQRコードをスキャンしてカスタマーサービスTelegramを追加',
    contact_desc1: '購入续行が安心、割引が手に入りやすい',
    contact_desc2: '異常アラート、重要な情報を逃さない',
    contact_desc3: 'リソースの動向、リアルタイムで把握',
    contact_desc4: '高コストパフォーマンス、柔軟で安定して信頼できる',
    time_zone_desc: `注: ${appNameMap.ja}は現在、標準時間として中国標準時（UTC+8）を採用しています。`,
    select_time: '時間を選択',
    endTimeBeforeStartTips: '終了時刻は開始時刻より早く設定できません',
  },

  // 路由
  routes: {
    myDomains: 'マイドメイン名', //我的域名
    monitorTask: 'タスクの監視', //监控任务
    batchOperation: '一括アクション', //批量操作
    recordMana: 'レコード管理', //记录管理
    domainSetting: 'ドメイン名の設定', //域名设置
    dataStatistics: 'データ統計', //数据统计
    addDomains: 'ドメイン名の追加', //添加域名
    addRecords: 'レコードの追加', //添加记录
    modifyRecords: 'レコードの変更', //修改记录
    importRecords: 'レコードのインポート', //导入记录
    exportRecords: 'レコードのエクスポート', //导出记录
    deleteDomains: 'ドメイン名の削除', //删除域名
    operationLog: '操作ログ', //操作日志
    fileList: 'ダウンロードリスト', //文件下载列表
  },

  // 表格
  columns: {
    domain: 'ドメイン名', //域名
    takeStatus: '引き継ぎ状態', //接管状态
    records: 'レコード数', //记录数
    domainGroup: 'グループ化', //域名分组
    lastUpdated: 'さいごそうさじかん', //最后操作时间
    remark: 'コメント', //备注
    operation: '操作', //操作
    hostRecord: 'ホストレコード', //主机记录
    recordType: 'レコードタイプ', //记录类型
    recordValue: 'レコード値', //记录值
    lineType: 'ラインタイプ', //线路类型
    weights: 'ウェイト', //权重
    mx: 'MX', //优先级
    ttl: 'TTL', //TTL
    monitor: '監視', //监控
    X: 'M最適化', //M优化
    status: 'ステータス', //状态
    port: 'ポート', //端口
    monitorMethod: 'モニタモード', //监控方式
    monitorType: '監視タイプ', //监控类型
    alarmRules: 'アラーム規則', //报警规则
    alarmTrigger: 'アラームトリガ', //报警触发
    noticeMethod: '通知方法', //通知方式
    monitorProject: 'プロジェクトの監視', //监控项目
    errIp: '障害IP', //故障IP
    startTime: '開始時間', //开始时间
    recoveryTime: 'リカバリ時間', //恢复时间
    duration: '継続時間', //持续时间
    optMession: 'オペレーションタスク', //操作任务
    optTime: 'そうさじかん', //操作时间
    optResult: '操作結果', //操作结果
    fileType: 'ファイルの種類', //文件类型
    fileName: 'ファイル名', //文件名
    createTime: '作成時間', //创建时间
    comleteTime: '完了時間', //完成时间
    counter: '数量', //数量
    origin: 'ソースステーションアドレス',
  },

  // 组件
  components: {
    // CatDialog
    confirm: '確認',
    cancel: 'キャンセル',
    // DnsDomainFilter
    recordTypePlaceholder: 'レコードタイプ',
    lineTypePlaceholder: 'ラインタイプ',
    hostPlaceholder: "例：www 或 {'@'}",
    host: 'ホストレコード',
    recordValuePlaceholder: '例：1.1.1.1',
    recordValue: 'レコード値', //记录值
    query: '検索けんさく', //搜索/查询
    clear: 'リセット', //清空/重置
    // DnsDomainTextarea
    domainEmpty: '追加するドメイン名を入力してください！', //请输入要添加的域名!
    domainMax10: 'ドメイン名を1回に10個まで追加するには、数を減らして複数回追加してください', //单次添加域名数量最多 10 个，请减少数量分多次添加
    domainFormatErr: '{domains}形式が間違っています！',
    // DnsDomainTransfer
    selectDomain: 'ドメイン名の選択', //选择域名
    search: 'ドメイン名の検索', //域名搜索
    selected: '選択済み', //已选择
    clearAll: 'すべてクリア', //清除所有
    // DnsUpload
    reUpload: '再アップロード', //重新上传
    // CatPagination
    total: '合計 {total} 個', //共 {total} 项
    eachSize: 'ページごとに {pageSize} 行を表示', //每页显示 {pageSize} 行
    // PwdPanel
    save: '安全性', //安全程度
    weak: '弱い', //弱
    general: '一般', //一般
    complex: '強い', //强
    pwdPanel2: '6-20ビット文字',
    pwdPanel3: '大文字と小文字、数字、句読点のみを含む(スペースを除く）',
    pwdPanel4: '大文字、小文字、句読点は少なくとも2種類含む',
    // cdnDomainTransfer
    selectDomainPlaceholder: 'ドメイン名の選択',
    selectedDomains: '{count}つ選びました',
    deleted: '削除されました',
  },

  header: {
    accountInfo: 'アカウント情報', //"账号信息",
    labelMana: 'ラベル管理', // "标签管理",
    orderMana: 'オーダー管理', //"订单管理",
    billMama: '消費管理', //"請求書管理", //"账单管理",
    repayMana: '継続料金管理', //"续费管理",
    invoiceMana: '請求書管理', // "发票管理",
    incomeExpenditure: '収支明細', //"收支明细",
    couponsMana: 'クーポン管理', //"优惠券管理",
    primaryAccount: 'メインアカウント',
    bypassAccount: 'アカウント',
    availableCost: '使用可能な限度',
    toCost: 'チャージ',
    discountCoupon: 'クーポン（枚）',
    invokable: '請求可能',
    unpaid: '未払い{orderNum}件',
  },

  error: {
    badRequest: 'リクエストパラメータが不正です',
    unauthorized: '未認証です',
    forbidden: 'このリソースにアクセスする権限がありません',
    notFound: '要求されたリソースは存在しません',
    serverError: 'サーバー内部エラー',
    requestFailedWithStatus: 'リクエストに失敗しました。ステータスコード：{0}',
    networkError: 'ネットワークエラーです。接続を確認してください',
    requestError: 'リクエストエラー',
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
