<template>
  <Transition name="v2-product-drawer">
    <div v-show="tempStore.prodSlider" class="v2-product-drawer" @mouseenter="openDrawer" @click="closeDrawer">
      <div class="v2-product-drawer__panel" @mouseenter="openDrawer" @mouseleave="closeDrawer" @click.stop>
        <aside class="v2-product-drawer__rail">
          <button class="v2-product-drawer__rail-item" type="button">
            <SvgIcon name="v2-header-menu" class="v2-product-drawer__rail-icon" />
            <span>{{ t('home.allProduct') }}</span>
            <el-icon class="v2-product-drawer__rail-arrow">
              <ArrowRight />
            </el-icon>
          </button>
        </aside>

        <section class="v2-product-drawer__content">
          <!-- <header class="v2-product-drawer__header">
            <div class="v2-product-drawer__search">
              <SvgIcon
                name="v2-header-search"
                class="v2-product-drawer__search-icon"
              />
              <div class="v2-product-drawer__search-divider" />
              <span>{{ searchPlaceholder }}</span>
            </div>

            <button
              class="v2-product-drawer__close"
              type="button"
              @click="closeDrawer"
            >
              <el-icon><Close /></el-icon>
            </button>
          </header> -->

          <div class="v2-product-drawer__body">
            <div class="v2-product-drawer__main">
              <section v-if="recentItems.length" class="v2-product-drawer__recent">
                <div class="v2-product-drawer__section-title">
                  {{ t('home.access') }}
                </div>
                <div class="v2-product-drawer__recent-grid">
                  <button
                    v-for="(item, index) in recentItems"
                    :key="`${item.path || item.name}-${index}`"
                    class="v2-product-drawer__recent-item"
                    type="button"
                    @click="openRecent(item)"
                  >
                    {{ item.title }}
                  </button>
                </div>
              </section>

              <div class="v2-product-drawer__sections">
                <section
                  v-for="(section, index) in sections"
                  :key="section.title"
                  :ref="el => setSectionRef(el as HTMLElement | null, index)"
                  class="v2-product-drawer__section"
                  :class="{ 'is-active': hoveredSectionIndex === index }"
                  @mouseenter="hoveredSectionIndex = index"
                >
                  <div class="v2-product-drawer__section-heading">
                    {{ section.title }}
                  </div>

                  <button
                    v-for="item in section.items"
                    :key="`${section.title}-${item.title}`"
                    class="v2-product-drawer__section-link"
                    type="button"
                    @click="goItem(item)"
                  >
                    {{ item.title }}
                  </button>
                </section>
              </div>
            </div>

            <aside class="v2-product-drawer__anchors">
              <button
                v-for="(section, index) in sections"
                :key="`${section.title}-anchor`"
                class="v2-product-drawer__anchor"
                :class="{ 'is-active': hoveredSectionIndex === index }"
                type="button"
                @mouseenter="hoveredSectionIndex = index"
                @click="scrollToSection(index)"
              >
                {{ section.title }}
              </button>
            </aside>
          </div>
        </section>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import { modelRoutes, getRouteModel } from '@/router/map'
import { useBaseStore, useTempStore } from '@/store'
import { userId } from '@/store/user'
import { _deepClone } from '@/utils/collection-utils'
import t from '@/utils/i18n'
import { pushRoute } from '@/utils/router-jump'

type DrawerRoute = PlusRouteRecordRaw & {
  children?: DrawerRoute[]
}

type DrawerItem = {
  title: string
  path: string
}

type DrawerSection = {
  title: string
  path: string
  items: DrawerItem[]
}

const baseStore = useBaseStore()
const tempStore = useTempStore()
const route = useRoute()

const sectionRefs = ref<Array<HTMLElement | null>>([])
const hoveredSectionIndex = ref(-1)

const isVisibleRoute = (route: DrawerRoute) => {
  return (
    (route.meta?.notNav === false && route.meta?.notMenu === true) ||
    (route.meta?.notNav === undefined && !route.meta?.notMenu)
  )
}

const getOnlineProduct = (_routes: DrawerRoute[]) => {
  const routes = _deepClone(_routes) as DrawerRoute[]
  return routes.filter(route => {
    if (route.children?.length && !route.meta?.notNav) {
      route.children = getOnlineProduct(route.children)
      if (!route.children.length) delete route.children
      return true
    }
    return isVisibleRoute(route)
  })
}

const getNextPath = (route: DrawerRoute) => {
  return route.redirect || route.path || route.children?.[0]?.path || ''
}

const sections = computed<DrawerSection[]>(() => {
  return getOnlineProduct(modelRoutes as any[]).map(route => ({
    title: route.meta?.title as string,
    path: getNextPath(route),
    items:
      route.children
        ?.filter(child => isVisibleRoute(child as DrawerRoute) && child.meta?.title)
        .map(child => ({
          title: child.meta?.title as string,
          path: getNextPath(child as DrawerRoute),
        })) || [],
  }))
})

const recentItems = computed(() => {
  const list = baseStore.accessHistory[userId()] || []
  return list.slice(0, 3).map((item: any) => ({
    ...item,
    title: getRouteModel(item.path)?.title || item?.title || item?.meta?.title || item?.name || item?.path || '-',
  }))
})

