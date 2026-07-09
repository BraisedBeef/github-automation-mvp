export interface ContentFilterInterface {
  duration?: number; // 时长
  datePicker: any; //date-picker回显内容
  start_time: any;
  end_time: any;
  type: number; // 查询类型
  status: number; // 提交状态
}

export interface RequestFilterInterface {
  start_time: any;
  end_time: any;
  type: number;
  status: number;
}
