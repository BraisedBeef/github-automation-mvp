<template>
  <div class="oss-menu">
    <p class="title">
      {{ title }}
    </p>
    <el-menu :default-active="defaultActive">
      <el-menu-item v-for="item in menus" :key="item.index" :index="item.index" @click="onClick">
        {{ item.label }}
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  defaultActive: {
    type: String,
    default: '',
  },
  menus: {
    type: Array<{ label: string; index: string }>,
    default: () => [],
  },
})

const emits = defineEmits(['select'])

const onClick = (item: any) => {
  emits('select', item.index)
}
</script>

<style lang="scss" scoped>
.oss-menu {
  min-width: 180px;
  height: 100%;
  padding: 20px 0;
  background: #fff;

  .title {
    padding: 0 20px;
    margin-bottom: 8px;
    font-size: 16px;
    font-weight: 500;
    color: #000;
  }

  .el-menu {
    padding: 0;
    border: none;

    .el-menu-item {
      //   padding-left: 0;
    }
  }
}
</style>
