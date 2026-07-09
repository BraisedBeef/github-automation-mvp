<template>
  <div class="step-box">
    <p class="title">
      {{ t('securitySetting.enterEmailVerificationCode') }}
    </p>
    <p class="content mt14">
      {{ t('securitySetting.enterEmailVerificationCodeMsg').split('{XXXXXX}')[0]
      }}<span class="content-black">123456789@163.com</span
      >{{ t('securitySetting.enterEmailVerificationCodeMsg').split('{XXXXXX}') }}
    </p>
    <div class="verification-container mt40">
      <input
        v-for="(code, index) in verificationCodes"
        :key="index"
        v-model="verificationCodes[index]"
        maxlength="1"
        class="verification-input"
        @input="handleInput(index, $event)"
        @keydown="handleKeyDown(index, $event)"
      />
    </div>
    <p class="mt20">
      <el-button type="text" class="get-code">
        {{ t('securitySetting.retrieveVerificationCodeAgain') }}
      </el-button>
    </p>
    <div class="footer-box mt40">
      <el-space>
        <el-button>{{ t('securitySetting.return') }}</el-button>
        <el-button type="primary">
          {{ t('securitySetting.nextStep') }}
        </el-button>
      </el-space>
    </div>
  </div>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
const emits = defineEmits(['emailCode'])
const verificationCodes = ref(['', '', '', '', '', ''])

const handleInput = (index, event) => {
  const value = event.target.value
  verificationCodes.value[index] = value

  // 判断是否输入完成
  if (verificationCodes.value.join('').length === 6) {
    emits('emailCode', verificationCodes.value.join(''))
  }

  // 自动跳到下一个输入框
  if (value && index < verificationCodes.value.length - 1) {
    const nextInput = event.target.nextElementSibling
    if (nextInput) {
      nextTick(() => {
        nextInput.focus()
      })
    }
  }
}
const handleKeyDown = (index, event) => {
  // 处理删除操作
  if (event.key === 'Backspace' && !event.target.value && index > 0) {
    const prevInput = event.target.previousElementSibling
    if (prevInput) {
      nextTick(() => {
        prevInput.focus()
      })
    }
  }
}
</script>
<style scoped lang="scss">
.step-box {
  padding: 20px 20px 24px;

  .title {
    font-weight: 600;
    color: #000;
  }

  .content-black {
    color: #000;
  }
}

.mt14 {
  margin-top: 14px;
}

.mt40 {
  margin-top: 40px;
}

.mt20 {
  margin-top: 20px;
}

.verification-container {
  display: flex;
}

.verification-input {
  width: 50px;
  height: 50px;
  margin-right: 30px;
  font-size: 20px;
  color: #000;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 5px;

  &:last-child {
    margin-right: 0;
  }

  &:focus {
    border: 1px solid #394aff;
  }
}

.verification-input:focus {
  outline: none;

  // border-color: #007bff;
  // box-shadow: 0 0 5px #007bff;
}

.get-code {
  padding: 0 !important;
}
</style>
