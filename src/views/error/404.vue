<template>
  <div class="error">
    <div class="error-cont">
      <img :src="image404" alt="" />
      <div style="margin: 20px 0 10px">
        {{ t('common.notFound') }}
      </div>
      <el-button type="primary" link to="Account" @click="back">
        {{ t('common.backHome') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { image404 } from '@/config/base-config'

import { replaceRoute } from '@/utils/router-jump'

const back = () => {
  replaceRoute({ name: 'Layout' })
}
</script>

<style lang="scss">
.error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  text-align: center;

  .error-cont {
    div {
      font-size: 16px;
      font-weight: 400;
      color: var(--common-text);
    }

    .el-button {
      font-size: 16px !important;
    }
  }
}
</style>
