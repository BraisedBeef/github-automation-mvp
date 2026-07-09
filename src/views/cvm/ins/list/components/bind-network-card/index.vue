<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('networkCard.bindNetworkCard')"
    :width="state.bindType.value === 1 ? '950px' : dialogClass"
    :loading="state.comfirmLoading"
    :disabled="!state.checked && state.bindType.value === 1"
    @confirm="confirmHandle(formRef)"
    @update:dialog="() => {}"
    @open="open"
    @close="closeFn"
  >
    <p class="mb20 desc1">
      {{ t('networkCard.placeSelectbindNetworkCard', [insDetail?.instanceName]) }}
    </p>
    <p class="mb20 desc2">
      {{ t('networkCard.insSupportNetworkCardNum', [state.maxEniNums, state.maxIpNums]) }}
    </p>

    <div>
      <!-- form -->
      <div class="form-wrap mt20">
        <el-form
          ref="formRef"
          require-asterisk-position="right"
          label-width="auto"
          :model="state.createForm"
          hide-required-asterisk
          :rules="rules"
          label-position="left"
        >
          <!-- 绑定方式 -->
          <el-form-item :label="t('networkCard.bindingMethod')" class="login-type-wrap">
            <div class="df jsb ac w-full">
              <BtnsGroup
                v-model="state.bindType"
                :list="btnsGroupList"
                :style="btnsGroupClass"
                @change-value="changeType"
              />
            </div>
          </el-form-item>
          <template v-if="state.bindType.value === 1">
            <!-- 搜索网卡名称/ID -->
            <el-form-item>
              <div style="flex: 1">
                <el-input v-model.trim="state.search" :placeholder="t('networkCard.searchNetworkCardIdOrName')">
                  <template #suffix>
                    <SvgIcon name="dns-search" class="cursor-pointer" @click="screenToEip" />
                  </template>
                </el-input>
                <el-radio-group v-model="state.checked" class="radio-table">
                  <el-table v-loading="state.loading" :data="state.list" class="mt20 table">
                    <!-- 名称 -->
                    <el-table-column min-width="200" :label="t('networkCard.name')">
                      <template #default="{ row }">
                        <el-radio :label="row.eniId">
                          <Copy :text="row.eniName" />
                        </el-radio>
                      </template>
                    </el-table-column>
                    <!-- ID -->
                    <el-table-column min-width="260" :label="t('ID')">
                      <template #default="{ row }">
                        <div>
                          <Copy :text="row.eniUuid" />
                        </div>
                      </template>
                    </el-table-column>
                    <!-- 所属子网 -->
                    <el-table-column min-width="180" :label="t('networkCard.belongingSubnet')">
                      <template #default="{ row }">
                        <div>
                          <span>{{ row.subnetName }}</span>
                        </div>
                      </template>
                    </el-table-column>
                    <!-- 网卡内网IP数 -->
                    <el-table-column min-width="260" :label="t('networkCard.networkCardIpNumber')">
                      <template #default="{ row }">
                        <div>{{ row.ipNums }}</div>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-radio-group>
              </div>
            </el-form-item>
          </template>

          <template v-else>
            <!-- 名称 -->
            <el-form-item :label="t('networkCard.name')" prop="name">
              <el-input
                v-model.trim="state.createForm.name"
                :placeholder="t('networkCard.namePlaceholder')"
                class="w100"
              />
            </el-form-item>

            <!-- 所在地域 -->
            <el-form-item :label="t('networkCard.whereLocation')" prop="regionId">
              <span>{{ state.regionName }}</span>
            </el-form-item>

            <!-- 所属网络 -->
            <el-form-item :label="t('networkCard.belongingNetwork')" prop="vpcId">
              <span>{{ state.createForm.vpcId }}({{ state.vpcName }})</span>
            </el-form-item>

            <!-- 所属子网 -->
            <el-form-item :label="t('networkCard.belongingSubnet')" prop="subnetId">
              <el-select
                v-model="state.createForm.subnetId"
                v-loading="state.subnetLoading"
                class="select-opts w100"
                :placeholder="t('networkCard.pleaseSelect')"
                @change="changeSubnet"
              >
                <el-option v-for="item in state.subnetOptions" :key="item.id" :label="item.label" :value="item.id">
                  <div class="df ac opt-wrap w-full h-full">
                    <div>{{ item.label }}</div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <!-- 可用区 -->
            <el-form-item :label="t('networkCard.zone')" prop="zoneId">
              <span>{{ state.zoneName }}</span>
            </el-form-item>

            <!-- 可分配IP数 -->
            <el-form-item :label="t('networkCard.assignableIpNumber')" prop="key">
              <div>
                <span>1/30</span>
                <span class="msg">{{ t('networkCard.subnetUsableIp', [state.usableIpCount]) }}</span>
              </div>
            </el-form-item>

            <!-- 分配IP -->
            <el-form-item :label="t('networkCard.assignIp')" prop="primaryIp">
              <div style="flex: 1">
                <!-- 主IP -->
                <div class="item df ac">
                  <div class="col1">
                    {{ t('networkCard.primaryIp') }}
                  </div>
                  <div class="col2">
                    <el-select
                      v-model="state.createForm.primaryIpType"
                      class="select-opts w190"
                      :placeholder="t('networkCard.placeSelect')"
                    >
                      <el-option v-for="item in ipOptions" :key="item.value" :label="item.label" :value="item.value">
                        <div class="df ac opt-wrap w-full h-full">
                          <div>{{ item.label }}</div>
                        </div>
                      </el-option>
                    </el-select>
                  </div>
                  <div v-if="state.createForm.primaryIpType === 1" class="col3">
                    {{ t('networkCard.systemAutomaticAllocationIp') }}
                  </div>
                  <el-input
                    v-else
                    v-model.trim="state.createForm.primaryIp"
                    :placeholder="t('networkCard.enterIpAddress')"
                    class="w100"
                  />
                </div>
                <!-- 现在不支持添加辅助ip -->
                <!-- 辅助IP -->
                <!-- <div class="item df ac">
                  <div class="col1">辅助IP</div>
                  <div class="col2">
                    <el-select class="select-opts" v-model="createForm.key" :placeholder="t('请选择')">
                      <el-option v-for="item in IpOpts" :key="item.value" :label="item.label" :value="item.value">
                        <div class="df ac opt-wrap w-full h-full">
                          <div>{{ item.label }}</div>
                        </div>
                      </el-option>
                    </el-select>
                  </div>
                  <div class="col3">
                    <el-input v-model.trim="createForm.search" :placeholder="'请输入弹性网卡名称'" />
                  </div>
                  <div class="col4">
                    <span class="text-primary cursor-pointer">删除</span>
                  </div>
                </div>

                !--增加一个辅助IP  --
                <div class="item df ac">
                  <span class="text-primary cursor-pointer"> +增加一个辅助IP </span>
                </div> -->
              </div>
            </el-form-item>

            <!-- 安全组 -->
            <el-form-item :label="t('networkCard.securityGroup')" prop="securityGroupId">
              <el-select
                v-model="state.createForm.securityGroupId"
                class="select-opts w100"
                :placeholder="t('networkCard.placeSelect')"
              >
                <el-option
                  v-for="item in state.securityGroupOptions"
                  :key="item.id"
                  :label="item.label"
                  :value="item.id"
                >
                  <div class="df ac opt-wrap w-full h-full">
                    <div>{{ item.label }}</div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-form>

        <!-- tip 底部tip不能有20px && 顶部距离表单要有20px-->
        <div v-if="state.bindType.value === 1" class="mt20">
          <Tip :text="tips" type="OneToMany" hide-margin-bottom />
        </div>
      </div>
    </div>
  </CatDialog>

  <CatDialog
    v-model:dialog="showB"
    :title="t('networkCard.prompt')"
    width="550px"
    destroy-on-close
    icon="warn-primary"
    :no-cancel="true"
    @confirm="tipComfirm"
    @close="tipComfirm"
  >
    <!-- 支付成功 -->
    <p class="dialog-text">
      {{ t('networkCard.paymentSuccessfulPrompt') }}
    </p>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { useCvmStore } from '@/store'
