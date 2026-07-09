<template>
  <div v-loading="loading" class="oss-bucket-overview-v2">
    <section v-if="showNotice" class="oss-bucket-overview-v2__notice">
      <SvgIcon name="cat-message-info" class="oss-bucket-overview-v2__notice-icon" />
      <p>
        {{ t('oss.s6.bucketUsageOverviewTip') }}
        <button type="button" @click="goToBilling">
          {{ t('oss.s6.goToBillingDetails') }}
        </button>
      </p>
      <button
        class="oss-bucket-overview-v2__notice-close"
        type="button"
        :aria-label="t('oss.close')"
        @click="showNotice = false"
      >
        <SvgIcon name="close" />
      </button>
    </section>

    <section class="page-box oss-bucket-overview-v2__section oss-bucket-overview-v2__usage">
      <header class="oss-bucket-overview-v2__section-header">
        <h3>{{ t('oss.s6.usageOverview') }}</h3>
      </header>

      <div class="oss-bucket-overview-v2__metric-grid">
        <article v-for="item in metrics" :key="item.key" class="oss-bucket-overview-v2__metric-card">
          <div class="oss-bucket-overview-v2__metric-label">
            <span>{{ item.label }}</span>
            <SvgIcon v-if="item.selectable" name="down-arrow" />
            <el-tooltip v-if="item.tooltip" :content="item.tooltip" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" class="oss-bucket-overview-v2__help-icon" />
            </el-tooltip>
          </div>

          <div class="oss-bucket-overview-v2__metric-value">
            <strong>{{ item.value }}</strong>
            <span>{{ item.unit }}</span>
          </div>

          <div v-if="item.comparisons" class="oss-bucket-overview-v2__comparisons">
            <span
              v-for="(comparison, index) in item.comparisons"
              :key="comparison.label"
              :class="{ 'has-divider': index === 0 }"
            >
              {{ comparison.label }}
              <SvgIcon
                :name="comparison.direction === 'down' ? 'sort-down' : 'sort-up'"
                :class="`is-${comparison.direction}`"
              />
              {{ comparison.value }}
            </span>
          </div>
          <p v-else class="oss-bucket-overview-v2__metric-caption">
            {{ item.caption }}
          </p>
        </article>
      </div>
    </section>

    <div class="oss-bucket-overview-v2__content-grid">
      <section class="page-box oss-bucket-overview-v2__section oss-bucket-overview-v2__section--basic">
        <header class="oss-bucket-overview-v2__section-header">
          <h3>{{ t('oss.basicInformation') }}</h3>
        </header>

        <div class="oss-bucket-overview-v2__info-list">
          <div v-for="item in basicInfoItems" :key="item.label" class="oss-bucket-overview-v2__info-item">
            <div class="oss-bucket-overview-v2__info-label">
              <span>{{ item.label }}</span>
              <el-tooltip v-if="item.tooltip" :content="item.tooltip" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="oss-bucket-overview-v2__help-icon" />
              </el-tooltip>
            </div>

            <div class="oss-bucket-overview-v2__info-value">
              <Copy v-if="item.copy" :text="item.value" />
              <span v-else>{{ item.value }}</span>
              <button
                v-if="item.action"
                class="oss-bucket-overview-v2__link"
                type="button"
                @click="goToTab(item.action)"
              >
                {{ t('common.settings') }}
                <SvgIcon name="share" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="page-box oss-bucket-overview-v2__section">
        <header class="oss-bucket-overview-v2__section-header">
          <h3>{{ t('oss.s6.bucketConfiguration') }}</h3>
        </header>

        <div class="oss-bucket-overview-v2__config-grid">
          <div
            v-for="(group, groupIndex) in configColumns"
            :key="groupIndex"
            class="oss-bucket-overview-v2__config-column"
          >
            <div v-for="item in group" :key="item.label" class="oss-bucket-overview-v2__config-item">
              <div class="oss-bucket-overview-v2__config-label">
                {{ item.label }}
              </div>

              <div class="oss-bucket-overview-v2__config-value">
                <span>{{ item.value }}</span>
                <button
                  v-if="item.action"
                  class="oss-bucket-overview-v2__link"
                  type="button"
                  @click="goToTab(item.action.tab, item.action.config)"
                >
                  {{ t('common.settings') }}
                  <SvgIcon name="share" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { _getBucketCrossDomain, _getBucketOverview, _getBucketReferer } from '@/apis/oss/storage-list'
