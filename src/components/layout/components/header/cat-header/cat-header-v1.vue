<template>
  <div class="header-in" :class="{ collapsed: baseStore.collapsed }">
    <slot name="left">
      <div class="cat-header-left">
        <div v-if="baseStore.collapsed" class="logo">
          <SvgIcon :name="logoTextName" class="logo-icon" @click="handleLogo" />
        </div>
        <span class="cat-header-title" @click="toHome">
          <SvgIcon name="console-icon" />
          {{ t('common.console') }}
        </span>
      </div>
    </slot>
    <slot name="center" />
    <slot name="right">
      <div class="cat-header-right">
        <!-- 费用中心 -->
        <div class="cost-wrap">
          <HeaderCost />
        </div>
        <!-- 站点 -->
        <div class="site-wrap">
          <HeaderSites />
        </div>
        <!-- 图标: 耳机和信息 -->
        <div class="icon-wrap">
          <HeaderContact />
        </div>
        <!-- <div class="icon-wrap">
          <SvgIcon name="cat-header-msg" class="header-icon"  pointer @click="toWebsite"></SvgIcon>
        </div> -->
        <!-- 用户 -->
        <div class="account-wrap">
          <HeaderAccount />
        </div>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import HeaderCost from './header-cost.vue'
import HeaderSites from './header-sites.vue'
import HeaderAccount from './header-account.vue'
// import HeaderAccount from './HeaderAccountFeat.vue'
import { useBaseStore } from '@/store'
import t from '@/utils/i18n'

import HeaderContact from './header-contact.vue'
import { owUrl, logoTextName } from '@/config/base-config'
import { pushRoute } from '@/utils/router-jump'

const baseStore = useBaseStore()

const handleLogo = () => {
  location.href = owUrl
}

const toHome = () => {
  // baseStore.routeModel = '/home'
  pushRoute({
    name: 'home',
  })
}
</script>

<style scoped lang="scss">
.header-in {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  border-bottom: 1px solid var(--border-c);

  .cat-header-left {
    display: flex;
    font-family: 'PingFang SC-Regular', 'PingFang SC';
    font-size: 16px;
    font-weight: 400;
    color: var(--common-text);

    .logo {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 137px;
      height: var(--header-h);
      margin-right: 20px;
      line-height: var(--header-h);

      &::before {
        position: absolute;
        top: 50%;
        left: 100%;
        display: inline-block;
        width: 1px;
        height: 20px;
        margin-right: 20px;
        content: '';
        background-color: var(--border-c);
        transform: translateY(-50%);
      }

      .logo-icon {
        font-size: 81px;
      }
    }

    & > span {
      /* line-height: var(--header-h);
      text-align: center;
      white-space: nowrap; */
    }

    .cat-header-title {
      display: flex;
      align-items: center;
      justify-content: center;
      height: calc(var(--header-h) - 1px);
      padding: 0 20px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 16px;
      font-weight: 400;
      color: #000;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: #f9fafc;
      }

      svg {
        width: 16px;
        height: 16px;
        margin-right: 5px;
      }
    }
  }

  .cat-header-right {
    /* padding: 0 20px; */
    display: flex;
    align-items: center;
    height: 100%;

    .cost-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 0 20px;

      &:hover {
        background-color: #f9fafc;
      }

      :deep(.el-dropdown) {
        position: relative;
        width: 100%;
        height: 100%;

        .cost-center {
          width: 100%;
          height: 100%;
          font-family: 'PingFang SC', 'PingFang SC';
          font-size: 16px;
          font-weight: 400;
          line-height: 60px;
          color: #000;
          text-align: center;
          white-space: nowrap;
          cursor: pointer;
        }
      }
    }

    .site-wrap {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;

      /* min-width: 139px; */
      padding: 0 20px;

      &:hover {
        background-color: #f9fafc;
      }
    }

    .icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;

      // width: 60px;
      height: 100%;
      padding: 0 20px;

      &:hover {
        background-color: #f9fafc;
      }

      .header-icon {
        width: 21px;
        height: 21px;
        color: var(--common-text);

        &:hover {
          color: var(--primary-color);
          animation: r 1 0.2s linear alternate;
        }

        @keyframes r {
          from {
            transform: rotateZ(-10deg);
          }

          to {
            transform: rotateZ(10deg);
          }
        }
      }
    }

    .account-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 70px;
      height: 100%;

      &:hover {
        background-color: #f9fafc;
      }

      :deep(.el-dropdown) {
        width: 100%;
        height: 100%;

        .drop {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
      }
    }
  }

  &.collapsed {
    .cat-header-left {
      padding-left: 0;
    }
  }
}
</style>

<style lang="scss">
.el-popper.is-light.cost-dropdown {
  top: calc(var(--header-h) - 1px) !important;
  left: -20px !important;
}
</style>
