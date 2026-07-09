<template>
  <div>
    <PageHeader
      :title="pageTitle"
      :back-title="t('dataStatistics.backTitle')"
      back-name="MyDomains"
      style="border-bottom: 0"
    >
      <template #title>
        <div class="the-title">
          {{ t('routes.myDomains') + '(' }}
          <span>{{ queryData.name }}</span>
          {{ ')' }}
        </div>
      </template>
    </PageHeader>
    <CatTabs v-model="active" :tabs="tabs" @change="domainLayoutChange" />
    <div class="domain-layout" style="padding: 20px">
      <div v-if="showErrorBox && active === 0" class="error-box">
        <div class="error-detail">
          <div>
            <div class="error-info">
              <SvgIcon name="tip-error" />
              {{ t('myDomains.takeOverTipDetail') }}
            </div>
            <div v-if="takeoverVisible" class="mt12 ml24 mb6">
              <el-table class="server-table" :data="takeoverInfo?.tableList || []" :max-height="200">
                <!-- 当前DNS -->
                <el-table-column width="240" :label="t('myDomains.nowDns')">
                  <template #default="{ row }">
                    {{ row.domainDnsServer }}
                  </template>
                </el-table-column>
                <!-- 当前DNS -->
                <el-table-column width="360" :label="t('myDomains.allocationDns')">
                  <template #default="{ row }">
                    {{ row.cloudDnsServer
                    }}<SvgIcon
                      v-if="!!row.cloudDnsServer"
                      name="dns-copy"
                      pointer
                      @click="handleCopy(row.cloudDnsServer)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
          <div class="error-btn">
            <span @click="changeErrorBox">{{ takeoverVisible ? t('myDomains.retract') : t('myDomains.expand') }}</span>
          </div>
        </div>

        <div class="handle" @click="revalidation">
          <SvgIcon :name="errorLoading ? 'loading' : 'refresh'" pointer :class="{ loading: errorLoading }" />
          <span style="margin-right: 8px">{{ t('domainLayout.reVerify') }}</span>
          <!-- <span @click="viewDetail">{{ t('myDomains.viewDetail') }}</span> -->
        </div>
      </div>
      <div class="page-box" style="min-height: 100%">
        <router-view :key="route.path" />
      </div>
    </div>
    <!-- <TakeoverDialog v-model:dialog="takeoverVisible" :info="takeoverInfo" /> -->
  </div>
</template>

<script setup lang="ts">
import type { CatTab } from '@/components/common/cat-tabs/type'

import { _throttle } from '@/utils/timing-utils'
import { _getDomainInfo, _refreshDomainStatus } from '@/apis/dns/domain'
import { events } from '@/utils/mitt'
import t from '@/utils/i18n'
import { useBaseStore, useTempStore } from '@/store'
import { message } from '@/utils/message'
import TakeoverDialog from './my-domains/takeover-dialog.vue'
import { handleCopyValue } from '@/utils/dom-utils'
import { pushRoute } from '@/utils/router-jump'
const tempStore = useTempStore()
const route = useRoute()
let active = ref<number>(0)
const tabs: CatTab[] = [
  { label: t('routes.recordMana'), value: 0, name: 'RecordMana' },
  { label: t('routes.domainSetting'), value: 1, name: 'DomainsSet' },
  { label: t('routes.dataStatistics'), value: 2, name: 'DataStatistics' },
]
const showErrorBox = ref(false)
const errorLoading = ref(false)
const queryData: any = ref({})
const takeoverVisible = ref(true)
const takeoverInfo: any = ref({})
// tab-change
const domainLayoutChange = (item: any) => {
  if (item.name) {
    // useBaseStore().selectedKeys = item.name
    pushRoute({
      name: item.name,
      query: { ...queryData.value, active: item.value },
    })
  }
}

const pageTitle = computed(() => {
  return t('routes.myDomains') + ' ' + queryData.value.name
})

onMounted(() => {
  queryData.value = route.query && { ...route.query }
  if (route.query.active) {
    active.value = Number(route.query.active)
    const activeItem = tabs.find(item => item.value === active.value)
    domainLayoutChange(activeItem)
  }
  getData()
  viewDetail()
  tempStore.setPageHeader(false)
})

onUnmounted(() => {
  tempStore.setPageHeader(true)
  events.off('refesh-domain-info')
})

