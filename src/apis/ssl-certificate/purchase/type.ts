//~~ 获取工厂列表接口返回类型
export interface FactoryListResp {
  items: {
    code: string
    id: number
    name: string
    status: number
    remark: string
  }[]
}

//~~ 获取厂商对应的证书配置
export interface FactoryConfigReq {
  /**
   * 厂商ID
   */
  factory_id: number
}
export interface FactoryConfigResp {
  /**
   * 证书域名类型：1=单域名，2=多域名，3=泛域名,多个用逗号隔开
   */
  cert_domain_types: string
  /**
   * 证书类型：1=DV，2=OV,多个用逗号隔开
   */
  cert_types: string
  /**
   * 加密标准:1=国际标准,多个用逗号隔开
   */
  encryption_standards: string
}

//~~ 创建订单接口请求类型
export interface CreateOrderReq {
  /**
   * 证书域名类型：1=单域名，2=多域名，3=泛域名
   */
  cert_domain_type: number
  /**
   * 证书类型：1=DV，2=OV
   */
  cert_type: number
  /**
   * 有效期，单位：天
   */
  cert_validity: number
  /**
   * 加密标准:1=国际标准
   */
  encryption_standard: number
  /**
   * 厂商(品牌)ID
   */
  factory_id: number
  /**
   * 数量：默认1
   */
  nums: number
  /**
   * 单价:默认0
   */
  price: number
  // [property: string]: any;
}
export interface CreateOrderResp {
  cert_id: string
  order_no: string
  // [property: string]: any;
}
