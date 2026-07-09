<template>
  <div class="header-in" :class="{ 'header-in--sidebar': isSidebarMode }">
    <div class="cat-header-left">
      <button class="brand" type="button" @click="handleLogo">
        <SvgIcon name="v2-header-logo" class="brand__logo" />
      </button>
      <button class="home-entry" type="button" @click="toHome">
        <SvgIcon name="v2-header-home" class="home-entry__icon" />
        <span>{{ t('common.console') }}</span>
      </button>
    </div>

    <div class="cat-header-right">
      <div class="site-wrap">
        <HeaderSitesV2 :dark="isSidebarMode" />
      </div>
      <div class="cost-wrap">
        <HeaderCostV2 :dark="isSidebarMode" />
      </div>
      <div class="service-wrap">
        <HeaderContactV2 :dark="isSidebarMode" />
      </div>
      <div class="account-wrap">
        <HeaderAccountV2 />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import HeaderCostV2 from './header-cost-v2.vue'
import HeaderSitesV2 from './header-sites-v2.vue'
import HeaderAccountV2 from './header-account-v2.vue'
import HeaderContactV2 from './header-contact-v2.vue'
import { owUrl } from '@/config/base-config'
import { useTempStore } from '@/store'
import t from '@/utils/i18n'
import { pushRoute } from '@/utils/router-jump'

const tempStore = useTempStore()
const isSidebarMode = computed(() => tempStore.showSlider)

const handleLogo = () => {
  location.href = owUrl
}

const toHome = () => {
  pushRoute({ name: 'home' })
}
</script>

<style scoped lang="scss">
.header-in {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  height: 56px;
  padding: 0 24px 0 0;
  background: #fff;

  &.header-in--sidebar {
    background: #191c23;
  }
}

.cat-header-left,
.cat-header-right {
  display: flex;
  align-items: center;
}

.cat-header-left {
  // gap: 12px;
  min-width: 0;
}

.brand,
.home-entry,
.search-entry {
  padding: 0;
  background: transparent;
  border: 0;
}

.brand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  padding: 0 16px;
  color: #191c23;
  cursor: pointer;
}

.brand__logo {
  width: 55px;
  height: 22px;
}

.home-entry {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  height: 56px;
  padding: 16px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
}

.home-entry__icon {
  width: 20px;
  height: 20px;
}

.search-entry {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  width: 280px;
  min-width: 280px;
  height: 56px;
  margin-right: 24px;
  margin-left: auto;
  color: #828b9c;
  text-align: left;
  cursor: default;
}

.search-entry__icon {
  width: 20px;
  height: 20px;
}

.search-entry span {
  overflow: hidden;
  font-size: 14px;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cat-header-right {
  flex-shrink: 0;
  gap: 8px;
  height: 100%;
}

.site-wrap,
.cost-wrap,
.service-wrap,
.account-wrap {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 16px;
}

.header-in--sidebar {
  .brand,
  .home-entry {
    color: rgb(255 255 255 / 90%);
  }
}

@media (width <= 1100px) {
  .header-in {
    padding-right: 16px;
  }

  .search-entry {
    width: 220px;
    min-width: 220px;
    margin-right: 12px;
  }
}
</style>
