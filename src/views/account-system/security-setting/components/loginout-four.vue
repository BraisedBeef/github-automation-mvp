<template>
  <div class="step-box">
    <div class="title-box">
      <el-icon size="24" color="#67C23A">
        <SuccessFilled />
      </el-icon>
      <p class="title ml12">
        {{ t('securitySetting.detectionPassed') }}
      </p>
    </div>
    <p class="info mt18">
      {{ t('securitySetting.detectionPassedTips') }}
    </p>
    <p class="error mt16">
      {{ t('securitySetting.attentionPoints') }}
    </p>
    <div class="footer mt44">
      <el-button type="primary">
        {{ t('securitySetting.returnSecuritySettings') }}
      </el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { SuccessFilled } from '@element-plus/icons'
</script>
<style scoped lang="scss">
.step-box {
  padding: 20px 20px 24px;

  .title-box {
    display: flex;
    align-items: center;

    .title {
      font-size: 16px;
      font-weight: bold;
      color: #000;
    }
  }

  .error {
    color: #fe4d4f;
  }
}

.ml12 {
  margin-left: 12px;
}

.mt18 {
  margin-top: 18px;
}

.mt16 {
  margin-top: 16px;
}

.mt44 {
  margin-top: 44px;
}
</style>
