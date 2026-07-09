<template>
  <div id="google-auth">
    <div class="loader-wrapper">
      <div class="loader">
        <SvgIcon :name="logoName" />
      </div>
      <div class="loader-text">
        <!-- 10个div -->
        <div>L</div>
        <div>O</div>
        <div>A</div>
        <div>D</div>
        <div>I</div>
        <div>N</div>
        <div>G</div>
        <div />
        <div />
        <div />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { _googleAuthorizingCode } from '@/apis/login'
import { useBaseStore, useLoginStore, useUserStore } from '@/store'
import { _setItem } from '@/utils/storage'
import { message } from '@/utils/message'
import t from '@/utils/i18n'
import { addUserInfoCookie } from '@/views/auth/config'
import { setCookies } from '@/utils/cookie'
import { TOKEN, USER_STORE, LANGUAGE_MAP } from '@/config/constant-config'
import { logoName } from '@/config/base-config'
import { pushRoute } from '@/utils/router-jump'

const route = useRoute()
const code = ref<string>(route.query.code as string) // code
const loginStore = useLoginStore()
const userStore = useUserStore()
const baseStore = useBaseStore()

/**
 * @name 谷歌登录
 * @desc 入口1：控制台登录:登录成功后跳转layout
 * @desc 入口2：云服务官网登录：domian?redirect_url=xxx，登录成功后跳转到云服务官网，实现1级域名共享userinfo和token
 */
