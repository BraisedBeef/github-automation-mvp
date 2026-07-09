<template>
  <aside class="cat-aside" :class="baseStore.collapsed ? 'aside-collapsed' : ''">
    <AccountMenuV2
      v-if="routeModel"
      :menu-routes="filterRoutes"
      :section-title="routeModel.title"
      :section-icon="routeModel.icon"
    />
    <template v-else>
      <el-menu
        id="cat-menu"
        :default-active="state.selectedKeys"
        :class="[baseStore.collapsed ? 'collapsed' : '']"
        :collapse="baseStore.collapsed"
        :collapse-transition="false"
        popper-effect="light"
        unique-opened
        @open="open"
      >
        <template v-for="menu in filterRoutes" :key="menu.name">
          <ElDeepMenu :menu="menu" :opened-key="state.openedKey" />
        </template>
      </el-menu>
      <div class="menu-collapsed">
        <SvgIcon
          :name="baseStore.collapsed ? 'menu-collapsed-active' : 'menu-collapsed'"
          :class="{ active: baseStore.collapsed }"
          pointer
          @click="handleCollasped"
        />
      </div>
    </template>
  </aside>
</template>

<script setup lang="ts">
import AccountMenuV2 from './account-menu-v2.vue'
import ElDeepMenu from './el-deep-menu.vue'
import { useBaseStore, usePermissionStore } from '@/store'
import { _filterRoutes } from '@/utils/router-utils'
import { _debounce } from '@/utils/timing-utils'
import { getRouteModel } from '@/router/map'
const baseStore = useBaseStore()
const route = useRoute()
const permissionStore = usePermissionStore()
const routeModel = computed(() => getRouteModel(('/' + route.path.split('/')[1]) as any))

// 过滤后的菜单
const filterRoutes = computed(() => {
  const routeType = route.path.split('/')[1]
  const routes = routeModel.value ? _filterRoutes(routeModel.value.routes) : []

  if (routeType === 'cdn') {
    // cdn离线日志日志
    if (!permissionStore.cdn.showOfflineLogMenu) {
      const index = routes.findIndex(el => el.name === 'cdn_offline_log')
      routes.splice(index, 1)
    }
  }

  return routes
})

const state = reactive({
  selectedKeys: '',
  openedKey: '',
})

const open = (index: string, indexPath: string[]) => {
  const name = indexPath[0] || ''
  state.openedKey = name
}

const handleCollasped = () => {
  baseStore.toggleCollaspe()
}

watch(
  route,
  () => {
    // state.selectedKeys = route.meta.selectedKeys || ''
    state.selectedKeys = String(route.meta?.notMenu ? route.meta?.notMenuRedirect : route.name || '')
  },
  { immediate: true },
)

const fn = _debounce(() => {
  const isNeedCollaspe = document.documentElement.clientWidth < 1210
  if (isNeedCollaspe !== baseStore.collapsed) {
    baseStore.collapsed = isNeedCollaspe
  }
}, 300)

onMounted(() => {
  window.addEventListener('resize', fn)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', fn)
})
</script>

<style lang="scss">
$menu-collapsed-h: 54px; // 收缩按钮的高度

// 侧边容器
.cat-aside {
  position: relative;
  z-index: var(--menu-index);
  width: var(--menu-w);
  height: 100%;
  transition: all 0.25s;

  // 容器收缩
  &.aside-collapsed {
    width: var(--menu-w-collapsed);
  }
}

// cat-menu
#cat-menu {
  width: 100%;
  height: calc(100% - $menu-collapsed-h); // 留给收缩按钮的
  overflow: hidden auto;
  transition: all 0.25s;

  // 无子项
  .el-menu-item {
    width: 100%;
    height: var(--menu-item-h);
    padding: 0;
    background-color: #fff;

    .menu-icon {
      left: var(--menu-icon-left);
    }

    .menu-title {
      left: var(--menu-title-left);
    }

    //   选中
    &.is-active {
      position: relative;
      background: var(--menu-active-bg);

      &::before {
        position: absolute;
        top: 0;
        right: 0;
        display: inline-block;
        width: 2px;
        height: 100%;
        content: '';
        background-color: var(--primary-color);
      }

      .menu-title {
        color: var(--primary-color);
      }

      .menu-icon {
        color: var(--primary-color);
      }
    }

    &:hover {
      background: var(--menu-active-bg);

      .menu-title {
        color: var(--primary-color);
      }

      .menu-icon {
        color: var(--primary-color);
      }
    }
  }

  // 有子项
  .el-sub-menu {
    .el-sub-menu__title {
      position: relative;
      height: var(--menu-item-h);
      padding: 0;

      .menu-icon {
        left: var(--menu-icon-left);
        flex-shrink: 0;
      }

      .menu-title {
        left: var(--menu-title-left);
      }

      .el-sub-menu__icon-arrow {
        color: #555;
      }
    }

    .el-menu {
      .el-menu-item-group {
        .el-menu-item-group__title {
          display: none;
        }
      }
    }

    // 打开子项
    &.is-opened {
      .el-sub-menu__title {
        .menu-title {
          color: var(--primary-color);
        }

        .menu-icon {
          color: var(--primary-color);
        }

        .el-sub-menu__icon-arrow {
          color: var(--primary-color);
        }
      }
    }
  }

  // 收缩状态
  &.collapsed {
    width: var(--menu-w-collapsed);

    .menu-icon {
      top: 50%;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
    }

    .el-menu-item {
      background-color: #fff !important;

      &.is-active {
        background-color: var(--primary-color) !important;

        &::before {
          display: none;
        }

        .menu-icon {
          color: #fff;
        }
      }
    }

    .el-sub-menu {
      &.is-active {
        .el-sub-menu__title {
          background-color: var(--primary-color);
        }

        .menu-icon {
          color: #fff;
        }
      }
    }
  }
}

/* icon基础设置 */
.cat-aside .menu-icon {
  position: absolute;
  top: 50%;
  width: var(--menu-icon-size);
  height: var(--menu-icon-size);
  transform: translateY(-50%);
}

// 收缩按钮
.cat-aside .menu-collapsed {
  position: relative;
  width: 100%;
  height: $menu-collapsed-h;
  border-top: 1px solid #eee;

  &:hover {
    background: var(--menu-active-bg);

    svg {
      color: var(--primary-color);
    }
  }

  svg {
    position: absolute;
    top: 50%;
    left: var(--menu-icon-left);
    width: 24px; // 收缩按钮大小为24px
    height: 24px;
    transform: translateY(-50%);
  }
}

/* title基础设置 */
.cat-aside .menu-title {
  position: absolute;
  top: 50%;
  width: var(--menu-title-w);
  height: var(--menu-item-h);
  font-family: 'PingFang SC-Regular', 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: var(--primary-text);
  user-select: none;
  transform: translateY(-50%);

  @include flex(flex-start);

  &.has-children {
    width: var(--menu-title-with-children);
  }

  div {
    display: -webkit-box;
    overflow: hidden;
    line-height: 20px;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
    word-break: break-all;
    white-space: normal;
    -webkit-box-orient: vertical;
  }
}
</style>

<style lang="scss">
.el-menu-item-group__title {
  display: none;
}
</style>
