import { defineStore } from 'pinia'
import { SUB_USER_CREATE_STORE } from '@/config/constant-config'

export type CreateUserInfoForm = any
export type CreateUserOperateForm = any
export type SelectRoleList = any[]

/**
 * @Desc 创建子用户
 */
export default defineStore(SUB_USER_CREATE_STORE, {
  state: () => {
    return {
      createUserInfoForm: {} as CreateUserInfoForm, // 创建用户信息
      createUserOperateForm: {} as CreateUserOperateForm, // 创建用户操作
      createUserType: 1, // 创建用户类型
      active: 'a', // 创建用户步骤值
      selectRoleList: [] as SelectRoleList, // 角色列表
      isSelf: false, // 自助管理角色列表
    }
  },
  getters: {},
  actions: {
    setCreateUserInfoForm(form: CreateUserInfoForm) {
      this.createUserInfoForm = form
    },
    clearCreateUserInfoForm() {
      this.createUserInfoForm = {} as CreateUserInfoForm
    },
    setCreateUserOperateForm(form: CreateUserOperateForm) {
      this.createUserOperateForm = form
    },
    clearCreateUserOperateForm() {
      this.createUserOperateForm = {} as CreateUserOperateForm
    },
    setCreateUserType(type: number) {
      this.createUserType = type
    },
    clearCreateUserType() {
      this.createUserType = 1
    },
    setStepActive(stepStatus: string) {
      this.active = stepStatus
    },
    clearStepActive() {
      this.active = 'a'
    },
    setSelectRoleList(list: any) {
      this.selectRoleList = list
    },
    clearSelectRoleList() {
      this.selectRoleList = []
    },
    setIsSelf(isSelf) {
      this.isSelf = isSelf
    },
    clearIsSelf() {
      this.isSelf = false
    },
    clearAll() {
      this.clearCreateUserInfoForm()
      this.clearCreateUserOperateForm()
      this.clearCreateUserType()
      this.clearStepActive()
      this.clearSelectRoleList()
      this.clearIsSelf()
    },
  },
})
