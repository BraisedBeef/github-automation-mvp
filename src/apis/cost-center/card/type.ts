export interface GetCreditcardReq {
  id: string // 卡ID
}

export interface AddCreditcardReq {
  brand: string //卡品牌

  cardToken: string //卡token

  cardNo: string //卡号

  validDate: string //卡有效期

  email: string //邮箱

  userName: string //持卡人姓名
}

export interface RemoveCreditcardReq {
  id: string // 卡ID
}

export interface SetDefaultCreditcardReq {
  id: string // 卡ID
}