import { FormInstance, FormRules } from 'element-plus/es'
import { getInsBindEniList, eniBindVm, createEni, createEniBindIns } from '@/apis/network/network-card'
import { btnsGroupList, initCreateForm } from './config'
import { Form } from './type'
import { getQuerySubnetPage } from '@/apis/network/subnet'
import { getListSecurityGroup } from '@/apis/network/security-group'
import { getQuerySubnetDetail } from '@/apis/network/subnet'
import { ipv4Pattern, ipOptions } from '@/views/network/network-card/list/components/set-add/config'
import { InsBindEniListReq } from '@/apis/network/type/network-card'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const dialogMap = {
  [ja]: '900px',
  [en]: '820px',
  [zh]: '740px',
}

const btnsGroupMap = {
  [ja]: { width: '340px' },
  [en]: { width: '280px' },
  [zh]: { width: '180px' },
}

const dialogClass = useI18nStyle(dialogMap)
const btnsGroupClass = useI18nStyle(btnsGroupMap)

interface PropType {
  insDetail: any
}

const props = withDefaults(defineProps<PropType>(), {})

const emits = defineEmits<{
  (event: 'success'): void
}>()

const tips = computed(() => [
  {
    main: t('networkCard.beCareful'),
    sub: [t('networkCard.beCarefulTipOne'), t('networkCard.beCarefulTipTwo')],
  },
])

