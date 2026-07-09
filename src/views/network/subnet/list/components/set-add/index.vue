<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('subnet.addSubnet')"
    width="635px"
    :loading="state.comfirmLoading"
    @confirm="confirmHandle"
    @open="open"
    @close="initData"
  >
    <div class="form-wrap">
      <el-form
        ref="formRef"
        require-asterisk-position="right"
        label-width="auto"
        :model="state.form"
        :rules="rules"
        label-position="left"
        :hide-required-asterisk="true"
      >
        <!-- 可用区 -->
        <el-form-item :label="t('subnet.usableArea')" prop="zoneId">
          <div class="w380">
            <el-select
              v-model="state.form.zoneId"
              v-loading="state.zoneLoading"
              class="select-opts w-full"
              :placeholder="t('subnet.pleaseSelect')"
            >
              <el-option v-for="item in state.zoneList" :key="item.id" :label="item.zoneName" :value="item.id">
                <div class="df ac opt-wrap w-full h-full">
                  <div>{{ item.zoneName }}</div>
                </div>
              </el-option>
            </el-select>
            <div class="item-tip mt10">
              {{ t('subnet.zoneTip') }}
            </div>
          </div>
        </el-form-item>
        <!-- 所属网络 -->
        <el-form-item :label="t('subnet.belongingNetwork')" prop="vpcId">
          <div :class="parentClass">
            <div class="w380">
              <el-select
                v-model="state.form.vpcId"
                v-loading="state.vpcLoading"
                class="select-opts w-full"
                filterable
                :placeholder="t('subnet.pleaseSelect')"
                @change="changeVpc"
              >
                <el-option v-for="item in state.vpcList" :key="item.id" :label="item.label" :value="item.id">
                  <div class="df ac opt-wrap w-full h-full">
                    <div>{{ item.label }}</div>
                  </div>
                </el-option>
              </el-select>
            </div>
            <!-- UI说英语和日语换行显示 -->
            <span class="nowrap" :class="boxClass">{{ t('subnet.subnetNumber', [state.subnetNumber]) }}</span>
          </div>
        </el-form-item>
        <!-- 子网名称 -->
        <el-form-item :label="t('subnet.subnetName')" prop="subnetName">
          <div class="w380">
            <el-input v-model="state.form.subnetName" maxlength="60" show-word-limit />
          </div>
        </el-form-item>
        <!-- 子网IPv4网段 -->
        <el-form-item v-loading="state.vpcLoading" :label="t('subnet.subnetIpv4')" prop="cidrBlock">
          <template #label>
            <div class="df ac lh34">
              <span class="mr5">{{ t('subnet.subnetIpv4') }}</span>
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
          <div>
            <div class="df ac">
              <p>{{ state.form.ipv4One }}</p>
              <p class="mx10">.</p>
              <p>{{ state.form.ipv4Two }}</p>
              <p class="mx10">.</p>
              <div v-if="subnetRule.ipv4ThreeList.length > 1" class="w100">
                <el-tooltip placement="top" effect="light">
                  <template #content>
                    <p>{{ subnetRule.ipv4ThreeRange }}</p>
                  </template>
                  <el-input v-model="state.form.ipv4Three" />
                </el-tooltip>
              </div>
              <p v-else>
                {{ state.form.ipv4Three }}
              </p>
              <p class="mx10">.</p>
              <div v-if="subnetRule.ipv4FourList.length > 1" class="w100">
                <el-tooltip placement="top" effect="light">
                  <template #content>
                    <p>{{ subnetRule.ipv4FourRange }}</p>
                  </template>
                  <el-input v-model="state.form.ipv4Four" />
                </el-tooltip>
              </div>
              <p v-else>
                {{ state.form.ipv4Four }}
              </p>
              <p class="mx10">/</p>
              <div class="w100">
                <el-select v-model="state.form.port" class="select-opts w-full" placeholder="" @change="changePort">
                  <el-option v-for="item in netmaskList" :key="item.value" :label="item.label" :value="item.value">
                    <div class="df ac opt-wrap w-full h-full">
                      <div>{{ item.label }}</div>
                    </div>
                  </el-option>
                </el-select>
              </div>
            </div>
            <div class="mt10 value">
              {{ t('subnet.availableIPNumber', [state.ipNumber]) }}
            </div>
            <div class="mt10 value origin-text">
              {{ t('subnet.subnetIpTip') }}
            </div>
          </div>
        </el-form-item>
        <!-- 关联路由表 -->
        <el-form-item :label="t('subnet.associationRoutingTable')" prop="rbId">
          <template #label>
            <div class="df ac lh34">
              <span class="mr5">{{ t('subnet.associationRoutingTable') }}</span>
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
          <div class="w380">
            <el-select
              v-model="state.form.rbId"
              v-loading="state.routingTableLoading"
              class="select-opts w-full"
              :placeholder="t('subnet.pleaseSelect')"
            >
              <el-option v-for="item in state.routingTableList" :key="item.id" :label="item.rbName" :value="item.id">
                <div class="df ac opt-wrap w-full h-full">
                  <div>{{ item.rbName }}</div>
                </div>
              </el-option>
            </el-select>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { FormInstance, FormRules } from 'element-plus/es'
