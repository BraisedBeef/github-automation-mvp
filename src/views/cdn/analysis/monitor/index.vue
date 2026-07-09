<template>
  <div class="monitor">
    <CatTabs v-model="pageType" :tabs="tabMenuList" full-container @change="pageTypeChange" />
    <div class="page-box speed-content pd20 mt20">
      <div class="in">
        <div class="top df ac">
          <div class="title nowrap">
            {{ pageType === '3' ? t('allSiteWithinRemainFlux') : t('staticWithinRemainFlux') }}
          </div>
          <div>
            <span class="count">{{ getFluxDetail(remainFlux.chinese_remain).count }}</span>
            <span class="unit">{{ getFluxDetail(remainFlux.chinese_remain).unit }}</span>
          </div>
        </div>
        <el-progress :stroke-width="10" :percentage="getRate(remainFlux.chinese_remain, remainFlux.chinese_total)" />
      </div>
      <div class="out mr20 ml20">
        <div class="top df ac">
          <div class="title nowrap">
            {{ pageType === '3' ? t('allSiteWithoutRemainFlux') : t('withoutRemainFlux') }}
          </div>
          <div>
            <span class="count">{{ getFluxDetail(remainFlux.overseas_remain).count }}</span>
            <span class="unit">{{ getFluxDetail(remainFlux.overseas_remain).unit }}</span>
          </div>
        </div>
        <el-progress :stroke-width="10" :percentage="getRate(remainFlux.overseas_remain, remainFlux.overseas_total)" />
      </div>
      <div class="get-flow df fdc jsb">
        <el-button type="primary" @click="pushRoute('/cdn/buyFlow')">
          {{ t('purchaseTraffic') }}
        </el-button>
        <el-button plain @click="pushRoute('/cdn/fluxPkg')">
          {{ t('fluxPkgDetail') }}
        </el-button>
      </div>
    </div>
    <CatTabsBox v-model="tab" :list="monitorRoutes" class="mt20" @change="changeTab" />
    <el-form :model="form" class="page-box pd20 mt20" inline>
      <el-form-item>
        <el-form inline>
          <el-form-item :label="t('region')" class="mr20">
            <el-tooltip placement="top" effect="light">
              <SvgIcon class="mr10" name="cat-cdn-help" />
              <template #content>
                <div style="max-width: 365px">
                  {{ t('regionTip') }}
                </div>
              </template>
            </el-tooltip>
            <CatTabsBox v-model="form.area" :list="areaList1" @change="changeArea" />
          </el-form-item>
          <el-form-item :label="t('range')">
            <CatTabsBox v-model="form.time_range" :list="timeRangeList" @change="clickDateTimeRange" />
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item :label="t('time')" style="width: 100%">
        <div class="overflow-scroll">
          <DateTimePicker
            ref="DateTimePickerRef"
            v-model:start_time="form.start_time"
            v-model:end_time="form.end_time"
            :disabled-date="disabledDate"
            :loading="loading"
            :compare="showConfig[tab].compare"
            @change="changeDatePicker"
          />
        </div>
      </el-form-item>
      <el-form-item>
        <el-form inline>
          <el-form-item :label="t('granularity')">
            <CatTabsBox v-model="form.interval" :list="intervalList" />
          </el-form-item>
          <el-form-item :label="t('domain')" class="domain-select">
            <CatTransfer v-model="form.domain_ids" :list="domainList" :loading="domainLoading" />
            <div v-if="showConfig[tab].spilt" class="df ml20">
              <p class="mr10">
                {{ t('splitByDomain') }}
              </p>
              <el-switch
                v-model="form.is_split"
                size="large"
                :disabled="DateTimePickerRef?.showCompareButton"
                :active-text="t('yes')"
                :inactive-text="t('no')"
                :before-change="splitBeforeChange"
              />
            </div>
          </el-form-item>
          <el-form-item v-if="showMoreFilter">
            <el-button plain style="color: var(--primary-color)" @click="expand = !expand">
              <span>{{ t('advancedFiltering') }}</span>
              <svgIcon
                name="down-arrow"
                :style="{ transform: `rotate(${expand ? -180 : 0}deg)`, transition: 'all 0.3s' }"
              />
            </el-button>
          </el-form-item>
        </el-form>
      </el-form-item>
      <template v-if="expand">
        <el-form-item>
          <el-form inline>
            <el-form-item v-if="showConfig[tab].operator" :label="t('operator')" class="mr20">
              <el-select
                v-model="form.operator"
                :disabled="disabledOperator"
                :loading="loading"
                @change="
                  v => {
                    changeHighLevel('operator', v)
                  }
                "
              >
                <el-option
                  v-for="(operatev, i) in operatorList"
                  :key="i"
                  :label="operatev.label"
                  :disabled="form.ip_protocol! > 0 && i !== 0"
                  :value="operatev.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-if="showConfig[tab].http_protocol" :label="t('httpProtocol')" class="mr20 ml20">
              <CatSelect
                v-model="form.http_protocol"
                :list="httpList"
                :disabled="disabledHttp"
                :loading="loading"
                @change="
                  v => {
                    changeHighLevel('httpProtocol', v)
                  }
                "
              />
            </el-form-item>
            <el-form-item v-if="showConfig[tab].ip_protocol" :label="t('ipProtocol')" class="ml20">
              <el-select
                v-model="form.ip_protocol"
                :disabled="disabledIp"
                :loading="loading"
                @change="
                  v => {
                    changeHighLevel('ipProtocol', v)
                  }
                "
              >
                <el-option
                  v-for="(ip, i) in ipList"
                  :key="i"
                  :label="ip.label"
                  :value="ip.value"
                  :disabled="form.operator! > 0 && i !== 0"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </el-form-item>
      </template>
      <el-form-item style="margin-bottom: 20px !important">
        <el-button :loading="loading" type="primary" @click="queryHandle">
          {{ t('query') }}
        </el-button>
      </el-form-item>
    </el-form>
    <Component :is="currentComponent" ref="childComponent" :filter="childParams!" :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Bindwidth, _getOperator, _remainFlux, _domainList } from '@/apis/cdn/monitor'
