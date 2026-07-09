export interface GetUserSubscribeListReq {
  targetUserId: string //目标用户id
}

export interface UpdateUserSubscribeReq {
  subscribes: string[]
  targetUserId: string // 更新的目标用户id
}

export interface GetSubscribeManaListReq {
  productId: string // 产品ID
  isSendMsg: boolean // 30天内是否发送过消息
}

export interface UpdateDisturbReq {
  productId: string // 产品ID
  notDisturb: number // 免打扰标志 0 不开启 1 开启
  uids: number[] //操作目标用户id
}

export interface UpdateProductSubscribeReq {
  notDisturb: number // 免打扰标志 0 不开启 1 开启
  receivingChannels: string // 接受渠道 TG MAIL 用 , 分割
  uids: number[] // 账户id
  subMessageType: string // 消息子类型ID
}

export interface UpdateBatchProductSubscribeReq {
  subMessageTypes: string[] // 消息子类型ID
  notDisturb: number //免打扰标志 0 不开启 1 开启
  receivingChannels: string //接受渠道 TG MAIL 用 , 分割
  uids: string[] //账户id集合
}

export interface GetSubscribeListReq {
  productId: string // 产品ID 不查询传 0 产品枚举
  isSendMsg: boolean // 是否查询30天内发送过消息的产品 true false
  uid: number // 用户ID
}

export interface UpdateUserProductSubscribeReq {
  operateUid: number // 操作的账户ID
  productIds: string[] // 需要订阅的产品ID集合
}

export interface SubscribeOverviewReq {
  uid: number // 用户id
}

export interface TelegramBindReq {
  telegramId: string // TG账户
  chatId: string // 群聊ID
  targetUid: string // 账号id
}

export interface TelegramUnbindReq {
  targetUid: string // 目标用户ID
}