import { message } from '@/utils/message'
import { getQueryVpcPage } from '@/apis/network/private-network'
import { getQueryRouteTablePage } from '@/apis/network/route-table'
import { _listByRegionId } from '@/apis/cvm/base'
import { AddFormType } from '../../type'
import { getCreateSubnet } from '@/apis/network/subnet'
import { Warning } from '@element-plus/icons-vue'
import {
  netmaskList,
  calculateAllowedSubnets,
  analysisSubnetList,
  AnalysisSubnetObjType,
  getIpv4ThreeRange,
  getIpv4FourRange,
} from '../../config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

interface PropType {
  regionId: number
  locationId: number
  subList: any[]
  reserveIpNum: number
}

const props = withDefaults(defineProps<PropType>(), {})

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const classOneMap = {
  [ja]: '',
  [en]: '',
  [zh]: 'df ac',
}
const classTwoMap = {
  [ja]: 'item-msg value mt10',
  [en]: 'item-msg value mt10',
  [zh]: 'item-msg ml9',
}

const parentClass = useI18nStyle(classOneMap)
const boxClass = useI18nStyle(classTwoMap)

const initForm: AddFormType = {
  zoneId: '',
  vpcId: '',
  rbId: '',
  subnetName: '',
  cidrBlock: '',
  ipv4One: '',
  ipv4Two: '',
  ipv4Three: '',
  ipv4Four: '',
  port: '',
}

const emits = defineEmits<{
  (event: 'success'): void
}>()

const formRef = ref<FormInstance>()
const show = ref<boolean>(false) // 弹窗显示

const state = reactive<{
  comfirmLoading: boolean
  form: AddFormType // 表单数据
  vpcList: any[] // vpc列表
  vpcLoading: boolean
  zoneList: any[] // 可用区列表
  zoneLoading: boolean
  routingTableList: any[] // 关联路由表列表
  routingTableLoading: boolean
  subnetNumber: number // 已有子网数量
  ipNumber: number // 可用ip数量
}>({
  comfirmLoading: false,
  form: { ...initForm },
  vpcList: [],
  vpcLoading: false,
  zoneList: [],
  zoneLoading: false,
  routingTableList: [],
  routingTableLoading: false,
  subnetNumber: 0,
  ipNumber: 0,
})

// 子网相关限制
const subnetRule = reactive<{
  vpcCidr: string // 当前选择的所属网络cidr
  vpcSubnetList: { [key: number]: string[] } // 当前所属网络允许的子网cidr列表
  portIpList: string[] // 当前掩码下所允许的ip列表
  ipv4ThreeList: string[]
  ipv4ThreeRange: string
  ipv4FourList: string[]
  ipv4FourRange: string
}>({
  vpcCidr: '',
  vpcSubnetList: {},
  portIpList: [],
  ipv4ThreeList: [],
  ipv4FourList: [],
  ipv4ThreeRange: '',
  ipv4FourRange: '',
})

