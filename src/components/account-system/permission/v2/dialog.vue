<template>
  <CatDialog
    v-model:dialog="userStore.permissionDialog.show"
    :title="t('prem.dialogHint')"
    width="600px"
    destroy-on-close
    :confirm-text="t('prem.dialogConfirmText')"
    :no-cancel="true"
    @confirm="confirmHandle"
    @update:dialog="() => {}"
  >
    <div class="permission-dialog-v2">
      <p class="permission-dialog-v2__title">
        <SvgIcon class="permission-dialog-v2__icon" name="tip-error" />
        <span>{{ t('prem.desc1', [t(userStore.permissionDialog.i18nKey)]) }}</span>
      </p>
      <div class="permission-dialog-v2__card">
        <p class="permission-dialog-v2__card-title">
          {{ t('prem.desc2') }}
        </p>
        <p class="permission-dialog-v2__card-desc">
          {{ normalizedDesc }}
        </p>
      </div>
    </div>
  </CatDialog>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import t from '@/utils/i18n'

const userStore = useUserStore()

const normalizedDesc = computed(() => t('prem.desc3').replace(/[；;]\s*$/, ''))

const confirmHandle = () => {
  userStore.setPermission({
    show: false,
    i18nKey: userStore.permissionDialog.i18nKey,
  })
}
</script>

<style lang="scss" scoped>
.permission-dialog-v2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.permission-dialog-v2__title {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.permission-dialog-v2__icon {
  width: 24px;
  height: 24px;
}

.permission-dialog-v2__card {
  padding: 16px;
  background: #f9fafc;
}

.permission-dialog-v2__card-title,
.permission-dialog-v2__card-desc {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
}

.permission-dialog-v2__card-title {
  margin-bottom: 8px;
  color: #191c23;
}

.permission-dialog-v2__card-desc {
  color: #828b9c;
}
</style>
