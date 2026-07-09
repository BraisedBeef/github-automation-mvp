<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('networkCard.addNetworkCard')"
    :width="dialogWidth"
    :loading="state.comfirmLoading"
    @confirm="confirmHandle"
    @open="open"
    @close="closeFn"
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
        <!-- 名称 -->
        <el-form-item :label="t('networkCard.name')" prop="name">
          <div class="w100">
            <el-input v-model="state.form.name" :placeholder="t('networkCard.namePlaceholder')" />
          </div>
        </el-form-item>
        <!-- 所属地域 -->
        <el-form-item :label="t('networkCard.regionalAffiliation')" prop="regionId">
          <p>{{ cvmStore.areaSelect.regionName }}</p>
        </el-form-item>
        <!-- 所属网络 -->
        <el-form-item :label="t('networkCard.belongingNetwork')" prop="vpcId">
          <div class="w100">
            <el-select
              v-model="state.form.vpcId"
              v-loading="state.vpcLoading"
              class="select-opts w-full"
              :placeholder="t('networkCard.pleaseSelect')"
            >
              <el-option v-for="item in state.vpcOptions" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </div>
        </el-form-item>
        <!-- 所属子网 -->
        <el-form-item :label="t('networkCard.belongingSubnet')" prop="subnetId">
          <div class="w100">
            <el-select
              v-model="state.form.subnetId"
              v-loading="state.subnetLoading"
              class="select-opts w-full"
              :placeholder="t('networkCard.pleaseSelect')"
              @change="changeSubnet"
            >
              <el-option v-for="item in state.subnetOptions" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </div>
        </el-form-item>
        <!-- 所在地区 -->
        <el-form-item :label="t('networkCard.area')" prop="zoneId">
          <p>{{ state.zoneName }}</p>
        </el-form-item>
        <!-- 可分配IP数 -->
        <el-form-item :label="t('networkCard.assignableIpNumber')" prop="usableIpCount">
          <div>
            <span>1/30</span>
            <span class="msg"> {{ t('networkCard.subnetAvailableIpNumber', [state.usableIpCount]) }}</span>
          </div>
        </el-form-item>
        <!-- 分配IP -->
        <el-form-item :label="t('networkCard.assignIp')" prop="primaryIp">
          <div class="df ac">
            <p class="mr20">
              {{ t('networkCard.primaryIp') }}
            </p>
            <div class="w140 mr20">
              <el-select
                v-model="state.form.primaryIpType"
                v-loading="state.securityGroupLoading"
                class="select-opts w-full"
                :placeholder="t('networkCard.pleaseSelect')"
              >
                <el-option v-for="item in ipOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>
            <p v-if="state.form.primaryIpType === 1">
              {{ t('networkCard.automaticAllocateIp') }}
            </p>
            <div v-else class="w300">
              <el-input v-model="state.form.primaryIp" :placeholder="t('networkCard.enterIpAddress')" />
            </div>
          </div>
          <!-- 苏杰说暂时不支持添加辅助ip -->
          <!-- <div class="df ac mt20" v-for="(item, index) in form.subIP" :key="item.type">
              <p class="w60">辅助IP</p>
              <div class="w140 mr20">
                <el-select class="select-opts w-full" v-model="item.type" :placeholder="t('请选择')">
                  <el-option v-for="val in ipOptions" :key="val.value" :label="val.label" :value="val.value">
                    <div class="df ac opt-wrap w-full h-full">
                      <div>{{ val.label }}</div>
                    </div>
                  </el-option>
                </el-select>
              </div>
              <div class="w300 mr10">
                <el-input v-model="item.text" :disabled="item.type === 1" placeholder="请输入IP地址"></el-input>
              </div>
              <span class="text-primary cursor-pointer" @click="remarkFn(index)">删除</span>
            </div>
            <div class="mt23 w-100">
              <span class="text-primary cursor-pointer" @click="addIpFn">增加一个辅助IP</span>
            </div> -->
        </el-form-item>
        <!-- 安全组 -->
        <el-form-item :label="t('networkCard.securityGroup')" prop="securityGroupId">
          <div class="w100">
            <el-select
              v-model="state.form.securityGroupId"
              class="select-opts w-full"
              :placeholder="t('networkCard.pleaseSelect')"
            >
              <el-option
                v-for="item in state.securityGroupOptions"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              />
            </el-select>
          </div>
        </el-form-item>
      </el-form>
      <div class="mt20">
        <!-- tip -->
        <Tip :text="tips" type="OneToOne" hide-margin-bottom />
      </div>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { FormInstance, FormRules } from 'element-plus/es'
import { useCvmStore } from '@/store'
import { getQueryVpcPage } from '@/apis/network/private-network'
import { getQuerySubnetPage } from '@/apis/network/subnet'
import { getListSecurityGroup } from '@/apis/network/security-group'
import { message } from '@/utils/message'
import { ipOptions, initForm, ipv4Pattern } from './config'
import { createEni } from '@/apis/network/network-card'
import { CreateEniReq } from '@/apis/network/type/network-card'
import { getQuerySubnetDetail } from '@/apis/network/subnet'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

interface PropType {
  regionId: number
}

const props = withDefaults(defineProps<PropType>(), {})

const emits = defineEmits<{
  (event: 'success'): void
}>()

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const dialogMap = {
  [ja]: '690px',
  [en]: '780px',
  [zh]: '670px',
}