const rules = reactive<FormRules<AddFormType>>({
  zoneId: [{ required: true, message: t(''), trigger: 'blur' }],
  vpcId: [{ required: true, message: t(''), trigger: 'blur' }],
  rbId: [{ required: true, message: t(''), trigger: 'blur' }],
  subnetName: [
    { required: true, message: t(''), trigger: 'blur' },
    {
      pattern: /^[\w\u4e00-\u9fa5.-]{1,60}$/,
      message: t('securityGroup.addNameCondition'),
      trigger: 'blur',
    },
  ],
  cidrBlock: [
    {
      validator: (rule, value, callback) => {
        const cidr = `${state.form.ipv4One}.${state.form.ipv4Two}.${state.form.ipv4Three}.${state.form.ipv4Four}/${state.form.port}`
        if (!state.form.ipv4One || state.form.ipv4One === '') {
          callback(new Error(''))
        } else if (!state.form.ipv4Two || state.form.ipv4Two === '') {
          callback(new Error(''))
        } else if (!state.form.ipv4Three || state.form.ipv4Three === '') {
          callback(new Error(''))
        } else if (!state.form.ipv4Four || state.form.ipv4Four === '') {
          callback(new Error(''))
        } else if (subnetRule.ipv4ThreeList.findIndex(item => item === state.form.ipv4Three) < 0) {
          callback(new Error(''))
        } else if (subnetRule.ipv4FourList.findIndex(item => item === state.form.ipv4Four) < 0) {
          callback(new Error(''))
        } else if (!state.form.port || state.form.port === '') {
          callback(new Error(''))
        } else if (props.subList.findIndex(item => item.cidrBlock === cidr) >= 0) {
          message.warning(t('subnet.ipConflictSubnet'))
          callback(new Error(''))
        } else if (subnetRule.vpcCidr === cidr) {
          message.warning(t('subnet.ipConflictNetwork'))
          callback(new Error(''))
        } else {
          callback()
        }
      },
    },
  ],
})