import t from '@/utils/i18n'
import { FORMAT_TIME, maoYunDayJs } from '@/utils/mao-yun-day-js'
import { pushRoute, replaceRoute } from '@/utils/router-jump'
import { getFluxDetail } from '@/utils/unit'
import { BucketInfo } from '@/views/oss/hooks/use-oss'

const ACL_MAP: Record<string, string> = {
  private: t('oss.privateReadWrite'),
  'public-read-write': t('oss.publicReadPrivateWrite'),
  'public-read': t('oss.publicReadWrite'),
}

const bucketInfo = ref({
  baseInfo: {
    name: '',
    defaultDomain: '',
    region: '',
    'x-oss-acl': '',
    createDate: 0,
  },
  objectCount: 0,
  readCount: 0,
  storage: 0,
  traffic: 0,
})

const loading = ref(false)
const showNotice = ref(true)
const crossDomainRuleCount = ref(0)
const refererEnabled = ref(false)

const currSelectBucket = inject<BucketInfo>('currSelectBucket', {
  name: '',
  region: '',
  sseAlgorithm: '',
})

const formattedCreateTime = computed(() => {
  return bucketInfo.value.baseInfo.createDate
    ? `${maoYunDayJs(bucketInfo.value.baseInfo.createDate * 1000).format(FORMAT_TIME)}`
    : '-'
})

const storageDetail = computed(() => getFluxDetail(bucketInfo.value.storage))
const trafficDetail = computed(() => getFluxDetail(bucketInfo.value.traffic))
const encryptionEnabled = computed(() => currSelectBucket?.sseAlgorithm === 'AES256')
const encryptionStatus = computed(() => (encryptionEnabled.value ? t('oss.s6.enabled') : t('oss.s6.notEnabled')))
const aclLabel = computed(() => ACL_MAP[bucketInfo.value.baseInfo['x-oss-acl']] || '-')
const defaultDomain = computed(() => bucketInfo.value.baseInfo.defaultDomain || '-')

const metrics = computed(() => [
  {
    key: 'objectCount',
    label: t('oss.s6.objectCount'),
    value: bucketInfo.value.objectCount,
    unit: t('oss.s6.count'),
    selectable: true,
    tooltip: t('oss.s6.usageOverviewTip'),
    comparisons: [
      { label: t('oss.s6.comparedWithYesterday'), direction: 'up', value: '0%' },
      { label: t('oss.s6.comparedWithLastMonth'), direction: 'up', value: '0%' },
    ],
  },
  {
    key: 'storage',
    label: t('oss.storage'),
    value: storageDetail.value.count,
    unit: storageDetail.value.unit,
    comparisons: [
      { label: t('oss.s6.comparedWithYesterday'), direction: 'down', value: '0%' },
      { label: t('oss.s6.comparedWithLastMonth'), direction: 'down', value: '0%' },
    ],
  },
  {
    key: 'traffic',
    label: t('oss.s6.internetTraffic'),
    value: trafficDetail.value.count,
    unit: trafficDetail.value.unit,
    selectable: true,
    caption: `${t('oss.s6.lastMonthInternetTraffic')} 0 B`,
  },
  {
    key: 'readCount',
    label: t('oss.s6.readRequestCount'),
    value: bucketInfo.value.readCount,
    unit: t('oss.s6.times'),
    selectable: true,
    caption: `${t('oss.s6.lastMonthReadRequests')} 0 ${t('oss.s6.times')}`,
  },
])

