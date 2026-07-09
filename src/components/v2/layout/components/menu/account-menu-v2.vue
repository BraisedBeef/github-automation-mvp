<template>
  <div class="account-menu-v2" :class="{ 'is-collapsed': baseStore.collapsed }">
    <div class="account-menu-v2__body">
      <div class="account-menu-v2__section-title">
        <SvgIcon :name="sectionIcon" class="account-menu-v2__section-icon" :style="{ color: sectionIconColor }" />
        <span v-show="!baseStore.collapsed" class="account-menu-v2__section-text">{{ sectionTitle }}</span>
      </div>

      <div class="account-menu-v2__list">
        <template v-for="menu in menuRoutes" :key="menu.name">
          <button
            type="button"
            class="account-menu-v2__item"
            :class="{
              'is-open': isGroupExpanded(menu),
              'is-active': isItemActive(menu),
            }"
            @click="handlePrimaryClick(menu)"
          >
            <SvgIcon v-if="menu.meta?.icon" :name="menu.meta.icon" class="account-menu-v2__item-icon" />
            <span v-show="!baseStore.collapsed" class="account-menu-v2__item-label">
              {{ menu.meta?.title }}
            </span>
            <SvgIcon
              v-if="hasChildren(menu) && !baseStore.collapsed"
              name="down-arrow"
              class="account-menu-v2__item-arrow"
              :class="{ 'is-expanded': isGroupExpanded(menu) }"
            />
          </button>

          <el-collapse-transition>
            <div
              v-if="hasChildren(menu) && !baseStore.collapsed && isGroupExpanded(menu)"
              class="account-menu-v2__children"
            >
              <button
                v-for="child in menu.children"
                :key="child.name"
                type="button"
                class="account-menu-v2__child"
                :class="{ 'is-active': isChildActive(child) }"
                @click="handleChildClick(child)"
              >
                <span class="account-menu-v2__child-dot" />
                <span class="account-menu-v2__child-label">{{ child.meta?.title }}</span>
              </button>
            </div>
          </el-collapse-transition>
        </template>
      </div>
    </div>

    <button type="button" class="account-menu-v2__footer" @click="handleCollapsed">
      <SvgIcon
        name="menu-shrink"
        class="account-menu-v2__footer-icon"
        :class="{ 'is-collapsed': baseStore.collapsed }"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useBaseStore } from '@/store'
import { pushRoute } from '@/utils/router-jump'

const props = withDefaults(
  defineProps<{
    menuRoutes: any[]
    sectionTitle?: string
    sectionIcon?: string
    sectionIconColor?: string
  }>(),
  {
    sectionTitle: '账号中心',
    sectionIcon: 'v2-cdn',
    sectionIconColor: '',
  },
)

const route = useRoute()
const baseStore = useBaseStore()
const expandedGroups = ref<string[]>([])

const currentMenuKey = computed(() => String(route.meta?.notMenu ? route.meta?.notMenuRedirect : route.name || ''))

const hasChildren = (menu: any) => Array.isArray(menu?.children) && menu.children.length > 0

const menuIndex = (menu: any) => String(menu?.meta?.notMenu ? menu?.meta?.notMenuRedirect : menu?.name || '')

const isChildActive = (menu: any) => currentMenuKey.value === menuIndex(menu)

const isGroupExpanded = (menu: any) => expandedGroups.value.includes(String(menu?.name || ''))

const isItemActive = (menu: any) => {
  if (currentMenuKey.value === menuIndex(menu)) return true
  return hasChildren(menu) && menu.children.some((child: any) => isChildActive(child))
}

const syncExpandedGroupByRoute = () => {
  const activeGroup = props.menuRoutes.find(
    menu => hasChildren(menu) && menu.children.some((child: any) => isChildActive(child)),
  )
  if (!activeGroup?.name) return

  const groupName = String(activeGroup.name)
  if (!expandedGroups.value.includes(groupName)) {
    expandedGroups.value = [...expandedGroups.value, groupName]
  }
}

const handleRoutePush = (name: string) => {
  pushRoute({ name })
}