// 获取vpc列表
const getQueryVpcList = async () => {
  const params = { regionId: props.regionId, pageSize: 10000, pageIndex: 1 }
  state.vpcLoading = true
  const res = await getQueryVpcPage(params)
  try {
    state.vpcLoading = false
    if (res.success) {
      state.vpcList = (res.data?.list || []).map(item => ({
        ...item,
        label: `${item.vpcName}(${item.cidrBlock})`,
      }))
      if (state.vpcList.length > 0) {
        state.form.vpcId = state.vpcList[0].id
        changeVpc()
      }
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.vpcLoading = false
    console.log('error', err)
  }
}

// 获取可用区
const getListByRegionId = async zoneId => {
  const params = { regionId: props.regionId }
  state.zoneLoading = true
  const res = await _listByRegionId(params)
  try {
    state.zoneLoading = false
    if (res.success) {
      state.zoneList = res?.data || []
      if (zoneId) {
        state.form.zoneId = state.zoneList.find(item => item.id === +zoneId)?.id
        console.log(state.form.zoneId, 'zoneId', zoneId)
      }
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.zoneLoading = false
    console.group('error', err)
  }
}

// 获取关联路由表
const getQueryRouteTableList = async () => {
  const params = { regionId: props.regionId, pageSize: 10000, pageIndex: 1 }
  state.routingTableLoading = true
  const res = await getQueryRouteTablePage(params)
  try {
    state.routingTableLoading = false
    if (res.success) {
      state.routingTableList = res?.data?.list || []
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.routingTableLoading = false
    console.log('error', err)
  }
}

// 切换所属网段
const changeVpc = () => {
  const vpc = state.vpcList.find(item => item.id === state.form.vpcId)
  // 获取子网数量
  state.subnetNumber = vpc.subnetNum
  // 获取允许的子网cidr列表
  subnetRule.vpcSubnetList = calculateAllowedSubnets(vpc.cidrBlock)
  // 选择所属网段后设置默认掩码为24
  state.form.port = 24
  changePort()
}

// 切换子网掩码
const changePort = () => {
  // 获取当前选择掩码的ip列表
  subnetRule.portIpList = subnetRule.vpcSubnetList[state.form.port]
  const ipNumber = netmaskList.find(item => item.value === state.form.port)?.num || 0
  state.ipNumber = ipNumber > 0 ? ipNumber - props.reserveIpNum : 0
  try {
    const ipv4Obj = analysisSubnetList(subnetRule.portIpList)
    const ipv4ThreeList = (ipv4Obj as AnalysisSubnetObjType).ipv4Three,
      ipv4FourList = (ipv4Obj as AnalysisSubnetObjType).ipv4Four
    if (ipv4ThreeList.length === 1) {
      state.form.ipv4Three = ipv4ThreeList[0]
      subnetRule.ipv4ThreeList = [...ipv4ThreeList]
      subnetRule.ipv4ThreeRange = ''
    } else {
      state.form.ipv4Three = ''
      subnetRule.ipv4ThreeList = (ipv4Obj as AnalysisSubnetObjType).ipv4Three
      subnetRule.ipv4ThreeRange = getIpv4ThreeRange(subnetRule.ipv4ThreeList)
      console.log('subnetRule.ipv4ThreeRange', subnetRule.ipv4ThreeRange)
    }
    if (ipv4FourList.length === 1) {
      state.form.ipv4Four = ipv4FourList[0]
      subnetRule.ipv4FourList = [...ipv4FourList]
      subnetRule.ipv4FourRange = ''
    } else {
      state.form.ipv4Four = ''
      subnetRule.ipv4FourList = (ipv4Obj as AnalysisSubnetObjType).ipv4Four
      subnetRule.ipv4FourRange = getIpv4FourRange(subnetRule.ipv4FourList)
      console.log('subnetRule.ipv4FourRange', subnetRule.ipv4FourRange)
    }
    state.form.ipv4One = (ipv4Obj as AnalysisSubnetObjType).ipv4One[0]
    state.form.ipv4Two = (ipv4Obj as AnalysisSubnetObjType).ipv4Two[0]
  } catch (err) {
    console.log('err', err)
  }
  setTimeout(() => {
    ;(formRef.value as FormInstance).clearValidate('cidrBlock')
  }, 80)
}

const showCallback = zoneId => {
  getQueryVpcList()
  getListByRegionId(zoneId)
  getQueryRouteTableList()
}

// 初始化数据
const initData = () => {
  show.value = false
  state.form = { ...initForm }
  state.vpcList = []
  state.zoneList = []
  state.routingTableList = []
  state.subnetNumber = 0
  state.ipNumber = 0
  subnetRule.vpcCidr = ''
  subnetRule.vpcSubnetList = {}
  subnetRule.portIpList = []
  subnetRule.ipv4ThreeList = []
  subnetRule.ipv4FourList = []
  subnetRule.ipv4ThreeRange = ''
  subnetRule.ipv4FourRange = ''
  ;(formRef.value as FormInstance).resetFields()
}

const confirmHandle = async () => {
  await (formRef.value as FormInstance).validate()
  const params = {
    zoneId: state.form.zoneId as number,
    vpcId: state.form.vpcId as number,
    rbId: state.form.rbId as number,
    subnetName: state.form.subnetName,
    cidrBlock: `${state.form.ipv4One}.${state.form.ipv4Two}.${state.form.ipv4Three}.${state.form.ipv4Four}/${state.form.port}`,
  }
  state.comfirmLoading = true
  try {
    const res = await getCreateSubnet(params)
    state.comfirmLoading = false
    if (res.success) {
      message.success(t('subnet.addSuccess'))
      initData()
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.comfirmLoading = false
    console.log('error', err)
  }
}

// 弹窗打开
const open = () => {}

defineExpose({
  show,
  showCallback,
})
</script>
<style scoped lang="scss">
.w380 {
  width: 380px;
}

.item-tip {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 12px;
  font-weight: 400;
  line-height: 17px !important;
  color: #999;
}

.mt9 {
  margin-top: 9px;
}

.item-msg {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #555;
}

.ml9 {
  margin-left: 9px;
}

.w100 {
  width: 100px;
}

.mx10 {
  margin: 0 10px;
}

.mt10 {
  margin-top: 10px;
}

.origin-text {
  color: #fc8c00;
}

.w240 {
  width: 240px;
}

.mr5 {
  margin-right: 5px;
}

.fs16 {
  font-size: 16px;
}

.form-tooltip {
  width: 200px !important;
}

.value {
  line-height: 20px !important;
}

.lh34 {
  line-height: 34px;
}

:deep(.el-form .el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form .el-form-item .el-form-item__content) {
  * {
    line-height: 32px;
  }
}

:deep(.el-form-item__error) {
  line-height: initial !important;
}

:deep(.el-form .el-form-item .el-form-item__content .el-form-item__error) {
  position: absolute;
}

.mt20 {
  margin-top: 20px;
}

.nowrap {
  text-wrap: nowrap;
}
</style>
