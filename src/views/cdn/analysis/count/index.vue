<template>
  <div class="count">
    <CatTabs v-model="page" :tabs="tabMenuList" full-container @change="changePage" />

    <CatTabsBox v-model="childTab" :list="tabList" class="page-box mt20" @change="changeTab" />

    <div class="page-box pd20 mt20">
      <div class="df jsb">
        <el-form :model="form" class="cont-query-form mr20 mb20">
          <el-form-item>
            <el-form-item v-show="tabComponent?.form.includes(0)" :label="t('region')">
              <el-tooltip placement="top" effect="light">
                <SvgIcon class="mr10" name="cat-cdn-help" />
                <template #content>
                  <div style="max-width: 365px">
                    {{ t('regionTip') }}
                  </div>
                </template>
              </el-tooltip>
              <CatTabsBox v-model="form.area" :list="areaSelectList" @change="changeArea" />
            </el-form-item>
            <el-form-item :label="t('range')" style="margin-bottom: 20px !important">
              <div class="df">
                <CatTabsBox v-model="form.time_range" :list="timeRangeList" class="mr20" @change="clickDateTimeRange" />
                <DateTimePicker
                  v-show="tabComponent?.form.includes(2)"
                  v-model:start_time="form.start_time"
                  :disabled-date="disabledDate"
                  :loading="loading"
                  :compare="false"
                />
              </div>
            </el-form-item>
          </el-form-item>
          <div class="df">
            <el-form-item v-show="tabComponent?.form.includes(1)" :label="t('domain')">
              <CatTransfer v-model="form.domain_ids" :list="domainList" :loading="domainLoading" />
            </el-form-item>
            <div class="df">
              <el-button type="primary" @click="search">
                {{ t('query') }}
              </el-button>
              <el-button plain style="width: 40px" @click="download">
                <SvgIcon name="cat-cdn-download" />
              </el-button>
            </div>
          </div>
        </el-form>
      </div>
      <el-divider style="margin-top: 0" />
      <component :is="tabComponent?.component" ref="childPage" v-loading="loading" @search="search" />
    </div>
  </div>
</template>

<script setup lang="ts">
import User from './user/index.vue'
import Operator from './operator/index.vue'
import Flow from './flow/index.vue'
import Broadband from './broadband/index.vue'
import Request from './request/index.vue'
import Error from './error/index.vue'
import HotUrl from './hot-url/index.vue'
import HotDomain from './hot-domain/index.vue'