const cvmStore = useCvmStore()

const formRef = ref<FormInstance>()

const show = ref<boolean>(false) // 弹窗显示
const showB = ref<boolean>(false) // 弹窗显示

const state = reactive<{
  comfirmLoading: boolean
  loading: boolean // 弹性网卡列表loading
  list: any[] // 可绑定的弹性网卡
  bindType: { label: string; value: number } // 绑定方式
  search: string // 可绑定弹性网卡搜索关键词
  checked: number // 选择弹性网卡
  createForm: Form
  regionName: string // 地域名称
  zoneName: string // 可用区名称
  vpcName: string // 所属网络名称
  maxEniNums: number // 实例最大网卡个数
  maxIpNums: number // 网卡最大IP个数
  usableIpCount: number // 当前子网可用IP数
  subnetLoading: boolean // 获取子网列表loading
  subnetOptions: any[] // 子网列表
  reserveIpList: any[] // 子网厂商预留IP
  securityGroupLoading: boolean // 获取安全组列表loading
  securityGroupOptions: any[] // 安全组列表
  addKey: boolean
}>({
  comfirmLoading: false,
  loading: false,
  list: [],
  bindType: { label: t('networkCard.bindExistingNetworkCard'), value: 1 },
  search: '',
  checked: NaN,
  createForm: {
    ...initCreateForm,
  },
  regionName: '',
  zoneName: '',
  vpcName: '',
  maxEniNums: 0,
  maxIpNums: 0,
  usableIpCount: 0,
  subnetLoading: false,
  subnetOptions: [],
  reserveIpList: [],
  securityGroupLoading: false,
  securityGroupOptions: [],
  addKey: false,
})

