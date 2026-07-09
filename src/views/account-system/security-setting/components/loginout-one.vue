<template>
  <div class="step-box">
    <div class="msg-item">
      <div class="msg-title">
        {{ t('securitySetting.accountCancellationNotes') }}
      </div>
      <div class="msg-content">
        {{ t('securitySetting.accountCancellationNotesOne') }}
      </div>
      <div class="msg-content">
        {{ t('securitySetting.accountCancellationNotesTwo') }}
      </div>
      <div class="msg-content">
        {{ t('securitySetting.accountCancellationNotesAnnotate') }}
      </div>
      <div class="msg-content">
        {{ t('securitySetting.accountCancellationNotesThree') }}
      </div>
      <div class="msg-content">
        {{ t('securitySetting.accountCancellationNotesFour') }}
      </div>
      <div class="msg-content">
        {{ t('securitySetting.accountCancellationNotesFive') }}
      </div>
      <div class="msg-content">
        {{ t('securitySetting.accountCancellationNotesSix') }}
      </div>
      <div class="msg-content">
        {{ t('securitySetting.accountCancellationNotesServen') }}
      </div>
      <div class="msg-content">
        {{ t('securitySetting.accountCancellationNotesEight') }}
      </div>
    </div>
    <div class="msg-item mt40">
      <div class="msg-title">
        {{ t('securitySetting.reminderAgain') }}
      </div>
      <div class="msg-content">
        {{ t('securitySetting.reminderAgainOne') }}
      </div>
      <div class="msg-content">
        {{ t('securitySetting.reminderAgainTwo') }}
      </div>
      <div class="msg-content">
        {{ t('securitySetting.reminderAgainThree') }}
      </div>
      <div class="msg-content">
        {{ t('securitySetting.reminderAgainFour') }}
      </div>
    </div>
    <div class="msg-item mt40">
      <el-form ref="formRef" require-asterisk-position="right" :model="form">
        <el-form-item :label="t('securitySetting.remark')" prop="remark" :label-width="formLabelWidth">
          <el-input
            v-model="form.remark"
            style="width: 400px"
            :placeholder="t('securitySetting.remarkPlaceholder')"
            class="input-with-select"
          />
        </el-form-item> </el-form
      >remarkTipsOne
      <p class="form-info">
        {{ t('securitySetting.remarkTipsOne')
        }}<span class="form-info-black">{{ t('securitySetting.remarkTipsTwo') }}</span
        >{{ t('securitySetting.remarkTipsThree') }}
      </p>
      <div class="read-box mt40">
        <el-checkbox v-model="readKey" :label="t('securitySetting.readAndAgree')" />
        <span class="loginout-box">{{ t('securitySetting.accountCancellationAgreement') }}</span>
      </div>
      <div class="footer-box mt40">
        <el-space>
          <el-button>{{ t('securitySetting.return') }}</el-button>
          <el-button type="primary" @click="getNext">
            {{ t('securitySetting.nextStep') }}
          </el-button>
        </el-space>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
const props = withDefaults(
  defineProps<{
    getNextStep?: (value: string) => void
  }>(),
  {},
)

const formLabelWidth = '60px'
const form = reactive<{
  remark: string
}>({
  remark: '',
})
const readKey = ref<boolean>(false)

const getNext = () => {
  if (!readKey.value) {
    console.log('请阅读并同意猫云账号注销协议')
  } else {
    props.getNextStep && props.getNextStep(form.remark)
  }
}
</script>
<style scoped lang="scss">
.step-box {
  padding: 20px 20px 24px;

  .msg-item {
    .msg-title {
      margin-bottom: 8px;
      color: #000;
    }

    .msg-content {
      color: #555;
    }
  }

  .form-info-black {
    font-weight: bold;
    color: #000;
  }

  .read-box {
    display: flex;
    align-items: center;

    .loginout-box {
      color: #394aff;
      cursor: pointer;
    }
  }
}

.mt20 {
  margin-top: 20px;
}

.mt40 {
  margin-top: 40px;
}
</style>
