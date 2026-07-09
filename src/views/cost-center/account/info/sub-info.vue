<template>
  <div class="h-full df ac jc" style="background: #fff">
    <div class="df ac jc">
      <div class="df fdc ac jc">
        <el-image style="width: 126px; height: 82px; margin-bottom: 40px" :src="permissionImg" />
        <p class="title mb20">
          <span>{{ t('prem.pageDesc') }}</span>
        </p>
        <div class="desc-wrap">
          <p class="main-desc">
            {{ t('prem.desc2') }}
          </p>
          <p class="sub-desc mb20">
            {{ t('prem.desc3') }}
          </p>
        </div>
        <el-button type="primary" @click="refresh">
          <SvgIcon name="qrcode-refresh" /><span class="ml4">{{ t('prem.reload') }}</span>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import permissionImg from '@/assets/images/account-system/permission/permission.png'
import { useUserStore } from '@/store'
import { message } from '@/utils/message'
import t from '@/utils/i18n'

const userStore = useUserStore()
// 刷新
const refresh = () => {
  userStore.getUser().then(() => {
    message.success(t('prem.refreshSuccess'))
  })
}
</script>

<style lang="scss" scoped>
.title {
  font-family: PingFangSC, 'PingFang SC';

  // font-weight: 500;
  font-size: 16px;
  color: var(--primary-text);
}

.desc-wrap {
  box-sizing: border-box;
  width: 400px;
  min-height: 80px;
  padding: 10px 16px;
  margin-bottom: 40px;
  background: #f9fafc;
  border-radius: 4px;

  .main-desc {
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 14px;
    color: var(--primary-text);
  }

  .sub-desc {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--common-text);
  }
}
</style>
