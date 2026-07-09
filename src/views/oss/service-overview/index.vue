<template>
  <div v-loading="loading" class="oss-service-overview">
    <div class="page-box pd20">
      <p class="title">
        {{ t('oss.s6.usageOverview') }}
      </p>
      <Tip
        :text="[
          {
            main: t('oss.s6.usageOverviewTip'),
          },
        ]"
      />
      <div class="data-grid">
        <div v-for="item in metrics" :key="item.label" class="data-card">
          <div class="data-label">
            {{ item.label }}
          </div>
          <div class="data-value">
            <span class="num">{{ item.value }}</span>
            <span>{{ item.unit }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="oss-service-overview-package">
      <div class="page-box pd20 package">
        <div>
          <div class="df package-header">
            <p class="title">
              {{ t('oss.s6.resourcePackage') }}
            </p>
            <DisableText :disabled="false" :text="t('oss.resourcePackM')" @click="toPage('oss_resourcePack')" />
          </div>
          <div class="package-content">
            <div class="package-content-item">
              <div class="data-label">
                {{ t('oss.s6.effective') }}
              </div>
              <div class="data-value">
                <span class="num">{{ overviewData.activeResourcePackages }}</span>
                <span>{{ t('oss.s6.count') }}</span>
              </div>
            </div>
            <div class="package-content-item">
              <div class="data-label">
                <span>{{ t('oss.s6.willExpire') }}</span>
                <el-tooltip :content="t('oss.s6.resourcePackageWillExpire')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-tip" class="ml10" />
                </el-tooltip>
              </div>
              <div class="data-value">
                <span class="num1">{{ overviewData.expiringPackageCount }}</span>
                <span>{{ t('oss.s6.count') }}</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <el-button type="primary" @click="toPage('oss_res_create')">
            {{ t('oss.buyPackage') }}
          </el-button>
        </div>
      </div>
      <div class="page-box pd20 bucket">
        <div class="df bucket-header">
          <p class="title">
            {{ t('oss.s6.recentAccessBucket') }}
          </p>
          <DisableText :disabled="false" :text="t('oss.bucketList')" @click="toPage('bucket')" />
        </div>
        <div class="bucket-content">
          <div
            v-for="item in overviewData.lastAccessedBuckets"
            :key="item"
            class="bucket-content-item"
            @click="toPage('bucket_detail', { id: item.bucket_id, region: item.region, name: item.name })"
          >
            <div>
              <SvgIcon name="oss-bucket-logo" class="mr10" />
              <span>{{ item.name }}</span>
            </div>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { _getOssServicesOverview } from '@/apis/oss/storage-list'
import t from '@/utils/i18n'
import { bytesToGB } from '@/utils/unit'

import { ArrowRight } from '@element-plus/icons'
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
.oss-service-overview {
  .title {
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 500;
    color: #000;
  }

  .data-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    padding: 12px 0;
    background: #f9fafc;
    border-radius: 4px;

    .data-card:last-of-type {
      border-right: none;
    }

    .data-card {
      padding-left: 20px;
      border-right: 1px solid #ddd;

      .data-label {
        margin-bottom: 12px;
        font-size: 14px;
        font-weight: 500;
        color: #000;
      }

      .data-value {
        font-size: 14px;
        font-weight: 500;
        color: #000;

        .num {
          margin-right: 5px;
          font-size: 24px;
          font-weight: 500;
          color: #0063ff;
        }
      }
    }
  }

  &-package {
    display: flex;
    gap: 20px;
    margin-top: 20px;

    .package {
      // height: fit-content;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;

      &-header {
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        .title {
          margin: 0;
        }
      }

      &-content {
        display: flex;
        margin-bottom: 20px;

        &-item {
          width: 100%;

          .data-label {
            margin-bottom: 6px;
            font-size: 14px;
            font-weight: 400;
            color: #999;
          }

          .data-value {
            font-size: 14px;
            font-weight: 500;
            color: #000;

            .num {
              margin-right: 5px;
              font-size: 24px;
              font-weight: 500;
              color: #0fbe5b;
            }

            .num1 {
              margin-right: 5px;
              font-size: 24px;
              font-weight: 500;
              color: #fc8c00;
            }
          }
        }
      }
    }

    .bucket {
      width: 100%;

      &-header {
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        .title {
          margin: 0;
        }
      }

      &-content {
        &-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 52px;
          cursor: pointer;
          border-bottom: 1px solid #eee;

          &:hover {
            color: #0063ff;
          }
        }
      }
    }
  }
}
</style>
