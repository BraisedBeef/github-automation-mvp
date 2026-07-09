<template>
  <div v-loading="loading" class="oss-overview-v2">
    <div class="oss-overview-v2__layout">
      <main class="oss-overview-v2__main">
        <section class="oss-overview-v2__hero">
          <div class="oss-overview-v2__hero-content">
            <h1>{{ t('oss.buyPack.title') }}</h1>
            <p>{{ t('productOverview.objectStorageDesc') }}</p>
            <div class="oss-overview-v2__hero-actions">
              <button
                class="oss-overview-v2__button oss-overview-v2__button--primary"
                type="button"
                @click="toPage('bucket')"
              >
                {{ t('oss.createBucket') }}
              </button>
              <a
                class="oss-overview-v2__button oss-overview-v2__button--outline"
                :href="`${documentUrl}document/detail?type=oss`"
                target="_blank"
                rel="noreferrer"
              >
                <span>{{ t('productOverview.detail') }}</span>
                <SvgIcon name="v2-right-arrow" />
              </a>
            </div>
          </div>
          <img class="oss-overview-v2__hero-image" :src="OssOverviewHero" alt="" />
        </section>

        <section class="oss-overview-v2__panel oss-overview-v2__usage">
          <header class="oss-overview-v2__panel-header">
            <div class="oss-overview-v2__usage-title">
              <h2>{{ t('oss.s6.usageOverview') }}</h2>
              <div class="oss-overview-v2__select">
                {{ t('oss.s6.storageCapacity') }}
              </div>
            </div>
            <button class="oss-overview-v2__link" type="button" @click="toPage('oss_usage_statistics')">
              <span>{{ t('oss.s6.viewMore') }}</span>
              <SvgIcon name="v2-right-arrow" />
            </button>
          </header>

          <div class="oss-overview-v2__metric-grid">
            <article v-for="item in metrics" :key="item.label" class="oss-overview-v2__metric-card">
              <div class="oss-overview-v2__metric-label">
                {{ item.label }}
              </div>
              <div class="oss-overview-v2__metric-value">
                <strong>{{ item.value }}</strong>
                <span>{{ item.unit }}</span>
              </div>
            </article>
          </div>
        </section>

        <section class="oss-overview-v2__panel oss-overview-v2__starter">
          <header class="oss-overview-v2__panel-header">
            <h2>{{ t('oss.s6.gettingStarted') }}</h2>
            <a
              class="oss-overview-v2__link"
              :href="`${documentUrl}document/detail?type=oss`"
              target="_blank"
              rel="noreferrer"
            >
              {{ t('oss.s6.viewMore') }}
              <SvgIcon name="v2-right-arrow" />
            </a>
          </header>

          <div class="oss-overview-v2__starter-grid">
            <article class="oss-overview-v2__starter-item">
              <div class="oss-overview-v2__starter-title">
                <span>1</span>
                <h3>{{ t('oss.createBucket') }}</h3>
              </div>
              <p>{{ t('oss.s6.createBucketGuide') }}</p>
              <button class="oss-overview-v2__mini-button" type="button" @click="toPage('bucket')">
                {{ t('oss.createBucket') }}
              </button>
            </article>
            <article class="oss-overview-v2__starter-item">
              <div class="oss-overview-v2__starter-title">
                <span>2</span>
                <h3>{{ t('oss.s6.manageObjects') }}</h3>
              </div>
              <p>{{ t('oss.s6.manageObjectsGuide') }}</p>
              <button class="oss-overview-v2__text-button" type="button" @click="toPage('bucket')">
                {{ t('oss.s6.learnMore') }}
                <SvgIcon name="v2-right-arrow" />
              </button>
            </article>
            <article class="oss-overview-v2__starter-item">
              <div class="oss-overview-v2__starter-title">
                <span>3</span>
                <h3>{{ t('oss.s6.viewUsageStatistics') }}</h3>
              </div>
              <p>{{ t('oss.s6.viewUsageStatisticsGuide') }}</p>
              <button class="oss-overview-v2__text-button" type="button" @click="toPage('oss_usage_statistics')">
                {{ t('oss.s6.learnMore') }}
                <SvgIcon name="v2-right-arrow" />
              </button>
            </article>
            <article class="oss-overview-v2__starter-item">
              <div class="oss-overview-v2__starter-title">
                <span>4</span>
                <h3>{{ t('oss.buyPackage') }}</h3>
              </div>
              <p>{{ t('oss.s6.buyResourcePackageGuide') }}</p>
              <button class="oss-overview-v2__mini-button" type="button" @click="toPage('oss_res_create')">
                {{ t('oss.buyPackage') }}
              </button>
            </article>
          </div>
        </section>
      </main>

      <aside class="oss-overview-v2__aside">
        <section class="oss-overview-v2__panel oss-overview-v2__package">
          <header class="oss-overview-v2__panel-header">
            <h2>{{ t('oss.resourcePackM') }}</h2>
            <button class="oss-overview-v2__link" type="button" @click="toPage('oss_resourcePack')">
              <span>{{ t('oss.resourcePackM') }}</span>
              <SvgIcon name="v2-right-arrow" />
            </button>
          </header>

          <div class="oss-overview-v2__package-stats">
            <div>
              <span>{{ t('oss.s6.effective') }}</span>
              <p>
                <strong>{{ overviewData.activeResourcePackages }}</strong> {{ t('oss.s6.count') }}
              </p>
            </div>
            <div>
              <span>{{ t('oss.s6.willExpire') }}</span>
              <p>
                <strong>{{ overviewData.expiringPackageCount }}</strong> {{ t('oss.s6.count') }}
              </p>
            </div>
          </div>

          <button
            class="oss-overview-v2__button oss-overview-v2__button--primary oss-overview-v2__buy"
            type="button"
            @click="toPage('oss_res_create')"
          >
            {{ t('oss.buyPackage') }}
          </button>
        </section>

        <section class="oss-overview-v2__panel oss-overview-v2__help">
          <header class="oss-overview-v2__panel-header">
            <h2>{{ t('oss.s6.helpDocs') }}</h2>
            <a
              class="oss-overview-v2__link"
              :href="`${documentUrl}document/detail?type=oss`"
              target="_blank"
              rel="noreferrer"
            >
              {{ t('oss.s6.viewMore') }}
              <SvgIcon name="v2-right-arrow" />
            </a>
          </header>
          <div class="oss-overview-v2__help-list">
            <a
              v-for="item in ['productOverview', 'basicConcepts', 'mainFeatures', 'productAdvantages']"
              :key="item"
              :href="`${documentUrl}document/detail?type=oss`"
              target="_blank"
              rel="noreferrer"
            >
              <span>{{ t(`oss.s6.${item}`) }}</span>
              <p>{{ t(`oss.s6.${item}Summary`) }}</p>
            </a>
          </div>
        </section>

        <section class="oss-overview-v2__panel oss-overview-v2__buckets">
          <header class="oss-overview-v2__panel-header">
            <h2>{{ t('oss.s6.recentAccessBucket') }}</h2>
            <button class="oss-overview-v2__link" type="button" @click="toPage('bucket')">
              <span>{{ t('oss.bucketList') }}</span>
              <SvgIcon name="v2-right-arrow" />
            </button>
          </header>

          <div class="oss-overview-v2__bucket-list">
            <button
              v-for="item in overviewData.lastAccessedBuckets"
              :key="`${item.bucket_id}-${item.region}-${item.name}`"
              type="button"
              @click="toPage('bucket_detail', { id: item.bucket_id, region: item.region, name: item.name })"
            >
              <SvgIcon name="oss-bucket-logo" />
              <span>{{ item.name }}</span>
              <SvgIcon name="v2-right-arrow" />
            </button>
            <div v-if="!overviewData.lastAccessedBuckets.length" class="oss-overview-v2__empty">--</div>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script lang="ts" setup>
