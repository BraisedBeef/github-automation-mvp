//~~ 创建托管接口请求类型
export interface CreateHostingReq {
  cert_ids: string[]
  /**
   * 资源替换时间：到期前(15，25 )天
   */
  hosting_date: number
  /**
   * 资源替换开始时间段：hh:mm
   */
  hosting_time: string
  /**
   * 资源替换结束时间段：hh:mm
   */
  hosting_end_time: string
  /**
   * 托管云资源类型：1=cdn,2=dns解析，多个用,隔开
   */
  hosting_type: string
}
export interface CreateHostingResp {
  /**
   * 失败的cert
   */
  failed_cert_ids?: {
    domain: string
    reason: string
  }[]
  /**
   * 托管成功的Cert
   */
  success_cert_ids?: string[]
}

//~~ 关联证书接口请求类型
export interface AssociateCertReq {
  /**
   * 关联新证书
   */
  associated_cert_id?: string
  /**
   * 关联方式：1=系统自动检查,2=用户指定证书，只会执行一次
   */
  associated_type: number
  /**
   * 主键ID
   */
  hosting_id: number
}

//~~ 取消托管接口请求类型
export interface CancelHostingReq {
  hosting_id: number
}
export interface CancelHostingResp {}

//~~ 获取托管详情接口请求类型
export interface HostingDetailsReq {
  /**
   * 托管ID
   */
  id: number

  [property: string]: any
}
export interface GetHostingDetailsResp {
  /**
   * 新证书对应的域名
   */
  associated_cert_domain: string
  /**
   * 新证书ID
   */
  associated_cert_id: string
  /**
   * 关联方式：1=系统自动检查，2=指定证书
   */
  associated_type: number
  /**
   * 旧证书对应的域名
   */
  domain: string
  /**
   * 托管资源类型：1=CDN，2=DNS，多个用","拼接
   */
  host_type: string
  /**
   * 资源替换日期
   */
  hosting_date: string
  /**
   * 资源替换开始时间
   */
  hosting_time: string
  /**
   * 资源替换结束时间
   */
  hosting_end_time: string
  /**
   * 旧证书
   */
  old_cert_id: string
  [property: string]: any
}

//~~ 托管证书关联的新证书列表接口请求类型
export interface GetAssociateCertReq {
  cert_id?: string
}
export interface GetAssociateCertResp {
  items: {
    cert_id: string
    cid: number
    domain: string
    expire_at: number
    remark: string
    [property: string]: any
  }[]
  [property: string]: any
}

//~~ 获取可托管证书列表
export interface GetAvailableCertsReq {
  certId?: string
  page: number
  limit: number
}
export interface GetAvailableCertsResp {
  total: number
  page: number
  limit: number
  items: {
    cert_id: string
    cid: number
    domain: string
    expire_at: number
    remark: string
    [property: string]: any
  }[]
}

//~~ 托管设置
export interface HostingSettingReq {
  /**
   * 资源替换时间：到期前 15，25 天
   */
  hosting_date: number
  /**
   * 主键ID
   */
  hosting_id: number
  /**
   * 资源替换开始时间段
   */
  hosting_time: string
  /**
   * 资源替换结束时间段
   */
  hosting_end_time: string
  /**
   * 托管云资源类型：1=cdn,2=dns解析，多个用,隔开
   */
  hosting_type: string
  [property: string]: any
}

//~~ 展示托管列表
export interface ListHostingReq {
  /**
   * 证书ID
   */
  cert_id?: string
  /**
   * 域名
   */
  domain?: string
  /**
   * 页码
   */
  page: number
  /**
   * 每页数量
   */
  page_size: number
  /**
   * 状态
   */
  status: number
  [property: string]: any
}
export enum AssociatedTypeEnum {
  SYSTEM_AUTO_CHECK = 1,
  USER_SPECIFIED_CERT = 2,
}
export interface ListHostingResp {
  /**
   * 托管列表
   */
  items: {
    /**
     * 证书过期时间
     */
    cert_expire_at: number
    /**
     * 证书ID
     */
    cert_id: string
    cert_status: number
    /**
     * 创建时间
     */
    created_at: number
    /**
     * 域名
     */
    domain: string
    /**
     * 托管ID
     */
    id: number
    remark: string
    /**
     * 状态
     */
    status: number
    /**
     * 更新时间
     */
    updated_at: number
    // 关联方式
    associated_type: number
    // 关联证书ID
    associated_cert_id: string
    // 资源替换时间
    hosting_date: number
    // 资源替换时段
    hosting_time: string
    [property: string]: any
  }[]
  /**
   * 每页数量
   */
  limit: number
  /**
   * 页码
   */
  page: number
  /**
   * 总数
   */
  total: number
  [property: string]: any
}

// ~~ 删除托管记录
export interface DelHostingReq {
  /**
   * 证书ID
   */
  cert_id?: string
  /**
   * 证书状态
   */
  cert_status?: number
  /**
   * 域名
   */
  domain?: string
  /**
   * 托管ID
   */
  id: number
  /**
   * 状态
   */
  status?: number
}
export interface DelHostingResp {}
