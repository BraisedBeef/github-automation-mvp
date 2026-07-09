<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('user.deleteUser')"
    width="630px"
    destroy-on-close
    :confirm-text="t('common.delete')"
    :loading="loading"
    @confirm="confirmHandle(formRef)"
    @update:dialog="closeHandle"
  >
    <el-row class="mb20">
      <el-col :span="24" class="primary-text">
        {{ t('user.deleteUserTip', [userName]) }}
      </el-col>
    </el-row>

    <el-row>
      <el-col v-for="(item, index) in tipText" :key="index" class="mb10">
        {{ item.desc }}
      </el-col>
    </el-row>

    <el-row class="mb20">
      <el-col>
        <span class="text-error">{{ t('user.deleteUserDesc1') }}</span
        ><span class="primary-text">{{ t('user.deleteUserDesc2') }}</span>
      </el-col>
    </el-row>

    <el-row class="mb20">
      <el-col :span="24">
        <span class="primary-text">{{ t('user.deleteUserDesc3') }}</span
        ><span class="primary-text bold">{{ t('user.deleteUserDesc4') }}</span>
      </el-col>
    </el-row>

    <el-form ref="formRef" :model="form" :rules="rules" label-position="left" require-asterisk-position="right">
      <el-form-item label="" prop="text">
        <el-input v-model.trim="form.text" :placeholder="t('user.deleteUserPlaceholder')" autocomplete="off" />
      </el-form-item>
    </el-form>
  </CatDialog>
</template>

<script lang="ts" setup>
import { message } from '@/utils/message'
import { _setStatus } from '@/apis/account-system/access/user'
import t from '@/utils/i18n'
import { FormInstance, FormRules } from 'element-plus/es'

interface Form {
  text: string
}

const props = withDefaults(
  defineProps<{
    ids: number[]
    list: any[]
  }>(),
  {
    ids: () => [],
    list: () => [],
  },
)

const emits = defineEmits<{
  (event: 'success'): void
}>()

// 校验文本
const checkText = (rule: any, value: any, callback: any) => {
  console.log(value)

  if (!value) {
    return callback('')
  } else if (value !== t('user.deleteUserPlaceholder')) {
    return callback(new Error(t('user.deleteUserIptWarn')))
  } else {
    callback()
  }
}

const show = ref<boolean>(false) // 弹窗显示
const loading = ref<boolean>(false)
const form = reactive<Form>({
  text: '',
})
const formRef = ref<FormInstance>()
const rules = reactive<FormRules<Form>>({
  text: [{ validator: checkText, trigger: 'blur' }],
})

const tipText = computed(() => {
  return [
    {
      desc: t('user.effect1'),
    },
    {
      desc: t('user.effect2'),
    },
    {
      desc: t('user.effect3'),
    },
  ]
})

const userName = computed(() => {
  return props.list.map(el => el.userName).join(',')
})

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid, fields) => {
    if (valid) {
      console.log('submit!')

      setStatus()
    } else {
      console.log('error submit!', fields)
      // message.warning(t('user.deleteUserIptWarn'))
    }
  })
}

const closeHandle = () => {
  form.text = ''
}

// 设置用户为删除状态
const setStatus = async () => {
  try {
    loading.value = true
    const res = await _setStatus({
      state: 2, // 用户状态( 1正常 2删除 3禁用)
      ids: props.ids,
    })

    console.log(`_setStatus===>`, res)

    if (res.success) {
      message.success(t('common.deleteSuccess'))
      show.value = false
      form.text = ''
      emits('success')
    } else {
      message.warning(t('role.deleteFail'))
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.el-form-item {
  height: 34px;
  margin-bottom: 20px;
}

.primary-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--primary-text);
}

.bold {
  font-weight: bold;
}
</style>
