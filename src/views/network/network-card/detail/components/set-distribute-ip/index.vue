<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('networkCard.allocationInternalIP')"
    :width="dialogWidth"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @open="open"
    @close="initFn"
  >
    <div class="form-wrap">
      <el-form
        ref="formRef"
        v-loading="loading"
        require-asterisk-position="right"
        label-width="auto"
        :model="form"
        :rules="rules"
        label-position="left"
      >
        <!-- 所属子网 -->
        <el-form-item :label="t('networkCard.belongingSubnet')" prop="oldName">
          {{ props.detail?.subnetName }}
        </el-form-item>
        <!-- 子网CIDR -->
        <el-form-item :label="t('networkCard.subnetCidr')" prop="oldName">
          {{ props.detail?.subnetCidr }}
        </el-form-item>
        <!-- 子网可用IP -->
        <el-form-item :label="t('networkCard.subnetAvailableIp')" prop="oldName">
          {{ props.subnetDetail?.usableIpCount }}
        </el-form-item>
        <!-- IP配额 -->
        <el-form-item :label="t('networkCard.ipQuota')" prop="oldName">
          {{ subnetDetail?.ipQuota }}
        </el-form-item>
        <!-- 可用配额 -->
        <el-form-item :label="t('networkCard.availableQuota')" prop="oldName">
          {{ (subnetDetail?.ipQuota || 0) - ipList.length }}
        </el-form-item>
        <!-- 分配IP -->
        <el-form-item :label="t('networkCard.assignIp')" prop="ip" class="ip-wrap">
          <div>
            <template v-for="(item, index) in form.ip" :key="item.type">
              <div :class="`ip-item df ac ${index > 0 ? 'mt10' : ''}`">
                <div class="ip-select" :style="selectWidth">
                  <el-select
                    v-model="item.type"
                    class="select-opts w-full"
                    :placeholder="t('networkCard.pleaseSelect')"
                    @change="changeType"
                  >
                    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                      <div class="df ac opt-wrap w-full h-full">
                        <div>{{ item.label }}</div>
                      </div>
                    </el-option>
                  </el-select>
                </div>
                <div class="ml10 w250">
                  <el-input
                    v-model="item.ip"
                    :disabled="item.type === 1"
                    :class="ipErrorList.indexOf(index) >= 0 ? 'is-error' : ''"
                  />
                </div>
                <span v-if="index > 0" class="text-primary cursor-pointer ml10" @click="removeFn(index)">{{
                  t('networkCard.delete')
                }}</span>
              </div>
            </template>
            <!-- 这里需要显示ip个数，限制数量为上面的可用配额，但是现在接口没有返回 所以写死了  后期需要替换为可用配额的值 -->
            <div v-if="form.ip.length < 5" class="mt10">
              <span class="text-primary cursor-pointer" @click="addFn">+{{ t('networkCard.newlyAdded') }}</span>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { FormRules } from 'element-plus/es/components/form/src/types'
import { ipv4Pattern } from '../../../list/components/set-add/config'
import { addIp } from '@/apis/network/network-card'
import { message } from '@/utils/message'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

interface PropType {
  detail: any
  subnetDetail: any
  ipList: any[]
}

interface Form {
  ip: { type: number; ip: string }[]
}

const options = [
  { label: t('networkCard.autoFill'), value: 1 },
  { label: t('networkCard.manuallyFillIn'), value: 2 },
]

const props = withDefaults(defineProps<PropType>(), {})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const dialogMap = {
  [ja]: '650px',
  [en]: '680px',
  [zh]: '550px',
}

const selectMap = {
  [ja]: { width: '120px' },
  [en]: { width: '160px' },
  [zh]: { width: '120px' },
}

const dialogWidth = useI18nStyle(dialogMap)
const selectWidth = useI18nStyle(selectMap)

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const loading = ref<boolean>(false)
const ipErrorList = ref<number[]>([])
const formRef = ref<any>()

const form = reactive<Form>({
  ip: [{ type: 1, ip: '' }],
})

const rules = reactive<FormRules<Form>>({
  ip: [
    {
      validator: (rule, value, callback) => {
        const arr: number[] = []
        // 这里配置ip不能在产商预留ip列表和子网已用ip列表中
        const ipList = [...(props.subnetDetail?.reserveIpList || []), ...props.subnetDetail.useIpList]
        form.ip.forEach((item, index) => {
          if (item.type === 1) return
          const key = ipv4Pattern.test(item.ip)
          if (!key || ipList.indexOf(item.ip) >= 0 || item.ip === '') {
            arr.push(index)
          }
        })
        ipErrorList.value = arr
        console.log('ipErrorList.value', ipErrorList.value)
        callback()
      },
    },
  ],
})

const changeType = () => {
  formRef.value.validateField('ip')
}

// 新增
const addFn = () => {
  form.ip.push({ type: 1, ip: '' })
}
// 删除
const removeFn = index => {
  form.ip.splice(index, 1)
}

const initFn = () => {
  ipErrorList.value = []
  form.ip = [{ type: 1, ip: '' }]
  comfirmLoading.value = false
  show.value = false
}

const confirmHandle = async () => {
  const params = { eniId: props.detail.eniId, ipList: form.ip }
  comfirmLoading.value = true
  try {
    const res = await addIp(params)
    comfirmLoading.value = false
    if (res.success) {
      message.success(t('networkCard.allocationInternalIPSuccess'))
      initFn()
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    comfirmLoading.value = false
    console.log('error', err)
  }
}
// 弹窗打开
const open = () => {}

defineExpose({
  show,
  loading,
})
</script>
<style scoped lang="scss">
.name-desc {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #999;
}

.ip-select {
  width: 120px;
}

.w250 {
  width: 250px;
}

.ml10 {
  margin-left: 10px;
}

.is-error {
  :deep(.el-input__inner) {
    border-color: #f56c6c;
  }
}
</style>
