<template>
  <div>
    <PageHeader
      :title="state.edit ? t('addMonitor.editMonitor') : t('addMonitor.addMonitor')"
      :back-title="pageHeader.backTitle"
    />
    <div class="dns-add-monitor">
      <div class="page-box">
        <div class="contents">
          <!-- 监控频率 -->
          <div class="interval">
            <div class="title" style="border-top: none">
              {{ t('addMonitor.interval') }}
            </div>
            <template v-if="!state.requestLoading">
              <div class="content">
                <el-radio-group v-model="info.interval">
                  <el-radio :label="30">
                    {{ t('addMonitor.interval1') }}
                  </el-radio>
                  <el-radio :label="60">
                    {{ t('addMonitor.interval2') }}
                  </el-radio>
                </el-radio-group>
              </div>
            </template>
            <template v-else>
              <div class="request-loading">{{ t('common.loading') }}...</div>
            </template>
          </div>
          <!-- 监控任务 -->
          <el-form label-position="left" label-width="auto" class="the-form">
            <div class="title">
              {{ t('addMonitor.monitorTask') }}
            </div>
            <el-form-item :label="t('addMonitor.monitorType')">
              <template v-if="!state.requestLoading">
                <div class="task-value">
                  <el-select
                    v-model="info.monitorType"
                    :placeholder="t('addMonitor.monitorType')"
                    :disabled="state.edit"
                    @change="() => (state.error = {})"
                  >
                    <el-option v-for="item in monitorTypes" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </template>
              <template v-else>
                <div class="request-loading">{{ t('common.loading') }}...</div>
              </template>
            </el-form-item>
            <template v-if="info.monitorType === 1">
              <el-form-item :label="t('addMonitor.protocol')">
                <template v-if="!state.requestLoading">
                  <div class="task-value">
                    <el-select
                      v-model="info.protocol"
                      :placeholder="t('addMonitor.protocol')"
                      @change="taskPrefixChange"
                    >
                      <el-option
                        v-for="item in monitorMethods"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </div>
                </template>
                <template v-else>
                  <div class="request-loading">{{ t('common.loading') }}...</div>
                </template>
              </el-form-item>
              <el-form-item
                v-if="info.monitorType === 1"
                id="port"
                :label="t('addMonitor.port')"
                :class="{ 'is-error': state.error.port }"
              >
                <template v-if="!state.requestLoading">
                  <div id="port" class="task-item">
                    <div class="task-value">
                      <el-input
                        v-model.number="info.port"
                        :placeholder="t('addMonitor.port')"
                        :disabled="info.protocol !== 3"
                        :class="{ 'error-input': state.error.port }"
                        @blur="validatePort"
                      />
                      <div class="error-msg">
                        <SvgIcon v-if="state.error.port" name="tip-error" />{{ state.error.port }}
                      </div>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="request-loading">{{ t('common.loading') }}...</div>
                </template>
              </el-form-item>
              <el-form-item
                v-if="info.protocol !== 3"
                id="path"
                :label="t('addMonitor.path')"
                :class="{ 'is-error': state.error.path }"
              >
                <template v-if="!state.requestLoading">
                  <div id="path" class="task-item">
                    <div class="task-value">
                      <el-input
                        v-model.trim="info.path"
                        :placeholder="t('addMonitor.path')"
                        :class="{ 'error-input': state.error.path }"
                        @blur="validatePath"
                      />
                      <div class="error-msg">
                        <SvgIcon v-if="state.error.path" name="tip-error" />{{ state.error.path }}
                      </div>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="request-loading">{{ t('common.loading') }}...</div>
                </template>
              </el-form-item>
              <el-form-item
                id="domain"
                :label="t('addMonitor.monitorDomain')"
                :class="{ 'is-error': state.error.domain || state.error.childDomain }"
              >
                <template v-if="!state.requestLoading">
                  <div class="task-value">
                    <el-select
                      v-model="info.domain"
                      :placeholder="t('addMonitor.monitorDomainPlaceholder')"
                      class="domain-select"
                      :class="{ 'error-input': state.error.domain }"
                      :disabled="state.edit"
                      :loading="domainLoading"
                      @change="domainChange"
                    >
                      <el-option
                        v-for="item in info.domainOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                    <div class="error-msg domain-error">
                      <SvgIcon v-if="state.error.domain" name="tip-error" />{{ state.error.domain }}
                    </div>
                    <br />
                    <el-select
                      v-model="info.childDomain"
                      :disabled="!info.domain || state.edit"
                      :class="{ 'error-input': state.error.childDomain }"
                      :placeholder="t('addMonitor.monitorDomainPlaceholder2')"
                      @change="validateChildDomain"
                    >
                      <el-option
                        v-for="item in info.childDomainOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                    <div class="error-msg c-domain-error">
                      <SvgIcon v-if="state.error.childDomain" name="tip-error" />{{ state.error.childDomain }}
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="request-loading">{{ t('common.loading') }}...</div>
                </template>
              </el-form-item>
            </template>
            <template v-else>
              <template v-if="!state.requestLoading">
                <el-form-item label="URL">
                  <div class="task-value">
                    <el-input
                      v-model.trim="info.URL"
                      placeholder="URL"
                      :disabled="state.edit"
                      :class="{ 'is-error': state.error.URL }"
                      @blur="validateURL"
                    />
                    <div class="error-msg">
                      <SvgIcon v-if="state.error.URL" name="tip-error" />{{ state.error.URL }}
                    </div>
                  </div>
                </el-form-item>
              </template>
              <template v-else>
                <div class="request-loading">{{ t('common.loading') }}...</div>
              </template>
            </template>
            <template v-if="info.protocol !== 3 || info.monitorType === 2" id="headers">
              <el-form-item
                id="headers"
                :label="t('addMonitor.customHeader')"
                :class="{ 'is-error': state.error.headers }"
              >
                <template v-if="!state.requestLoading">
                  <div class="task-value">
                    <div
                      v-for="(item, index) in info.headers"
                      :key="item.id"
                      class="custom-header"
                      :class="{ last: index === info.headers.length - 1 }"
                    >
                      <el-input
                        v-model.trim="item.key"
                        :placeholder="t('addMonitor.customHeaderPlaceholder1')"
                        @blur="validateHeaders"
                      />
                      <span class="point">:</span>
                      <el-input
                        v-model.trim="item.value"
                        :placeholder="t('addMonitor.customHeaderPlaceholder2')"
                        @blur="validateHeaders"
                      />
                      <div class="svg">
                        <SvgIcon v-if="index === 0" name="monitor-header-add" pointer class="add" @click="headersAdd" />
                        <SvgIcon
                          v-if="info.headers.length > 1 && index !== 0"
                          name="monitor-header-delete"
                          class="delete"
                          pointer
                          @click="headersDelete(index)"
                        />
                      </div>
                    </div>
                    <div class="error-msg">
                      <SvgIcon v-if="state.error.headers" name="tip-error" />{{ state.error.headers }}
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="request-loading">{{ t('common.loading') }}...</div>
                </template>
              </el-form-item>
              <el-form-item
                id="successCode"
                :label="t('addMonitor.statusCode')"
                :class="{ 'is-error': state.error.successCode }"
              >
                <template v-if="!state.requestLoading">
                  <div class="task-value">
                    <el-input
                      v-model.trim="info.successCode"
                      autosize
                      type="textarea"
                      :placeholder="t('addMonitor.statusCodePlaceholder')"
                      @blur="validateCode"
                    />
                    <div class="error-msg">
                      <SvgIcon v-if="state.error.successCode" name="tip-error" />{{ state.error.successCode }}
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="request-loading">{{ t('common.loading') }}...</div>
                </template>
              </el-form-item>
            </template>
            <template v-if="info.monitorType === 1">
              <!-- 报警规则 -->
              <div class="title">
                {{ t('addMonitor.reportTrigger') }}
              </div>
              <template v-if="!state.requestLoading">
                <el-form-item id="ttl" :label="t('addMonitor.ttlSet')">
                  <div class="rule-item">
                    <el-checkbox v-model="info.reportTtl" :label="t('addMonitor.ttlSetActive')" />
                  </div>
                </el-form-item>
                <el-form-item id="alarm" :label="t('columns.alarmTrigger')">
                  <div class="rule-item">
                    <el-radio-group v-model="info.reportTrigger">
                      <el-radio v-for="item in reportTriggerRules" :key="item.value" :label="item.value">
                        {{ item.label }}
                        <el-tooltip
                          v-if="item.value === 2"
                          placement="top"
                          :content="t('monitorList.alarmStatus2Tip')"
                          popper-class="alarmTrigger-popper"
                        >
                          <SvgIcon name="cat-cdn-help" style="margin-left: -2px" />
                        </el-tooltip>
                      </el-radio>
                    </el-radio-group>
                  </div>
                </el-form-item>
              </template>
              <template v-else>
                <div class="request-loading">{{ t('common.loading') }}...</div>
              </template>
            </template>
            <!-- 报警通知 -->
            <div class="title">
              {{ t('addMonitor.noticeSet') }}
            </div>
            <template v-if="!state.requestLoading">
              <el-form-item id="#sbs" :label="t('addMonitor.subscribe')">
                <el-select v-model="info.notifyUser" multiple placeholder="可以选择多个账号">
                  <el-option v-for="item in sbs" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </template>
            <template v-else>
              <div class="request-loading">{{ t('common.loading') }}...</div>
            </template>
            <div class="node">
              <!-- 监控节点 -->
              <div class="title">
                {{ t('addMonitor.monitorNode') }}
              </div>
              <template v-if="!state.requestLoading">
                <div class="node-content">
                  <div v-for="(item, index) in state.IP" :key="index" class="node-item">
                    <span>{{ item.ip }}</span>
                    <span>{{ item.location }}</span>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="request-loading">{{ t('common.loading') }}...</div>
              </template>
            </div>
          </el-form>
        </div>
        <!-- 操作按钮 -->
        <div class="handle">
          <el-button type="primary" :loading="state.loading" :disabled="state.requestLoading" @click="handleConfirm">
            {{ state.edit ? t('addMonitor.updateMonitor') : t('addMonitor.enableMonitor') }}
          </el-button>
          <el-button plain @click="handleCancel">
            {{ t('common.back') }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { monitorMethods, reportTriggerRules, monitorTypes, EMIAL_REG } from '../config'

import { _addMonitor, _getDomainOptions, _getMonitorDetail, _updateMonitor } from '@/apis/dns/monitor'
import { LANG } from '@/config/constant-config'
import { _getIPList } from '@/apis/dns/sys'
import { useBaseStore, useTempStore } from '@/store'
import t from '@/utils/i18n'
import { _getItem } from '@/utils/storage'

// import { events } from '@/utils/mitt'
import { message } from '@/utils/message'
import { _getUserList } from '@/apis/account-system/access/user'
import { backRoute } from '@/utils/router-jump'
const baseStore = useBaseStore()
const route = useRoute()
const lang = _getItem(LANG, true)
const notifyInput = (t: any) => {
  const value = t.target.value
  state.notifyOptions = [
    value + '@qq.com',
    value + '@163.com',
    value + '@126.com',
    value + '@gmail.com',
    value + '@sina.com',
  ]
}
const state = reactive<{
  edit: boolean
  id: any
  loading: boolean
  requestLoading: boolean
  // err
  error: {
    [x: string]: string
  }
  IP: any[]
  notifyOptions: any[] // 通知设置的选项
}>({
  edit: false, // 是否编辑
  id: void 0, // 编辑的监控id
  loading: false,
  requestLoading: false, // 回显数据时的loading
  // err
  error: {},
  IP: [],
  notifyOptions: [],
})
const info = reactive<{
  interval: number
  task: number
  monitorType: 1 | 2
  URL: string
  protocol: 1 | 2 | 3
  path: string
  domain: any
  childDomain: any
  domainOptions: any[]
  childDomainOptions: any[]
  headers: { key: string; value: string; id: number }[]
  successCode: string
  port: any
  reportTtl: boolean
  reportTrigger: 1 | 2 | 3
  reportTriggerRules: any[]
  isEmail: boolean
  isSms: boolean
  notifyEmail: string[]
  notifyMobile: string[]
  notifyUser: number[]
}>({
  interval: 30, // 监控频率
  task: 0, // 监控任务
  monitorType: 1, //  域名监控 | URL监控
  URL: '', // URL
  protocol: 1, // 选择协议
  path: '', // 路径
  domain: void 0, // 地址域名
  childDomain: void 0, // 子域名
  domainOptions: [], // 域名选项
  childDomainOptions: [], // 子域名选项
  headers: [{ key: '', value: '', id: 0 }], // 自定义headers
  successCode: '', // 状态码
  port: 80, // 端口
  reportTtl: false, // TTL设置
  reportTrigger: 1,
  reportTriggerRules, // 报警触发
  isEmail: false, // 是否邮件通知
  isSms: false, // 是否短信通知
  notifyEmail: [], // 邮件
  notifyMobile: [], // 短信(手机号)
  notifyUser: [], // 订阅用户的ids
})
// 监控域名change
const taskPrefixChange = (v: 1 | 2 | 3) => {
  state.error = {}
  if (v === 1) {
    info.port = 80
  } else if (v === 2) {
    info.port = 443
  } else {
    info.port = ''
  }
}

const domainChange = (v: number) => {
  validateDomain()
  getDomainOptions(v)
}

// 添加自定义header
const headersAdd = () => {
  state.error = {}
  info.headers.push({
    id: info.headers.length,
    key: '',
    value: '',
  })
}
// 删除自定义header
const headersDelete = (i: number) => {
  state.error = {}
  info.headers = info.headers.filter((item, index) => index !== i)
  for (let i = 0; i < info.headers.length - 1; i++) {
    info.headers[i].id = i
  }
}

// 确认
const handleConfirm = async () => {
  /****   整理数据  ****/
  const validateRes = validate()
  console.log('看看错误', state.error)

  const isErr = Object.values(validateRes).filter(item => item)
  if (isErr[0]) {
    scroll(validateRes)
    return
  } else {
    let data: any = {}
    if (state.edit) {
      const _ = formatData()
      data = formatEdit(_)
    } else {
      data = formatData()
    }
    try {
      state.loading = true
      const fn = state.edit ? _updateMonitor : _addMonitor
      const { code } = await fn(data)
      state.loading = false
      if (code === 200) {
        message.success(`${state.edit ? t('common.updateSuccess') : t('common.addSuccess')}`)
        backRoute()
      }
    } catch (error) {
      state.loading = false
    }
  }
}

// 校验端口
const validatePort = () => {
  if (info.monitorType === 1 && info.protocol === 3) {
    state.error.port = info.port ? '' : t('addMonitor.portValidate') // port
  }
}

// 校验路径
const validatePath = () => {
  if (info.monitorType === 1 && info.protocol !== 3) {
    state.error.path = info.path ? '' : t('addMonitor.pathValidate') // path
  }
}

// 监控域名校验
const validateDomain = () => {
  if (info.monitorType === 1) {
    state.error.domain = info.domain ? '' : t('addMonitor.monitorDomainValidate') // 监控域名
  }
}

// 子域名校验
const validateChildDomain = () => {
  if (info.monitorType === 1) {
    state.error.childDomain = info.childDomain ? '' : t('addMonitor.monitorDomainValidate2') // 子域名
  }
}

// 校验headers
const validateHeaders = () => {
  const isExsitEmpty = info.headers.some(item => {
    if (item.key.trim() && !item.value.trim()) {
      return true
    } else if (!item.key.trim() && item.value.trim()) {
      return true
    } else {
      return false
    }
  })
  console.log('校验headers', isExsitEmpty, info.headers)
  state.error.headers = isExsitEmpty ? t('addMonitor.customHeaderValidate') : '' //headers
}

// URL校验
const validateURL = () => {
  if (info.monitorType === 2 /*URL监控*/) {
    state.error.URL = info.URL ? '' : t('addMonitor.urlValidate') // url没填
  }
}

// 状态码校验
const validateCode = () => {
  // if (info.protocol !== 3) {
  const successCode = info.successCode
    ? info.successCode
        .replaceAll('，', ',')
        .split(',')
        .map(item => item.trim())
    : []
  state.error.successCode = validateSuccessCode(successCode) ? t('addMonitor.statusCodeValidate') : '' // 状态码
  // }
}

// 总体校验
const validate = () => {
  console.log('看下', info.notifyUser)

  state.error = {}
  let obj: any = {}
  info.headers = info.headers.map((item, index) => ({
    key: item.key.trim(),
    value: item.value.trim(),
    id: index,
  }))
  // headers
  const isExsitEmpty = info.headers.some(item => {
    if (item.key.trim() && !item.value.trim()) {
      return true
    } else if (!item.key.trim() && item.value.trim()) {
      return true
    } else {
      return false
    }
  })
  // 状态码
  const successCode = info.successCode
    ? info.successCode
        .replaceAll('，', ',')
        .split(',')
        .map(item => item.trim())
    : []
  if (info.monitorType === 1 /*域名监控*/) {
    // http & https的情况
    if (info.protocol !== 3) {
      // 各自的错误信息
      obj.path = info.path ? '' : t('addMonitor.pathValidate') // path
      obj.domain = info.domain ? '' : t('addMonitor.monitorDomainValidate') // 监控域名
      obj.childDomain = info.childDomain ? '' : t('addMonitor.monitorDomainValidate2') // 子域名
      obj.headers = isExsitEmpty ? t('addMonitor.customHeaderValidate') : '' //headers
      obj.successCode = validateSuccessCode(successCode) ? t('addMonitor.statusCodeValidate') : '' // 状态码
    } else {
      // tcp 的情况
      obj.port = info.port ? '' : t('addMonitor.portValidate') // port
      obj.domain = info.domain ? '' : t('addMonitor.monitorDomainValidate') // 监控域名
      obj.childDomain = info.childDomain ? '' : t('addMonitor.monitorDomainValidate2') // 子域名
    }
  } else if (info.monitorType === 2 /*URL监控*/) {
    obj.URL = info.URL ? '' : t('addMonitor.urlValidate') // url没填
    obj.headers = isExsitEmpty ? t('addMonitor.customHeaderValidate') : '' //headers
    obj.successCode = validateSuccessCode(successCode) ? t('statusCodeValidate1') : '' // 状态码
  }
  // 通知
  if (info.isEmail /* 如果开启了email */) {
    if (info.notifyEmail.length === 0) {
      // 不能为空
      obj.notifyEmail = t('addMonitor.noticeValidate1')
    } else {
      // 格式校验
      const err = info.notifyEmail.find(item => !EMIAL_REG.test(item))
      if (err) {
        obj.notifyEmail = err + t('addMonitor.formatError')
      }
    }
  }
  if (info.isSms /* 如果开启了短信 */) {
    if (info.notifyMobile.length === 0) {
      // 不能为空
      obj.notifyMobile = t('addMonitor.noticeValidate2')
    } else {
      // 格式校验
      const TEL_REG = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
      const err = info.notifyMobile.find(item => !TEL_REG.test(item))
      if (err) {
        obj.notifyMobile = err + t('addMonitor.formatError')
      }
    }
  }
  state.error = obj
  return obj
}

// 正整数不包括0
const reg = /^[1-9]\d*$/
// 校验状态码: false通过
const validateSuccessCode = (code: string[]) => {
  if (code.length === 0) return false
  const isExsitOver = code.some((item: any) => !reg.test(item) || item < 100 || item > 600)
  return isExsitOver
}

// 校验后滚动到错误区域
const scroll = (obj: any) => {
  let id: string = ''
  const key = Object.keys(obj)[0]
  switch (key) {
    case 'port':
      id = '#task'
      break
    case 'path':
      id = '#task'
      break
    case 'domain':
      id = '#port'
      break
    case 'childDomain':
      id = '#port'
      break
    case 'URL':
      id = '#task'
      break
    case 'headers':
      id = '#domain'
      break
    case 'successCode':
      id = '#domain'
      break
    case 'notifyEmail':
      id = '#notifyEmail'
      break
    default:
      id = '#notifyMobile'
      break
  }
  document.querySelector(id)?.scrollIntoView()
}
// 格式化data(提交后台)
const formatData = () => {
  let data: any = {}
  const headers: any = {}
  for (let i = 0; i < info.headers.length; i++) {
    headers[info.headers[i].key] = info.headers[i].value
  }
  info.headers = info.headers.filter(item => item.key && item.value)
  const successCode = info.successCode
    ? info.successCode
        .replaceAll('，', ',')
        .split(',')
        .map(item => item.trim())
        .filter(item => item)
    : []
  data.interval = info.interval // 监控频率
  data.monitorType = info.monitorType // 监控类型
  if (info.monitorType === 1 /*域名监控*/) {
    data.monitorDomain = {
      port: info.port,
      domainId: info.domain,
      host: info.childDomain,
      path: info.protocol === 3 ? '' : info.path,
      headers: info.protocol === 3 ? {} : headers,
      successCode: info.protocol === 3 ? [] : successCode,
      protocol: info.protocol,
    }
    data.reportTtl = info.reportTtl
    data.reportTrigger = info.reportTrigger
  } else {
    data.monitorUrl = {
      url: info.URL,
      headers,
      successCode: successCode,
    }
    data.reportTtl = false // 默认值
    data.reportTrigger = 1 // 默认值
  }
  // data.notifyEmail = info.isEmail ? info.notifyEmail : []
  // data.notifyMobile = info.isSms ? info.notifyMobile : []
  data.notifyUser = info.notifyUser.filter(item => item)
  console.log('数据格式化', data)
  return data
}
// 格式化编辑的data
const formatEdit = (data: any) => {
  data.id = Number(route.query.id)
  const { monitorDomain, monitorUrl } = data
  if (monitorDomain) {
    data.domain = {
      protocol: monitorDomain.protocol,
      port: monitorDomain.port,
      path: monitorDomain.path,
      headers: monitorDomain.headers,
      successCode: monitorDomain.successCode,
    }
  }
  if (monitorUrl) {
    data.url = {
      url: monitorUrl.url,
      headers: monitorUrl.headers,
      successCode: monitorUrl.successCode,
    }
  }
  data.reportTrigger = {
    ttl: data.reportTtl,
    type: data.reportTrigger,
  }
  delete data.monitorDomain
  delete data.monitorUrl
  delete data.reportTtl
  delete data.monitorType
  return data
}

const handleCancel = () => {
  backRoute()
}

const domainLoading = ref(false)

// 获取监控域名列表或者子域名列表
const getDomainOptions = async (domainId: number) => {
  try {
    domainLoading.value = true
    const { code, data } = await _getDomainOptions({ domainId })
    domainLoading.value = false
    if (code === 200) {
      const { list } = data
      if (domainId === 0) {
        info.domainOptions =
          list &&
          list.map((item: { domain: any; id: any }) => ({
            label: item.domain,
            value: item.id,
          }))
      } else {
        info.childDomainOptions =
          list &&
          list.map((item: { domain: any; id: any; value: string }) => ({
            label: item.domain,
            value: item.value,
          }))
      }
    }
  } catch (error) {
    domainLoading.value = false
  }
}
// 获取当前编辑监控的信息(回显)
const getDetail = async (id: any) => {
  try {
    state.requestLoading = true
    const { code, data } = await _getMonitorDetail({ id })
    state.requestLoading = false
    if (code === 200) {
      info.interval = data.interval
      info.monitorType = data.monitorType
      // 判断协议
      if (data.monitorType === 1 /*域名监控*/) {
        const { monitorDomain } = data
        info.port = monitorDomain.port
        info.path = monitorDomain.path
        info.domain = monitorDomain.domainId
        info.childDomain = monitorDomain.host
        info.protocol = monitorDomain.protocol
        let headers: any[] = []
        for (const key in monitorDomain.headers) {
          headers.push({
            key,
            value: monitorDomain.headers[key],
          })
        }
        info.headers = headers.length === 0 ? [{ key: '', value: '' }] : headers
        info.successCode = monitorDomain.successCode ? monitorDomain.successCode.join(',') : ''
      } else {
        const { monitorUrl } = data
        info.URL = monitorUrl.url
        let headers: any[] = []
        for (const key in monitorUrl.headers) {
          headers.push({
            key,
            value: monitorUrl.headers[key],
          })
        }
        info.headers = headers.length === 0 ? [{ key: '', value: '' }] : headers

        info.successCode = monitorUrl.successCode ? monitorUrl.successCode.join(',') : ''
      }
      info.reportTtl = data.reportTtl
      info.reportTrigger = data.reportTrigger
      if (data.notifyEmail && data.notifyEmail[0]) {
        info.isEmail = true
        info.notifyEmail = data.notifyEmail
      }
      if (data.notifyMobile && data.notifyMobile[0]) {
        info.isSms = true
        info.notifyMobile = data.notifyMobile
      }
      const includesIds: number[] = []
      data.notifyUser?.forEach(item => {
        let a = sbs.value.find(citem => item == citem.id)
        if (a) {
          includesIds.push(item)
        }
      })
      info.notifyUser = [...includesIds]
      console.log('看看', info.notifyUser)
    }
  } catch (error) {
    console.log('触发detail error', error)
    state.requestLoading = false
  }
}

// 获取ip
const getIp = async () => {
  try {
    state.loading = true
    const { code, data } = await _getIPList()
    state.loading = false
    if (code === 200) {
      console.log('ip', data)
      const { list } = data
      state.IP = list || []
    }
  } catch (error) {
    state.loading = false
  }
}

const sbs = ref<any[]>([]) // 订阅者
const sbLoading = ref(false)

const getSbs = async () => {
  sbs.value = []
  try {
    sbLoading.value = true
    const { code, data } = await _getUserList({
      condition: '',
      queryProductId: 'DNS',
      pageIndex: 1,
      pageSize: 9999,
    })
    if (code === 10000) {
      const { list } = data
      list &&
        list.forEach(item => {
          sbs.value.push({
            ...item,
            label: item.userName,
            value: item.id,
          })
        })
      console.log('sb', sbs.value)
      // 如果是添加, 并且有sbs数据 默认填入第一条
      if (list && list[0] && !state.edit) {
        info.notifyUser = [list[0].id]
      }
    } else {
      sbs.value = []
    }
  } catch (error) {
    sbs.value = []
  } finally {
    sbLoading.value = false
  }
}

const pageHeader = reactive<{ [x: string]: string }>({})

onMounted(async () => {
  const { edit, id, name, backTitle } = route.query
  console.log(route.query, 'route.query')
  pageHeader.backTitle = t(backTitle as string)
  pageHeader.backName = name as string

  state.edit = !!Number(edit)
  if (state.edit) {
    state.requestLoading = true
  }
  await getDomainOptions(0)
  await getSbs()
  getIp()
  state.edit && getDetail(id)
  useTempStore().setPageHeader(false)
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style scoped lang="scss">
.dns-add-monitor {
  padding: 16px 0 0;

  .page-box {
    width: 100%;
    background: #fff;

    .contents {
      width: 100%;
      height: 100%;
      padding: 0 20px;
      overflow: auto;
      background-color: #fff;

      .title {
        display: flex;
        align-items: center;
        padding: 20px 0 24px;
        font-family: 'PingFang SC-Regular', 'PingFang SC';
        font-size: 16px;
        font-weight: 500;
        line-height: 1;
        color: #191c23;
        border-top: 1px solid #e6ebf3;
      }

      & > div {
        width: 100%;
      }

      // 监控频率
      .interval {
        .content {
          padding-bottom: 20px;
          padding-left: 124px;
        }
      }

      :deep(.the-form) {
        .el-form-item {
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .el-form-item__label {
          width: 104px;
          min-height: 34px;
          padding-right: 20px;
          font-size: 14px;
          line-height: 34px;
          color: #8a94a6;
        }

        .el-form-item__label-wrap {
          .el-form-item__label {
            color: #8a94a6;
          }
        }

        .el-form-item {
          .el-form-item__content {
            min-height: 34px;
            line-height: 34px;

            .el-select {
              width: 360px;
            }

            .el-input {
              width: 360px;
            }

            .el-input__wrapper,
            .el-select__wrapper,
            .el-textarea__inner {
              border-radius: 0;
              box-shadow: 0 0 0 1px #d9dee8 inset;
            }

            .el-input__wrapper,
            .el-select__wrapper {
              min-height: 34px;
            }

            .el-input__inner,
            .el-select__placeholder,
            .el-textarea__inner {
              font-size: 14px;
            }
          }

          /* 域名监控 */
          &#domain {
            .el-form-item__content {
              .domain-select {
                /* margin-bottom: 20px; */
              }
            }
          }

          /* 自定义header */
          &#headers {
            .el-form-item__content {
              .el-input {
                width: 166px;
              }

              .point {
                margin: 0 12.5px;
                line-height: 34px;
                color: #9e9e9e;
              }

              .custom-header {
                display: flex;
                margin-bottom: 24px;

                &.last {
                  margin-bottom: 0;
                }

                .svg {
                  display: flex;
                  align-items: center;
                  margin-left: 20px;

                  svg {
                    width: 20px;
                    height: 20px;
                  }
                }
              }
            }
          }

          /* 状态码 */
          &#successCode {
            .el-form-item__content {
              .el-textarea {
                width: 360px;
                min-height: 120px;

                .el-textarea__inner {
                  width: 100%;
                  min-height: 120px !important;
                  font-family: 'PingFang SC-Regular', 'PingFang SC';
                  font-size: 14px;
                  font-weight: 400;
                  color: var(--primary-text);

                  &::placeholder {
                    font-family: 'PingFang SC-Regular', 'PingFang SC';
                    font-size: 14px;
                    font-weight: 400;
                    color: var(--tip-text);
                  }
                }
              }
            }
          }

          /* ttl */
          &#ttl {
            margin-bottom: 20px;

            .rule-item {
              min-height: 34px;
              line-height: 34px;
            }
          }

          /* 报警 */
          &#alarm {
            margin-bottom: 24px;
          }

          /* 通知设置 */
          &#notifyMobile,
          &#notifyEmail {
            .el-form-item__label-wrap {
              .el-checkbox {
                height: var(--input-height) !important;
              }
            }

            .el-form-item__content {
              display: inline-block;

              .el-select {
                .select-trigger {
                  &[aria-describedby] {
                    .el-select__input {
                      display: inline-block;
                      margin-left: 0 !important;
                    }
                  }

                  .el-select__input {
                    display: none;
                  }
                }

                &.value {
                  .select-trigger {
                    &[aria-describedby] {
                      .el-select__input {
                        display: inline-block;
                        margin-right: 5px;
                        margin-bottom: 5px;
                        margin-left: 8px !important;
                      }
                    }
                  }
                }
              }

              .el-select__tags {
                max-width: 330px !important;

                & > .el-select-tags-wrapper {
                  margin-bottom: 5px;
                  margin-left: 8px;
                }

                & > .el-select__input {
                  height: auto;
                  margin-left: 8px !important;
                }

                .el-select-tags-wrapper {
                  .el-tag {
                    height: 24px;
                    margin: 0;
                    margin-top: 5px;
                    margin-right: 5px;
                    font-family: 'PingFang SC-Regular', 'PingFang SC';
                    font-size: 14px;
                    font-weight: 400;
                    color: var(--primary-color);
                    background-color: #ebecfd;

                    .el-icon {
                      color: var(--primary-color);

                      &:hover {
                        background-color: initial;
                      }
                    }
                  }
                }
              }

              .el-input {
                height: auto !important;
                min-height: var(--input-height);

                .el-input__wrapper {
                  position: relative;
                  min-height: var(--input-height);
                  padding: 0 8px;

                  .el-input__suffix {
                    position: absolute;
                    right: 8px;
                    bottom: 8px;
                    height: initial;
                  }
                }
              }
            }
          }
        }

        // 监控节点
        .node {
          .node-content {
            display: grid;
            grid-template-columns: repeat(3, minmax(180px, 1fr));
            gap: 18px 64px;
            max-width: 900px;
            padding-bottom: 28px;

            .node-item {
              min-height: 20px;
              font-family: 'PingFang SC-Regular', 'PingFang SC';
              font-size: 14px;
              font-weight: 400;
              line-height: 22px;
              color: #191c23;

              span {
                word-break: break-all;
              }

              &:hover {
                text-decoration: underline;
              }

              & > span:first-child {
                padding-right: 20px;
              }
            }
          }

          .request-loading {
            padding-bottom: 20px;
          }
        }
      }
    }

    .handle {
      padding: 20px;
      background: #fff;
      border-top: 1px solid #e6ebf3;

      .el-button {
        min-width: 82px;
        height: 34px;
        padding: 7px 16px !important;
        border-radius: 0;
      }
    }
  }
}

.error-input {
  .el-input__wrapper {
    box-shadow: 0 0 0 1px var(--error-color);

    .el-input__inner {
      color: var(--error-color);
      border-color: var(--error-color);
    }
  }
}

.error-msg {
  top: 100%;

  /* position: absolute; */
  left: 0;
  margin-top: 5px;
  font-family: 'PingFang SC-Regular', 'PingFang SC';
  font-size: 12px;
  font-weight: 400;
  line-height: 17px;
  color: var(--error-color);

  svg {
    margin-top: -2px;
    margin-right: 4px;
  }

  &.domain-error {
    top: var(--input-height);
  }

  &.c-domain-error {
    top: calc(var(--input-height) * 2 + 20px);
  }
}

:deep(.no-arrow) {
  &.el-select--disabled {
    .select-trigger {
      .el-input {
        .el-input__wrapper {
          .el-input__suffix {
            .el-input__suffix-inner {
              .el-icon {
                opacity: 0;
              }
            }
          }
        }
      }
    }
  }
}
</style>

<style lang="scss">
.alarmTrigger-popper {
  max-width: 400px;
}
</style>
