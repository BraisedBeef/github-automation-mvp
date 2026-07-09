<template>
  <div class="v2-home">
    <div class="v2-home__grid">
      <div class="v2-home__main">
        <section class="v2-panel v2-home__top">
          <section
            class="v2-panel--hero tw-grid tw-grid-cols-1"
            :class="{ 'xl:tw-grid-cols-[minmax(586px,_1fr)_minmax(0,602px)]': hasRecentItems }"
          >
            <div class="hero-card">
              <img class="hero-card-bg" src="@/assets/v2/home-figma/images/hero-banner.png" alt="背景图" />
              <div class="hero-card__copy">
                <h2>{{ t('home.v2Welcome') }}</h2>
                <el-button class="v2-primary-btn" type="primary" @click="startTrial">
                  {{ t('home.v2StartTrial') }}
                </el-button>
              </div>
            </div>

            <div v-if="hasRecentItems" class="recent-panel">
              <div class="v2-panel__title">
                {{ t('home.access') }}
              </div>
              <div class="recent-panel__grid tw-grid tw-grid-cols-1 sm:tw-grid-cols-2">
                <button
                  v-for="(item, index) in recentItems"
                  :key="`${item.path || item.key}-${index}`"
                  class="recent-panel__item"
                  type="button"
                  @click="item.action ? item.action() : openAccessRoute(item)"
                >
                  {{ item.title }}
                </button>
              </div>
            </div>
          </section>

          <section class="v2-panel--resources">
            <div class="v2-panel__title">
              {{ t('home.naturalResources') }}
            </div>
            <div class="resource-grid">
              <button
                v-for="item in resourceCards"
                :key="item.key"
                class="resource-card"
                :class="`resource-card--${item.key}`"
                type="button"
                @click="goResourceConsole(item)"
              >
                <div class="resource-card__title">
                  <SvgIcon :name="item.icon" class="resource-card__icon" />
                  <span>{{ item.title }}</span>
                </div>
                <div class="resource-card__desc">
                  {{ item.key === 'cdn' ? item.detailValue : `${item.value} ${item.unit}` }}
                </div>
              </button>
            </div>
            <div v-if="showResourceEmpty" class="resource-empty">
              {{ t('home.noData') }}
            </div>
          </section>
        </section>
        <section class="metrics-row">
          <div class="v2-panel metric-panel">
            <div class="v2-panel__head">
              <div class="v2-panel__title">CDN</div>
              <button class="v2-inline-link v2-inline-link--dark" type="button" @click="goCdn">
                <span>{{ t('home.accelerating') }} {{ cdn?.deployed || 0 }}/{{ cdn?.total || 0 }}</span>
                <el-icon><ArrowRight /></el-icon>
              </button>
            </div>

            <div class="metric-panel__grid">
              <div class="metric-stat">
                <div class="metric-stat__label">
                  {{ t('home.yesterdayDataUsage') }}
                </div>
                <div class="metric-stat__value">
                  <span>{{ cdnFluxDetail.count }}</span>
                  <small>{{ cdnFluxDetail.unit }}</small>
                </div>
                <div class="metric-stat__bar">
                  <span class="metric-stat__bar-inland" :style="{ width: flowMetric.inlandP }" />
                  <span class="metric-stat__bar-overseas" :style="{ width: flowMetric.overseasP }" />
                </div>
              </div>

              <div class="metric-stat">
                <div class="metric-stat__label">
                  {{ t('home.yesterdayConsumption') }}
                </div>
                <div class="metric-stat__value">
                  <span>{{ reqFluxDetail.count }}</span>
                  <small>{{ reqFluxDetail.unit }}</small>
                </div>
                <div class="metric-stat__bar">
                  <span class="metric-stat__bar-inland" :style="{ width: reqMetric.inlandP }" />
                  <span class="metric-stat__bar-overseas" :style="{ width: reqMetric.overseasP }" />
                </div>
              </div>
            </div>

            <div class="metric-panel__legend">
              <span><i class="dot dot--blue" />{{ t('home.domestic') }}</span>
              <span><i class="dot dot--green" />{{ t('home.overseas') }}</span>
            </div>
          </div>

          <div class="v2-panel domain-panel">
            <div class="v2-panel__title">
              {{ t('home.domainServices') }}
            </div>
            <div class="domain-panel__grid">
              <div class="domain-panel__item">
                <div class="domain-panel__label">
                  {{ t('home.domainRegisterNum') }}
                </div>
                <div class="domain-panel__value">
                  {{ domain?.cnt || 0 }}
                </div>
                <button class="v2-text-link" type="button" @click="registerDomain">
                  {{ t('home.registerDomain') }}
                </button>
              </div>
              <div class="domain-panel__item">
                <div class="domain-panel__label">
                  {{ t('home.dnsNum') }}
                </div>
                <div class="domain-panel__value">
                  {{ dns.domain }}
                </div>
                <button
                  class="v2-text-link"
                  :class="{ 'v2-text-link--warn': dns.invalid_domain }"
                  type="button"
                  @click="addDns"
                >
                  {{
                    dns.invalid_domain
                      ? `${t('home.error')} ${dns.invalid_domain}`
                      : `${t('home.normal')} ${dns.effective_domain}`
                  }}
                </button>
              </div>
              <div class="domain-panel__item">
                <div class="domain-panel__label">
                  {{ t('home.sslNum') }}
                </div>
                <div class="domain-panel__value">0</div>
                <span class="domain-panel__muted">{{ t('home.applySsl') }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="v2-panel recommend-panel">
          <div class="v2-panel__title">
            {{ t('home.v2RecommendProduct') }}
          </div>

          <div class="recommend-tabs" role="tablist">
            <button
              v-for="item in featuredItems"
              :key="item.key"
              class="recommend-tabs__item"
              :class="{ 'is-active': activeFeatured?.key === item.key }"
              type="button"
              @click="activeFeaturedKey = item.key"
            >
              {{ item.title }}
            </button>
          </div>

          <div v-if="activeFeatured" class="recommend-body">
            <div class="recommend-body__copy">
              <span class="recommend-body__badge">
                {{ activeFeatured.badge }}
              </span>
              <h3>{{ activeFeatured.description }}</h3>
              <p>{{ activeFeatured.supportText }}</p>
              <el-button class="v2-primary-btn" type="primary" @click="goConsole(activeFeatured)">
                {{ activeFeatured.actionText }}
              </el-button>
            </div>
            <div class="recommend-body__visual">
              <img
                :src="featuredImageMap[activeFeatured.key]"
                :alt="activeFeatured.title"
                class="recommend-body__image"
              />
            </div>
          </div>
        </section>
      </div>

      <aside class="v2-home__side">
        <section class="v2-panel profile-panel">
          <div class="profile-panel__banner">
            <div class="profile-panel__avatar">
              <el-avatar v-if="userStore.user.headImg" :src="userStore.user.headImg" :size="64" />
              <SvgIcon v-else name="cat-header-account" class="profile-panel__fallback" />
            </div>
            <div class="profile-panel__copy">
              <div class="profile-panel__name">
                {{ userStore.user.userName || '-' }}
              </div>
              <div class="profile-panel__id">
                <span>{{ t('home.id') }}{{ userStore.user.id }}</span>
                <SvgIcon name="dns-copy" class="profile-panel__copy-icon" @click.stop="handleCopy(userStore.user.id)" />
              </div>
            </div>
          </div>

          <div class="profile-panel__body">
            <div class="v2-panel__head">
              <div class="v2-panel__title">
                {{ t('home.cost') }}
              </div>
              <button class="v2-inline-link v2-inline-link--dark" type="button" @click="toOrder">
                <span>{{ t('home.order') }}</span>
                <el-icon><ArrowRight /></el-icon>
              </button>
            </div>

            <div class="balance-card">
              <div class="balance-card__label">
                {{ t('home.accountPrice') }}
              </div>
              <div class="balance-card__row">
                <div class="balance-card__value">
                  <span>${{ userStore.user.balance || 0 }}</span>
                  <small>USD</small>
                </div>
                <el-button class="v2-primary-btn v2-primary-btn--compact" type="primary" @click="toRecharge">
                  {{ t('home.recharge') }}
                </el-button>
              </div>
            </div>

            <div class="balance-metrics">
              <button class="balance-metrics__item" type="button" @click="toOrder">
                <div>
                  <div class="balance-metrics__label">
                    {{ t('home.payOrder') }}
                  </div>
                  <div class="balance-metrics__value">
                    {{ userStore.user.orderNum || 0 }}
                  </div>
                </div>
                <span class="balance-metrics__link">
                  {{ t('home.v2PayNow') }}
                  <!-- <el-icon><TopRight /></el-icon> -->
                  <SvgIcon name="arrow" size="16" class="metrics__link__icon" />
                </span>
              </button>
              <button class="balance-metrics__item" type="button" @click="toOrder">
                <div>
                  <div class="balance-metrics__label">
                    {{ t('home.day30') }}
                  </div>
                  <div class="balance-metrics__value">
                    {{ userStore.user.expireNum || 0 }}
                  </div>
                </div>
                <span class="balance-metrics__link">
                  {{ t('home.v2RenewNow') }}
                  <!-- <el-icon><TopRight /></el-icon> -->
                  <SvgIcon name="arrow" class="metrics__link__icon" />
                </span>
              </button>
            </div>
          </div>
        </section>

        <section class="v2-panel access-panel">
          <div class="v2-panel__title">
            {{ t('home.accessControl') }}
          </div>
          <div class="access-panel__grid">
            <div class="access-panel__metric">
              <div class="access-panel__metric-box">
                <div class="access-panel__label">{{ t('home.user') }}（人）</div>
                <div class="access-panel__value">
                  {{ userStore.user.userNum || 0 }}
                </div>
              </div>
              <el-button class="access-panel__action" plain @click="toUserCreate">
                {{ t('home.addUser') }}
              </el-button>
            </div>
            <div class="access-panel__metric">
              <div class="access-panel__metric-box">
                <div class="access-panel__label">{{ t('home.role') }}（人）</div>
                <div class="access-panel__value">
                  {{ userStore.user.roleNum || 0 }}
                </div>
              </div>
              <el-button class="access-panel__action" plain @click="toRoleCreate">
                {{ t('home.addRole') }}
              </el-button>
            </div>
          </div>
        </section>

        <section class="v2-panel docs-panel">
          <div class="v2-panel__head">
            <div class="v2-panel__title">
              {{ t('home.doc') }}
            </div>
            <button class="v2-inline-link v2-inline-link--dark" type="button" @click="goDocumentCenter">
              <span>{{ t('home.v2DocCenter') }}</span>
              <el-icon><ArrowRight /></el-icon>
            </button>
          </div>

          <div class="docs-panel__grid">
            <button
              v-for="item in productDocs"
              :key="item.productId"
              class="docs-panel__item"
              type="button"
              @click="goOfficialDoc(item.productId)"
            >
              <SvgIcon name="menu-docs" class="docs-panel__icon" />
              <span>{{ item.name }}</span>
            </button>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import cvmFeatureImage from '@/assets/v2/home-figma/images/cvm-feature.png'
import dnsFeatureImage from '@/assets/v2/home-figma/images/dns-feature.png'
import domainFeatureImage from '@/assets/v2/home-figma/images/domain-feature.png'
import { CVM_KEY, DNS_KEY, DOMAIN_KEY } from '@/config/constant-config'
import { getRouteModel } from '@/router/map'
import t from '@/utils/i18n'
import { useHomeMainDashboard } from './use-home-main-dashboard'

const {
  accessHistory,
  activeFeatured,
  activeFeaturedKey,
  cdn,
  cdnFluxDetail,
  dns,
  domain,
  featuredItems,
  flowMetric,
  goCdn,
  goConsole,
  goResourceConsole,
  goDocumentCenter,
  goOfficialDoc,
  handleCopy,
  init,
  openAccessRoute,
  productDocs,
  registerDomain,
  reqFluxDetail,
  reqMetric,
  resourceCards,
  showResourceEmpty,
  startTrial,
  toOrder,
  toRecharge,
  toRoleCreate,
  toUserCreate,
  addDns,
  userStore,
} = useHomeMainDashboard()

const featuredImageMap = {
  [DNS_KEY]: dnsFeatureImage,
  [DOMAIN_KEY]: domainFeatureImage,
  [CVM_KEY]: cvmFeatureImage,
}

const recentItems = computed(() => {
  return accessHistory.value.slice(0, 6).map(item => ({
    ...item,
    title:
      getRouteModel(item.path)?.title ||
      item?.title ||
      item?.meta?.title ||
      item?.name ||
      item?.label ||
      item?.pathName ||
      item?.path ||
      '-',
  }))
})

const hasRecentItems = computed(() => recentItems.value.length > 0)

onMounted(() => {
  init()
})
</script>

<style scoped lang="scss">
.v2-home {
  min-height: 100%;
  overflow-x: hidden;
  background: #f2f4f7;
}

.v2-home__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 460px;
  gap: 20px;
  align-items: start;
  width: 100%;
}

