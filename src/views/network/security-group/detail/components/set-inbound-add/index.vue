<template>
  <CatDialog
    v-model:dialog="show"
    :title="ruleactive === 'ingress' ? t('securityGroup.addInboundRules') : t('securityGroup.addEgressRules')"
    width="1160px"
    :loading="state.comfirmLoading"
    @confirm="confirmHandle"
    @close="closeFn"
    @open="open"
  >
    <div class="type-1-add-content">
      <el-form
        v-for="(item, index) in state.ruleList"
        :key="item.keys"
        :ref="
          (el: any) => {
            addFormList[index] = el
          }
        "
        :model="item[0]"
        :rules="rulesList[index]"
        label-width="0"
      >
        <el-table :data="item" :show-header="!index">
          <!-- 类型 -->
          <el-table-column width="218" class="type-td" :label="t('securityGroup.type')">
            <template #default="{ row }">
              <el-select
                v-model="row.groupType"
                class="select-opts w-full"
                :placeholder="t('securityGroup.selectType')"
                @change="val => changeInboundAddType(val, index)"
              >
                <el-option
                  v-for="item in InboundAddTypeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
          </el-table-column>
          <!-- 来源 or 目标 -->
          <el-table-column
            width="280"
            :label="ruleactive === 'ingress' ? t('securityGroup.source') : t('securityGroup.target')"
          >
            <template #header>
              <div class="df ac">
                <span>{{ ruleactive === 'ingress' ? t('securityGroup.source') : t('securityGroup.target') }}</span>
                <el-tooltip effect="light" content="" placement="top">
                  <template #content>
                    <div>
                      {{
                        ruleactive === 'ingress'
                          ? t('securityGroup.sourceToolTipTitle')
                          : t('securityGroup.sourceToolTipTitle2')
                      }}<br />
                      {{ t('securityGroup.sourceToolTip1') }}<br />
                      {{ t('securityGroup.sourceToolTip2') }}<br />
                      {{ t('securityGroup.sourceToolTip3') }}<br />
                      {{ t('securityGroup.sourceToolTip4') }}<br />
                      {{ t('securityGroup.sourceToolTip5') }}<br />
                      {{ t('securityGroup.sourceToolTip6') }}<br />
                      {{ t('securityGroup.sourceToolTip7') }}
                    </div>
                  </template>
                  <SvgIcon name="cat-cdn-buy-warning" class="ml4" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <div class="py11">
                <el-select
                  v-model="row.type"
                  class="select-opts w-full"
                  :placeholder="t('securityGroup.selectSource')"
                  @change="val => changeType(val, index)"
                >
                  <el-option v-for="item in sourceTypeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <!-- 参数模板 - IP 地址组 -->
                <div v-if="row.type === 3" class="mt15">
                  <el-form-item label="" prop="remoteAddressGroupId">
                    <el-select
                      v-model="row.remoteAddressGroupId"
                      v-loading="state.remoteAddressGroupLoading"
                      class="select-opts w-full"
                      filterable
                      :placeholder="t('securityGroup.selectParamTemplate')"
                      @visible-change="getIpGroupListFn"
                    >
                      <el-option
                        v-for="item in state.remoteAddressGroupList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </div>
                <!-- 安全组 -->
                <div v-else-if="row.type === 2" class="mt15">
                  <el-form-item label="" prop="remoteGroupId">
                    <el-select
                      v-model="row.remoteGroupId"
                      v-loading="state.remoteGroupLoading"
                      class="select-opts w-full"
                      :placeholder="t('securityGroup.placeSelectSecurityGroup')"
                      filterable
                      @visible-change="getListSecurityGroupFn"
                    >
                      <el-option
                        v-for="item in state.remoteGroupIdList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </div>
                <!-- IP 地址或 CIDR 段 -->
                <div v-else class="mt15">
                  <el-form-item label="" prop="remoteIpPrefix">
                    <el-input
                      v-model.trim="row.remoteIpPrefix"
                      :placeholder="t('securityGroup.remoteIpPrefixPlaceholder')"
                    />
                  </el-form-item>
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 协议端口 -->
          <el-table-column width="208" :label="t('securityGroup.protocolPort')">
            <template #header>
              <div class="df ac">
                <span>{{ t('securityGroup.protocolPort') }}</span>
                <el-tooltip effect="light" content="" placement="top">
                  <template #content>
                    <div>
                      {{ t('securityGroup.protocolPortToolTipTitle') }}<br />
                      {{ t('securityGroup.protocolPortToolTip1') }}<br />
                      {{ t('securityGroup.protocolPortToolTip2') }}<br />
                      {{ t('securityGroup.protocolPortToolTip3') }}<br />
                      {{ t('securityGroup.protocolPortToolTip4') }}<br />
                      {{ t('securityGroup.protocolPortToolTip5') }}
                    </div>
                  </template>
                  <SvgIcon name="cat-cdn-buy-warning" class="ml4" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <el-form-item label="" prop="port">
                <el-input
                  v-model.trim="row.port"
                  :disabled="!!row.groupType"
                  :placeholder="t('securityGroup.protocolPortPlaceholder')"
                />
              </el-form-item>
            </template>
          </el-table-column>
          <!-- 策略 -->
          <el-table-column width="112" :label="t('securityGroup.strategy')">
            <template #default="{ row }">
              <div class="py11 w92">
                <el-form-item label="" prop="action">
                  <el-select
                    v-model="row.action"
                    class="select-opts w-full"
                    :placeholder="t('securityGroup.selectStrategy')"
                  >
                    <el-option
                      v-for="item in actionTypeList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </div>
            </template>
          </el-table-column>
          <!-- 描述 -->
          <el-table-column width="250" :label="t('securityGroup.describe')">
            <template #default="{ row }">
              <div class="py11 w238">
                <el-form-item label="" prop="description">
                  <el-input v-model.trim="row.description" />
                </el-form-item>
              </div>
            </template>
          </el-table-column>
          <!-- 删除 -->
          <el-table-column width="60" :label="t('securityGroup.operate')">
            <template #header>
              <EllipsisTooltip class="operate-header-tooltip" :text="t('securityGroup.operate')" />
            </template>
            <el-icon
              v-if="state.ruleList?.length > 1"
              class="cursor-pointer"
              color="#999999"
              @click="() => removeRow(index)"
            >
              <CircleCloseFilled />
            </el-icon>
          </el-table-column>
        </el-table>
      </el-form>

      <div v-if="hasMore" class="type-1-table-add cat-flex">
        <span class="text-primary cursor-pointer" @click="addRow">+{{ t('securityGroup.addNewLine') }}</span>
      </div>
    </div>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { CircleCloseFilled } from '@element-plus/icons-vue'
