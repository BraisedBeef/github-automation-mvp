<template>
  <div class="page">
    <!-- icon -->
    <div class="register-success-header">
      <SvgIcon name="register-success" />
      <span>{{ t('login.registSuccess') }}</span>
    </div>
    <div class="register-success-desc">
      {{ t('login.registSuccessTip') }}
    </div>
    <div class="register-success-user">
      <!-- 登录名 -->
      <div class="register-success-account">{{ t('login.loginName') }}: {{ state.account }}</div>
    </div>

    <el-button type="primary" class="register-success-btn w-full" @click="pushRoute({ name: 'Layout' })">
      {{ t('login.toConsole') }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { pushRoute } from '@/utils/router-jump'

const route = useRoute()
const state = reactive({
  account: '',
  phone: '',
})

onMounted(() => {
  // console.log(route.query)
  const { name, phone } = route.query as any
  state.account = name
  state.phone = phone
})
</script>

<style scoped lang="scss">
@use '../style/page';
@use '../style/btn';

.register-success-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  font-family: PingFangSC-Medium, 'PingFang SC';
  font-size: 24px;

  // font-weight: 500;
  color: #324065;

  svg {
    width: 110px;
    height: 110px;
    margin-bottom: 25px;
  }
}

.register-success-desc {
  margin-bottom: 20px;
  font-family: PingFangSC-Regular, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #5b6786;
}

.register-success-user {
  margin-bottom: 35px;
  font-family: PingFangSC-Regular, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #324065;

  .register-success-account {
    margin-bottom: 10px;
  }
}
</style>