.v2-home__main,
.v2-home__side {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.v2-home__top {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
}

.v2-panel {
  // border: 1px solid #e8ecf3;
  background: #fff;
}

.v2-panel__title {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.v2-panel__head {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.v2-primary-btn {
  min-width: 108px;
  height: 34px;
  padding: 0 12px;
  font-size: 14px;
  line-height: 22px;
  border: 0;
  border-radius: 0;
  box-shadow: none;

  &:hover,
  &:focus-visible {
    background: #1f75ff;
  }
}

.v2-primary-btn--compact {
  min-width: 76px;
}

.v2-inline-link,
.v2-text-link {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 0;
  font-size: 12px;
  line-height: 20px;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
  transition: color 0.2s ease;

  .el-icon {
    font-size: 14px;
  }

  &:hover {
    color: #3d8bff;
  }
}

.v2-inline-link--dark {
  color: #191c23;

  &:hover {
    color: #06f;
  }
}

.v2-panel--hero {
  gap: 20px;
}

.hero-card {
  position: relative;
  height: 196px;
  overflow: hidden;
  background: #f2f4fb;

  // overflow: hidden;
  // background:
  //   url('@/assets/v2/home-figma/images/hero-bg.png') no-repeat center / cover,
  //   linear-gradient(180deg, #fafbfd 0%, #fbfcff 100%);
  border: 1px solid #e8ecf3;

  // background:
  //   url('@/assets/v2/home-figma/images/hero-bg.png') no-repeat ,linear-gradient(180deg, #fafbfd 0%, #fbfcff 100%);
  // background-size: 520px 100%;
  // background-position: right;
}

.hero-card-bg {
  position: absolute;
  right: 0;
  left: 0;
  height: 100%;

  // width: 100%;
}

.hero-card__glow {
  position: absolute;
  background: linear-gradient(180deg, rgb(255 255 255 / 95%), rgb(231 244 255 / 92%));
  border: 1px solid rgb(91 160 255 / 18%);
  border-radius: 22px;
  box-shadow:
    0 12px 32px rgb(13 61 157 / 8%),
    inset 0 0 0 1px rgb(255 255 255 / 70%);
}

.hero-card__glow--lg {
  top: 29px;
  right: 98px;
  width: 154px;
  height: 126px;
}

.hero-card__glow--md {
  right: 232px;
  bottom: 30px;
  width: 84px;
  height: 68px;
}

.hero-card__glow--sm {
  top: 52px;
  right: 36px;
  width: 60px;
  height: 60px;
}

.hero-card__copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: flex-start;
  padding: 57px 32px;
}

.hero-card__copy h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
  color: #191c23;
}

.recent-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recent-panel__grid {
  gap: 12px;
}

.recent-panel__item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  font-size: 12px;
  line-height: 20px;
  color: #191c23;
  text-align: left;
  cursor: pointer;
  background: #fff;

  // padding: 0 16px;
  border: 1px solid #e8ecf3;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    color: #06f;
    border-color: rgb(0 102 255 / 28%);
    box-shadow: 0 10px 24px rgb(13 61 157 / 8%);
    transform: translateY(-1px);
  }
}