import { FormRules } from 'element-plus/es/components/form/src/types'
import { InboundAddTypeList, sourceTypeList, actionTypeList, multiportAllProtocolTypeList } from '../../config'
import { getListSecurityGroup } from '@/apis/network/security-group'
import { getIpGroupList } from '@/apis/network/ip-group'
import { securityGroutRules } from '../../config'
import { addSecurityGroupRule } from '@/apis/network/security-group'
import { message } from '@/utils/message'
import EllipsisTooltip from '@/components/common/ellipsis-tooltip/index.vue'

interface PropType {
  regionId: number
  detailId: number
  ruleactive: string
}

const props = withDefaults(defineProps<PropType>(), {})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const show = ref<boolean>(false) // 弹窗显示
const hasMore = ref<boolean>(true) // 是否可以新增一行

const initRule = {
  groupType: 0,
  type: 1,
  remoteIpPrefix: '',
  remoteAddressGroupId: '',
  remoteGroupId: '',
  port: '',
  action: 'allow',
  description: '',
  keys: null,
}

const state = reactive<{
  comfirmLoading: boolean
  ruleList: any[][]
  remoteAddressGroupList: any[] // ip组列表
  remoteAddressGroupLoading: boolean // 获取ip组列表loading
  remoteGroupIdList: any[] // 安全组列表
  remoteGroupLoading: boolean // 获取安全组列表loading
}>({
  comfirmLoading: false,
  ruleList: [[{ ...initRule }]],
  remoteAddressGroupList: [],
  remoteAddressGroupLoading: false,
  remoteGroupIdList: [],
  remoteGroupLoading: false,
})

const addFormList = ref<any[]>([])

// 初始化的校验规则
const Initrules = {
  remoteAddressGroupId: [
    {
      validator: (rule, value, callback) => {
        if (/\d+/g.test(value)) {
          callback()
        } else {
          callback(new Error(''))
        }
      },
    },
  ],
  remoteGroupId: [
    {
      validator: (rule, value, callback) => {
        if (/\d+/g.test(value)) {
          callback()
        } else {
          callback(new Error(''))
        }
      },
    },
  ],
  remoteIpPrefix: [
    {
      validator: (rule, value, callback) => {
        const key = securityGroutRules.remoteIpPrefix(value)
        if (key) {
          callback()
        } else {
          callback(new Error(''))
        }
      },
    },
  ],
  port: [
    {
      validator: (rule, value, callback) => {
        const key = securityGroutRules.port(value)
        if (key) {
          callback()
        } else {
          callback(new Error(''))
        }
      },
    },
  ],
}

// 表格的校验规则
const rulesList = ref<FormRules<any>[]>([
  {
    remoteIpPrefix: Initrules.remoteIpPrefix,
    port: Initrules.port,
  },
])

// 获取安全组列表
const getListSecurityGroupFn = async key => {
  if (!key) return
  const params = { regionId: props.regionId, pageIndex: 1, pageSize: 1000 }
  state.remoteGroupLoading = true
  try {
    const res = await getListSecurityGroup(params)
    state.remoteGroupLoading = false
    if (res.success) {
      state.remoteGroupIdList = (res.data?.list || []).map(item => ({
        label: `${item.id}(${item.name})`,
        value: item.id,
      }))
    }
  } catch (err) {
    console.log('error', err)
    state.remoteGroupLoading = false
  }
}

