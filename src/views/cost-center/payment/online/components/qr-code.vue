<template>
  <div class="qrcode">
    <!-- 过期 -->
    <div v-if="overdue" class="cover df jc ac cursor-pointer" @click="emits('clickCover')">
      <div>
        <p class="cover-desc">
          {{ t('payment.qrCodeExpired') }}
        </p>
        <p class="cover-desc">
          {{ t('payment.refresh') }}
        </p>
        <p class="df jc ac" style="margin-top: 10px">
          <SvgIcon style="width: 20px; height: 20px" name="qrcode-refresh" />
        </p>
      </div>
    </div>
    <!-- 正常 -->
    <el-image
      v-else
      v-loading="loading"
      element-loading-background="rgba(122, 122, 122, 0.8)"
      style="width: 100%; height: 100%"
      :src="url"
    >
      <!-- 加载失败 -->
      <template #error>
        <div class="error-cover df jc ac cursor-pointer" @click="emits('clickCover')">
          <div>
            <p class="cover-desc">
              {{ t('payment.loadFail') }}
            </p>
            <p class="cover-desc">
              {{ t('payment.refresh') }}
            </p>
            <p class="df jc ac" style="margin-top: 10px">
              <SvgIcon style="width: 20px; height: 20px" name="qrcode-refresh" />
            </p>
          </div>
        </div>
      </template>
    </el-image>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/common/svg-icon/index.vue'
import t from '@/utils/i18n'

const emits = defineEmits<{
  (event: 'clickCover'): void
}>()

const props = withDefaults(
  defineProps<{
    url: string
    overdue: boolean // 是否过期
    loading: boolean // loading
  }>(),
  { url: '', overdue: false, loading: false },
)
</script>

<style lang="scss" scoped>
// 二维码
.qrcode {
  position: relative;
  width: 200px;
  height: 200px;
  margin-right: 64px;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--border-c);
  border-radius: 10px;

  .cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgb(0 0 0 / 40%);
    backdrop-filter: blur(2px);
    border-radius: 10px;

    .cover-desc {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #fff;
      text-align: center;
    }
  }

  .error-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgb(0 0 0 / 40%);
    backdrop-filter: blur(2px);
    border-radius: 10px;

    .cover-desc {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #fff;
      text-align: center;
    }
  }
}
</style>