const googleLogin = async () => {
  try {
    // 重定向地址
    const redirect_url = route.query?.redirect_url as string

    const res = await _googleAuthorizingCode({
      code: code.value,
    })
    console.log(`googleAuthorizingCode===>`, res)

    if (res.success) {
      // 谷歌账号已注册平台 直接登录
      if (res.data?.token) {
        // 存放token
        _setItem(TOKEN, res.data.token)
        userStore.setToken(res.data.token)
        userStore.setUser(res.data)

        // 存放cookie
        setCookies(TOKEN, res.data.token)
        setCookies(USER_STORE, JSON.stringify(addUserInfoCookie(res.data)))

        message.success(t('login.loginSuccess'))

        // 更新lang
        const cb = () => {
          if (res.data.langCode) {
            const key = res.data.langCode.split('-')[0]
            console.log(`cb===>`, res.data.langCode, res.data.langCode.split('-'), key)

            const lang = LANGUAGE_MAP[key].i18nParam
            baseStore.switchLanguage(lang)
          }

          loginStore.clearAll()
        }

        // 需要重定向
        if (redirect_url) {
          // window.open(redirect_url, '_self ')
          window.location.href = redirect_url
        } else {
          // 无需重定向
          pushRoute({
            name: 'Layout',
          }).then(() => cb())
        }
      } else {
        // 谷歌账号未注册过平台
        loginStore.setLoginGoogleForm({
          email: res.data?.email || '',
        })
        pushRoute({ name: 'RegisterGoogle' })
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    loginStore.setCacheGoogle({
      code: code.value,
      res: true,
    })
  }
}

onMounted(() => {
  code.value = route.query.code as string
  if (code.value && loginStore.cacheGoogle.code !== code.value) {
    loginStore.clearCacheGoogle()
  }

  if (!loginStore.cacheGoogle.res && code.value) {
    googleLogin()
  }
})

// 路由
watch(
  () => route.query.code,
  () => {
    code.value = route.query.code as string
    if (code.value && loginStore.cacheGoogle.code !== code.value) {
      loginStore.clearCacheGoogle()
    }

    if (!loginStore.cacheGoogle.res && code.value) {
      googleLogin()
    }
  },
)
</script>

<style scoped lang="scss">
* {
  padding: 0;

  /* 初始化 */
  margin: 0;
}

body {
  /* 100%窗口高度 */
  height: 100vh;
}

.loader-wrapper {
  /* 固定定位 */
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;

  /* 溢出隐藏 */
  overflow: hidden;

  /* 渐变背景 */

  /* background: linear-gradient(
    45deg,
    rgb(90, 54, 148) 0%,
    rgb(19, 189, 206) 33%,
    rgb(0, 148, 217) 66%,
    rgb(111, 199, 181) 100%
  ); */
  background: #f6f8fb;
  background-position: 0% 100%;
  background-size: 400%;

  /* 执行背景渐变动画：动画名 时长 加速后减速 无限次播放 */
  animation: gradient 7.5s ease-in-out infinite;
}

/* 旋转loading的外圈 */
.loader {
  /* 相对定位 居中 */
  position: relative;
  top: 50%;
  left: 50%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 150px;
  margin-top: -75px;
  margin-left: -75px;
  border: 3px solid transparent;

  /* border-top-color: #fff; */
  border-top-color: #0063ff;
  border-radius: 50%;

  /* 执行旋转动画 */
  animation: spin 3s linear infinite;
}

/* 旋转loading的中圈 */
.loader::before {
  /* 绝对定位 */
  position: absolute;
  inset: 5px;
  content: '';
  border: 3px solid transparent;

  /* border-top-color: #fff; */
  border-top-color: #0063ff;
  border-radius: 50%;

  /* 执行反向的旋转动画 reverse:反向 */
  animation: spin 1s linear infinite reverse;
}

/* 旋转loading的内圈 */
.loader::after {
  /* 绝对定位 */
  position: absolute;
  inset: 15px;
  content: '';
  border: 3px solid transparent;

  /* border-top-color: #fff; */
  border-top-color: #0063ff;
  border-radius: 50%;

  /* 执行旋转动画 */
  animation: spin 1s linear infinite;
}

/* logo */
.loader svg {
  width: 55%;
  height: 55%;

  /* border-radius: 50%; */

  /* 执行反向的旋转动画,时长必须和外圈的动画一致(不让其跟着旋转) */
  animation: spin 3s linear infinite reverse;
}

.loader-text {
  /* 绝对定位 水平居中 */
  position: absolute;
  top: 72%;
  left: 50%;
  z-index: 3;
  width: 50%;
  height: 36px;

  /* 防止选取 */
  user-select: none;
  transform: translateX(-50%);
}

.loader-text div {
  /* 绝对定位 */
  position: absolute;
  width: 30px;
  height: 36px;
  margin: 0 20px;

  /* background: #0063FF; */
  font-size: 32px;

  /* color: #fff; */
  color: #0063ff;

  /* 默认隐藏+旋转180度 */
  opacity: 0;
  transform: rotate(180deg);

  /* 执行文字移动动画 */
  animation: move 2s linear infinite;
}

/* 最后面的三个圆 */
.loader-text div:nth-child(8)::before,
.loader-text div:nth-child(9)::before,
.loader-text div:nth-child(10)::before {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 10px;
  height: 10px;
  content: '';

  /* background-color: #fff; */
  background-color: #0063ff;
  border-radius: 50%;
}

/* 文字下的投影 */
.loader-text div::after {
  position: absolute;
  bottom: -40px;
  left: 50%;
  width: 10px;
  height: 5px;
  margin-left: -5px;
  content: '';
  background-color: rgb(255 255 255 / 15%);
  border-radius: 50%;
}

/* 最后面的三个圆的投影 */
.loader-text div:nth-child(8)::after,
.loader-text div:nth-child(9)::after,
.loader-text div:nth-child(10)::after {
  left: 0;
  margin-left: 0;
}

/* 接下来为各个文字设置动画延迟时间 */
.loader-text div:nth-child(2) {
  animation-delay: 0.2s;
}

.loader-text div:nth-child(3) {
  animation-delay: 0.4s;
}

.loader-text div:nth-child(4) {
  animation-delay: 0.6s;
}

.loader-text div:nth-child(5) {
  animation-delay: 0.8s;
}

.loader-text div:nth-child(6) {
  animation-delay: 1s;
}

.loader-text div:nth-child(7) {
  animation-delay: 1.2s;
}

.loader-text div:nth-child(8) {
  animation-delay: 1.4s;
}

.loader-text div:nth-child(9) {
  animation-delay: 1.6s;
}

.loader-text div:nth-child(10) {
  animation-delay: 1.8s;
}

/* 定义动画 */

/* 背景渐变动画 */
@keyframes gradient {
  50% {
    background-position: 100% 0%;
  }
}

/* 旋转动画 */
@keyframes spin {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 文字移动动画 */
@keyframes move {
  0% {
    right: 0;
    opacity: 0;
  }

  35% {
    right: 41%;
    opacity: 1;
    transform: rotate(0);
  }

  65% {
    right: 59%;
    opacity: 1;
    transform: rotate(0);
  }

  100% {
    right: 100%;
    transform: rotate(-180deg);
  }
}
</style>