import { MAX_SPLIT_DOMAIN, monitorRoutes, showConfig } from './config'
import { getFluxDetail } from '@/utils/unit'
import { setDateTimeRangeDayjs } from '@/utils/format-time'
import { getRate } from '@/utils/number-utils'
import { areaList1, httpList, ipList, tabMenuList, timeRangeList } from '@/assets/data/common'
import t from '@/utils/i18n'

import type { RemainFlux } from './type'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import { pushRoute } from '@/utils/router-jump'

const router = useRouter()

const pageType = ref<string>('0,1,2')
const tab = ref<string>('broadband')
const childParams = ref<Bindwidth | null>(null)
const childComponent = ref<any>(null)

const pageTypeChange = async v => {
  sessionStorage.cdn_domain_page_type = v.value
  getRemainflux()
  await getDomainList()
  queryHandle()
}
const changeTab = v => {
  sessionStorage.cdn_monitor_tab_type = v.value
  // 切换tab时重置域名拆分状态
  if (!showConfig[tab.value].spilt) form.value.is_split = false
  queryHandle()
}
const currentComponent = computed(() => monitorRoutes.find(v => v.value === tab.value)!.c)

const remainLoading = ref(false)
const remainFlux = ref<RemainFlux>({
  chinese_remain: 0,
  overseas_remain: 0,
  chinese_total: 0,
  overseas_total: 0,
})
const getRemainflux = () => {
  remainLoading.value = true
  _remainFlux({ cdnType: pageType.value === '3' ? 'ecdn' : 'cdn' })
    .then(res => {
      remainFlux.value = res.data
    })
    .finally(() => {
      remainLoading.value = false
    })
}
onBeforeMount(async () => {
  pageType.value = sessionStorage.cdn_domain_page_type || '0,1,2'
  tab.value = sessionStorage.cdn_monitor_tab_type || 'broadband'
  childParams.value = form.value
  getRemainflux()
  await getOperator()
  await getDomainList()
  queryHandle()
})
onBeforeUnmount(() => {
  sessionStorage.cdn_domain_page_type = pageType.value
  sessionStorage.cdn_monitor_tab_type = tab.value
})