// 获取IP地址列表
const getIpGroupListFn = async key => {
  if (!key) return
  const params = { regionId: props.regionId, pageIndex: 1, pageSize: 1000 }
  state.remoteAddressGroupLoading = true
  try {
    const res = await getIpGroupList(params)
    state.remoteAddressGroupLoading = false
    state.remoteAddressGroupList = (res.data?.list || []).map(item => ({
      label: `${item.id}(${item.name})`,
      value: item.id,
    }))
  } catch (err) {
    console.log('error', err)
    state.remoteAddressGroupLoading = false
  }
}

// 切换类型
const changeInboundAddType = (val, index) => {
  const item = InboundAddTypeList.find(item => item.value === val)
  const params = {
    ...initRule,
    port: `${item?.data?.protocol || ''}${item?.data?.multiport ? ':' + item.data.multiport : ''}`,
    description: item?.data?.description || '',
    groupType: val,
    remoteIpPrefix: val === 0 ? '' : 'ALL',
  }
  state.ruleList.splice(index, 1, [params])
}

// 切换来源
const changeType = (val, index) => {
  const rules: FormRules<any> = {
    port: Initrules.port,
  }
  if (val === 1) {
    rules.remoteIpPrefix = Initrules.remoteIpPrefix
  } else if (val === 2) {
    rules.remoteGroupId = Initrules.remoteGroupId
  } else if (val === 3) {
    rules.remoteAddressGroupId = Initrules.remoteAddressGroupId
  }
  rulesList.value.splice(index, 1, rules)
}

// 新增一行
const addRow = () => {
  const keys = new Date().getTime()
  state.ruleList.push([{ ...initRule, keys }])
  rulesList.value.push({
    remoteIpPrefix: Initrules.remoteIpPrefix,
    port: Initrules.port,
  })
}

// 删除一行
const removeRow = index => {
  state.ruleList.splice(index, 1)
  rulesList.value.splice(index, 1)
}

const confirmHandle = async () => {
  const formList = addFormList.value.map((i, index) => {
    return i?.validate ? i.validate() : []
  })
  await Promise.all(formList)
  const list: number[] = []
  const params = {
    regionId: props.regionId,
    groupId: props.detailId,
    rules: state.ruleList.map((item: any[], index: number) => {
      const i = item[0]
      const portList = i.port.split(':')
      if (portList[0] === 'ICMPV6' && !securityGroutRules.ipv6(i.remoteIpPrefix)) {
        list.push(index)
      }
      const obj: any = {
        type: i.type,
        description: i.description,
        direction: props.ruleactive,
        protocol: portList[0].toLowerCase(),
        // 如果协议为['icmp','icmpv6', 'gre', 'all']中的一个 端口固定为all
        multiport: multiportAllProtocolTypeList.findIndex(i => i === portList[0]) >= 0 ? 'all' : portList[1],
        action: i.action,
      }
      if (i.type === 1) {
        obj.remoteIpPrefix = i.remoteIpPrefix === 'ALL' ? 'all' : i.remoteIpPrefix
        obj.remoteGroupId = null
        obj.remoteAddressGroupId = null
      }
      if (i.type === 3) {
        obj.remoteIpPrefix = null
        obj.remoteGroupId = null
        obj.remoteAddressGroupId = i.remoteAddressGroupId
      }
      if (i.type === 2) {
        obj.remoteIpPrefix = null
        obj.remoteGroupId = i.remoteGroupId
        obj.remoteAddressGroupId = null
      }
      return obj
    }),
  }
  if (list.length > 0) {
    message.warning(t('securityGroup.icmpv6Msg'))
    return false
  }
  state.comfirmLoading = true
  try {
    const res = await addSecurityGroupRule(params)
    state.comfirmLoading = false
    if (res.success) {
      message.success(t('securityGroup.increaseSuccess'))
      closeFn()
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.comfirmLoading = false
    console.log('error', err)
  }
}

const closeFn = () => {
  addFormList.value.forEach(i => {
    i?.resetFields()
  })
  state.ruleList = [[{ ...initRule }]]
  addFormList.value = []
  rulesList.value = [
    {
      remoteIpPrefix: Initrules.remoteIpPrefix,
      port: Initrules.port,
    },
  ]
  show.value = false
  hasMore.value = true
}
// 弹窗打开
const open = () => {}

defineExpose({
  show,
  hasMore,
})
</script>
<style scoped lang="scss">
.type-1-add-content {
  position: relative;
  flex: 1;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid var(--border-c);

  .type-1-table-wrap {
    width: 100%;
  }

  .type-1-table-add {
    width: 100%;
    height: 60px;
    cursor: pointer;

    svg {
      width: 24px;
      height: 24px;
    }
  }
}

.py11 {
  padding: 11px 0;
}

.w168 {
  width: 168px;
}

.w198 {
  width: 198px;
}

.w183 {
  width: 183px;
}

.w238 {
  width: 238px;
}

.w268 {
  width: 268px;
}

.w94 {
  width: 92px;
}

.mt15 {
  margin-top: 15px;
}

:deep(.el-table_2_column_8 .cell) {
  padding-left: 14px !important;
}

:deep(.el-table_2_column_12 .cell) {
  padding-right: 14px !important;
}

:deep(.operate-header-tooltip) {
  width: 100%;
}
</style>
