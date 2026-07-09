<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('networkCard.editPrimaryIp')"
    :width="dialogClass"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="() => {}"
    @open="open"
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
          {{ props.detail.subnetName }}
        </el-form-item>
        <!-- 子网CIDR -->
        <el-form-item :label="t('networkCard.subnetCidr')" prop="oldName">
          {{ props.detail.subnetCidr }}
        </el-form-item>
        <!-- 当前主IP -->
        <el-form-item :label="t('networkCard.currentPrimaryIp')" prop="oldName">
          {{ editData?.ip }}
        </el-form-item>
        <!-- 新IP -->
        <el-form-item :label="t('networkCard.newIp')" prop="ip" class="ip-wrap">
          <div class="w430">
            <el-input v-model="form.ip" />
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
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const dialogMap = {
  [ja]: '610px',
  [en]: '610px',
  [zh]: '550px',
}

const dialogClass = useI18nStyle(dialogMap)

interface PropType {
  detail: any
  reserveIpList: any[]
}

interface Form {
  ip: string
}

const props = withDefaults(defineProps<PropType>(), {})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const loading = ref<boolean>(false)
const editData = ref<any>()

const form = reactive<Form>({
  ip: '',
})

const rules = reactive<FormRules<Form>>({
  ip: {
    validator: (rule, value, callback) => {
      if (value === '') {
        callback(new Error(t('')))
      } else if (!ipv4Pattern.test(value)) {
        callback(new Error(t('')))
      } else if (props.reserveIpList.findIndex(item => item === value) >= 0) {
        callback(new Error(t('')))
      } else {
        callback()
      }
    },
  },
})

const formRef = ref<any>()

const confirmHandle = async () => {
  await formRef.value?.validate()
  const params = {
    eniId: props.detail?.eniId,
    privateIpId: editData.value?.id,
    ip: form.ip,
  }
  console.log('params', params)
  // ---------- 没有修改主ip的接口  找苏杰 ----------
}
// 弹窗打开
const open = () => {}

defineExpose({
  show,
  editData,
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

.w430 {
  width: 430px;
}

.ml10 {
  margin-left: 10px;
}
</style>