import OssOverviewHero from '@/assets/v2/oss-figma/oss-overview-hero.png'
import { _getOssServicesOverview } from '@/apis/oss/storage-list'
import { documentUrl } from '@/config/base-config'
import t from '@/utils/i18n'
import { bytesToGB } from '@/utils/unit'
import { pushRoute } from '@/utils/router-jump'

const metrics = ref([
  { label: t('oss.s6.storageCapacity'), value: '0', unit: 'GB', key: 'storage' },
  { label: t('oss.s6.internetTraffic'), value: '0', unit: 'GB', key: 'traffic' },
  { label: t('oss.s6.readRequestCount'), value: 0, unit: t('oss.s6.times'), key: 'readCount' },
])

const loading = ref(false)
const overviewData = ref<any>({
  activeResourcePackages: 0,
  expiringPackageCount: 0,
  lastAccessedBuckets: [],
})

const toPage = (name, params = {}) => {
  pushRoute({
    name,
    params,
  })
}

// 获取对象存储服务概览数据
const getOssServiceOverview = async () => {
  try {
    loading.value = true
    const res = await _getOssServicesOverview()
    // 处理返回的数据
    console.log(res)
    if (res.data) {
      overviewData.value = res.data
      metrics.value.forEach(item => {
        switch (item.key) {
          case 'storage':
            item.value = bytesToGB(res.data.storage)
            break
          case 'traffic':
            item.value = bytesToGB(res.data.traffic)
            break
          case 'readCount':
            item.value = res.data.readCount
            break
        }
      })
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  getOssServiceOverview()
})
</script>

<style lang="scss" scoped>
.oss-overview-v2 {
  width: 100%;
  min-width: 0;
  color: #191c23;

  button {
    font: inherit;
  }

  &__layout {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr);
    gap: 24px;
    align-items: start;
  }

  &__main,
  &__aside {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
  }

  &__panel,
  &__hero {
    background: #fff;
  }

  &__hero {
    display: flex;
    align-items: center;
    min-height: 236px;
    padding-left: 32px;
    overflow: hidden;
  }

  &__hero-content {
    position: relative;
    z-index: 1;
    flex: 1;
    min-width: 0;

    h1 {
      margin: 0 0 8px;
      font-size: 24px;
      font-weight: 500;
      line-height: 32px;
      color: rgb(0 0 0 / 90%);
    }

    p {
      max-width: 560px;
      margin: 0;
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
      color: rgb(0 0 0 / 64%);
    }
  }

  &__hero-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }

  &__hero-image {
    flex: 0 0 314px;
    width: 314px;
    height: 236px;
    object-fit: cover;
  }

  &__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 76px;
    height: 34px;
    padding: 0 12px;
    font-size: 14px;
    line-height: 22px;
    text-decoration: none;
    cursor: pointer;
    background: #fff;
    border: 1px solid #06f;

    &--primary {
      color: #fff;
      background: #06f;
    }

    &--outline {
      gap: 8px;
      color: #06f;

      svg {
        width: 16px;
        height: 16px;
      }
    }
  }

  &__panel {
    padding: 24px;
    overflow: hidden;
  }

  &__panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 0;

    h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
      color: #191c23;
    }
  }

  &__link {
    display: inline-flex;
    flex-shrink: 0;
    gap: 4px;
    align-items: center;
    padding: 0;
    font-size: 14px;
    line-height: 22px;
    color: #828b9c;
    text-decoration: none;
    cursor: pointer;
    background: transparent;
    border: 0;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      color: #06f;
    }

    &--muted {
      cursor: default;

      &:hover {
        color: #828b9c;
      }
    }
  }

  &__usage {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__usage-title {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  &__select {
    position: relative;
    width: 114px;
    height: 30px;
    padding: 4px 28px 4px 8px;
    overflow: hidden;
    font-size: 12px;
    line-height: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
    border: 1px solid #dcdfe6;

    &::after {
      position: absolute;
      top: 9px;
      right: 10px;
      width: 6px;
      height: 6px;
      content: '';
      border-right: 1px solid #828b9c;
      border-bottom: 1px solid #828b9c;
      transform: rotate(45deg);
    }
  }

  &__metric-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }

  &__metric-card {
    min-width: 0;
    padding: 20px;
    background: #f9fafc;
  }

  &__metric-label {
    overflow: hidden;
    font-size: 12px;
    line-height: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__metric-value {
    display: flex;
    gap: 4px;
    align-items: baseline;
    margin-top: 12px;
    font-family: MiSans, 'Noto Sans CJK', sans-serif;
    font-size: 14px;
    line-height: 32px;

    strong {
      font-size: 24px;
      font-weight: 600;
    }
  }

  &__starter {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__starter-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  &__starter-item {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 142px;
    padding: 0 16px;
    border-right: 1px solid #e8ebf0;

    &:first-child {
      padding-left: 0;
    }

    &:last-child {
      padding-right: 0;
      border-right: 0;
    }

    > p {
      flex: 1;
      margin: 12px 0;
      font-size: 12px;
      line-height: 20px;
      color: #828b9c;
    }
  }

  &__starter-title {
    display: flex;
    gap: 8px;
    align-items: center;

    > span {
      display: inline-flex;
      flex: 0 0 20px;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      font-size: 14px;
      line-height: 20px;
      color: #06f;
      border: 1px solid #06f;
      border-radius: 50%;
    }

    h3 {
      margin: 0;
      overflow: hidden;
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__mini-button,
  &__text-button {
    align-self: flex-start;
    min-height: 28px;
    padding: 4px 8px;
    font-size: 12px;
    line-height: 20px;
    color: #fff;
    cursor: pointer;
    background: #06f;
    border: 0;
  }

  &__text-button {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 0;
    font-size: 14px;
    line-height: 22px;
    color: #06f;
    background: transparent;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  &__package {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__package-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;

    > div {
      min-width: 0;
    }

    span {
      display: block;
      overflow: hidden;
      font-size: 12px;
      line-height: 20px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    p {
      margin: 8px 0 0;
      font-family: MiSans, 'Noto Sans CJK', sans-serif;
      font-size: 14px;
      line-height: 32px;

      strong {
        margin-right: 2px;
        font-size: 24px;
        font-weight: 600;
      }
    }
  }

  &__buy {
    width: 100%;
  }

  &__help {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__help-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    > a {
      display: flex;
      gap: 12px;
      align-items: center;
      min-width: 0;
      color: inherit;
      text-decoration: none;

      > span {
        flex-shrink: 0;
        padding: 2px 6px;
        font-size: 12px;
        line-height: 20px;
        color: #06f;
        background: rgb(0 102 255 / 8%);
      }

      p {
        min-width: 0;
        margin: 0;
        overflow: hidden;
        font-size: 14px;
        line-height: 22px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  &__buckets {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__bucket-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    button {
      display: flex;
      gap: 8px;
      align-items: center;
      width: 100%;
      min-width: 0;
      padding: 0;
      color: #191c23;
      text-align: left;
      cursor: pointer;
      background: transparent;
      border: 0;

      svg {
        flex: 0 0 20px;
        width: 20px;
        height: 20px;
      }

      svg:last-child {
        flex-basis: 16px;
        width: 16px;
        height: 16px;
      }

      span {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        font-size: 14px;
        line-height: 22px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &:hover {
        color: #06f;
      }
    }
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 136px;
    color: #828b9c;
  }
}

@media (width <= 1440px) {
  .oss-overview-v2 {
    &__hero-image {
      flex-basis: 260px;
      width: 260px;
      object-position: center;
    }

    &__starter-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      row-gap: 24px;
    }

    &__starter-item:nth-child(2) {
      border-right: 0;
    }
  }
}

@media (width <= 1100px) {
  .oss-overview-v2 {
    &__layout {
      grid-template-columns: 1fr;
    }

    &__aside {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__buckets {
      grid-column: 1 / -1;
    }
  }
}
</style>