const form = ref<Bindwidth>({
  time_range: 'today',
  area: 0,
  domain_names: [],
  domain_ids: [],
  interval: 0,
  operator: 0,
  http_protocol: 0,
  ip_protocol: 0,
  is_split: false,
  start_time: setDateTimeRangeDayjs('today').current,
  end_time: setDateTimeRangeDayjs('today').compare,
})

// 域名拆分限制
const splitBeforeChange = (v = form.value.is_split) => {
  if (!v && form.value.domain_ids.length > MAX_SPLIT_DOMAIN) {
    ElMessage.warning(t('domainSplitLimit', { limit: MAX_SPLIT_DOMAIN }))
    return false
  } else {
    return true
  }
}
const loading = ref<boolean>(false)
const disabledDate = time => {
  const currentDate = new Date()
  const startDate = new Date(currentDate)
  startDate.setMonth(currentDate.getMonth() - 3)
  return time.getTime() > Date.now() || time < startDate
}
const intervalList = ref([
  { label: t('min5'), value: 0, disabled: false },
  { label: t('hour1'), value: 1, disabled: false },
  { label: t('day1'), value: 2, disabled: true },
])
const initIntervalList = v => {
  intervalList.value.forEach(v => {
    v.disabled = false
  })
  if (v === 'today' || v === 'yesterday') {
    intervalList.value[2].disabled = true
  } else if (v === 'month') {
    intervalList.value[0].disabled = true
    intervalList.value[1].disabled = true
  } else {
    intervalList.value[0].disabled = true
  }
  form.value.interval = intervalList.value.find(v => !v.disabled)!.value
}
const clickDateTimeRange = v => {
  form.value.time_range = v.value
  const object = setDateTimeRangeDayjs(v.value)
  form.value.start_time = object.current
  form.value.end_time = object.compare
  initIntervalList(v.value)
}
const changeDatePicker = v => {
  form.value.time_range = ''
  if (
    maoYunDayJs(form.value.start_time[1]).valueOf() - maoYunDayJs(form.value.start_time[0]).valueOf() >
    1000 * 60 * 60 * 24
  ) {
    initIntervalList('')
  } else {
    initIntervalList('today')
  }
}
const DateTimePickerRef = ref<any>(null)
const domainList = ref<any[]>([])
const domainLoading = ref(false)
const getDomainList = async () => {
  domainLoading.value = true
  await _domainList({
    scene: pageType.value === '3' ? 'monitoring-ecdn' : 'monitoring',
    areaCode: form.value.area,
  })
    .then(res => {
      domainList.value = res.data.data || []
    })
    .finally(() => {
      domainLoading.value = false
    })
}
const operatorList = ref<any[]>([])
const getOperator = async () => {
  await _getOperator()
    .then(res => {
      const list = res.data.data.map(v => ({ label: t(v.Name), value: v.Code }))
      operatorList.value = [{ label: t('allOperators'), value: 0 }, ...list]
    })
    .catch(() => {
      operatorList.value = [{ label: t('allOperators'), value: 0 }]
    })
}
const expand = ref(false)
const showMoreFilter = computed(() => {
  const c = showConfig[tab.value]
  return c.operator || c.http_protocol || c.ip_protocol
})
const changeArea = () => {
  form.value.operator = 0
  form.value.ip_protocol = 0
  nextTick(() => {
    getDomainList()
  })
}
const changeHighLevel = (type, value) => {
  if (type === 'operator' && value === 0) {
    form.value.http_protocol = 0
    form.value.ip_protocol = 0
  } else if (type === 'http_protocol' && value === 0) {
    form.value.operator = 0
    form.value.ip_protocol = 0
  } else if (type === 'ip_protocol' && value === 0) {
    form.value.operator = 0
    form.value.http_protocol = 0
  }
}
const disabledOperator = computed(() => {
  if ((form.value.http_protocol || form.value.ip_protocol) && form.value.area === 0) {
    return true
  } else if (form.value.area) {
    return true
  } else {
    return false
  }
})
const disabledHttp = computed(() => {
  if ((form.value.operator || form.value.ip_protocol) && form.value.area === 0) {
    return true
  }
  return false
})
const disabledIp = computed(() => {
  if ((form.value.operator || form.value.http_protocol) && form.value.area === 0) {
    return true
  } else if (form.value.area) {
    return true
  } else {
    return false
  }
})