// 重新验证
const revalidation = async () => {
  if (errorLoading.value) return
  if (!queryData.value.id) return

  try {
    errorLoading.value = true
    // message.warning(t('提交验证中！'))
    const { code, data } = await _refreshDomainStatus({
      domainId: queryData.value.id,
    })
    errorLoading.value = false
    if (code === 200 && data) {
      // 不显示
      showErrorBox.value = !(data[0].dnsStatus === 1)
      if (data[0].dnsStatus === 1) {
        events.emit('refesh-domain-info')
        message.success(t('myDomains.verifySuccess'))
      } else {
        message.error(`${t('myDomains.verifyFail')}${data[0].dnsStatusReason}`)
      }
    } else {
      // 显示
      showErrorBox.value = true
    }
  } catch (error) {
    errorLoading.value = false
  }
}

// 查看详情
const viewDetail = async () => {
  if (!queryData.value.id) {
    message.error('No DomainId!')
    return
  }
  try {
    errorLoading.value = true
    const { code, data } = await _getDomainInfo({
      domainId: queryData.value.id,
    })
    errorLoading.value = false
    if (code === 200) {
      const arr: any[] = []
      const domainDnsServerList = data.domainDnsServer || []
      const cloudDnsServerList = data.cloudDnsServer || []
      for (var i = 0; i < Math.max(domainDnsServerList.length, cloudDnsServerList.length); i++) {
        arr.push({
          domainDnsServer: domainDnsServerList[i] || '',
          cloudDnsServer: cloudDnsServerList[i] || '',
        })
      }
      takeoverInfo.value = {
        ...data,
        domainId: queryData.value.id,
        tableList: arr,
      }
    } else {
      takeoverInfo.value = {}
    }
  } catch (error) {
    errorLoading.value = false
  }
}

const changeErrorBox = () => {
  takeoverVisible.value = !takeoverVisible.value
}

const getData = async () => {
  if (errorLoading.value) return
  if (!queryData.value.id) return
  try {
    errorLoading.value = true
    const { code, data } = await _getDomainInfo({
      domainId: queryData.value.id,
    })
    errorLoading.value = false
    if (code === 200) {
      showErrorBox.value = Boolean(data.dnsStatus === 2)
    }
  } catch (error) {
    errorLoading.value = false
  }
}

const handleCopy = async (v: string) => {
  await handleCopyValue(v)
  message.success(t('domainSet2.copySuccess'))
}
</script>

<style scoped lang="scss">
.error-box {
  display: flex;

  // align-items: center;
  align-items: self-start;
  justify-content: space-between;
  width: 100%;
  min-height: var(--input-height);
  padding: 5px 12px 6px;
  margin-bottom: 20px;
  font-family: 'PingFang SC-Regular', 'PingFang SC';

  /* border: 1px solid var(--error-color); */
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--error-color);
  background-color: var(--error-box-bgc);

  .error-detail {
    display: flex;
    align-items: self-start;
    overflow-y: hidden;

    .error-info {
      display: flex;
      align-items: center;

      svg {
        flex-shrink: 0;
        align-self: baseline;
        width: 16px;
        height: 16px;
        margin-top: 2px;
        margin-right: 8px;
      }
    }

    .error-btn {
      margin-left: 8px;
      color: var(--primary-color);
      white-space: nowrap;
      cursor: pointer;
    }

    .mt12 {
      margin-top: 12px;
    }

    .mb6 {
      margin-bottom: 6px;
    }

    .ml24 {
      margin-left: 24px;
    }

    .server-table {
      width: 600px;

      :deep(.el-table__cell) {
        height: 40px;

        svg {
          margin-left: 5px;
        }
      }
    }
  }

  // &>div:first-child {
  //   max-width: 100%;

  //   svg {
  //     margin-right: 8px;
  //   }
  // }

  & > div:last-child {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    margin-left: 20px;
    cursor: pointer;

    svg {
      margin-right: 5px;
    }
  }

  .handle {
    color: var(--primary-color);

    span:hover {
      text-decoration: underline;
    }
  }

  .loading {
    animation: loading infinite 0.5s;
  }

  @keyframes loading {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
}

.the-title {
  span {
    color: var(--primary-color);
  }
}

.resize {
  :deep(.cat-tabs) {
    .cat-tabs__header {
      .cat-tab__item {
        font-size: 14px;
      }
    }
  }
}

.server {
  display: flex;
  width: 500px;

  .t {
    font-size: 14px;
    font-weight: 400;
    color: #000;
  }

  & > div {
    width: 50%;

    & > div:first-child {
      margin-bottom: 8px;
    }

    .server-box {
      flex-shrink: 0;
      padding: 12px;
      font-size: 14px;
      font-weight: 400;

      div {
        word-break: break-all;

        svg {
          margin-left: 4px;
          color: #999;
        }
      }
    }
  }

  .server-l {
    margin-right: 20px;

    .server-box {
      div {
        /* color: var(--error-color); */
        color: #555;
      }
    }
  }

  .server-r {
    .server-box {
      div {
        color: var(--success-color);
      }
    }
  }
}
</style>