const openDrawer = () => {
  tempStore.setProdSlider(true)
}

const closeDrawer = () => {
  tempStore.setProdSlider(false)
}

const setSectionRef = (el: HTMLElement | null, index: number) => {
  sectionRefs.value[index] = el
}

const scrollToSection = (index: number) => {
  hoveredSectionIndex.value = index
  sectionRefs.value[index]?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest',
  })
}

const goItem = (item: DrawerItem) => {
  closeDrawer()
  if (item.path) pushRoute(item.path)
}

const openRecent = (item: any) => {
  closeDrawer()
  const route = getRouteModel(item.path)?.routes?.[0]
  const targetPath = route?.path || item.fullPath
  if (targetPath) pushRoute({ path: targetPath })
}

watch(
  sections,
  value => {
    if (!value.length) {
      hoveredSectionIndex.value = -1
      return
    }
    if (hoveredSectionIndex.value >= value.length) {
      hoveredSectionIndex.value = -1
    }
  },
  { immediate: true },
)

watch(
  () => route.fullPath,
  () => {
    closeDrawer()
  },
)
</script>

<style scoped lang="scss">
.v2-product-drawer {
  position: fixed;
  inset: 56px 0 0;
  z-index: 5000;
  background: rgb(0 0 0 / 45%);
}

.v2-product-drawer__panel {
  display: flex;
  width: 1216px;
  height: calc(100vh - 56px);
  background: #fff;
}

.v2-product-drawer__rail {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e8ecf3;
}

.v2-product-drawer__rail-item {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  height: 56px;
  padding: 0 16px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  text-align: left;
  background: #f9fafc;
  border: 0;
  border-bottom: 1px solid #e8ecf3;
}

.v2-product-drawer__rail-icon {
  width: 20px;
  height: 20px;
}

.v2-product-drawer__rail-arrow {
  margin-left: auto;
  font-size: 16px;
}

.v2-product-drawer__content {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-top: 1px solid #e8ecf3;
}

.v2-product-drawer__header {
  display: flex;
  gap: 24px;
  align-items: center;
  height: 56px;
  padding: 0 24px;
  border-bottom: 1px solid #e8ecf3;
}

.v2-product-drawer__search {
  display: flex;
  flex: 1;
  gap: 12px;
  align-items: center;
  min-width: 0;
  height: 40px;
  padding: 0 8px;
  color: #828b9c;
}

.v2-product-drawer__search-icon {
  width: 20px;
  height: 20px;
}

.v2-product-drawer__search-divider {
  width: 1px;
  height: 16px;
  background: #191c23;
}

.v2-product-drawer__search span {
  overflow: hidden;
  font-size: 14px;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.v2-product-drawer__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  font-size: 24px;
  color: #191c23;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.v2-product-drawer__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 200px;
  height: calc(100% - 56px);
}

.v2-product-drawer__main {
  padding: 24px 16px;
  overflow: auto;
}

.v2-product-drawer__recent {
  padding: 0 16px;
  margin-bottom: 24px;
}

.v2-product-drawer__section-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  color: #191c23;
}

.v2-product-drawer__recent-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.v2-product-drawer__recent-item {
  height: 38px;
  padding: 0 16px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  text-align: left;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e8ecf3;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    color: #06f;
    background: #f9fafc;
  }
}

.v2-product-drawer__sections {
  column-count: 3;
  column-gap: 12px;
  padding: 0 0 24px;
}

.v2-product-drawer__section {
  padding: 4px 16px;
  margin-bottom: 8px;
  break-inside: avoid;
}

.v2-product-drawer__section-heading,
.v2-product-drawer__section-link,
.v2-product-drawer__anchor {
  width: 100%;
  padding: 0;
  text-align: left;
  background: transparent;
  border: 0;
}

.v2-product-drawer__section-heading {
  display: flex;
  align-items: center;
  height: 40px;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.v2-product-drawer__section-link {
  height: 38px;
  font-size: 14px;
  line-height: 22px;
  color: #50596a;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    color: #06f;
  }
}

.v2-product-drawer__section.is-active {
  // .v2-product-drawer__section-link {
  background: #f2f4f7;
  transition: background-color 0.2s ease;

  // }
}

.v2-product-drawer__anchors {
  padding: 24px 0;
  overflow: auto;
  background: #fff;
  border-left: 1px solid #e8ecf3;
}

.v2-product-drawer__anchor {
  height: 38px;
  padding-left: 12px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  border-left: 2px solid transparent;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;

  &.is-active,
  &:hover {
    color: #06f;
    background: #f9fafc;
    border-left-color: #06f;
  }
}

.v2-product-drawer-enter-active,
.v2-product-drawer-leave-active {
  transition: opacity 0.22s ease;
}

.v2-product-drawer-enter-active .v2-product-drawer__panel,
.v2-product-drawer-leave-active .v2-product-drawer__panel {
  transition:
    transform 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.24s ease;
}

.v2-product-drawer-enter-from,
.v2-product-drawer-leave-to {
  opacity: 0;
}

.v2-product-drawer-enter-from .v2-product-drawer__panel,
.v2-product-drawer-leave-to .v2-product-drawer__panel {
  opacity: 0.9;
  transform: translate3d(-20px, -8px, 0);
}
</style>
