<template>
  <component :is="user.accountType == 1 ? MainUser : MainUser" />
</template>
<script setup lang="ts">
import MainUser from './main-info.vue'
import SubUser from './sub-info.vue'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
</script>
./info/index.vue./main-info/main-info.vue./sub-info/sub-info.vue