.v2-panel--resources {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  gap: 20px;
}

.resource-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  min-width: 0;
  height: 132px;
  padding: 24px;
  overflow: hidden;
  text-align: left;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e8ecf3;
  transition:
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    transform 0.22s ease,
    background 0.22s ease;

  &::before {
    position: absolute;
    inset: 0;
    content: '';
    background: url('@/assets/v2/home-figma/images/resource-card-bg.png') no-repeat center / cover;
    opacity: 0;
    transition: opacity 0.22s ease;
  }

  &:hover {
    box-shadow: 0 4px 10px 0 rgb(0 0 0 / 10%);

    &::before {
      opacity: 1;
    }
  }
}

.resource-card__title,
.resource-card__desc {
  position: relative;
  z-index: 1;
}

.resource-card__title {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.resource-card__icon {
  width: 24px;
  height: 24px;
  color: #191c23;
}

.metrics__link__icon {
  width: 16px;
  height: 16px;
}

.resource-card__desc {
  font-size: 12px;
  line-height: 20px;
  color: #5d6677;
}

.resource-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 132px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  border: 1px solid #e8ecf3;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.metric-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 218px;
  padding: 20px;
}

.metric-panel__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 194px));
  gap: 24px;
}

.metric-stat {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metric-stat__label,
.domain-panel__label,
.balance-card__label,
.balance-metrics__label,
.access-panel__label {
  font-size: 12px;
  line-height: 20px;
  color: #191c23;
}

.metric-stat__value,
.domain-panel__value,
.balance-metrics__value,
.access-panel__value {
  display: flex;
  gap: 6px;
  align-items: flex-end;
  color: #191c23;

  span,
  & {
    font-size: 24px;
    font-weight: 600;
    line-height: 32px;
  }

  small {
    padding-bottom: 2px;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
  }
}

.metric-stat__bar {
  display: flex;
  width: 100%;
  height: 6px;
  overflow: hidden;
  background: #edf0f5;
}

.metric-stat__bar-inland,
.metric-stat__bar-overseas {
  display: block;
  height: 100%;
}

.metric-stat__bar-inland {
  background: #4b8fff;
}

.metric-stat__bar-overseas {
  background: #4dc596;
}

.metric-panel__legend {
  display: flex;
  gap: 40px;
  align-items: center;

  span {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
    line-height: 20px;
    color: #191c23;
  }
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot--blue {
  background: #4b8fff;
}

.dot--green {
  background: #4dc596;
}

.domain-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 218px;
  padding: 20px;
}

.domain-panel__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.domain-panel__item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.domain-panel__muted {
  font-size: 12px;
  line-height: 20px;
  color: #828b9c;
}

.v2-text-link {
  width: fit-content;
}

.v2-text-link--warn {
  color: #ff5a5a;

  &:hover {
    color: #ff7373;
  }
}

.recommend-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 376px;
  padding: 20px;
}