const dialogWidth = useI18nStyle(dialogMap)

const cvmStore = useCvmStore()

const tips = computed(() => [
  {
    main: t('networkCard.addNetworkCardTip'),
  },
])

const formRef = ref<FormInstance>()
const show = ref<boolean>(false) // 弹窗显示

const state = reactive<{
  comfirmLoading: boolean
  form: CreateEniReq
  zoneName: string
  usableIpCount: number | string
  vpcOptions: any[]
  vpcLoading: boolean
  subnetOptions: any[]
  reserveIpList: any[] // 子网厂商预留IP
  subnetLoading: boolean
  securityGroupOptions: any[]
  securityGroupLoading: boolean
}>({
  comfirmLoading: false,
  form: { ...initForm, regionId: props.regionId },
  zoneName: '',
  usableIpCount: '',
  vpcOptions: [],
  vpcLoading: false,
  subnetOptions: [],
  reserveIpList: [],
  subnetLoading: false,
  securityGroupOptions: [],
  securityGroupLoading: false,
})

const rules = reactive<FormRules<CreateEniReq>>({
  name: [
    { required: true, message: '', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error(t('')))
        } else if (!/^[\w\u4e00-\u9fa5.-]{1,60}$/.test(value)) {
          callback(new Error(t('securityGroup.addNameCondition')))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  vpcId: [{ required: true, message: '', trigger: 'blur' }],
  subnetId: [{ required: true, message: '', trigger: 'blur' }],
  securityGroupId: [{ required: true, message: '', trigger: 'blur' }],
  primaryIp: [
    {
      validator: (rule, value, callback) => {
        if (state.form.primaryIpType === 2) {
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

// 获取私网列表
const getVpcList = async () => {
  const params = { pageIndex: 1, pageSize: 9999, regionId: props.regionId }
  state.vpcLoading = true
  try {
    const res = await getQueryVpcPage(params)
    state.vpcLoading = false
    if (res.success) {
      state.vpcOptions = (res.data?.list || []).map(item => ({
        ...item,
        label: `${item.vpcUuid}(${item.vpcName} | ${item.cidrBlock})`,
      }))
      if (state.vpcOptions.length > 0) {
        state.form.vpcId = state.vpcOptions[0].id
      }
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.vpcLoading = false
    console.log('error', err)
  }
}

// 获取子网列表
const getSubnetList = async () => {
  const params = { regionId: props.regionId, vpcId: state.form.vpcId as number, pageIndex: 1, pageSize: 9999 }
  state.subnetLoading = true
  try {
    const res = await getQuerySubnetPage(params)
    state.subnetLoading = false
    if (res.success) {
      state.subnetOptions = (res.data?.list || []).map(item => ({
        ...item,
        label: `${item.subnetUuid}(${item.subnetName} | ${item.cidrBlock})`,
      }))
      if (state.subnetOptions.length > 0) {
        const item = state.subnetOptions[0]
        state.form.zoneId = item.zoneId
        state.form.subnetId = item.id
        state.zoneName = item.zoneName
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
  const params = { subnetId: state.form.subnetId }
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
  state.form.zoneId = item.zoneId
  state.form.subnetId = item.id
  state.zoneName = item.zoneName
  state.usableIpCount = item.usableIpCount
  getSubnetDetail()
}

// 获取安全组列表
const getSecurityGroupList = async () => {
  const params = { regionId: props.regionId, pageIndex: 1, pageSize: 9999 }
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

watch(
  () => state.form.vpcId,
  () => {
    if (state.form.vpcId !== '') {
      getSubnetList()
    }
  },
)

// 删除
// const remarkFn = (index) => {
//   form.subIP.splice(index, 1)
// }
// 增加一个辅助IP
// const addIpFn = () => {
//   form.subIP.push({ type: 1, text: '' })
// }

const initializeFn = () => {
  formRef.value?.clearValidate()
  state.comfirmLoading = false
  state.form = { ...initForm, regionId: props.regionId }
  state.zoneName = ''
  state.usableIpCount = ''
  state.vpcOptions = []
  state.vpcLoading = false
  state.subnetOptions = []
  state.subnetLoading = false
  state.securityGroupOptions = []
  state.securityGroupLoading = false
}

const confirmHandle = async () => {
  await formRef.value?.validate()
  const params = { ...state.form }
  state.comfirmLoading = true
  try {
    const res = await createEni(params)
    state.comfirmLoading = false
    if (res.success) {
      message.success(t('networkCard.addNetworkCardSuccess'))
      initializeFn()
      show.value = false
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
  initializeFn()
  show.value = false
}

// 弹窗打开
const open = () => {
  state.form.regionId = props.regionId
}

defineExpose({
  show,
  getVpcList,
  getSecurityGroupList,
})
</script>

<style lang="scss" scoped>
.w100 {
  width: 100%;
}

.msg {
  color: #999;
}

.w60 {
  width: 60px;
}

.w140 {
  width: 140px;
}

.w300 {
  width: 300px;
}

.mr10 {
  margin-right: 10px;
}

.mt23 {
  margin-top: 23px;
}

.w-100 {
  width: 100%;
}

.w300 {
  width: 300px;
}

.mr20 {
  margin-right: 20px;
}

:deep(.el-form-item__error) {
  line-height: initial !important;
}

:deep(.el-form .el-form-item .el-form-item__content .el-form-item__error) {
  position: absolute;
}
</style>
