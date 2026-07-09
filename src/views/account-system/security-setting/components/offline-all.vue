<template>
  <el-dialog
    v-model="dialogFormVisible"
    :title="t('securitySetting.confirmOfflineAllLoginStatus')"
    width="460"
    class="mobile-dialog"
  >
    <span>{{ t('securitySetting.confirmOfflineAllLoginStatusTips') }}</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleFn">
          {{ t('securitySetting.offlineImmediately') }}
        </el-button>
        <el-button @click="dialogFormVisible = false">
          {{ t('securitySetting.cancel') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { _offlineAllLoginStatus } from '@/apis/account-system/access/user'
import { goRoute, pushRoute } from '@/utils/router-jump'
const dialogFormVisible = ref<boolean>(false)
const router = useRouter()

const handleFn = async () => {
  const res = await _offlineAllLoginStatus()
  if (res.code === 10000) {
    dialogFormVisible.value = false
    pushRoute({ name: 'Login' }).then(() => {
      goRoute(-window.history.length - 1)
    })
  }
}

defineExpose({
  showDialog: () => {
    dialogFormVisible.value = true
  },
})
</script>
<style scoped lang="scss">
.dialog-footer {
  text-align: center;
}
</style>
