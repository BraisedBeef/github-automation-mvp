<template>
  <el-config-provider :locale="UIlanguage">
    <CatLoading v-if="loading" />
    <RouterView v-else />
    <ThemeVersionSwitch />
  </el-config-provider>
</template>
<script lang="ts" setup>
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useI18n } from 'vue-i18n'
import { useHtmlTitle } from '@/hooks/use-html-title'
import { useStorageSync } from '@/hooks/use-storage-sync'
import ThemeVersionSwitch from '@/components/common/theme-version-switch/index.vue'

const { locale } = useI18n()
const router = useRouter()
const loading = ref(true)
useHtmlTitle()

useStorageSync()

onMounted(() => {
  router.isReady().then(() => {
    loading.value = false
  })
})

const UIlanguage = computed(() => {
  return LANGUAGE_MAP[locale.value].data
})
</script>

<style lang="scss">
#app {
  min-width: var(--app-min-width);
  height: 100%;
}
</style>
<style></style>
