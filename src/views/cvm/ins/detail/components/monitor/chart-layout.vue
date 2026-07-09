<template>
  <div>
    <div class="title mb20">
      <div class="df ac">
        <div class="pointer" @click="isShow = !isShow">
          <el-icon :class="isShow ? 'is-reverse' : ''" style="transition: 0.3s">
            <CaretRight /> </el-icon
          ><span class="ml4">{{ title }}</span>
        </div>
      </div>
    </div>
    <el-collapse-transition>
      <div v-show="isShow">
        <slot />
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { CaretRight } from '@element-plus/icons-vue'

interface PropType {
  title: string
}

const props = withDefaults(defineProps<PropType>(), {
  title: '',
})

const isShow = ref<boolean>(true) // 是否显示
</script>

<style lang="scss" scoped>
.title {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #000;
}

.is-reverse {
  transform: rotateZ(90deg);
}
</style>
