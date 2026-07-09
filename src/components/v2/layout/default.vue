<template>
  <main id="cat" class="theme-v2">
    <header class="header" :class="{ 'header--v2-sidebar': tempStore.showSlider }">
      <section
        id="logo"
        ref="logoSectionRef"
        class="logo logo--v2"
        :class="{
          collapsed: tempStore.showSlider && baseStore.collapsed,
          'logo--v2-open': tempStore.prodSlider,
          'logo--v2-sidebar': tempStore.showSlider,
        }"
      >
        <button
          ref="logoToggleRef"
          class="logo-toggle"
          type="button"
          @mouseenter="handleV2MenuEnter"
          @mouseleave="handleV2MenuLeave"
          @click="handleV2MenuClick"
        >
          <template v-if="tempStore.prodSlider">
            <SvgIcon name="close" class="logo-toggle__icon logo-toggle__icon--close" />
          </template>
          <template v-else>
            <SvgIcon name="v2-header-menu" class="logo-toggle__icon" />
          </template>
        </button>
      </section>
      <CatHeader />
    </header>
    <ProductDrawerV2 />
    <section class="container">
      <CatMenu v-if="tempStore.showSlider" />
      <section
        v-loading="routerLoading"
        :class="['container-in', baseStore.collapsed ? 'collapsed' : '', tempStore.showSlider ? '' : 'container-all']"
      >
        <PageHeader v-if="showPageHeader" />
        <section
          id="page-wrap"
          class="page-wrap"
          :style="pageWrapStyle"
          :class="{ 'without-page-header': shouldRemovePageWrapPadding }"
        >
          <PermissionPage>
            <RouterView />
          </PermissionPage>
        </section>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import CatMenu from './components/menu/cat-menu.vue'
import CatHeader from './components/header/cat-header/cat-header-v2.vue'
import ProductDrawerV2 from './components/header/cat-header/product-drawer-v2.vue'
import PageHeader from './components/header/default-page-header/default-page-header.vue'
import PermissionPage from '@/components/account-system/permission/page.vue'
import { useBaseStore, useTempStore, useUserStore } from '@/store'
import { _getItem } from '@/utils/storage'
import { TOKEN } from '@/config/constant-config'
import { routerLoading } from '@/router/index'

const baseStore = useBaseStore()
const tempStore = useTempStore()
const route = useRoute()
const userStore = useUserStore()
const logoSectionRef = ref<HTMLElement | null>(null)
const logoToggleRef = ref<HTMLElement | null>(null)

const showPageHeader = computed(() => {
  return tempStore.showSlider && tempStore.pageHeader && !route.meta.hidePageHeaderInV2
})

const shouldRemovePageWrapPadding = computed(() => {
  return tempStore.showSlider && !showPageHeader.value
})

const pageWrapStyle = computed(() => {
  const allShowSliderRouteNames = [
    'payment_product_order',
    'payment_online',
    'payment_success',
    'payment_fail',
    'tg_bind_success',
    'ins_create',
    'cvm_refund_order',
    'cvm_refund_success',
    'network_refund_order',
    'public_ip_order',
    'payment_pre_pay_order',
    'payment_pre_refund_order',
    'ssl_certificate_purchase',
    'oss_res_create',
  ]

  const name = route.name as string
  const res = allShowSliderRouteNames.includes(name)

  return {
    padding: res ? '0px' : '20px',
    minHeight: res ? '100%' : 'calc(100% - var(--page-header-h))',
  }
})

const handleV2MenuEnter = () => {
  tempStore.setProdSlider(true)
}

const handleV2MenuLeave = (event: MouseEvent) => {
  const nextTarget = event.relatedTarget as Node | null
  if (!nextTarget) {
    tempStore.setProdSlider(false)
    return
  }

  const isMovingWithinInteractiveArea =
    logoSectionRef.value?.contains(nextTarget) ||
    logoToggleRef.value?.contains(nextTarget) ||
    document.querySelector('.v2-product-drawer')?.contains(nextTarget)

  if (isMovingWithinInteractiveArea) return

  tempStore.setProdSlider(false)
}

const handleV2MenuClick = () => {
  if (tempStore.prodSlider) {
    tempStore.setProdSlider(false)
    return
  }

  if (tempStore.showSlider) {
    baseStore.toggleCollaspe()
    return
  }

  tempStore.setProdSlider(!tempStore.prodSlider)
}

onMounted(() => {
  const token = _getItem(TOKEN, true)
  token && userStore.getUser()
})
</script>

<style lang="scss">
html,
body,
#app {
  width: 100%;
  height: 100%;
}

#cat {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 1210px;
  height: 100%;

  .header {
    display: flex;
    width: 100%;
    height: var(--header-h);

    &.header--v2-sidebar {
      background: #191c23;
    }
  }

  #logo {
    position: relative;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    width: var(--menu-w);
    height: 100%;
    padding: 0;
    overflow: hidden;
    color: #fff;
    cursor: pointer;
    user-select: none;
    background-color: #fff;
    transition: width 0.3s;

    &.logo--v2 {
      justify-content: center;
      width: 72px;

      .logo-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 72px;
        height: 56px;
        padding: 0;
        line-height: 0;
        cursor: pointer;
        background: transparent;
        border: 0;

        &:hover {
          background: #f8f9fb;
        }
      }

      .logo-toggle__icon {
        display: block;
        flex-shrink: 0;
        width: 24px;
        height: 24px;
      }

      .logo-toggle__icon--close {
        width: 16px;
        height: 16px;
      }
    }

    &.logo--v2-sidebar {
      background: #191c23;

      .logo-toggle {
        color: rgb(255 255 255 / 90%);

        &:hover {
          background: rgb(255 255 255 / 4%);
        }
      }

      &.collapsed {
        background: #191c23;
        border-right: none;
      }
    }

    &.logo--v2-open {
      background: #06f;
      border-right-color: #0052d9;

      .logo-toggle {
        width: 72px;

        &:hover {
          background: #06f;
        }
      }

      .logo-toggle__icon {
        color: #fff;
      }
    }

    &.collapsed {
      width: var(--menu-w-collapsed);
      margin-right: 0;
      text-align: center;
      border-right: 1px solid #fff;

      &::before {
        display: none;
      }

      svg {
        margin-right: 0;
      }

      img {
        display: none;
      }

      &.logo--v2 {
        width: 56px;
      }
    }
  }

  .container {
    display: flex;
    flex: 1;
    height: 0;

    & > div {
      flex-shrink: 0;
    }

    .container-in {
      display: flex;
      flex-direction: column;
      width: calc(100% - var(--menu-w));
      margin-left: auto;
      transition: all 0.25s;

      &.collapsed {
        width: calc(100% - var(--menu-w-collapsed));
      }

      .page-wrap {
        flex: 1;
        height: 0;
        padding: 20px;
        overflow: auto;
        background-color: #f2f4f8;
        background-blend-mode: overlay;

        &.without-page-header {
          height: 100%;
          padding: 0 !important;
        }
      }
    }

    .container-all {
      width: 100% !important;
    }
  }
}
</style>
