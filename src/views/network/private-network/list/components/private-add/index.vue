<template>
  <div>
    <CatDialog
      v-model:dialog="show"
      :title="t('privateNetwork.addVPCForTitle')"
      :width="dialogWidth"
      :loading="state.confirmLoading"
      @confirm="confirmHandle"
      @close="closeFn"
      @open="open"
    >
      <div class="private-add-dialog">
        <el-form
          ref="baseFormRef"
          :model="state.baseInfo"
          :rules="baseRules"
          label-position="left"
          label-width="auto"
          require-asterisk-position="right"
          :hide-required-asterisk="true"
        >
          <!-- 名称 -->
          <el-form-item :label="t('privateNetwork.addForVpcName')" prop="vpcName" class="base-form-item name-form-item">
            <el-input
              v-model.trim="state.baseInfo.vpcName"
              maxlength="60"
              show-word-limit
              :placeholder="t('privateNetwork.addForVpcNamePlaceholder')"
            />
          </el-form-item>
          <!-- IPv4 网段 -->
          <el-form-item :label="t('privateNetwork.addForIpv4')" prop="ipv4" class="base-form-item cidr-form-item">
            <div class="cidr-editor-wrap">
              <div class="cidr-editor">
                <div class="cidr-select cidr-prefix-select">
                  <el-select v-model="state.cidrRuleId" class="w-full" @change="handleCidrRuleChange">
                    <el-option
                      v-for="item in CIDR_RULE_OPTIONS"
                      :key="item.id"
                      :label="item.firstOctetLabel"
                      :value="item.id"
                    />
                  </el-select>
                </div>
                <span class="mx8">.</span>
                <template v-for="(field, octetIndex) in VPC_EDITABLE_OCTET_FIELDS" :key="field.key">
                  <div class="ip-input-w">
                    <el-tooltip placement="top" effect="light" :disabled="!state.baseInfo[field.rangeKey]">
                      <template #content>
                        <p>{{ state.baseInfo[field.rangeKey] }}</p>
                      </template>
                      <el-input
                        v-model="state.baseInfo[field.key]"
                        maxlength="3"
                        :disabled="state.baseInfo[field.listKey].length <= 1"
                        @blur="handleVpcOctetBlur(octetIndex + 1)"
                      />
                    </el-tooltip>
                  </div>
                  <span v-if="octetIndex < VPC_EDITABLE_OCTET_FIELDS.length - 1" class="mx8">.</span>
                </template>
                <span class="mx8">/</span>
                <div class="mask-select-w">
                  <el-select v-model="state.baseInfo.ipv4Mask" class="w-full" @change="handleVpcMaskChange">
                    <el-option v-for="mask in currentRule.maskOptions" :key="mask" :label="mask" :value="mask" />
                  </el-select>
                </div>
              </div>
            </div>
          </el-form-item>
          <div class="section-divider" />

          <div class="section-title">
            {{ t('privateNetwork.addForNetworkInfo') }}
          </div>

          <el-form-item :label="t('privateNetwork.addForNetworkName')" prop="" class="subnet-form-item">
            <div class="subnet-table-wrap">
              <el-form
                v-for="(item, index) in state.vpcList"
                :key="item[0].keys"
                :ref="
                  (el: FormInstance | null) => {
                    setAddFormRef(item[0].keys, el)
                  }
                "
                :model="item[0]"
                :rules="rulesList[index]"
                label-width="0"
              >
                <el-table :data="item" class="table" :show-header="!index">
                  <!-- 子网名称 -->
                  <el-table-column width="210" :label="t('privateNetwork.addForNetworkName')">
                    <template #default="{ row }">
                      <div class="py11">
                        <el-form-item label="" prop="subnetName">
                          <el-input v-model.trim="row.subnetName" maxlength="60" show-word-limit />
                        </el-form-item>
                      </div>
                    </template>
                  </el-table-column>
                  <!-- 可用区 -->
                  <el-table-column width="170" :label="t('privateNetwork.addForNetworkZone')">
                    <template #default="{ row }">
                      <div class="py11">
                        <el-form-item label="" prop="zoneId">
                          <el-select
                            v-model="row.zoneId"
                            v-loading="state.zoneLoading"
                            class="select-opts w-full"
                            :placeholder="t('privateNetwork.addForNetworkZonePlaceholder')"
                          >
                            <el-option
                              v-for="zone in state.zoneList"
                              :key="zone.id"
                              :label="zone.zoneName"
                              :value="zone.id"
                            >
                              <div class="df ac opt-wrap w-full h-full">
                                <div>{{ zone.zoneName }}</div>
                              </div>
                            </el-option>
                          </el-select>
                        </el-form-item>
                      </div>
                    </template>
                  </el-table-column>
                  <!-- 子网 IPv4 网段 -->
                  <el-table-column width="350">
                    <template #header>
                      <div class="df ac">
                        <span class="mr5">{{ t('privateNetwork.addForNetworkSubnetIpv4') }}</span>
                        <el-tooltip placement="top" effect="light">
                          <template #content>
                            <div class="form-tooltip">
                              {{ t('subnet.subnetIpv4FormTip') }}
                            </div>
                          </template>
                          <el-icon>
                            <Warning class="fs16" />
                          </el-icon>
                        </el-tooltip>
                      </div>
                    </template>
                    <template #default="{ row }">
                      <div class="py11">
                        <!-- 子网 IPv4 网段 -->
                        <el-form-item label="" prop="cidrBlock">
                          <div class="subnet-ip-cell">
                            <div class="subnet-ip-editor">
                              <template v-for="(field, octetIndex) in OCTET_FIELDS" :key="field.key">
                                <div class="ip-input-w">
                                  <el-tooltip placement="top" effect="light" :disabled="!row[field.rangeKey]">
                                    <template #content>
                                      <p>{{ row[field.rangeKey] }}</p>
                                    </template>
                                    <el-input
                                      v-model="row[field.key]"
                                      maxlength="3"
                                      :disabled="row[field.listKey].length <= 1"
                                      @blur="handleSubnetOctetBlur(index, octetIndex)"
                                    />
                                  </el-tooltip>
                                </div>
                                <span v-if="octetIndex < OCTET_FIELDS.length - 1" class="mx8">.</span>
                              </template>
                              <span class="mx8">/</span>

                              <div class="mask-select-w">
                                <el-select
                                  v-model="row.port"
                                  class="select-opts w-full"
                                  placeholder=""
                                  @change="changePort(index)"
                                >
                                  <el-option
                                    v-for="netmask in subnetNetmaskList"
                                    :key="netmask.value"
                                    :label="netmask.label"
                                    :value="netmask.value"
                                  >
                                    <div class="df ac opt-wrap w-full h-full">
                                      <div>{{ netmask.label }}</div>
                                    </div>
                                  </el-option>
                                </el-select>
                              </div>
                            </div>
                          </div>
                        </el-form-item>
                      </div>
                    </template>
                  </el-table-column>
                  <!-- 可用 IP 数量 -->
                  <el-table-column width="160" :label="t('privateNetwork.addForNetworkAvailableIp')">
                    <template #default="{ row }">
                      {{ row.ipNumber }}
                    </template>
                  </el-table-column>
                  <!-- 操作 -->
                  <el-table-column :label="t('privateNetwork.addForNetworkOperate')">
                    <template #default>
                      <DisableText
                        :disabled="state.vpcList.length === 1"
                        :text="t('common.delete')"
                        disabled-type="text"
                        @click="removeRow(index)"
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </el-form>

              <div class="network-button">
                <div v-if="hasMore" class="type-1-table-add" @click="addRow">
                  <span class="text-primary cursor-pointer"> +{{ t('privateNetwork.addForNetworkAddLine') }} </span>
                  <span class="ml5">{{ state.vpcList.length }}/{{ state.maxSubnetNum }}</span>
                </div>
                <div class="subnet-tip">
                  {{ t('privateNetwork.addForNetworkSubnetTip') }}
                </div>
              </div>
            </div>
          </el-form-item>

          <el-form-item
            :label="t('privateNetwork.addForNetworkAssociationRoutingTable')"
            prop="rbUuid"
            class="base-form-item route-form-item"
          >
            <template #label>
              <div class="df ac lh34">
                <span class="mr5">{{ t('privateNetwork.addForNetworkAssociationRoutingTable') }}</span>
                <el-tooltip placement="top" effect="light">
                  <template #content>
                    <div class="form-tooltip">
                      {{ t('subnet.rbIdFormTip') }}
                    </div>
                  </template>
                  <el-icon>
                    <Warning class="fs16" />
                  </el-icon>
                </el-tooltip>
              </div>
            </template>
            <el-input
              v-model.trim="state.baseInfo.rbUuid"
              :placeholder="t('privateNetwork.addForNetworkAssociationRoutingTablePlaceholder')"
              disabled
            />
          </el-form-item>
        </el-form>
      </div>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useCvmStore } from '@/store'
