<template>
  <slot v-if="checkPermissionRes" />
  <div v-else class="bg df ac jc">
    <div>
      <p class="title mb20 df ac">
        <SvgIcon style="width: 24px; height: 24px" class="mr4" name="tip-error" />
        {{ t('prem.desc1', [t(i18nKey)]) }}
      </p>
      <p class="title mb20">
        {{ t('prem.desc2') }}
      </p>
      <p class="desc mb20">
        {{ t('prem.desc3') }}
      </p>
      <el-button class="btn" type="primary" @click="refresh">
        {{ t('prem.reload') }}
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

const refresh = () => {
  userStore.getUser().then(() => {
    message.success(t('prem.refreshSuccess'))
    emits('refresh')
  })
}
</script>

<style lang="scss" scoped>
.bg {
  background: #fff;
}

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