const initParams = () => {
  const query: any = {
    pageType: pageType.value,
    ...form.value,
    domain_names: form.value.domain_ids.map(v => domainList.value.find(d => d.id === v)!.cname),
    start_time: maoYunDayJs(form.value.start_time[0]).valueOf() / 1000,
    end_time: maoYunDayJs(form.value.start_time[1]).valueOf() / 1000,
    start_time_next: maoYunDayJs(form.value.end_time[0]).valueOf() / 1000,
    end_time_next: maoYunDayJs(form.value.end_time[1]).valueOf() / 1000,
  }
  if (!showMoreFilter.value) {
    delete query.operator
    delete query.http_protocol
    delete query.ip_protocol
  }
  if (DateTimePickerRef.value.showCompareButton) {
    childParams.value = query
    return query
  } else {
    delete query.start_time_next
    delete query.end_time_next
    childParams.value = query
    return query
  }
}

watch(
  () => form.value,
  () => {
    childParams.value = initParams()
  },
  { deep: true },
)

// 域名拆分限制
watch(
  () => form.value.domain_ids,
  () => {
    const flag = splitBeforeChange(!form.value.is_split)
    if (!flag) form.value.domain_ids.shift()
  },
)

watch(
  () => childComponent.value,
  () => {
    childParams.value = initParams()
  },
)

// 使用数据时关闭域名拆分状态
watch(
  () => DateTimePickerRef.value?.showCompareButton,
  () => {
    if (DateTimePickerRef.value?.showCompareButton) form.value.is_split = false
  },
)

const queryHandle = () => {
  const query = initParams()
  nextTick(async () => {
    loading.value = true
    await childComponent.value.handleQuery(query)
    let timer = setTimeout(() => {
      loading.value = false
      clearTimeout(timer)
    }, 500)
  })
}
</script>

<style lang="scss" scoped>
.monitor {
  :deep(.cat-tabs__header) {
    border: none;
  }

  .speed-content {
    display: grid;
    grid-template-columns: 1fr 1fr auto;

    .in,
    .out {
      padding: 14px 20px;
      background-color: #f9fafc;
      border-radius: 4px;

      .title {
        margin-right: 14px;
      }

      .count {
        margin-right: 4px;
        font-size: 24px;
        font-weight: 700;
        color: var(--primary-color);
      }

      .unit {
        font-weight: 700;
        color: var(--primary-text);
      }

      :deep(.el-progress__text) {
        min-width: unset;
        margin-left: 12px;
        color: var(--sub-text);
      }

      .top {
        margin-bottom: 10px;
      }
    }

    .get-flow {
      padding-left: 20px;
      border-left: 1px solid #edeff4;

      .el-button {
        margin: 0 !important;
      }

      .el-button.is-plain {
        color: var(--primary-color);
        border: 1px solid var(--primary-color);
      }
    }
  }

  .domain-select {
    :deep(.el-form-item__content) {
      display: flex !important;
    }
  }
}
</style>
