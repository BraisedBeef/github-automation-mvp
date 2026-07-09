<template>
  <div>
    <div class="card">
      <div class="title mb20">
        {{ productConfig?.title }}
      </div>
      <div class="desc">
        {{ productConfig?.desc }}
      </div>
      <div class="btns-wrap">
        <!-- 开通服务 -->
        <el-button
          :loading="loading"
          :class="disabled && 'disabled'"
          type="primary"
          :disabled="disabled"
          @click="openProductServe"
        >
          {{ t('productOverview.open') }}
        </el-button>
        <!-- 了解详情 -->
        <el-button @click="goOfficial(productConfig?.official)">
          {{ t('productOverview.detail') }}
        </el-button>
      </div>
    </div>
    <!-- <OssOpenFailDialog /> -->
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useOpen } from './hooks/use-open'
// import OssOpenFailDialog from './components/oss-open-fail-dialog.vue'
// const ossOpenFailDialogRef = ref<any>(null)
const { loading, disabled, openProductServe, goOfficial, productConfig } = useOpen()
</script>

<style lang="scss" scoped>
.card {
  box-sizing: border-box;
  height: 340px;
  padding: 60px 40px;
  background: #fff;
  background-image: url('../../../assets/images/overview/bg.png');
  background-repeat: no-repeat;
  background-position: right;
  background-size: auto 345px;

  .title {
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 24px;
    color: #000;
  }

  .desc {
    width: 50%;
    max-width: 590px;
    margin-bottom: 40px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #000;
  }

  .disabled {
    color: #fff !important;
    background: #ccc !important;
  }
}
</style>