const rules = reactive<FormRules<Form>>({
  name: [
    { required: true, message: '', trigger: 'blur' },
    {
      pattern: /^[\w\u4e00-\u9fa5.-]{1,60}$/,
      message: t('securityGroup.addNameCondition'),
      trigger: 'blur',
    },
    // {
    //   validator: (rule, value, callback) => {
    //     if (value === '') {
    //       callback(new Error(t('')))
    //     } else if (!/^[\w\u4e00-\u9fa5.-]{1,60}$/.test(value)) {
    //       callback(new Error(t('')))
    //     } else {
    //       callback()
    //     }
    //   },
    //   trigger: 'blur',
    // },
  ],
  vpcId: [{ required: true, message: '', trigger: 'blur' }],
  subnetId: [{ required: true, message: '', trigger: 'blur' }],
  securityGroupId: [{ required: true, message: '', trigger: 'blur' }],
  primaryIp: [
    {
      validator: (rule, value, callback) => {
        if (state.createForm.primaryIpType === 2) {
          if (value === '') {
            callback(new Error(t('')))
          } else if (!ipv4Pattern.test(value)) {
            callback(new Error(t('')))
          } else if (state.reserveIpList.findIndex(item => item === value) >= 0) {
            callback(new Error(t('')))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
    },
  ],
})

// 切换登录方式
const changeType = (btn: any) => {
  console.log('btn', btn.value, state.addKey)
  if (btn.value === 2 && !state.addKey) {
    state.addKey = true
    // 新建弹性网卡并绑定
    getSubnetList()
    getSecurityGroupList()
  }
}

// 获取实例允许绑定的网卡列表
const getEniList = async () => {
  const params: InsBindEniListReq = { insId: props.insDetail.id }
  if (state.search && Number.isFinite(Number(state.search))) {
    // 网卡ID
    params.eniUuid = state.search
  } else if (state.search && !Number.isFinite(Number(state.search))) {
    // 网卡名称
    params.eniName = state.search
  }
  state.loading = true
  try {
    const res = await getInsBindEniList(params)
    if (res.success) {
      state.list = res.data?.list || []
      state.maxEniNums = res.data?.maxEniNums || 0
      state.maxIpNums = res.data?.maxIpNums || 0
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    state.loading = false
  }
}

// 获取子网列表
const getSubnetList = async () => {
  const params = {
    regionId: props.insDetail.regionId,
    zoneId: props.insDetail.zoneId,
    vpcId: state.createForm.vpcId as number,
    pageIndex: 1,
    pageSize: 999,
  }
  state.subnetLoading = true
  try {
    const res = await getQuerySubnetPage(params)
    state.subnetLoading = false
    if (res.success) {
      state.subnetOptions = (res.data?.list || []).map(item => ({
        ...item,
        label: `${item.id}(${item.subnetName} | ${item.cidrBlock})`,
      }))
      if (state.subnetOptions.length > 0) {
        const item = state.subnetOptions[0]
        state.createForm.subnetId = item.id
        state.usableIpCount = item.usableIpCount
        getSubnetDetail()
      }
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.subnetLoading = false
    console.log('error', err)
  }
}

// 获取子网详情
const getSubnetDetail = async () => {
  const params = { subnetId: state.createForm.subnetId }
  try {
    const res = await getQuerySubnetDetail(params)
    if (res.success) {
      state.reserveIpList = res.data?.reserveIpList || []
    }
  } catch (err) {
    console.log('error', err)
  }
}

// 切换子网
const changeSubnet = val => {
  const item = state.subnetOptions.find(item => item.id === val)
  state.createForm.subnetId = item.id
  state.usableIpCount = item.usableIpCount
  getSubnetDetail()
}

// 获取安全组列表
const getSecurityGroupList = async () => {
  const params = { regionId: props.insDetail.regionId, pageIndex: 1, pageSize: 9999 }
  state.securityGroupLoading = true
  try {
    const res = await getListSecurityGroup(params)
    state.securityGroupLoading = false
    if (res.success) {
      state.securityGroupOptions = (res.data?.list || []).map(item => ({
        ...item,
        label: `${item.groupUuid} | ${item.name}`,
      }))
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.securityGroupLoading = false
    console.log('error', err)
  }
}

// 实例绑定网卡
const eniBindVmFn = async id => {
  const params = { insId: props.insDetail.id, eniId: id }
  state.comfirmLoading = true
  try {
    const res = await eniBindVm(params)
    if (res.success) {
      if (state.bindType.value === 1) {
        message.success(t('networkCard.bindNetworkSuccess'))
        closeFn()
        emits('success')
      } else {
        closeFn()
        showB.value = true
      }
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    state.comfirmLoading = false
  }
}
// 绑定弹性网卡
const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (state.bindType.value === 1) {
    // 绑定已有弹性网卡
    eniBindVmFn(state.checked)
  } else {
    // 新建弹性网卡并绑定
    if (!formEl) return
    await formEl.validate()
    const params = { ...state.createForm, insId: props.insDetail.id }
    state.comfirmLoading = true
    try {
      const res = await createEniBindIns(params)
      if (res.success) {
        message.success(t('networkCard.bindNetworkSuccess'))
        closeFn()
        emits('success')
      } else {
        message.warning(res.msg)
        state.comfirmLoading = false
        // const params = { ...state.createForm }
        // state.comfirmLoading = true
        // try {
        //   const res = await createEni(params)
        //   if (res.success && res.data?.eniId) {
        //     const id = res.data?.eniId
        //     eniBindVmFn(id)
        //   } else {
        //     message.warning(res.msg)
        //     state.comfirmLoading = false
      }
    } catch (err) {
      console.log('error', err)
      state.comfirmLoading = false
    }
  }
}

const tipComfirm = () => {
  emits('success')
  closeFn()
}

// 搜索弹性公网ip
const screenToEip = () => {
  getEniList()
}
// 弹窗打开
const open = () => {
  console.log(props, 'props')

  const networkInfo = props.insDetail.networkInfos.find(item => item.primaryType === 1)
  state.createForm = {
    ...initCreateForm,
    regionId: props.insDetail.regionId,
    zoneId: props.insDetail.zoneId,
    vpcId: networkInfo?.vpcId,
  }
  state.vpcName = networkInfo?.vpcName
  state.regionName = cvmStore.regionName
  state.zoneName = props.insDetail?.zoneName || ''
  getEniList()
}

const closeFn = () => {
  state.loading = false
  state.list = []
  state.bindType = { label: t('networkCard.bindExistingNetworkCard'), value: 1 }
  state.search = ''
  state.checked = NaN
  state.vpcName = ''
  state.maxEniNums = 0
  state.maxIpNums = 0
  state.usableIpCount = 0
  state.subnetLoading = false
  state.subnetOptions = []
  state.reserveIpList = []
  state.securityGroupLoading = false
  state.securityGroupOptions = []
  state.addKey = false
  formRef.value?.resetFields()
  show.value = false
  showB.value = false
  state.comfirmLoading = false
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.desc1 {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #000;
}

.desc2 {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #555;
}

.form-wrap {
  /* width: 55%; */
}

.opt-wrap {
  padding: 0 8px;

  &:hover {
    color: #0063ff;
    background: #f1f7ff;
  }
}

.item {
  // margin-bottom: 10px;

  .col1 {
    // flex-basis: 70px;
    min-width: 60px;
    margin-right: 10px;
  }

  .col2 {
    flex-basis: 190px;
    margin-right: 10px;
  }

  // .col3 {
  //   flex-basis: 300px;
  // }

  .col4 {
    margin-left: 10px;
  }
}

.dialog-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #999;
}

.radio-table {
  width: 100%;
}

.w400 {
  width: 400px;
}

.w190 {
  width: 195px;
}

.w300 {
  width: 300px;
}

.w550 {
  width: 550px;
}

.w100 {
  width: 100%;
}

:deep(.el-form .el-form-item .el-form-item__content .el-form-item__error) {
  position: absolute;
}
</style>