.recommend-tabs {
  display: flex;
  gap: 32px;
  align-items: center;
  height: 42px;
  border-bottom: 1px solid #eef1f6;
}

.recommend-tabs__item {
  position: relative;
  height: 42px;
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: transparent;
  border: 0;
  transition: color 0.2s ease;

  &::after {
    position: absolute;
    right: 0;
    bottom: -1px;
    left: 0;
    height: 2px;
    content: '';
    background: #06f;
    transition: transform 0.2s ease;
    transform: scaleX(0);
    transform-origin: left center;
  }

  &:hover,
  &.is-active {
    color: #06f;
  }

  &.is-active::after {
    transform: scaleX(1);
  }
}

.recommend-body {
  display: flex;

  // display: grid;
  // grid-template-columns: minmax(0, 1fr) 365px;
  gap: 24px;
  justify-content: space-between;
  height: 230px;
  min-height: 230px;
  padding: 0 0 0 32px;
  overflow: hidden;
  border: 1px solid #e8ecf3;
}

.recommend-body__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  // justify-content: center;
  min-width: 0;
  padding-top: 28px;
}

.recommend-body__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 12px;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  background: #edf4ff;
}

.recommend-body__copy h3 {
  width: 100%;
  margin: 16px 0 0;
  font-size: 20px;
  font-weight: 500;
  line-height: 32px;
  color: #191c23;
}

