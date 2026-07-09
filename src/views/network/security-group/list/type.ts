import { SecurityGroutRule } from '@/apis/network/type/security-group'

// 新建安全组
export interface CreateSecurityGroupType {
  regionId?: number // 区域id
  template?: number | string // 模板
  name: string // 安全组名称
  description: string // 安全组描述
}

// 安全组列表
export interface SecurityGroupListInterface {
  id: number
  description: string // 描述
  type: number //安全组类型  1 默认 2 自定义
  groupUuid: string // 安全组uuid
  name: string // 名称
  regionId: number // 地区ID
  uid: number // 用户ID
  updateTime: number
  createTime: number
  insNum: number // 关联实例数量
}

// 安全组模板
export interface TemplateListInterface {
  label: string // 模板名称
  value: number // 模板ID
  id?: number // 模板ID
  name?: string // 模板名称
  notes?: string // 模板描述
  ingressRules?: SecurityGroutRule[] // 入站规则
  egressRules?: SecurityGroutRule[] // 出站规则
}
