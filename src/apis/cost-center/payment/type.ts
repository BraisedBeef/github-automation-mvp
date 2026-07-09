export interface QueryProductOrderReq {
  tradeNoList: number[] | string[] // 订单号
}

export interface BalancePayOrderReq {
  tradeNoList: number[] | string[] // 产品订单号列表
}

export interface CreateSubOrderReq {
  tradeNo: string //订单号 创建订单时返回的订单号
  payChannel: number //支付渠道 1 微信 2 支付宝 3 信用卡 4 foxpay
}

export interface CreateRechargeOrderReq {
  scene: number // 支付场景 1 在线充值 2 产品订单支付
  amount: number //支付金额
  productTradeNoList?: string[] //产品订单号列表 scene 为2时必传
}

export interface QueryRechargeOrderReq {
  tradeNo: number | string // 订单号
}

export interface CreateProductOrderReq {
  serialNo: string
  // 预订单流水号
}
export interface QueryPreProductOrderReq {
  serialNo: string
  // 预订单流水号
}
