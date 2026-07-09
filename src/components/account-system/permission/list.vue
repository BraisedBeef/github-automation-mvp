<template>
  <component :is="currentComponent" :perm="perm" :i18n-key="i18nKey" @refresh="$emit('refresh')">
    <slot />
  </component>
</template>

<script setup lang="ts">
import LegacyPermissionList from './v1/list.vue'
import V2PermissionList from './v2/list.vue'
import { useThemeVersion } from '@/hooks/use-theme-version'

withDefaults(
  defineProps<{
    perm: string
    i18nKey: string
  }>(),
  {
    perm: '',
    i18nKey: '',
  },
)

defineEmits<{
  (event: 'refresh'): void
}>()

const { isV2Theme, syncThemeVersion } = useThemeVersion()

const currentComponent = computed(() => (isV2Theme.value ? V2PermissionList : LegacyPermissionList))

onBeforeMount(() => {
  syncThemeVersion()
})
</script>
