<template>
  <div v-if="state.show" class="env-component" :class="{ fixed }">
    <div class="project-type-title">
      切换程序类型,仅用于调试
      <br />
      <span>当前区域:</span>

      <span>{{ state.projectType === '1' ? '国内' : '海外' }}</span>
      <div v-if="close" class="close cat-flex" @click="state.show = false">x</div>
      <br />
      <span>环境: {{ mode }}</span>
    </div>
    <el-select v-model="state.projectType" @change="projectTypeChange">
      <el-option label="国内" value="1" />
      <el-option label="海外" value="2" />
    </el-select>
    <br />
    <br />
    <el-button type="success" @click="getEnvAccount"> 获取测试账号 </el-button>
  </div>
</template>

<script setup lang="ts">
import { useBaseStore } from '@/store'
import { getEnvAccount } from '@/utils/env-utils'
import { mode } from '@/config/base-config'

const baseStore = useBaseStore()
const props = withDefaults(
  defineProps<{
    fixed?: boolean
    close?: boolean
    reload?: boolean
  }>(),
  {
    fixed: true,
    close: true,
    reload: true,
  },
)
const state = reactive<{
  projectType: '1' | '2'
  show: boolean
}>({
  projectType: '2',
  show: false,
})
const projectTypeChange = (projectType: '1' | '2') => {
  baseStore.setProjectType(projectType)
  console.log('projectTypeChange', projectTypeChange)

  setTimeout(() => {
    props.reload && location.reload()
  }, 0)
}

onMounted(() => {
  nextTick(() => {
    state.projectType = baseStore.projectType as '1' | '2'
  })
  if (import.meta.env.MODE !== 'prod') {
    state.show = true
  }
})
</script>

<style scoped lang="scss">
.env-component {
  display: inline-block;
  padding: 24px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 0 4px #ccc;

  &.fixed {
    position: fixed;
    right: 10px;
    bottom: 10%;
  }

  .project-type-title {
    position: relative;

    // font-weight: 500;
    margin-bottom: 14px;
    font-size: 16px;

    .close {
      position: absolute;
      top: 0;
      right: 0;
      width: 1.5rem /* 24/16 */;
      height: 1.5rem /* 24/16 */;
      font-weight: 400;
      line-height: 1;
      color: #fff;
      cursor: pointer;
      background-color: #868484;
      border: 1px solid #868484;
      border-radius: 50%;
    }

    span {
      color: skyblue;
    }
  }
}
</style>