import { FormInstance } from 'element-plus/es'
import { FormRules } from 'element-plus/es/components/form/src/types'
import { _getQuickCreateDefaultZone, _listByRegionId } from '@/apis/cvm/base'
import { directCreateVpc } from '@/apis/network/private-network'
import { getSubnetIpConfig } from '@/apis/network/subnet'
import { Warning } from '@element-plus/icons-vue'
import { getNetmaskList } from '@/views/network/subnet/list/config'
import CidrUtil from './utils'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const dialogMap = {
  [ja]: '1230px',
  [en]: '1230',
  [zh]: '1130px',
}
const DEFAULT_ROUTE_TABLE_NAME = t('routeTable.defaultRoute')
const DEFAULT_RESERVED_IP_NUM = 3
const VPC_NAME_PATTERN = /^[\w\u4e00-\u9fa5.-]{1,60}$/

interface PropType {
  regionId: number
}

type OctetValueKey = 'ipv4One' | 'ipv4Two' | 'ipv4Three' | 'ipv4Four'
type OctetListKey = 'ipv4OneList' | 'ipv4TwoList' | 'ipv4ThreeList' | 'ipv4FourList'
type OctetRangeKey = 'ipv4OneRange' | 'ipv4TwoRange' | 'ipv4ThreeRange' | 'ipv4FourRange'