const basicInfoItems = computed(() => [
  { label: t('oss.bucketName'), value: bucketInfo.value.baseInfo.name || '-', copy: true },
  { label: t('oss.region'), value: bucketInfo.value.baseInfo.region || '-' },
  {
    label: t('oss.createTime'),
    value: formattedCreateTime.value,
    tooltip: t('common.time_zone_desc'),
  },
  { label: t('oss.accessPermissions'), value: aclLabel.value, action: 6 },
  { label: t('oss.s6.defaultDomainName'), value: defaultDomain.value, copy: true },
])

const configColumns = computed(() => [
  [
    { label: t('oss.s6.multiAZFeature'), value: t('oss.s6.enabled') },
    {
      label: t('oss.s6.crossDomainAccess'),
      value: t('oss.s6.ruleCount', { count: crossDomainRuleCount.value }),
      action: { tab: 5, config: '3' },
    },
    {
      label: t('oss.s6.originPull'),
      value: t('oss.s6.notConfigured'),
    },
    {
      label: t('oss.s6.inventory'),
      value: t('oss.s6.notConfigured'),
    },
    {
      label: t('oss.s6.lifecycle'),
      value: t('oss.s6.notConfigured'),
    },
    {
      label: t('oss.s6.logManagement'),
      value: t('oss.s6.notConfigured'),
    },
  ],
  [
    {
      label: t('oss.s6.metadataAcceleration'),
      value: t('oss.s6.notEnabled'),
    },
    {
      label: t('oss.versionControl'),
      value: t('oss.s6.notEnabled'),
    },
    {
      label: t('oss.s6.bucketEncryption'),
      value: encryptionStatus.value,
      action: { tab: 5, config: '1' },
    },
    {
      label: t('oss.s6.antiLeech'),
      value: refererEnabled.value ? t('oss.s6.enabled') : t('oss.s6.notConfigured'),
      action: { tab: 5, config: '2' },
    },
    {
      label: t('oss.s6.bucketReplication'),
      value: t('oss.s6.notConfigured'),
    },
  ],
])

const goToTab = (tabValue: number, config?: string) => {
  replaceRoute({
    name: 'bucket_detail',
    query: {
      active: tabValue,
      ...(config ? { config } : {}),
    },
  })
}

const goToBilling = () => {
  pushRoute({ name: 'expense_bill_bill_list' })
}

const getBucketOverview = async () => {
  const params = {
    bucketName: currSelectBucket.name,
    region: currSelectBucket.region,
  }
  const [overviewResult, crossDomainResult, refererResult] = await Promise.allSettled([
    _getBucketOverview(params),
    _getBucketCrossDomain(params),
    _getBucketReferer(params),
  ])

  if (overviewResult.status === 'fulfilled' && overviewResult.value.data) {
    bucketInfo.value = overviewResult.value.data
  }
  if (crossDomainResult.status === 'fulfilled') {
    crossDomainRuleCount.value = crossDomainResult.value.data?.rules?.length || 0
  }
  if (refererResult.status === 'fulfilled') {
    refererEnabled.value = Boolean(refererResult.value.data?.status)
  }
}

