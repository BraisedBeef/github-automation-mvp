<template>
  <div class="from-admin">
    {{ txt }}
  </div>
</template>

<script setup lang="ts">
import { _login } from '@/apis/dns/login'
import { TOKEN } from '@/config/constant-config'
import { _clear, _setItem } from '@/utils/storage'
import { useUserStore, useBaseStore } from '@/store'

import { pushRoute } from '@/utils/router-jump'
const userStore = useUserStore()
const txt = ref<string>('to Dns...')
onMounted(() => {
  _clear()
  const token = window.location.search.substring(1).split('&')[0].split('=')[1]
  login(token)
})

const login = async (token: string) => {
  try {
    const { code, data, msg } = await _login({
      token,
      method: 3,
    })
    if (code === 200) {
      const { token } = data
      // 存放token
      _setItem(TOKEN, token)
      userStore.getUser().then(() => {
        pushRoute({
          name: 'Layout',
        })
      })
    } else {
      txt.value = 'failure: ' + msg
    }
  } catch (error) {
    txt.value = 'failure: ' + error
  }
}
</script>

<style scoped lang="scss"></style>
