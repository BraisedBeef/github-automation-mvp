<template>
  <div v-loading="loading" class="oss-bucket-overview">
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
    <div class="page-box pd20">
      <p class="title">
        {{ t('oss.basicInformation') }}
      </p>
      <div class="basic-info">
        <el-row :gutter="10">
          <el-col :span="12">
            <div class="info-row">
              <span class="label" style="width: 80px">{{ t('oss.bucketName') }}</span>
              <Copy class="value" :text="bucketInfo.baseInfo.name || '-'" />
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-row">
              <span class="label">
                {{ t('oss.createTime') }}
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="ml10" />
                </el-tooltip>
              </span>
              <span class="value">{{ maoYunDayJs(bucketInfo.baseInfo.createDate * 1000).format(FORMAT_TIME) }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12">
            <div class="info-row">
              <span class="label">{{ t('oss.region') }}</span>
              <span class="value">{{ bucketInfo.baseInfo.region || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-row">
              <span class="label">{{ t('oss.accessPermissions') }}</span>
              <span class="value">{{ ACL_MAP[bucketInfo.baseInfo['x-oss-acl']] || '-' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="24">
            <div class="info-row">
              <span class="label">{{ t('oss.s6.defaultDomainName') }}</span>
              <Copy class="value" :text="bucketInfo.baseInfo.defaultDomain || '-'" />
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { _getBucketOverview } from '@/apis/oss/storage-list'
import t from '@/utils/i18n'
import { FORMAT_TIME, maoYunDayJs } from '@/utils/mao-yun-day-js'
import { bytesToGB } from '@/utils/unit'
import { BucketInfo } from '@/views/oss/hooks/use-oss'

const ACL_MAP: any = {
  private: t('oss.privateReadWrite'),
  'public-read-write': t('oss.publicReadPrivateWrite'),
  'public-read': t('oss.publicReadWrite'),
}

const metrics = ref([
  { label: t('oss.s6.storageCapacity'), value: '0', unit: 'GB', key: 'storage' },
  { label: t('oss.s6.objectCount'), value: 0, unit: t('oss.s6.count'), key: 'objectCount' },
  { label: t('oss.s6.internetTraffic'), value: '0', unit: 'GB', key: 'traffic' },
  { label: t('oss.s6.readRequestCount'), value: 0, unit: t('oss.s6.times'), key: 'readCount' },
])

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

// 当前桶信息
const currSelectBucket = inject<BucketInfo>('currSelectBucket', {
  name: '',
  region: '',
})
// 获取桶概览信息
const getBucketOverview = async () => {
  try {
    loading.value = true
    const res = await _getBucketOverview({
      bucketName: currSelectBucket.name,
      region: currSelectBucket.region,
    })

    if (res.data) {
      bucketInfo.value = res.data

      metrics.value.forEach(item => {
        switch (item.key) {
          case 'storage':
            item.value = bytesToGB(res.data.storage)
            break
          case 'objectCount':
            item.value = res.data.objectCount
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
    console.log(error)
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  getBucketOverview()
})
</script>

<style lang="scss" scoped>
.oss-bucket-overview {
  .page-box + .page-box {
    margin-top: 20px;
  }

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

  .basic-info {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .info-row {
      display: flex;
      gap: 10px;
      align-items: center;

      .label {
        font-size: 14px;
        font-weight: 400;
        color: #999;
      }

      .value {
        font-size: 14px;
        font-weight: 400;
        color: #000;
      }
    }
  }
}
</style>
