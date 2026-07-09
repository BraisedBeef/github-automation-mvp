<template>
  <div class="lock bgcf pd20">
    <div class="d-title">
      {{ t('domain.batch-operate.637445-0') }}
    </div>
    <DomainChoose ref="domainRef" v-model="domain" />

    <div class="d-title">
      {{ t('domain.batch-operate.637445-1') }}
    </div>
    <div class="mt20 mb10 df ac">
      <el-switch v-model="form.lock" :active-value="1" :inactive-value="2" />
      <div class="ml10" style="color: var(--primary-text)">
        {{ t('domain.batch-operate.637445-2') }}
      </div>
    </div>
    <el-text type="info">
      {{ t('domain.batch-operate.637445-3') }}
    </el-text>
    <div class="border-btn">
      <el-button type="primary" @click="send">
        {{ t('domain.batch-operate.637445-4') }}
      </el-button>
    </div>
    <LockVerifyDialog
      v-model:dialog="dialogLockVerify.show"
      :domain-list="dialogLockVerify.selectedData"
      :lock-state="dialogLockVerify.lock"
      :title="dialogLockVerify.title"
    />
  </div>
</template>

<script setup lang="ts">
import DomainChoose from './domain-choose.vue'
import LockVerifyDialog from '@/views/domain/components/lock-verify-dialog.vue'
import t from '@/utils/i18n'

const domain = ref('')
const domainRef = ref<any>(null)
const form = reactive<{ lock: 1 | 2 }>({ lock: 1 })

const dialogLockVerify = reactive<{ title?: string; selectedData: string[]; show: boolean; lock: 1 | 2 }>({
  title: t('domain.components.498323-0'),
  selectedData: [],
  show: false,
  lock: 1,
})

const send = async () => {
  if (!(await domainRef.value.domainRef.validate(b => b))) return
  dialogLockVerify.selectedData = domain.value.trim().split('\n')
  dialogLockVerify.show = true
  dialogLockVerify.lock = form.lock
  dialogLockVerify.title = t('domain.components.498323-0')
}
</script>

<style lang="scss" scoped>
@import '@/views/domain/config';

.el-switch {
  width: 36px;
}
</style>
