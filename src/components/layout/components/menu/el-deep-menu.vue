<template>
  <!-- 这个版本是之前产品要求图标跟第一行文本对齐，看了效果之后还是改成居中对齐，这里先保留，以免后面又要改回来 -->
  <!-- <template v-if="!menu.children">
    <el-menu-item :index="(menu.name as string)" :class="menu.meta?.icon">
      <div class="menu-item-box">
        <SvgIcon v-if="menu.meta?.icon" :name="menu.meta?.icon" class="menu-item-icon" />
        <span class="menu-item-title mr20" :class="{ 'has-children': menu.children, 'has-icon': menu.meta?.icon }">
          <div>{{ menu.meta?.title }}</div>
        </span>
      </div>
    </el-menu-item>
  </template>
  <template v-else>
    <el-sub-menu :index="(menu.name as string)" :class="menu.meta?.icon || 'no-icon'">
      <template #title>
        <div  class="menu-item-box">
          <SvgIcon v-if="menu.meta?.icon" :name="menu.meta?.icon" class="menu-item-icon" />
          <span class="menu-item-title mr40" :class="{ 'has-children': menu.children, 'has-icon': menu.meta?.icon }">
            <div>{{ menu.meta?.title }}</div>
          </span>
        </div>
      </template>
      <el-menu-item-group>
        <template #title>{{ menu.name }}</template>
        <template v-for="cmenu in menu.children" :key="cmenu.name">
          <ElDeepMenu :menu="cmenu" />
        </template>
      </el-menu-item-group>
    </el-sub-menu>
  </template> -->

  <template v-if="!menu.children">
    <el-menu-item :index="menuIndex(menu)" :class="menu.meta?.icon" @click="handleMenuClick(menu)">
      <SvgIcon v-if="menu.meta?.icon" :name="menu.meta?.icon" class="menu-icon" />
      <template #title>
        <span class="menu-title" :class="{ 'has-children': menu.children }">
          <div>{{ menu.meta?.title }}</div>
          <SvgIcon
            v-if="menu.meta?.rightIcon"
            :name="menu.meta?.rightIcon"
            class="ml10"
            style="width: 14px; height: 14px"
          />
        </span>
      </template>
    </el-menu-item>
  </template>
  <template v-else>
    <el-sub-menu :index="menuIndex(menu)" :class="menu.meta?.icon || 'no-icon'">
      <template #title>
        <SvgIcon v-if="menu.meta?.icon" :name="menu.meta?.icon" class="menu-icon" />
        <span class="menu-title" :class="{ 'has-children': menu.children }">
          <div>{{ menu.meta?.title }}</div>
        </span>
      </template>
      <el-menu-item-group>
        <template #title>
          {{ menu.name }}
        </template>
        <template v-for="cmenu in menu.children" :key="cmenu.name">
          <ElDeepMenu :menu="cmenu" />
        </template>
      </el-menu-item-group>
    </el-sub-menu>
  </template>
</template>

<script setup lang="ts">
import { pushRoute } from '@/utils/router-jump'

withDefaults(
  defineProps<{
    menu: any
  }>(),
  {},
)

const route = useRoute()

const menuIndex = (menu: any) => {
  return menu.meta?.notMenu ? menu.meta?.notMenuRedirect : menu.name
}

const router = useRouter()

const handleMenuClick = (menu: any) => {
  if (menu.meta?.dynamicRoute) {
    if (route.name === menu.name) {
      pushRoute({
        name: menu.name,
        query: route.query,
        params: route.params,
      })
    } else {
      pushRoute({
        name: menu.name,
      })
    }
  } else {
    pushRoute({
      name: menu.name,
    })
  }
}
</script>
<style lang="scss" scoped>
// 这个版本是之前产品要求图标跟第一行文本对齐的样式，看了效果之后还是改成居中对齐，这里先保留，以免后面又要改回来
// .menu-item-icon{
//   margin-left:var(--menu-icon-left);
//   width: var(--menu-icon-size);
//   height: var(--menu-icon-size);
// }
// .menu-item-box{
//   display: flex;
// }
// .menu-item-title{
//   margin-left: calc(var(--menu-icon-left) + var(--menu-icon-size) + 8px);
//   &.has-icon{
//     margin-left: 8px;
//   }
// }
// .menu-item-title div{
//   word-wrap: break-word; /* 自动换行 */
//   white-space: normal; /* 默认换行 */
//   word-break: break-word !important;
// }
// .mr40{
//   margin-right: 40px;
// }

.menu-title div {
  word-break: break-word !important;
}
</style>
