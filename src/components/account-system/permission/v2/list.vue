<template>
  <slot v-if="checkPermissionRes" />
  <div v-else class="permission-list-v2">
    <div class="permission-list-v2__empty">
      <div class="permission-list-v2__icon">
        <SvgIcon name="v2-permission" />
      </div>
      <div class="permission-list-v2__title">
        {{ t('prem.desc1', [t(i18nKey)]) }}
      </div>
      <div class="permission-list-v2__card">
        <div class="permission-list-v2__card-title">
          {{ t('prem.desc2') }}
        </div>
        <div class="permission-list-v2__card-desc">
          {{ normalizedDesc }}
        </div>
      </div>
      <el-button type="primary" class="permission-list-v2__reload" @click="refresh">
        <SvgIcon name="refresh" />
        <span>{{ t('prem.reload') }}</span>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store'
import { message } from '@/utils/message'
import { usePermission } from '../use-permission'
import t from '@/utils/i18n'

const props = withDefaults(
  defineProps<{
    perm: string
    i18nKey: string
  }>(),
  {
    perm: '',
    i18nKey: '',
  },
)

const emits = defineEmits<{
  (event: 'refresh'): void
}>()

const userStore = useUserStore()
const { checkPermissionRes } = usePermission(props.perm)

const normalizedDesc = computed(() => t('prem.desc3').replace(/[；;]\s*$/, ''))

const refresh = () => {
  userStore.getUser().then(() => {
    message.success(t('prem.refreshSuccess'))
    emits('refresh')
  })
}
</script>

<style lang="scss" scoped>
.permission-list-v2 {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  padding: 32px 16px;
  background: #fff;
}

.permission-list-v2__empty {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}

.permission-list-v2__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  color: #98a2b3;
  background: #f2f4f7;
  border-radius: 999px;
}

.permission-list-v2__icon :deep(svg) {
  width: 40px;
  height: 40px;
}

.permission-list-v2__title {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
  text-align: center;
}

.permission-list-v2__card {
  width: 400px;
  padding: 16px;
  background: #f9fafc;
}

.permission-list-v2__card-title {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.permission-list-v2__card-desc {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.permission-list-v2__reload {
  min-width: 92px;
}

.permission-list-v2__reload :deep(span) {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.permission-list-v2__reload :deep(svg) {
  width: 16px;
  height: 16px;
}

@media (width <= 768px) {
  .permission-list-v2__card {
    width: 100%;
  }
}
</style>
