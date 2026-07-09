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
    <p class="title mb20 df ac">
      <SvgIcon style="width: 24px; height: 24px" class="mr4" name="tip-error" />{{
        t('prem.desc1', [t(userStore.permissionDialog.i18nKey)])
      }}
    </p>
    <p class="title">
      {{ t('prem.desc2') }}
    </p>
    <p class="desc">
      {{ t('prem.desc3') }}
    </p>
  </CatDialog>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import t from '@/utils/i18n'

const userStore = useUserStore()

const show = ref<boolean>(true)

const confirmHandle = () => {
  userStore.setPermission({
    show: false,
    i18nKey: userStore.permissionDialog.i18nKey,
  })
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.title {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  color: var(--primary-text);
}

.desc {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  color: var(--common-text);
}
</style>
