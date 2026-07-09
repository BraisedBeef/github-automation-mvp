<template>
  <div class="domain-overview df">
    <div class="left">
      <div v-if="false">
        <div class="registe-top data-overview bgcf">
          <div class="ad-title title">
            {{ t('domain.overview.911714-0') }}
          </div>
          <div class="ad-input df mt20">
            <el-input v-model="input" :placeholder="t('domain.overview.911714-1')" />
            <el-button type="primary" style="margin-right: 200px" @click="queryHandle">
              {{ t('domain.overview.911714-2') }}
            </el-button>
          </div>
        </div>

        <div class="data-overview bgcf mt20 pd20">
          <div class="title">
            {{ t('domain.overview.911714-3') }}
          </div>
          <div class="data-list df mt20">
            <div
              v-for="(dv, di) in dataList"
              :key="'dv' + di"
              class="data-item pointer"
              @click="pushRoute('/domain/list/table')"
            >
              <div class="df ac">
                <div class="icon mr10" />
                <div>{{ dv.title }}</div>
              </div>
              <div class="count mt20" :style="{ color: dv.color }">
                {{ dv.count }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="data-overview bgcf pd20">
          <div class="title">
            {{ t('domain.overview.911714-4') }}
          </div>
          <div class="df jc">
            <CatStep v-model="step" :steps="stepList" class="mt20 mb20" style="width: auto" @change="changeStep" />
          </div>
          <div v-if="step === 0">
            <div class="data-item df ac">
              <div class="icon mr10" />
              <div class="title2">
                {{ t('domain.overview.911714-5') }}
              </div>
            </div>
            <div class="title2 mt10">
              {{ t('domain.overview.911714-6') }}
            </div>
            <div class="mt4">
              {{ t('domain.overview.911714-7') }}
            </div>
            <div class="mt4">
              {{ t('domain.overview.911714-8') }}
            </div>
            <div class="mt4">
              {{ t('domain.overview.911714-9') }}
            </div>
            <el-button type="primary" class="mt20" @click="pushRoute('/domain/template/table')">
              {{ t('domain.overview.911714-10') }}
            </el-button>
          </div>
          <div v-else-if="step === 1">
            <div class="data-item df ac">
              <div class="icon mr10" />
              <div class="title2">
                {{ t('domain.overview.911714-0') }}
              </div>
            </div>
            <div class="ad-input df mt20 step2">
              <el-input v-model="input" :placeholder="t('domain.overview.911714-1')" />
              <el-button type="primary" style="margin-right: 150px" @click="queryHandle">
                {{ t('domain.overview.911714-2') }}
              </el-button>
            </div>
            <div class="data-overview bgcf mt20 pd20">
              <div class="title">
                {{ t('domain.overview.911714-3') }}
              </div>
              <div class="data-list df mt20">
                <div
                  v-for="(dv, di) in dataList"
                  :key="'dv' + di"
                  class="data-item pointer"
                  @click="pushRoute('/domain/list/table')"
                >
                  <div class="df ac">
                    <div class="icon mr10" />
                    <div>{{ dv.title }}</div>
                  </div>
                  <div class="count mt20" :style="{ color: dv.color }">
                    {{ dv.count }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="step === 2">
            <div class="data-item df ac">
              <div class="icon mr10" />
              <div class="title2">
                {{ t('domain.overview.911714-11') }}
              </div>
            </div>
            <div class="title2 mt10">
              {{ t('domain.overview.911714-12') }}
            </div>
            <div class="mt20">
              <el-button type="primary" @click="pushRoute('/dns/my-domains')">
                {{ t('domain.overview.911714-13') }}
              </el-button>
              <el-button>{{ t('domain.overview.911714-14') }}</el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="data-overview bgcf mt20 pd20">
        <div class="title">
          {{ t('domain.overview.911714-15') }}
        </div>
        <div class="ad-list df mt20">
          <div v-for="(pv, pi) in productList" :key="'pv' + pi" class="ad-item df fdc">
            <div class="ad-title">
              {{ pv.title }}
            </div>
            <div class="ad-tip">
              {{ pv.tip }}
            </div>
            <el-link type="primary" class="mt10" @click="routeTo(pv.url)">
              {{ t('domain.overview.911714-16')
              }}<el-icon>
                <ArrowRight />
              </el-icon>
            </el-link>
          </div>
        </div>
      </div>
    </div>

    <div class="right data-overview bgcf ml20 pd20">
      <div class="title">
        {{ t('domain.overview.911714-17') }}
      </div>
      <div class="config-list">
        <div v-for="(cv, ci) in configList" :key="'cv' + ci" class="config-item df ac mt20" @click="routeTo(cv.url)">
          <img class="mr4" :src="cv.img" />
          <div class="text">
            {{ cv.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { _getContactsTemplateList, _getDomainOverview } from '@/apis/domain'
import { initDomain } from '@/views/domain/config'
import { ArrowRight } from '@element-plus/icons-vue'
import t from '@/utils/i18n'
import { owUrl } from '@/config/base-config'
import { getSessionItemRaw, setSessionItemRaw } from '@/utils/storage'
import { pushRoute } from '@/utils/router-jump'

const router = useRouter()

const input = ref('')
const queryHandle = () => {
  if (!input.value) return
  const darr = input.value.split('.').splice(0, 2)
  const domain = initDomain(darr[0])
  const parts = input.value.trim().split('.')
  const customSuffix = parts.length !== 2 ? '' : parts.pop()?.toLocaleLowerCase() || ''
  window.open(owUrl + `product/domain/query?domain=${domain}&suffix=${customSuffix}`, '_blank')
}

const step = ref<number>(getSessionItemRaw('domainTemplateTotal') ? 1 : 0)
const stepList = [
  { label: t('domain.overview.911714-18'), value: 0 },
  { label: t('domain.overview.911714-19'), value: 1 },
  { label: t('domain.overview.911714-20'), value: 2 },
]
const changeStep = v => {
  step.value = v.value
}

const dataList = ref<
  {
    title: string
    count: number
    key: string
    color: string
  }[]
>([
  { title: t('domain.overview.911714-21'), count: 0, key: 'all', color: 'var(--primary-text' },
  { title: t('domain.overview.911714-22'), count: 0, key: 'expiring', color: 'var(--el-color-danger)' },
  { title: t('domain.overview.911714-23'), count: 0, key: 'renew', color: 'var(--el-color-success)' },
  { title: t('domain.overview.911714-24'), count: 0, key: 'redeem', color: 'var(--el-color-warning)' },
])
const getData = () => {
  _getDomainOverview().then(res => {
    dataList.value.forEach(v => {
      v.count = res.data[v.key]
    })
  })
  if (!getSessionItemRaw('domainTemplateTotal')) {
    // 根据模板总数判断是否显示引导
    _getContactsTemplateList({ key: '', page: 1, limit: 10 }).then(res => {
      if (res.data.total >= 0) {
        setSessionItemRaw('domainTemplateTotal', res.data.total)
        step.value = 1
      }
    })
  }
}
getData()

const productList = ref([
  {
    title: t('domain.overview.911714-25'),
    tip: t('domain.overview.911714-26'),
    url: owUrl + 'product/cvm',
  },
  {
    title: t('domain.overview.911714-27'),
    tip: t('domain.overview.911714-28'),
    url: owUrl + 'product/cdn',
  },
  {
    title: t('domain.overview.911714-29'),
    tip: t('domain.overview.911714-30'),
    url: owUrl + 'product/ssl',
  },
])
const configList = ref<any>([
  {
    img: new URL('@/assets/images/domain/config-1.svg', import.meta.url),
    title: t('domain.overview.911714-31'),
    url: owUrl + 'product/domain/whois',
  },
  {
    img: new URL('@/assets/images/domain/config-2.svg', import.meta.url),
    title: t('domain.overview.911714-32'),
    url: owUrl + 'product/dns',
  },
  {
    img: new URL('@/assets/images/domain/config-3.svg', import.meta.url),
    title: t('domain.overview.911714-33'),
    url: owUrl + 'product/domain/price',
  },
])

const routeTo = url => {
  window.open(url, '_blank')
}
</script>

<style lang="scss" scoped>
.domain-overview {
  .data-overview {
    .title {
      font-size: 16px;
      font-weight: 700;
      color: var(--primary-text);
    }

    .title2 {
      font-weight: 700;
      color: var(--primary-text);
    }

    .data-list {
      .data-item {
        flex: 1 1 0;

        .count {
          font-size: 30px;
        }
      }
    }

    .data-item {
      .icon {
        width: 2px;
        height: 14px;
        background-color: var(--el-color-primary);
      }
    }

    .ad-list {
      gap: 20px;

      .ad-item {
        flex: 1 1 0;
        align-items: flex-start;
        padding: 20px;
        background-image: url('@/assets/images/domain/prd-bg.png');
        background-repeat: no-repeat;
        background-position: right bottom;
        border: 1px solid #eee;
        border-radius: 4px;

        .link {
          color: var(--el-color-primary);
          cursor: pointer;
          user-select: none;
        }

        .ad-title {
          font-weight: 700;
          color: var(--primary-text);
        }

        .ad-tip {
          flex: 1 1 0;
        }
      }
    }
  }

  .left {
    flex: 1;

    .registe-top {
      height: 170px;
      padding: 40px 20px 0;
      background-image: url('@/assets/images/domain/ad-bg.png');
      background-repeat: no-repeat;
      background-position: right bottom;

      .ad-title {
        font-size: 24px;
        font-weight: 700;
      }
    }

    .ad-input {
      .el-input {
        flex: 1 1 0;
      }

      :deep(.el-input__wrapper) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      .el-button {
        position: relative;
        z-index: 1;
        border-top-left-radius: 0 !important;
        border-bottom-left-radius: 0 !important;
        transform: translateX(-1px);
      }
    }

    .step2 {
      height: 54px;

      .el-input {
        height: unset !important;
      }

      :deep(.el-input__wrapper) {
        height: unset;
        padding: 0 14px;
      }

      :deep(.el-input__inner) {
        height: 100%;
      }

      .el-button {
        height: 100% !important;
        padding: 0 32px !important;
      }
    }
  }

  .right {
    min-width: 312px;
    height: fit-content;

    .config-list {
      .config-item {
        padding: 15px;
        cursor: pointer;
        border: 1px solid #eee;
        border-radius: 4px;

        .text {
          color: var(--primary-text);
        }
      }
    }
  }
}
</style>