const OCTET_FIELDS = [
  { key: 'ipv4One', listKey: 'ipv4OneList', rangeKey: 'ipv4OneRange' },
  { key: 'ipv4Two', listKey: 'ipv4TwoList', rangeKey: 'ipv4TwoRange' },
  { key: 'ipv4Three', listKey: 'ipv4ThreeList', rangeKey: 'ipv4ThreeRange' },
  { key: 'ipv4Four', listKey: 'ipv4FourList', rangeKey: 'ipv4FourRange' },
] as const

interface OctetEditorState {
  keys: number
  ipv4One: string
  ipv4Two: string
  ipv4Three: string
  ipv4Four: string
  ipv4OneList: string[]
  ipv4OneRange: string
  ipv4TwoList: string[]
  ipv4TwoRange: string
  ipv4ThreeList: string[]
  ipv4ThreeRange: string
  ipv4FourList: string[]
  ipv4FourRange: string
}

interface SubnetFormItemType extends OctetEditorState {
  subnetName: string
  zoneId: number | string
  cidrBlock: string
  port: number | string
  ipNumber: number
}

interface VpcBaseInfoType extends Omit<OctetEditorState, 'keys'> {
  vpcName: string
  ipv4: string
  ipv4Mask: number
  rbUuid: string
}

interface VpcRuleType {
  id: string
  label: string
  baseCidr: string
  minMask: number
  maxMask: number
}

interface VpcRuleRuntimeType extends VpcRuleType {
  basePrefix: number
  baseStartInt: number
  baseOctets: number[]
  maskOptions: number[]
}

interface CidrRuleOptionType {
  id: string
  firstOctetLabel: string
}

const VPC_RULES: VpcRuleType[] = [
  {
    id: '10',
    label: '10.0.0.0/8-30',
    baseCidr: '10.0.0.0/8',
    minMask: 8,
    maxMask: 30,
  },
  {
    id: '172',
    label: '172.16.0.0/12-30',
    baseCidr: '172.16.0.0/12',
    minMask: 12,
    maxMask: 30,
  },
  {
    id: '192',
    label: '192.168.0.0/16-30',
    baseCidr: '192.168.0.0/16',
    minMask: 16,
    maxMask: 30,
  },
  {
    id: '920',
    label: '9.20.0.0/22-30',
    baseCidr: '9.20.0.0/22',
    minMask: 22,
    maxMask: 30,
  },
]

const parseCidr = (cidr: string) => {
  const match = String(cidr).match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/)
  if (!match) return null
  const octets = [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])]
  const prefix = Number(match[5])
  if (octets.some(num => num < 0 || num > 255) || prefix < 0 || prefix > 32) return null
  return {
    octets,
    prefix,
  }
}

const CIDR_RULE_OPTIONS: CidrRuleOptionType[] = VPC_RULES.map(rule => ({
  id: rule.id,
  firstOctetLabel: String(parseCidr(rule.baseCidr)?.octets[0] ?? rule.id),
}))

const VPC_EDITABLE_OCTET_FIELDS = OCTET_FIELDS.slice(1)

const props = withDefaults(defineProps<PropType>(), {})

const emits = defineEmits<{
  (event: 'success'): void
}>()

const dialogWidth = useI18nStyle(dialogMap)
const cvmStore = useCvmStore()
const show = ref<boolean>(false)
const baseFormRef = ref<FormInstance>()
const addFormMap = ref<Record<number, FormInstance | null>>({})

