<template>
  <main id="cat">
    <header class="header">
      <section
        id="logo"
        class="logo"
        :class="{ collapsed: tempStore.showSlider && baseStore.collapsed, 'logo-border': true }"
      >
        <div class="logo-txt">Logo</div>
        <div class="prod">
          <div class="toggle-prod">
            <div v-show="tempStore.prodSlider" class="the-close" @mouseenter="prodEnter">
              <SvgIcon name="dialog-close" />
            </div>
            <CatProductions />
          </div>
          <div v-show="!tempStore.prodSlider" class="prod-box" @click.stop="prodEnter" @mouseenter="prodEnter">
            <SvgIcon name="logo-collaspe" />
          </div>
        </div>
        <SvgIcon v-if="!baseStore.collapsed" :name="logoTextName" class="logo-icon" @click="handleLogo" />
      </section>
      <CatHeader />
    </header>
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
import CatHeader from './components/header/cat-header/cat-header-v1.vue'
import PageHeader from './components/header/default-page-header/default-page-header.vue'
import PermissionPage from '@/components/account-system/permission/page.vue'
import { useBaseStore, useTempStore, useUserStore } from '@/store'
import { _getItem } from '@/utils/storage'
import CatProductions from '@/components/common/cat-productions/index.vue'
import { TOKEN } from '@/config/constant-config'
import { routerLoading } from '@/router/index'
import { owUrl, logoTextName } from '@/config/base-config'

const baseStore = useBaseStore()
const tempStore = useTempStore()
const route = useRoute()
const userStore = useUserStore()

const showPageHeader = computed(() => {
  return tempStore.showSlider && tempStore.pageHeader && !route.meta.hidePageHeaderInV1
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

const prodEnter = () => {
  tempStore.setProdSlider(true)
}

const handleLogo = () => {
  location.href = owUrl
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
  }

  .logo-border {
    border-bottom: 1px solid var(--border-c);
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

    .prod {
      position: relative;
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      margin-right: 20px;

      .prod-box {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60px;
        height: 60px;

        & > svg {
          width: 24px;
          height: 24px;
        }
      }

      .toggle-prod {
        position: absolute;
        top: 0;
        left: 0;
        flex-shrink: 0;
        width: 100%;
        height: 100%;

        .the-close {
          position: absolute;
          top: 0;
          left: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background-color: var(--primary-color);

          & > svg {
            top: 20px;
            left: 20px;
            width: 24px;
            height: 24px;
            color: #fff;
          }
        }
      }
    }

    .logo-txt {
      position: absolute;
      top: 0;
      left: 0;
      color: transparent;
    }

    .logo-icon {
      font-size: 81px;
    }

    &.collapsed {
      width: var(--menu-w-collapsed);
      margin-right: 0;
      text-align: center;
      background-color: #fff;
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

      .prod {
        width: var(--menu-w-collapsed);
        margin-right: 0;
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
