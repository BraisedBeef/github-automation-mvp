<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('user.disableUser')"
    width="640px"
    destroy-on-close
    :confirm-text="t('user.disable')"
    :loading="loading"
    :disabled="accessMethod != 1"
    @confirm="confirmHandle"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <el-row class="mb20">
      <el-col class="primary-text">
        {{ t('user.disableUserDesc1') }}
      </el-col>
    </el-row>

    <el-row>
      <el-col>
        <span class="primary-text">{{ t('user.accessStatus') }} </span>
        <span v-if="accessMethod == 1" class="text-success">{{ t('common.start') }}</span>
        <span v-else class="text-error">{{ t('user.close') }}</span>
      </el-col>
    </el-row>
  </CatDialog>
</template>

<script lang="ts" setup>
import { message } from '@/utils/message'
import { _updateSecuritySetting } from '@/apis/account-system/access/user'
import t from '@/utils/i18n'

const props = withDefaults(
  defineProps<{
    id: number
    accessMethod: number
  }>(),
  {
    id: 0,
    accessMethod: 1,
  },
)

const emits = defineEmits<{
  (event: 'success'): void
}>()

const show = ref<boolean>(false) // 弹窗显示
const loading = ref<boolean>(false)

const tips = computed(() => [
  {
    main: t('user.disableTip1'),
    sub: [t('user.disableTip2')],
  },
])

const confirmHandle = () => {
  updateSecuritySetting()
}

// 安全设置
const updateSecuritySetting = async () => {
  try {
    loading.value = true
    const res = await _updateSecuritySetting({
      uid: props.id,
      accessMethod: 0, // 当前只需要禁用
    })

    console.log(`_updateSecuritySetting===>`, res)

    if (res.success) {
      message.success(t('user.disableSuccess'))
      show.value = false
      emits('success')
    } else {
      message.warning(t('user.disableFail'))
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
.primary-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--primary-text);
}
</style>
