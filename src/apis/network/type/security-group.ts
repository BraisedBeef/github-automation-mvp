export interface ContentPagination {
  pageIndex: number
  pageSize: number
}

export interface ListSecurityGroupType extends ContentPagination {
  regionId: number // 区域id
}

// 克隆安全组
export interface CloneSecurityGroupType {
  regionId: number // 克隆区域id
  targetRegionId: number | string // 目标区域id
  targetName: string // 目标安全组名称
  id: number // 安全组id
  targetDescription: string // 目标安全组描述
}
// 删除安全组
export interface DelSecurityGroupType {
  regionId: number // 区域id
  ids: number[] // 安全组id
}
// 查询安全组规则列表
export interface ListSecurityGroupRuleType extends ContentPagination {
  securityGroupId: number // 安全组id
  direction: string // 规则方向，ingress表示入方向，egress表示出方向
}

//创建安全组
export interface SecurityGroutRule {
  /**
   * 安全组规则生效策略
   * 取值范围： allow表示允许 deny表示拒绝
   */
  action: string
  /**
   * 协议类型
   * icmp、tcp、udp、icmp, icmpv6或 gre或IP协议号 all代表所有 如果值是all multiport字段必须为all
   */
  protocol: string
  /**
   * 端口取值范围 1~65535
   * 取值范围：支持和单端口(80)，连续端口(1-30)以及不连续端口(22,3389,80)
   */
  multiport: string
  priority?: number // 优先级 取值范围：1~100，1代表最高优先级
  /**
     * IP地址 值范围：IP地址，或者cidr格式
        互斥 与remote_group_id，remote_address_group_id，ipTemplateId 字段互斥 4个字段只存在一个有效值
        protocol字段值等于 icmpv6 默认值 ::/0 等于其他类型时默认值 0.0.0.0/0
        ipv4 cidr格式192.168.0.0/32最大32个IP地址 ipv6 cidr格式2001:db8::/128最大128个IP地址
     */
  remoteIpPrefix?: string | null
  /**
     * 远端安全组ID，
        与remote_ip_prefix，remote_address_group_id，remoteGroupId 字段互斥 4个字段只存在一个有效值
     */
  remoteGroupId?: string | null
  /**
     * 远端地址组ID
    约束：与remote_ip_prefix，remote_group_id ipTemplateId功能互斥 4个字段只存在一个有效值
     */
  remoteAddressGroupId?: string | null
  direction: string //安全组规则的出入控制方向 ingress 表示入方向 egress 表示出方向
  description: string // 描述
}
export interface GetCreateSecurityGroutType {
  regionId: number // 区域id
  name: string // 安全组名称
  description?: string //安全组描述
  rules: SecurityGroutRule[]
}

export interface AddSecurityGroupRuleType {
  regionId: number // 区域id
  groupId: number // 安全组id
  rules: SecurityGroutRule[]
}

export interface DeleteSecurityGroupRuleType {
  regionId: number // 区域id
  groupId: number // 安全组id
  direction: string //功能说明：安全组规则出入控制方向  取值范围：egress：出方向  ingress：入方向
  groupRuleIds: number[] // 安全组规则id
}

export interface EditSecurityGroupRuleType {
  regionId: number // 区域id
  groupId: number // 安全组id
  id: number // 安全组规则id
  direction: string // 功能说明：安全组规则出入控制方向  取值范围：egress：出方向   ingress：入方向
  rule: SecurityGroutRule
}

export interface SecurityGroupInstancesListReq extends ContentPagination {
  groupId: number // 安全组id
}

export interface SecurityGroupBindInstanceReq {
  groupId: string | number // 安全组ID
  insIds: string[] // 实例ID
}

export interface SecurityGroupUnbindInstanceReq {
  groupId: string | number // 安全组ID
  insIds: string[] // 实例ID
}

export interface EditSecurityGroupRulePriorityReq {
  groupId: number // 安全组id
  direction: string // 安全组规则的出入控制方向* ingress 表示入方向* egress 表示出方向
  ruleId: number // 规则id
  priority: number // 优先级 1-100
  regionId: number // 区域id
}

export interface SecurityGroupByInstanceListReq {
  insId: number // 实例id
  regionId: number // 区域id
}
