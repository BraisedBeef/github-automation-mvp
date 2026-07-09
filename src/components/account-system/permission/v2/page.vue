<template>
  <slot v-if="checkPermissionRes" />
  <div v-else class="permission-page-v2">
    <div class="permission-page-v2__empty">
      <div class="permission-page-v2__icon">
        <SvgIcon name="v2-permission" />
      </div>
      <div class="permission-page-v2__title">
        {{ pageTitle }}
      </div>
      <div class="permission-page-v2__card">
        <div class="permission-page-v2__card-title">
          {{ t('prem.desc2') }}
        </div>
        <div class="permission-page-v2__card-desc">
          {{ normalizedDesc }}
        </div>
      </div>
      <el-button type="primary" class="permission-page-v2__reload" @click="refresh">
        <SvgIcon name="refresh" />
        <span>{{ t('prem.reload') }}</span>
      </el-button>
    </div>
    <PermissionDialog />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store'
import { message } from '@/utils/message'
import PermissionDialog from '../dialog.vue'
import t from '@/utils/i18n'

const route = useRoute()
const userStore = useUserStore()

const checkPermissionRes = computed(() => {
  const permissions = userStore?.user.permissions || []
  const accountType = userStore.user.accountType
  const pagePermissions = route.meta?.permissions as string[]

  if (accountType == 1) return true

  if (permissions.includes('**')) return true

  if (pagePermissions instanceof Array) {
    return pagePermissions.every(el => permissions.includes(el))
  }

  return true
})

const pageTitle = computed(() => {
  const titleKey = route.meta?.permissionPageTitleKey as string | undefined
  return titleKey ? t(titleKey) : t('prem.pageDesc')
})

const normalizedDesc = computed(() => t('prem.desc3').replace(/[；;]\s*$/, ''))

const refresh = () => {
  userStore.getUser().then(() => {
    message.success(t('prem.refreshSuccess'))
  })
}
</script>

<style lang="scss" scoped>
.permission-page-v2 {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 48px 16px;
  background: #fff;
}

.permission-page-v2__empty {
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center;
}

.permission-page-v2__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  color: #98a2b3;
  background: #f2f4f7;
  border-radius: 999px;
}

.permission-page-v2__icon :deep(svg) {
  width: 48px;
  height: 48px;
}

.permission-page-v2__title {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
  text-align: center;
}

.permission-page-v2__card {
  width: 400px;
  padding: 16px;
  background: #f9fafc;
}

.permission-page-v2__card-title {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.permission-page-v2__card-desc {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.permission-page-v2__reload {
  min-width: 92px;
}

.permission-page-v2__reload :deep(span) {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.permission-page-v2__reload :deep(svg) {
  width: 16px;
  height: 16px;
}

@media (width <= 768px) {
  .permission-page-v2 {
    padding: 32px 16px;
  }

  .permission-page-v2__card {
    width: 100%;
  }
}
</style>