onMounted(async () => {
  try {
    loading.value = true
    await getBucketOverview()
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.oss-bucket-overview-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #191c23;

  button {
    font: inherit;
  }

  &__notice {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    min-height: 46px;
    padding: 12px 16px;
    color: #06f;
    background: rgb(0 102 255 / 16%);

    p {
      flex: 1;
      margin: 0;
      font-size: 14px;
      line-height: 22px;
    }

    p button {
      padding: 0;
      color: inherit;
      cursor: pointer;
      background: transparent;
      border: 0;
    }
  }

  &__notice-icon,
  &__notice-close {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }

  &__notice-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    color: #06f;
    cursor: pointer;
    background: transparent;
    border: 0;

    :deep(svg) {
      width: 16px;
      height: 16px;
    }
  }

  &__section {
    padding: 24px;
  }

  &__section-header {
    display: flex;
    align-items: center;
    min-width: 0;
    margin-bottom: 24px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
      color: #191c23;
    }
  }

  &__usage {
    .oss-bucket-overview-v2__section-header {
      margin-bottom: 40px;
    }
  }

  &__metric-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  &__metric-card {
    min-width: 0;
  }

  &__metric-label {
    display: flex;
    gap: 4px;
    align-items: center;
    height: 22px;
    margin-bottom: 24px;
    font-size: 14px;
    line-height: 22px;
    color: #191c23;

    > svg {
      width: 16px;
      height: 16px;
    }
  }

  &__help-icon {
    width: 16px;
    height: 16px;
    color: #828b9c;
  }

  &__metric-value {
    display: flex;
    gap: 8px;
    align-items: baseline;
    height: 32px;

    strong {
      font-family: MiSans, sans-serif;
      font-size: 40px;
      font-weight: 600;
      line-height: 32px;
      color: #191c23;
    }

    span {
      font-size: 14px;
      line-height: 32px;
      color: #191c23;
    }
  }

  &__comparisons {
    display: flex;
    gap: 12px;
    margin-top: 8px;
    font-size: 12px;
    line-height: 20px;
    color: #50596a;

    span {
      display: inline-flex;
      gap: 4px;
      align-items: center;
      white-space: nowrap;
    }

    .has-divider {
      padding-right: 12px;
      border-right: 1px solid #e8ecf3;
    }

    svg {
      width: 16px;
      height: 16px;
    }

    .is-up {
      color: #01a66f;
    }

    .is-down {
      color: #f04438;
    }
  }

  &__metric-caption {
    margin: 8px 0 0;
    font-size: 12px;
    line-height: 20px;
    color: #50596a;
  }

  &__content-grid {
    display: grid;
    grid-template-columns: minmax(0, 474fr) minmax(0, 670fr);
    gap: 16px;
  }

  &__section--basic {
    min-width: 0;
  }

  &__info-list,
  &__config-column {
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 0;
  }

  &__info-item,
  &__config-item {
    display: flex;
    gap: 32px;
    align-items: flex-start;
    min-width: 0;
    font-size: 14px;
    line-height: 22px;
  }

  &__info-label {
    display: flex;
    flex: 0 0 76px;
    align-items: center;
    justify-content: space-between;
    color: #828b9c;
  }

  &__info-value {
    display: flex;
    gap: 20px;
    align-items: center;
    min-width: 0;
    color: #191c23;

    :deep(.copy-wrap) {
      display: inline-flex;
      gap: 8px;
      align-items: center;
      min-width: 0;
      max-width: 100%;
    }

    :deep(.copy-wrap .line-break),
    :deep(.copy-wrap .text-over),
    :deep(.copy-wrap p) {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__config-grid {
    display: grid;
    grid-template-columns: minmax(0, 202px) minmax(0, 212px);
    gap: 160px;
    align-items: start;
  }

  &__config-label {
    flex: 0 0 70px;
    color: #828b9c;
    white-space: nowrap;
  }

  &__config-value {
    display: flex;
    gap: 20px;
    align-items: center;
    min-width: 0;
    color: #191c23;
    white-space: nowrap;
  }

  &__link {
    display: inline-flex;
    flex-shrink: 0;
    gap: 4px;
    align-items: center;
    padding: 0;
    color: #06f;
    cursor: pointer;
    background: transparent;
    border: 0;

    svg {
      width: 16px;
      height: 16px;
    }
  }
}

@media (width <= 1120px) {
  .oss-bucket-overview-v2 {
    &__config-grid {
      gap: 48px;
    }

    &__metric-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 32px 24px;
    }
  }
}

@media (width <= 860px) {
  .oss-bucket-overview-v2 {
    &__content-grid,
    &__config-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    &__config-grid {
      gap: 20px;
    }
  }
}

@media (width <= 600px) {
  .oss-bucket-overview-v2 {
    &__section {
      padding: 20px 16px;
    }

    &__metric-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    &__info-item,
    &__config-item {
      gap: 16px;
    }
  }
}
</style>
