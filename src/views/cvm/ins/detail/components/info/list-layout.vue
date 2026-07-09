<template>
  <div class="item w-full mb15">
    <div class="df ac jsb mb10 top">
      <div class="pointer" @click="isShow = !isShow">
        <el-icon :class="isShow ? 'is-reverse' : ''" style="transition: 0.3s">
          <CaretRight /> </el-icon
        ><slot name="tl" />
      </div>
      <slot name="tr" />
    </div>
    <el-collapse-transition>
      <div v-show="isShow" class="bottom">
        <slot name="bm" />
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { CaretRight } from '@element-plus/icons-vue'

const isShow = ref<boolean>(true) // 是否显示
</script>

<style lang="scss" scoped>
.is-reverse {
  transform: rotateZ(90deg);
}

.item {
  box-sizing: border-box;
  padding: 24px 19px 24px 13px;

  /* min-height: 98px; */
  background: #f9fafc;
  border-radius: 4px;

  .top {
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 14px;
    color: #000;
  }

  .bottom {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #000;
  }
}

.mb15 {
  margin-bottom: 15px;
}
</style>
