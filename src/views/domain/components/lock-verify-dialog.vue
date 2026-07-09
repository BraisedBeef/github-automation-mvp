<template>
  <CatDialog
    v-model:dialog="lock.show"
    :loading="lock.loading"
    :disabled="lock.form.code === '' || lock.form.code.length !== 6 || lock.table.length === 0"
    :title="props.title"
    width="760px"
    destroy-on-close
    @confirm="updateLock"
  >
    <div style="font-size: 16px; color: var(--common-text)">
      {{ t('domain.components.498323-1') }}
    </div>
    <CatCdnTable :data="lock.table" class="mt20">
      <el-table-column prop="domain" :label="t('domain.components.498323-2')" />
      <el-table-column prop="lock" :label="t('domain.components.498323-3')">
        <template #default="{ row }">
          <span v-show="row.is_owner === 1">{{
            row.lock === 1 ? t('domain.components.498323-4') : t('domain.components.498323-5')
          }}</span>
          <el-text v-show="row.is_owner === 2" type="danger">
            {{ t('domain.components.498323-6') }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="domain" :label="t('domain.components.498323-7')">
        <template #default="{ row }">
          <span v-show="row.is_owner === 1">{{
            props.lockState === 1 ? t('domain.components.498323-4') : t('domain.components.498323-5')
          }}</span>
          <el-text v-show="row.is_owner === 2" type="danger">
            {{ t('domain.components.498323-6') }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="domain" :label="t('domain.components.498323-8')">
        <template #default="{ $index }">
          <el-link :disabled="lock.table.length <= 1" type="primary" @click="lock.table.splice($index, 1)">
            {{ t('domain.components.498323-9') }}
          </el-link>
        </template>
      </el-table-column>
    </CatCdnTable>
    <div class="mt20" style="font-weight: 700">
      {{ t('domain.components.498323-10') }}
    </div>
    <el-form :model="lock.form" label-position="left" label-width="auto" class="mt20">
      <el-form-item :label="t('domain.components.498323-11')">
        {{ lock.form.email }}
      </el-form-item>
      <el-form-item :label="t('domain.components.498323-12')">
        <div class="df ac">
          <el-input v-model="lock.form.code" clearable class="mr20" style="width: 300px" />
          <el-button :disabled="lockVerifyCodeTimer.timer !== undefined" type="primary" @click="getLockVerify">
            {{ t('domain.components.498323-13') }}
            {{ lockVerifyCodeTimer.timer !== undefined ? `(${lockVerifyCodeTimer.Countdown})` : '' }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>
  </CatDialog>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store'
import { _domainOwnership, _updateLock, _getLockVerify, _updateLockSign } from '@/apis/domain'
import { message } from '@/utils/message'
import t from '@/utils/i18n'

const userStore = useUserStore()
const props = withDefaults(
  defineProps<{
    title: string
    dialog: boolean
    domainList: string[]
    lockState: 1 | 2
  }>(),
  {
    title: t('domain.components.498323-0'),
    dialog: false,
    domainList: () => [],
  },
)

const emit = defineEmits<{
  (event: 'update:dialog', value: boolean): void
  (event: 'success', lockState: 1 | 2): void
  (event: 'cancel'): void
}>()

const lock = reactive<{
  show: boolean
  loading: boolean
  table: any[]
  form: any
}>({
  show: false,
  loading: false,
  table: [],
  form: { email: userStore.user.email, code: '' },
})

const domainOwnership = async () => {
  lock.loading = true
  const { data, code, message } = await _domainOwnership({
    domains: props.domainList,
  })
  if (code === 20000) {
    lock.table = data.list
  } else {
    message.error(message || t('domain.components.498323-14'))
  }
  lock.loading = false
}

const lockVerifyCodeTimer = reactive<{ timer?: number; Countdown: number }>({
  timer: undefined,
  Countdown: 60,
})
const getLockVerify = async () => {
  try {
    const { code, message: msg } = await _getLockVerify()
    if (code === 20000) {
      lockVerifyCodeTimer.Countdown = 60
      lockVerifyCodeTimer.timer = setInterval(() => {
        lockVerifyCodeTimer.Countdown -= 1
        if (lockVerifyCodeTimer.Countdown === 0) {
          clearInterval(lockVerifyCodeTimer.timer)
          lockVerifyCodeTimer.timer = undefined
        }
      }, 1000) as unknown as number
      message.success(t('domain.components.498323-15'))
    } else {
      message.error(msg || t('domain.components.498323-16'))
    }
  } catch (error) {
    message.error(t('domain.components.498323-17'))
  }
}
onUnmounted(() => {
  if (lockVerifyCodeTimer.timer) {
    clearInterval(lockVerifyCodeTimer.timer)
    lockVerifyCodeTimer.timer = undefined
  }
})

const updateLock = async () => {
  if (!lock.table.every(v => v.is_owner === 1)) {
    message.error(t('domain.components.498323-18'))
    return
  }
  lock.loading = true
  let _fn, datas
  // TODO 不同的修改方式会产生不同的操作记录，需要做区分
  // if (lock.table.length === 1) {
  //   // 单个域名锁定/解锁
  //   _fn = _updateLockSign
  //   datas = {
  //     id: lock.table[0].id,
  //   }
  // } else {
  // 批量域名锁定/解锁
  _fn = _updateLock
  datas = {
    ids: lock.table.map(v => v.id),
  }
  // }

  const { code, message: msg } = await _fn({
    ...datas,
    lock: props.lockState,
    code: lock.form.code,
  })
  if (code === 20000) {
    message.success(msg || t('domain.components.498323-19'))
    setTimeout(() => {
      lock.show = false
      emit('success', props.lockState)
    }, 100)
  } else {
    message.error(msg || t('domain.components.498323-20'))
  }
  lock.loading = false
}

// 监听props.dialog变化, 打开弹窗时请求域名信息
watch(
  () => props.dialog,
  () => {
    lock.show = props.dialog
    if (props.dialog && props.domainList.length > 0) domainOwnership()
  },
)
// 监听lock.show变化, 关闭弹窗时清空数据
watch(
  () => lock.show,
  () => {
    if (!lock.show) {
      lock.table = []
      lock.loading = false
      lock.form.code = ''
      emit('cancel')
      emit('update:dialog', lock.show)
    }
  },
)
</script>
