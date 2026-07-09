<template>
  <div class="env-product-url">
    <div class="product-url-title">修改当前请求地址</div>
    <div class="product-url-content">
      <el-input v-model.trim="state.productURL" placeholder="输入请求地址" />
      <el-button type="primary" :disabled="disabled1" @click="update"> 更改 </el-button>
      <el-button type="primary" :disabled="state.productURL === defaultURL" @click="reset"> 恢复默认 </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { httpUrl } from '@/config/base-config'
import { getSessionItemRaw, setSessionItemRaw } from '@/utils/storage'

const defaultURL = httpUrl
const state = reactive<{
  productURL: string
}>({
  productURL: '',
})
const update = () => {
  // if (import.meta.env.MODE === "dev") {
  //   message.warning("本地环境不允许更改请求地址!");
  //   return;
  // }
  // 存放
  setSessionItemRaw('prod-url', state.productURL)
  nextTick(() => {
    console.log('update prod-url')

    location.reload()
  })
}

const reset = () => {
  const u = state.productURL
  if (!u || u === defaultURL) return
  setSessionItemRaw('prod-url', defaultURL)
  nextTick(() => {
    console.log('reset prod-url')

    location.reload()
  })
}

const disabled1 = computed(() => {
  return !state.productURL || state.productURL === defaultURL
})

onMounted(() => {
  state.productURL = getSessionItemRaw('prod-url') || defaultURL
})
</script>

<style scoped lang="scss">
.env-product-url {
  .product-url-title {
    // font-weight: 500;
    margin-bottom: 14px;
    font-size: 16px;
  }

  .product-url-content {
    display: flex;

    :deep(.el-input) {
      width: 300px;
    }

    .el-button {
      margin-left: 20px;
    }
  }
}
</style>
