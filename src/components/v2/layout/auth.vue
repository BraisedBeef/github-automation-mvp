<template>
  <div class="v2-auth-layout">
    <div class="v2-auth-background" aria-hidden="true" />
    <LoginHeader @back="back" />

    <main v-if="isStandalonePage" class="v2-auth-success">
      <router-view />
    </main>

    <main v-else class="v2-auth-main">
      <section class="v2-auth-intro">
        <div class="v2-auth-copy">
          <h1>
            <span>{{ heroAction }}</span
            >朱雀云账号
          </h1>
          <p>
            {{ heroDescription[0] }}
            <br />
            {{ heroDescription[1] }}
          </p>
        </div>

        <div class="v2-auth-illustration" aria-hidden="true">
          <img src="@/assets/v2/auth-login/v2-login-image-2.png" alt="" />
        </div>
      </section>

      <section class="v2-auth-panel">
        <router-view v-slot="{ Component }">
          <keep-alive include="Login">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import LoginHeader from './components/header/login-header/login-header.vue'
import t from '@/utils/i18n'

const route = useRoute()
const isRegisterSuccessPage = computed(() => route.name === 'RegisterSuccess')
const isStandalonePage = computed(
  () =>
    isRegisterSuccessPage.value ||
    route.name === 'ForgetPwd' ||
    route.name === 'ResetPwd' ||
    route.name === 'ResetSuccess',
)
const isRegisterPage = computed(
  () => route.name === 'Register' || route.name === 'RegisterGoogle' || isRegisterSuccessPage.value,
)
const heroAction = computed(() => (isRegisterPage.value ? t('login.register') : t('login.login')))
const heroDescription = computed(() =>
  isRegisterPage.value
    ? ['快速创建统一身份标识', '开启安全、高效的云端访问体验']
    : ['统一身份认证与账号管理', '让访问更简单、让数据更安全'],
)

const back = () => {
  console.log('返回首页')
}
</script>

<style scoped lang="scss">
.v2-auth-layout {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 1024px;
  min-height: 100vh;
  overflow: hidden;
  color: #191c23;
  background: #fff;
}

.v2-auth-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url('@/assets/v2/auth-login/v2-login-image-0.png');
  background-repeat: no-repeat;

  // background-position:
  //   center top,
  //   center bottom;
  background-size: 100% 100%;

  // transform: scaleX(-1);
}

.v2-auth-main {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  display: flex;
  flex: 1;
  gap: 120px;
  align-items: center;
  width: 100%;
  max-width: 1440px;
  min-height: 0;
  padding: 0 50px;
  margin: 0 auto;
}

.v2-auth-success {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.v2-auth-intro {
  display: flex;
  flex: 0 0 580px;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 580px;
  height: 594px;
  padding-top: 36px;
}

.v2-auth-copy {
  text-align: center;

  h1 {
    margin: 0 0 32px;
    font-family: 'Noto Sans CJK SC', 'PingFang SC', sans-serif;
    font-size: 48px;
    font-weight: 500;
    line-height: 58px;
    white-space: nowrap;

    span {
      color: #06f;
    }
  }

  p {
    margin: 0;
    font-family: 'Noto Sans CJK SC', 'PingFang SC', sans-serif;
    font-size: 24px;
    font-weight: 500;
    line-height: 40px;
    color: #828b9c;
  }
}

.v2-auth-illustration {
  position: relative;
  flex-shrink: 0;
  width: 580px;
  height: 300px;
  margin: 0 auto;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 580px;
    max-width: none;
    height: 300px;
  }
}

.v2-auth-panel {
  position: relative;
  flex-shrink: 0;
  width: 640px;

  :deep(.page) {
    position: relative;
    top: auto;
    left: auto;
    width: 640px;
    min-height: 594px;
    padding: 48px;
    border-radius: 0;
    box-shadow: 0 4px 10px rgb(0 0 0 / 10%);
    transform: none;
  }
}

@media (width <= 1200px) {
  .v2-auth-main {
    gap: 32px;
    padding: 0 40px;
  }

  .v2-auth-panel,
  .v2-auth-panel :deep(.page) {
    width: 560px;
  }
}

@media (height <= 760px) {
  .v2-auth-main {
    align-items: flex-start;
    padding-top: 28px;
    padding-bottom: 28px;
    overflow-y: auto;
  }

  .v2-auth-intro {
    height: min(594px, calc(100vh - 112px));
    min-height: 520px;
  }
}
</style>
