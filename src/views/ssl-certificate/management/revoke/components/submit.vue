<template>
  <el-form label-position="left" label-width="auto">
    <el-form-item label="通用名称"> 未命名 </el-form-item>
    <el-form-item label="证书种类"> DV </el-form-item>
    <el-form-item label="证书生效时间"> 2024-09-06 07:59:59 </el-form-item>
  </el-form>

  <el-divider style="border-color: #eee" />
  <el-form-item>
    <el-button type="primary" @click="onNext"> 下一步 </el-button>
    <el-button type="default" @click="router.back"> 取消 </el-button>
  </el-form-item>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
const router = useRouter()
const emits = defineEmits(['switchTab'])

const onNext = () => {
  emits('switchTab', { value: 1 })
  // TODO: 吊销证书
}
</script>

<style lang="scss" scoped>
.title {
  font-size: 16px;
  line-height: 22px;
  color: #000;
}
</style>
