<template>
  <div class="page-box">
    <div class="head">
      <el-steps :active="stepNum" simple>
        <el-step :title="t('securitySetting.accountRegistrationApplication')">
          <template #icon>
            <span class="step-icon">1</span>
          </template>
        </el-step>
        <el-step :title="t('securitySetting.accountResourceDetection')">
          <template #icon>
            <span class="step-icon">2</span>
          </template>
        </el-step>
        <el-step :title="t('securitySetting.identityVerification')">
          <template #icon>
            <span class="step-icon">3</span>
          </template>
        </el-step>
        <el-step :title="t('securitySetting.cancellationReview')">
          <template #icon>
            <span class="step-icon">4</span>
          </template>
        </el-step>
      </el-steps>
    </div>
    <el-divider />
    <div class="body-box">
      <loginoutOne v-if="stepNum == 1" :get-next-step="getTwoStep" />
      <loginoutTwo v-if="stepNum == 2" />
      <loginoutThree v-if="stepNum == 3" />
      <loginoutFour v-if="stepNum == 4" />
    </div>
  </div>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import loginoutOne from './components/loginout-one.vue'
import loginoutTwo from './components/loginout-two.vue'
import loginoutThree from './components/loginout-three.vue'
import loginoutFour from './components/loginout-four.vue'

const stepNum = ref<number>(1)
const remark = ref<string>('')

const getTwoStep = value => {
  remark.value = value
  stepNum.value = 2
}
</script>
<style scoped lang="scss">
.page-box {
  background-color: #fff;

  .head {
    padding: 30px 0;
  }
}

:deep(.el-steps--simple) {
  background-color: #fff;
}

:deep(.el-step.is-simple .el-step__icon) {
  width: 30px;
  height: 30px;
}

.step-icon {
  display: inline-block;
  width: 30px;
  height: 30px;
  font-size: 16px;
  line-height: 30px;
  color: #555;
  text-align: center;
  background-color: #f9fafc;
  border-radius: 50%;
}

:deep(.el-step__title.is-wait) {
  color: #555;
}

:deep(.el-step__title.is-process) {
  font-weight: 400;
  color: #555;
}

:deep(.el-step__title.is-finish) {
  color: #000;
}

:deep(.el-step__head.is-finish) {
  .step-icon {
    color: #fff;
    background-color: #394aff;
  }
}
</style>