const ipToInt = (octets: number[]) => {
  return (((octets[0] << 24) >>> 0) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0
}

const intToIp = (num: number) => {
  return [(num >>> 24) & 255, (num >>> 16) & 255, (num >>> 8) & 255, num & 255]
}

const maskFromPrefix = (prefix: number) => {
  if (prefix <= 0) return 0
  if (prefix >= 32) return 0xffffffff >>> 0
  return (0xffffffff << (32 - prefix)) >>> 0
}

const ceilDiv = (a: number, b: number) => Math.floor((a + b - 1) / b)

const floorDiv = (a: number, b: number) => Math.floor(a / b)

const buildRuleRuntime = (rule: VpcRuleType): VpcRuleRuntimeType => {
  const parsed = parseCidr(rule.baseCidr)
  const fallback = { octets: [0, 0, 0, 0], prefix: rule.minMask }
  const { octets, prefix } = parsed || fallback
  return {
    ...rule,
    basePrefix: prefix,
    baseStartInt: ipToInt(octets),
    baseOctets: octets,
    maskOptions: Array.from({ length: rule.maxMask - rule.minMask + 1 }, (_, index) => rule.minMask + index),
  }
}

const DEFAULT_RULE = buildRuleRuntime(VPC_RULES[0])

const safeOctet = (value: string | number) => {
  const num = Math.trunc(Number(value))
  if (Number.isNaN(num)) return 0
  return Math.max(0, Math.min(255, num))
}

const createSubnetFormItem = (): SubnetFormItemType => ({
  keys: Date.now() + Math.floor(Math.random() * 1000),
  subnetName: '',
  zoneId: '',
  cidrBlock: '',
  ipv4One: '',
  ipv4Two: '',
  ipv4Three: '',
  ipv4Four: '',
  port: '',
  ipNumber: 0,
  ipv4OneList: [],
  ipv4OneRange: '',
  ipv4TwoList: [],
  ipv4TwoRange: '',
  ipv4ThreeList: [],
  ipv4ThreeRange: '',
  ipv4FourList: [],
  ipv4FourRange: '',
})

const formatAllowed = (values: number[]) => {
  if (!values.length) return ''
  if (values.length === 1) return `${t('subnet.range')}${values[0]}`
  const step = values[1] - values[0]
  let isArithmetic = step > 0
  for (let i = 2; i < values.length; i += 1) {
    if (values[i] - values[i - 1] !== step) {
      isArithmetic = false
      break
    }
  }
  if (isArithmetic) {
    return `${t('subnet.range')}${values[0]},${values[0] + step},...,${values[values.length - 1]}`
  }
  if (values.length <= 12) {
    return `${t('subnet.range')}${values.join(',')}`
  }
  return `${t('subnet.range')}${values[0]}...${values[values.length - 1]}`
}

const hasAnyNetInRange = (baseStartInt: number, basePrefix: number, prefix: number, low: number, high: number) => {
  const step = 2 ** (32 - prefix)
  const netCount = 2 ** (prefix - basePrefix)
  const maxNet = baseStartInt + (netCount - 1) * step
  if (high < baseStartInt || low > maxNet) return false
  const useLow = Math.max(low, baseStartInt)
  const useHigh = Math.min(high, maxNet)
  const kMin = ceilDiv(useLow - baseStartInt, step)
  const kMax = floorDiv(useHigh - baseStartInt, step)
  return kMin <= kMax
}

const allowedValuesByOctet = (
  baseStartInt: number,
  basePrefix: number,
  prefix: number,
  octetIndex: number,
  fixedPrefixOctets: number[],
) => {
  const values: number[] = []
  for (let value = 0; value <= 255; value += 1) {
    const arrLow = [0, 0, 0, 0]
    const arrHigh = [255, 255, 255, 255]
    let invalid = false

    for (let i = 0; i < octetIndex; i += 1) {
      const fixed = fixedPrefixOctets[i]
      if (Number.isNaN(fixed) || fixed < 0 || fixed > 255) {
        invalid = true
        break
      }
      arrLow[i] = fixed
      arrHigh[i] = fixed
    }
    if (invalid) continue

    arrLow[octetIndex] = value
    arrHigh[octetIndex] = value

    const low = ipToInt(arrLow) >>> 0
    const high = ipToInt(arrHigh) >>> 0
    if (hasAnyNetInRange(baseStartInt, basePrefix, prefix, low, high)) {
      values.push(value)
    }
  }
  return values
}

const getOctets = (target: Pick<OctetEditorState, OctetValueKey>) => {
  return [safeOctet(target.ipv4One), safeOctet(target.ipv4Two), safeOctet(target.ipv4Three), safeOctet(target.ipv4Four)]
}

const setOctets = (target: Pick<OctetEditorState, OctetValueKey>, octets: number[]) => {
  target.ipv4One = String(octets[0])
  target.ipv4Two = String(octets[1])
  target.ipv4Three = String(octets[2])
  target.ipv4Four = String(octets[3])
}

const normalizeOctetTarget = (
  target: Pick<OctetEditorState, OctetValueKey>,
  baseStartInt: number,
  basePrefix: number,
  prefix: number,
  startIdx = 0,
) => {
  const octets = getOctets(target)

  for (let i = startIdx; i < 4; i += 1) {
    const fixedPrefix = octets.slice(0, i)
    const allowed = allowedValuesByOctet(baseStartInt, basePrefix, prefix, i, fixedPrefix)
    if (!allowed.length) continue
    if (!allowed.includes(octets[i])) {
      octets[i] = allowed[0]
    }
  }

  const rawInt = ipToInt(octets)
  const netInt = (rawInt & maskFromPrefix(prefix)) >>> 0
  setOctets(target, intToIp(netInt))
}

const syncOctetAllowedState = (
  target: Pick<OctetEditorState, OctetValueKey | OctetListKey | OctetRangeKey>,
  baseStartInt: number,
  basePrefix: number,
  prefix: number,
) => {
  OCTET_FIELDS.forEach((field, index) => {
    const fixedPrefix = getOctets(target).slice(0, index)
    const allowed = allowedValuesByOctet(baseStartInt, basePrefix, prefix, index, fixedPrefix).map(String)
    target[field.listKey] = allowed
    target[field.rangeKey] = allowed.length > 1 ? formatAllowed(allowed.map(Number)) : ''
  })
}

const setAddFormRef = (key: number, form: FormInstance | null) => {
  if (form) {
    addFormMap.value[key] = form
  } else {
    delete addFormMap.value[key]
  }
}

const baseRules = {
  vpcName: [
    { required: true, message: '', trigger: ['blur', 'change'] },
    {
      validator: (_rule, value, callback) => {
        if (!value) {
          callback(new Error(''))
        } else if (!VPC_NAME_PATTERN.test(value)) {
          callback(new Error(t('privateNetwork.nameRule')))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  ipv4: [
    {
      validator: (_rule, value, callback) => {
        const invalidOctet = OCTET_FIELDS.some(field => {
          const options = state.baseInfo[field.listKey]
          return options.length > 0 && !options.includes(state.baseInfo[field.key])
        })
        if (!value || !CidrUtil.isCidr(value) || invalidOctet) {
          callback(new Error(''))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change'],
    },
  ],
}

const state = reactive<{
  confirmLoading: boolean
  vpcList: SubnetFormItemType[][]
  zoneList: any[]
  zoneLoading: boolean
  reserveIpNum: number
  cidrRuleId: string
  baseInfo: VpcBaseInfoType
  maxSubnetNum: number
}>({
  confirmLoading: false,
  vpcList: [[createSubnetFormItem()]],
  zoneList: [],
  zoneLoading: false,
  reserveIpNum: DEFAULT_RESERVED_IP_NUM,
  cidrRuleId: VPC_RULES[0].id,
  baseInfo: {
    vpcName: '',
    ipv4: '',
    ipv4One: String(DEFAULT_RULE.baseOctets[0]),
    ipv4Two: String(DEFAULT_RULE.baseOctets[1]),
    ipv4Three: String(DEFAULT_RULE.baseOctets[2]),
    ipv4Four: String(DEFAULT_RULE.baseOctets[3]),
    ipv4Mask: DEFAULT_RULE.minMask,
    ipv4OneList: [],
    ipv4OneRange: '',
    ipv4TwoList: [],
    ipv4TwoRange: '',
    ipv4ThreeList: [],
    ipv4ThreeRange: '',
    ipv4FourList: [],
    ipv4FourRange: '',
    rbUuid: DEFAULT_ROUTE_TABLE_NAME,
  },
  maxSubnetNum: 5,
})

const currentRule = computed(() => {
  const rule = VPC_RULES.find(item => item.id === state.cidrRuleId) || VPC_RULES[0]
  return buildRuleRuntime(rule)
})

const subnetMinMask = computed(() => Math.min(30, Number(state.baseInfo.ipv4Mask) || currentRule.value.minMask))
const subnetMaxMask = computed(() => 30)
const subnetNetmaskList = computed(() => getNetmaskList(subnetMinMask.value, subnetMaxMask.value))
const hasMore = computed(() => state.vpcList.length < state.maxSubnetNum)

const getRowByIndex = (index: number) => state.vpcList[index]?.[0]

const buildVpcCidr = () => {
  return `${state.baseInfo.ipv4One}.${state.baseInfo.ipv4Two}.${state.baseInfo.ipv4Three}.${state.baseInfo.ipv4Four}/${Number(state.baseInfo.ipv4Mask)}`
}

const getSubnetCidr = (row: SubnetFormItemType) => {
  return `${row.ipv4One}.${row.ipv4Two}.${row.ipv4Three}.${row.ipv4Four}/${row.port}`
}

const syncVpcCidr = (resetValue = false, startIdx = 0) => {
  state.baseInfo.ipv4Mask = Math.max(
    currentRule.value.minMask,
    Math.min(currentRule.value.maxMask, Number(state.baseInfo.ipv4Mask) || currentRule.value.minMask),
  )
  if (resetValue) {
    setOctets(state.baseInfo as unknown as OctetEditorState, currentRule.value.baseOctets)
  }
  normalizeOctetTarget(
    state.baseInfo as unknown as OctetEditorState,
    currentRule.value.baseStartInt,
    currentRule.value.basePrefix,
    Number(state.baseInfo.ipv4Mask),
    startIdx,
  )
  syncOctetAllowedState(
    state.baseInfo as unknown as OctetEditorState,
    currentRule.value.baseStartInt,
    currentRule.value.basePrefix,
    Number(state.baseInfo.ipv4Mask),
  )
  state.baseInfo.ipv4 = buildVpcCidr()
}

const syncRowSubnetInfo = (index: number, resetValue = false) => {
  const row = getRowByIndex(index)
  if (!row) return

  const defaultPort = subnetNetmaskList.value[0]?.value || subnetMinMask.value
  const portValue = Number(row.port || defaultPort)
  const finalPort = subnetNetmaskList.value.some(item => item.value === portValue) ? portValue : defaultPort
  row.port = finalPort

  const ipNumber = subnetNetmaskList.value.find(item => item.value === finalPort)?.num || 0
  row.ipNumber = ipNumber > 0 ? Math.max(ipNumber - state.reserveIpNum, 0) : 0

  const [vpcIp, vpcPrefixText] = state.baseInfo.ipv4.split('/')
  const basePrefix = Number(vpcPrefixText)
  const baseStartInt = CidrUtil.ipv4ToLong(CidrUtil.getBeginIp(vpcIp, basePrefix))

  if (resetValue) {
    const beginIp = CidrUtil.getBeginIp(vpcIp, basePrefix).split('.')
    setOctets(
      row,
      beginIp.map(item => safeOctet(item)),
    )
  }

  normalizeOctetTarget(row, baseStartInt, basePrefix, finalPort, 0)
  syncOctetAllowedState(row, baseStartInt, basePrefix, finalPort)

  row.cidrBlock = getSubnetCidr(row)
}

const syncAllSubnetInfo = (resetValue = false) => {
  state.vpcList.forEach((_, index) => {
    syncRowSubnetInfo(index, resetValue)
  })
}

const applyDefaultZone = (zoneId?: number | string) => {
  const targetZoneId = zoneId || state.zoneList[0]?.id || ''
  state.vpcList.forEach(item => {
    const row = item[0]
    if (!row.zoneId) {
      row.zoneId = targetZoneId
    }
  })
}

const getDefaultZoneId = async () => {
  const res = await _getQuickCreateDefaultZone({ regionId: props.regionId })
  if (res.success) {
    return res.data?.zoneId || ''
  }
  return ''
}

const getSubnetIpConfigFn = async () => {
  try {
    const res = await getSubnetIpConfig({ regionId: props.regionId })
    if (res.success) {
      state.reserveIpNum = res.data?.reserveIpNum ?? DEFAULT_RESERVED_IP_NUM
      syncAllSubnetInfo(false)
    }
  } catch (err) {
    console.log('getSubnetIpConfigFn error', err)
  }
}

const getCidrMeta = (cidr: string) => {
  if (!CidrUtil.isCidr(cidr)) return null
  const [ip, prefixText] = cidr.split('/')
  const prefix = Number(prefixText)
  return {
    prefix,
    start: CidrUtil.ipv4ToLong(CidrUtil.getBeginIp(ip, prefix)),
    end: CidrUtil.ipv4ToLong(CidrUtil.getEndIp(ip, prefix)),
  }
}

const isSubnetRowReady = (row: SubnetFormItemType) => {
  return Boolean(
    row.ipv4One && row.ipv4Two && row.ipv4Three && row.ipv4Four && row.port && CidrUtil.isCidr(getSubnetCidr(row)),
  )
}

const isSubnetInsideVpc = (subnetCidr: string, vpcCidr: string) => {
  const subnetMeta = getCidrMeta(subnetCidr)
  const vpcMeta = getCidrMeta(vpcCidr)
  if (!subnetMeta || !vpcMeta) return false
  if (subnetMeta.prefix < vpcMeta.prefix) return false
  return subnetMeta.start >= vpcMeta.start && subnetMeta.end <= vpcMeta.end
}

const validateSubnetCidr = (currentKey: number, callback: (err?: Error) => void) => {
  const row = state.vpcList.find(item => item[0].keys === currentKey)?.[0]
  if (!row) {
    callback()
    return
  }

  const cidr = getSubnetCidr(row)
  const currentIndex = state.vpcList.findIndex(item => item[0].keys === currentKey)
  if (!row.ipv4One || !row.ipv4Two || !row.ipv4Three || !row.ipv4Four || !row.port) {
    callback(new Error(''))
  } else if (row.ipv4OneList.findIndex(item => item === row.ipv4One) < 0) {
    callback(new Error(''))
  } else if (row.ipv4TwoList.findIndex(item => item === row.ipv4Two) < 0) {
    callback(new Error(''))
  } else if (row.ipv4ThreeList.findIndex(item => item === row.ipv4Three) < 0) {
    callback(new Error(''))
  } else if (row.ipv4FourList.findIndex(item => item === row.ipv4Four) < 0) {
    callback(new Error(''))
  } else if (state.baseInfo.ipv4 === cidr || !isSubnetInsideVpc(cidr, state.baseInfo.ipv4)) {
    callback(new Error(t('subnet.ipConflictNetwork')))
  } else if (
    state.vpcList.some((item, index) => {
      if (index === currentIndex) return false
      const otherRow = item[0]
      return isSubnetRowReady(otherRow) && CidrUtil.cidrConflict(getSubnetCidr(otherRow), cidr)
    })
  ) {
    callback(new Error(t('subnet.ipConflictSubnet')))
  } else {
    callback()
  }
}

const createRules = (rowKey: number): FormRules<any> => ({
  subnetName: [
    { required: true, message: '', trigger: ['blur', 'change'] },
    {
      pattern: /^[\w\u4e00-\u9fa5.-]{1,60}$/,
      message: t('securityGroup.addNameCondition'),
      trigger: 'blur',
    },
  ],
  zoneId: [{ required: true, message: '', trigger: ['blur', 'change'] }],
  cidrBlock: [
    {
      validator: (_rule, _value, callback) => validateSubnetCidr(rowKey, callback),
      trigger: ['blur', 'change'],
    },
  ],
})

const rulesList = ref<FormRules<any>[]>([createRules(state.vpcList[0][0].keys)])

const validateSubnetCidrFields = async () => {
  await nextTick()
  state.vpcList.forEach(item => {
    const row = item[0]
    row.cidrBlock = getSubnetCidr(row)
    addFormMap.value[row.keys]?.validateField?.('cidrBlock')
  })
}

const handleSubnetOctetBlur = async (index: number, startOctetIndex: number) => {
  const row = getRowByIndex(index)
  if (!row) return

  const [vpcIp, vpcPrefixText] = state.baseInfo.ipv4.split('/')
  const basePrefix = Number(vpcPrefixText)
  const baseStartInt = CidrUtil.ipv4ToLong(CidrUtil.getBeginIp(vpcIp, basePrefix))
  normalizeOctetTarget(row, baseStartInt, basePrefix, Number(row.port), startOctetIndex)
  syncRowSubnetInfo(index, false)
  await nextTick()
  addFormMap.value[row.keys]?.clearValidate?.('cidrBlock')
  validateSubnetCidrFields()
}

const handleVpcOctetBlur = async (startOctetIndex: number) => {
  syncVpcCidr(false, startOctetIndex)
  syncAllSubnetInfo(true)
  await nextTick()
  baseFormRef.value?.clearValidate?.('ipv4')
  validateSubnetCidrFields()
}

const changePort = async (index: number) => {
  const row = getRowByIndex(index)
  syncRowSubnetInfo(index, true)
  await nextTick()
  if (row) {
    addFormMap.value[row.keys]?.clearValidate?.('cidrBlock')
  }
  validateSubnetCidrFields()
}

const handleCidrRuleChange = async (ruleId: string) => {
  const rule = VPC_RULES.find(item => item.id === ruleId) || VPC_RULES[0]
  state.baseInfo.ipv4Mask = rule.minMask
  syncVpcCidr(true)
  syncAllSubnetInfo(true)
  await nextTick()
  baseFormRef.value?.clearValidate?.('ipv4')
  validateSubnetCidrFields()
}

const handleVpcMaskChange = async () => {
  syncVpcCidr(false, 0)
  syncAllSubnetInfo(true)
  await nextTick()
  baseFormRef.value?.clearValidate?.('ipv4')
  validateSubnetCidrFields()
}

const addRow = () => {
  if (!hasMore.value) return
  const nextItem = createSubnetFormItem()
  state.vpcList.push([nextItem])
  rulesList.value.push(createRules(nextItem.keys))
  applyDefaultZone()
  syncRowSubnetInfo(state.vpcList.length - 1, true)
}

const removeRow = (index: number) => {
  const row = getRowByIndex(index)
  state.vpcList.splice(index, 1)
  rulesList.value.splice(index, 1)
  if (row) {
    delete addFormMap.value[row.keys]
  }
  validateSubnetCidrFields()
}

const buildSubmitParams = () => {
  return {
    regionId: props.regionId,
    vpcName: state.baseInfo.vpcName,
    cidr: state.baseInfo.ipv4 as string,
    subnetCidrList: state.vpcList.map(item => {
      const row = item[0]
      return {
        subnetName: row.subnetName,
        zoneId: Number(row.zoneId),
        cidrBlock: getSubnetCidr(row),
      }
    }),
  }
}

const confirmHandle = async () => {
  try {
    state.confirmLoading = true
    await baseFormRef.value?.validate()
    const formList = state.vpcList.map(item => {
      const row = item[0]
      const form = addFormMap.value[row.keys]
      return form?.validate ? form.validate() : Promise.reject(new Error(`subnet form ref missing: ${row.keys}`))
    })
    await Promise.all(formList)

    const params = buildSubmitParams()
    console.log('params', params)
    const res = await directCreateVpc(params)
    if (res.success) {
      message.success(res.msg || t('subnet.addSuccess'))
      closeFn()
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('confirmHandle error', err)
  } finally {
    state.confirmLoading = false
  }
}

const resetState = () => {
  Object.values(addFormMap.value).forEach(item => {
    item?.resetFields?.()
  })
  addFormMap.value = {}
  state.confirmLoading = false
  state.vpcList = [[createSubnetFormItem()]]
  state.zoneList = []
  state.zoneLoading = false
  state.reserveIpNum = DEFAULT_RESERVED_IP_NUM
  state.cidrRuleId = VPC_RULES[0].id
  state.baseInfo = {
    vpcName: '',
    ipv4: '',
    ipv4One: String(DEFAULT_RULE.baseOctets[0]),
    ipv4Two: String(DEFAULT_RULE.baseOctets[1]),
    ipv4Three: String(DEFAULT_RULE.baseOctets[2]),
    ipv4Four: String(DEFAULT_RULE.baseOctets[3]),
    ipv4Mask: DEFAULT_RULE.minMask,
    ipv4OneList: [],
    ipv4OneRange: '',
    ipv4TwoList: [],
    ipv4TwoRange: '',
    ipv4ThreeList: [],
    ipv4ThreeRange: '',
    ipv4FourList: [],
    ipv4FourRange: '',
    rbUuid: DEFAULT_ROUTE_TABLE_NAME,
  }
  rulesList.value = [createRules(state.vpcList[0][0].keys)]
  syncVpcCidr(true)
  syncAllSubnetInfo(true)
}

const closeFn = () => {
  resetState()
  show.value = false
}

const getZoneList = async () => {
  const params = { regionId: props.regionId }
  state.zoneLoading = true
  try {
    const [zoneRes, defaultZoneId] = await Promise.all([_listByRegionId(params), getDefaultZoneId()])
    if (zoneRes.success) {
      state.zoneList = zoneRes?.data || []
      applyDefaultZone(defaultZoneId)
    } else {
      message.warning(zoneRes.msg)
    }
  } catch (err) {
    console.log('getZoneList error', err)
  } finally {
    state.zoneLoading = false
  }
}

const open = async () => {
  state.baseInfo.rbUuid = DEFAULT_ROUTE_TABLE_NAME
  syncVpcCidr(true)
  syncAllSubnetInfo(true)
  await Promise.all([getZoneList(), getSubnetIpConfigFn()])
}

syncVpcCidr(true)
syncAllSubnetInfo(true)

defineExpose({
  show,
  hasMore,
})
</script>

<style scoped lang="scss">
.private-add-dialog {
  padding: 4px 2px 0;
}

.section-title {
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2329;
}

.section-divider {
  margin: 12px 0 28px;
  border-top: 1px solid #e9edf5;
}

.base-form-item {
  margin-bottom: 26px;

  :deep(.el-form-item__label) {
    width: 96px;
    padding-right: 18px;
    color: #8a9099;
  }

  :deep(.el-form-item__content) {
    min-height: 40px;
  }
}

.region-form-item,
.name-form-item,
.route-form-item {
  width: 660px;
}

.cidr-form-item {
  width: 100%;
}

.readonly-text {
  font-size: 14px;
  line-height: 40px;
  color: #1f2329;
}

.cidr-editor-wrap {
  width: 100%;
}

.cidr-card {
  padding: 16px;
  background: #fcfdff;
  border: 1px solid #e8edf5;
  border-radius: 8px;
}

.cidr-editor {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-height: 40px;
}

.cidr-select {
  :deep(.el-select__wrapper) {
    min-height: 40px;
    border-radius: 4px;
  }
}

.cidr-prefix-select {
  width: 70px;
}

.cidr-warning {
  display: flex;
  align-items: center;
  font-size: 12px;
  line-height: 18px;
  color: #5e6773;
}

.warning-icon {
  margin-right: 6px;
  font-size: 16px;
}

.cidr-meta-row {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.cidr-current {
  font-size: 12px;
  line-height: 18px;
  color: #257942;
}

.subnet-form-item {
  margin-bottom: 20px;

  :deep(.el-form-item__label) {
    width: 0;
    padding: 0;
  }

  :deep(.el-form-item__content) {
    width: 100%;
    margin-left: 0 !important;
  }
}

.subnet-table-wrap {
  width: 100%;
}

.network-button {
  display: flex;
}

.type-1-table-add {
  height: 36px;
  line-height: 36px;
  cursor: pointer;
}

.subnet-tip {
  margin-top: 8px;
  margin-left: 330px;
  font-size: 14px;
  line-height: 20px;
  color: #fc8c00;
}

.subnet-ip-cell {
  padding: 2px 0;
}

.subnet-ip-editor {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  line-height: 32px;
}

.subnet-ip-tip {
  margin-top: 8px;
  font-size: 12px;
  line-height: 18px;
  color: #8a9099;
}

.ip-input-w {
  width: 45px;
  height: 32px;

  :deep(.el-input__wrapper) {
    min-height: 32px !important;
    border-radius: 4px;
  }

  :deep(.el-input.is-disabled .el-input__wrapper) {
    background: #f4f6f8;
    box-shadow: 0 0 0 1px #dfe5ee inset;
  }
}

.mask-select-w {
  width: 60px;
  height: 32px;

  :deep(.el-select__wrapper) {
    min-height: 32px !important;
    border-radius: 4px;
  }
}

.py11 {
  padding: 11px 0;
}

.mx8 {
  margin: 0 8px;
}

.ml5 {
  margin-left: 5px;
}

.mr5 {
  margin-right: 5px;
}

.lh34 {
  line-height: 34px;
}

.form-tooltip {
  width: 220px !important;
}

.fs16 {
  font-size: 16px;
  cursor: pointer;
}

.table {
  :deep(.el-table__cell) {
    padding: 0;
  }

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.deleteBtn {
  padding: 0 !important;
  line-height: 54px;
}
</style>
