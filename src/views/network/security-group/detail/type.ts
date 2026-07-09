// 规则列表
export interface SecurityGroupRuleInterface {
  type: number
  action: string
  createTime?: number
  description: string
  direction: string
  ethertype?: string
  groupId: string
  id: number
  multiport: string
  priority: number
  protocol: string
  remoteAddressGroupId: string | number
  remoteGroupId: string | number
  remoteIpPrefix: string
  updateTime?: number
}

// 编辑规则
export interface EditSecurityGroupRuleInterface extends SecurityGroupRuleInterface {
  type: number
  port: string
}
