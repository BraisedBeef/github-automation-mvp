export interface BasicInfoData {
  domainName: string; // 域名
  id: string; // 域名ID
  domainRegistrar: string; // 注册商
  status: number; // 状态 1 2 3
  dnsStatus: number; // DNS状态 1 2
  dnsStatusReason: string; // DNS状态原因
  domainDnsServer: string[]; // 当前域名在域名注册商的配置
  cloudDnsServer: string[]; //正确的DNS服务器
  remark: string; // 备注
  ttl: number; // TTL
  lockStatus: number; // 锁状态 1->锁定
  lockPwd: number; // 锁密码 0:未设置密码
  parseCount: number; // 解析记录个数
}