const handlePrimaryClick = (menu: any) => {
  if (hasChildren(menu)) {
    if (baseStore.collapsed) {
      const firstChild = menu.children.find((child: any) => !child.meta?.notMenu)
      if (firstChild?.name) {
        handleRoutePush(firstChild.name)
      }
      expandedGroups.value = [String(menu.name)]
      return
    }

    const groupName = String(menu.name)
    if (isGroupExpanded(menu)) {
      expandedGroups.value = expandedGroups.value.filter(name => name !== groupName)
    } else {
      expandedGroups.value = [...expandedGroups.value, groupName]
    }
    return
  }

  handleRoutePush(menu.name)
}

const handleChildClick = (menu: any) => {
  handleRoutePush(menu.name)
}

const handleCollapsed = () => {
  baseStore.toggleCollaspe()
}

watch(
  () => route.fullPath,
  () => {
    syncExpandedGroupByRoute()
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
.account-menu-v2 {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: rgb(255 255 255 / 65%);
  background: #191c23;

  &__body {
    flex: 1;
    overflow-y: auto;
  }

  &__section-title {
    box-sizing: border-box;
    display: flex;
    gap: 8px;
    align-items: center;
    height: 56px;
    padding: 16px;
    color: rgb(255 255 255 / 90%);
    border-top: 1px solid rgb(255 255 255 / 8%);
    border-bottom: 1px solid rgb(255 255 255 / 8%);
  }

  &__section-icon,
  &__item-icon,
  &__footer-icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }

  &__section-text {
    overflow: hidden;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 0;
  }

  &__item,
  &__child,
  &__footer {
    box-sizing: border-box;
    width: 100%;
    font: inherit;
    line-height: inherit;
    color: inherit;
    appearance: none;
    cursor: pointer;
    background: transparent;
    border: 0;
  }

  &__item {
    display: flex;
    gap: 8px;
    align-items: center;
    height: 38px;
    padding: 8px 16px;
    text-align: left;
    transition:
      background-color 0.2s ease,
      color 0.2s ease;

    &:hover,
    &.is-open,
    &.is-active {
      color: rgb(255 255 255 / 90%);
    }

    &.is-active:not(.is-open) {
      color: #fff;
      background: var(--primary-color);
    }
  }

  &__item-label,
  &__child-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    font-size: 14px;
    line-height: 22px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__item-arrow {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    opacity: 0.9;
    transform: rotate(-90deg);

    &.is-expanded {
      transform: rotate(0deg);
    }
  }

  &__children {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-bottom: 4px;
  }

  &__child {
    display: flex;
    gap: 8px;
    align-items: center;
    height: 38px;
    padding: 8px 16px 8px 32px;
    text-align: left;
    transition:
      background-color 0.2s ease,
      color 0.2s ease;

    &:hover {
      color: rgb(255 255 255 / 90%);
    }

    &.is-active {
      color: #fff;
      background: var(--primary-color);
    }
  }

  &__child-dot {
    flex-shrink: 0;
    width: 4px;
    height: 4px;
    background: currentcolor;
    border-radius: 999px;
  }

  &__footer {
    display: flex;
    align-items: center;
    height: 56px;
    padding: 12px 16px;
    color: rgb(255 255 255 / 65%);
    border-top: 1px solid rgb(255 255 255 / 12%);
    transition:
      color 0.2s ease,
      background-color 0.2s ease;

    &:hover {
      color: rgb(255 255 255 / 90%);
      background: rgb(255 255 255 / 4%);
    }
  }

  &.is-collapsed {
    .account-menu-v2__section-title,
    .account-menu-v2__item,
    .account-menu-v2__footer {
      justify-content: center;
      padding-right: 0;
      padding-left: 0;
    }

    .account-menu-v2__item {
      height: 44px;

      &.is-active {
        background: var(--primary-color);
      }
    }

    .account-menu-v2__section-title {
      height: 56px;
    }
  }

  &__footer-icon {
    width: 16px;
    height: 16px;

    &.is-collapsed {
      transform: rotate(180deg);
    }
  }
}
</style>