.recommend-body__copy p {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 20px;
  color: #828b9c;
}

.recommend-body__copy .v2-primary-btn {
  margin-top: 20px;
}

.recommend-body__visual {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
  height: 100%;
}

.recommend-body__image {
  display: block;
  width: 350px;
  max-width: 100%;
  height: 100%;
  object-fit: contain;
}

.profile-panel {
  min-height: 398px;
}

.profile-panel__banner {
  position: relative;
  display: flex;
  gap: 20px;
  align-items: center;
  min-height: 112px;
  padding: 24px;
  overflow: hidden;
  background: url('@/assets/v2/home-figma/images/trial.png') no-repeat center / cover;
}

.profile-panel__avatar,
.profile-panel__copy {
  position: relative;
  z-index: 1;
}

.profile-panel__fallback {
  width: 64px;
  height: 64px;
  color: #70a0f7;
}

.profile-panel__copy {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.profile-panel__name {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.profile-panel__id {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  line-height: 20px;
  color: #828b9c;
}

.profile-panel__copy-icon {
  width: 16px;
  height: 16px;
  color: #9aa4b2;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #06f;
  }
}

.profile-panel__body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.balance-card {
  padding: 16px 20px;
  border: 1px solid #e8ecf3;
}

.balance-card__row {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.profile-panel__avatar {
  width: 64px;
  height: 64px;
}

.balance-card__value {
  display: flex;
  align-items: flex-end;
  color: #191c23;

  span {
    font-size: 40px;
    font-weight: 600;
    line-height: 40px;
    letter-spacing: 0;
  }

  small {
    padding: 0 0 3px 2px;
    font-size: 14px;
    font-weight: 600;
    line-height: 22px;
  }
}

.balance-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.balance-metrics__item {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  min-height: 86px;
  padding: 16px 20px;
  text-align: left;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e8ecf3;
  transition:
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    transform 0.22s ease;

  &:hover {
    border-color: rgb(0 102 255 / 18%);
    box-shadow: 0 12px 24px rgb(13 61 157 / 6%);
    transform: translateY(-1px);

    .balance-metrics__link {
      color: #3d8bff;
    }
  }
}

.balance-metrics__link {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  font-size: 12px;
  line-height: 20px;
  color: #06f;
  transition: color 0.2s ease;
}

.access-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 226px;
  padding: 20px;
}

.access-panel__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.access-panel__metric {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.access-panel__metric-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 92px;
  padding: 16px 20px;
  background: #f9fafc;
}

.access-panel__action {
  height: 34px;
  margin: 0;
  color: #191c23;
  background: #fff;
  border-color: #dcdfe6;
  border-radius: 0;

  &:hover,
  &:focus-visible {
    color: #06f;
    background: #fff;
    border-color: #06f;
  }
}

.docs-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 344px;
  padding: 20px;
}

.docs-panel__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 12px;
}

.docs-panel__item {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
  padding: 0;
  font-size: 12px;
  line-height: 20px;
  color: #191c23;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
  transition: color 0.2s ease;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    color: #06f;
  }
}

.docs-panel__icon {
  flex: none;
  width: 16px;
  height: 16px;
}
</style>