import { tabMenuList, timeRangeList } from '@/assets/data/common'
import { _domainList } from '@/apis/cdn/monitor'
import { setDateTimeRangeDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'

interface TabItem {
  label: string
  value: string
  form: number[]
  component: Component
}

const page = ref<string>('0,1,2')
const changePage = async (v?) => {
  sessionStorage.cdn_domain_page_type = v?.value
  await getDomainList()
  search()
}
const childTab = ref<string>('user')
watch(
  () => childTab.value,
  n => {
    if (n === 'operator') {
      form.area = 0
    }
  },
)
const tabComponent = computed(() => tabList.find((v: TabItem) => v.value == childTab.value))
const changeTab = v => {
  sessionStorage.cdn_count_tab_type = v.value
  nextTick(() => {
    search()
  })
}
const areaSelectList = computed(() => {
  return [
    {
      label: t('inChina'),
      value: 0,
      disabled: false,
    },
    {
      label: t('outChina'),
      value: 1,
      disabled: childTab.value === 'operator' ? true : false,
    },
  ]
})
const tabList = reactive<TabItem[]>([
  {
    label: t('userAccDis'),
    value: 'user',
    form: [0, 1, 2],
    component: shallowRef(User),
  },
  {
    label: t('operatorDis'),
    value: 'operator',
    form: [0, 1, 2],
    component: shallowRef(Operator),
  },
  {
    label: t('fluxAnalysis'),
    value: 'flow',
    form: [0, 1, 2],
    component: shallowRef(Flow),
  },
  {
    label: t('bandwidthAnalysis'),
    value: 'broadband',
    form: [0, 1, 2],
    component: shallowRef(Broadband),
  },
  {
    label: t('resAnalysis'),
    value: 'request',
    form: [0, 1, 2],
    component: shallowRef(Request),
  },
  {
    label: t('errorCodeAnalysis'),
    value: 'error',
    form: [0, 1, 2],
    component: shallowRef(Error),
  },
  {
    label: t('hotTop100Analysis'),
    value: 'hotUrl',
    form: [0, 1, 2],
    component: shallowRef(HotUrl),
  },
  {
    label: t('domainRank'),
    value: 'hotDomain',
    form: [0, 2],
    component: shallowRef(HotDomain),
  },
])

const form = reactive<{
  area: number
  time_range: any
  domain_ids: number[]
  start_time: any
}>({
  area: 0,
  time_range: 'today',
  domain_ids: [],
  start_time: setDateTimeRangeDayjs('today').current,
})
const disabledDate = time => {
  const currentDate = new Date()
  const startDate = new Date(currentDate)
  startDate.setMonth(currentDate.getMonth() - 3)
  return time.getTime() > Date.now() || time < startDate
}
const changeArea = () => {
  nextTick(() => {
    getDomainList()
  })
}
const clickDateTimeRange = v => {
  form.start_time = setDateTimeRangeDayjs(v.value).current
}
const domainList = ref<any[]>([])
const domainLoading = ref(false)
const getDomainList = async () => {
  domainLoading.value = true
  await _domainList({
    scene: page.value === '3' ? 'analysis-ecdn' : 'analysis',
    areaCode: form.area,
  })
    .then(res => {
      domainList.value = res.data.data || []
    })
    .finally(() => {
      domainLoading.value = false
    })
}

const loading = ref<boolean>(false)
const childPage = ref<any>(null)

const search = async () => {
  if (childPage.value?.resetPage) await childPage.value?.resetPage() // 重置分页
  const { type, order_by } = childPage.value
  const params: any = {
    ...form,
    domain_ids: childTab.value === 'hotDomain' ? domainList.value.map(v => v.id) : form.domain_ids, //热点top100发送所有域名id
    start_time: maoYunDayJs(form.start_time[0]).valueOf() / 1000,
    end_time: maoYunDayJs(form.start_time[1]).valueOf() / 1000,
    type,
    order_by,
  }
  loading.value = true
  childPage.value.getData(page.value, params).finally(() => {
    loading.value = false
  })
}

const download = () => {
  const { type, order_by } = childPage.value
  childPage.value.download({
    ...form,
    domain_ids: childTab.value === 'hotDomain' ? domainList.value.map(v => v.id) : form.domain_ids, //热点top100发送所有域名id
    start_time: maoYunDayJs(form.start_time[0]).valueOf() / 1000,
    end_time: maoYunDayJs(form.start_time[1]).valueOf() / 1000,
    type,
    order_by,
  })
}

onBeforeMount(async () => {
  page.value = sessionStorage.cdn_domain_page_type || '0,1,2'
  childTab.value = sessionStorage.cdn_count_tab_type || 'user'
  await getDomainList()
  search()
})

onBeforeUnmount(() => {
  sessionStorage.cdn_domain_page_type = page.value
  sessionStorage.cdn_count_tab_type = childTab.value
})
</script>

<style lang="scss" scoped>
.count {
  :deep(.cat-tabs__header) {
    border: none;
  }

  .cont-query-form {
    .el-form-item {
      margin-bottom: 0;

      &:not(:last-child) {
        margin-right: 40px;
      }

      :deep(.el-form-item__content) {
        display: flex;
      }

      .el-form-item {
        margin-bottom: 20px;

        &:not(:last-child) {
          margin-right: 40px;
        }
      }
    }
  }
}
</style>
