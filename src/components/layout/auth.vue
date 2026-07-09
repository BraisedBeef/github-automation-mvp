<template>
  <div class="auth-layout">
    <!-- 登录模块的壳 -->

    <LoginHeader @back="back" />
    <div class="auth-body">
      <router-view v-slot="{ Component }">
        <keep-alive include="Login">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
    <!-- <EnvComponent /> -->
  </div>
</template>

<script setup lang="ts">
import LoginHeader from './components/header/login-header/login-header.vue'
// import EnvComponent from '@/components/env/env-component/index.vue'
const back = () => {
  console.log('返回首页')
}
</script>

<style scoped lang="scss">
.auth-layout {
  width: 100%;
  height: 100vh;

  .auth-body {
    width: 100%;
    height: calc(100% - var(--header-h));
    background-image: url('@/assets/images/login/login-bg.png');
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-position: center 55%;
    background-size: 3010px auto;
  }

  :deep(.login-header) {
    height: 60px;
  }
}
</style>
