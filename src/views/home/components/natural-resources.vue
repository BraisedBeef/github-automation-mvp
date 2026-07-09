<template>
  <!-- v-if="cdnPermission.checkPermissionRes || dnsPermission.checkPermissionRes" -->
  <div class="natural-resources-wrap mb20">
    <p class="tit mb20">
      {{ t('home.naturalResources') }}
    </p>
    <!-- 资源列表 -->
    <div class="natural-resources df ac">
      <!-- 云服务器 -->
      <div
        v-if="userStore.user.instanceNum"
        v-permission="['vcloudCvm:**']"
        class="item mr20 cvm pointer"
        @click="goto('cvm')"
      >
        <div class="bg h-full">
          <div class="t df ac mb10">
            <div class="line" />
            <div class="key">
              {{ t('home.cloudServer') }}
            </div>
          </div>
          <div class="b">
            <span class="num">{{ userStore.user.instanceNum }}</span>
            <span class="unit">{{ t('home.tower') }}</span>
          </div>
        </div>
      </div>
      <!-- dns -->
      <div v-if="dns?.domain" v-permission="['dns:**']" class="item mr20 dns pointer" @click="goto('dns')">
        <div class="bg h-full">
          <div class="t df ac mb10">
            <div class="line" />
            <div class="key">
              {{ t('home.dnsProduct') }}
            </div>
          </div>
          <div class="b">
            <span class="num">{{ dns?.domain }}</span>
            <span class="unit">{{ t('home.indivual') }}</span>
          </div>
        </div>
      </div>
      <!-- cdn -->
      <div v-if="cdn?.total" v-permission="['cdn:**']" class="item mr20 cdn pointer" @click="goto('cdn')">
        <div class="bg h-full">
          <div class="t df ac mb10">
            <div class="line" />
            <el-tooltip :content="t('home.cdn')" :disabled="!cdnTitleOverflow" placement="top" effect="light">
              <div ref="cdnTitleRef" class="key cdn-overflow-text" @mouseenter="updateCdnOverflow">
                {{ t('home.cdn') }}
              </div>
            </el-tooltip>
          </div>
          <div class="b">
            <el-tooltip :content="cdnUsageText" :disabled="!cdnUsageOverflow" placement="top" effect="light">
              <span ref="cdnUsageRef" class="cdn-overflow-text" @mouseenter="updateCdnOverflow" v-html="cdnUsageHtml" />
            </el-tooltip>
          </div>
        </div>
      </div>
      <!-- 域名注册 -->
      <div v-if="domain?.cnt" v-permission="['domain:**']" class="item domain pointer" @click="goto('domain')">
        <div class="bg h-full">
          <div class="t df ac mb10">
            <div class="line" />
            <div class="key">
              {{ t('home.domainRegister') }}
            </div>
          </div>
          <div class="b">
            <span class="num">{{ domain?.cnt || 0 }}</span>
            <span class="unit">{{ t('home.indivual') }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 无资源 -->
    <div v-if="show" class="noData df ac jc">
      <span>{{ t('home.noData') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { getFluxDetail } from '@/utils/unit'
import { usePermission } from '@/hooks/permission/use-permission'
import { getRouteModel } from '@/router/map'
import { _filterRoutes } from '@/utils/router-utils'
import { useUserStore } from '@/store'
import { pushRoute } from '@/utils/router-jump'

const router: any = useRouter()

const props = withDefaults(
  defineProps<{
    cdn: any
    dns: any
    domain: any
  }>(),
  {
    cdn: {},
    dns: {},
    domain: {},
  },
)

const userStore = useUserStore()
const cdnPermission = usePermission('cdn:**') // cdn权限
const dnsPermission = usePermission('dns:**') // dns权限
const cvmPermission = usePermission('vcloudCvm:**') // cvm权限
const domainPermission = usePermission('domain:**') // domain权限
const cdnTitleRef = ref<HTMLElement>()
const cdnUsageRef = ref<HTMLElement>()
const cdnTitleOverflow = ref(false)
const cdnUsageOverflow = ref(false)

const cdnFluxDetail = computed(() => getFluxDetail(props.cdn?.total))
const cdnUsageText = computed(() =>
  t('home.yesterdayDataUsageTotal', [cdnFluxDetail.value?.count, cdnFluxDetail.value?.unit]).replace(/<[^>]*>/g, ''),
)
const cdnUsageHtml = computed(() =>
  t('home.yesterdayDataUsageTotal', [cdnFluxDetail.value?.count, cdnFluxDetail.value?.unit]),
)

const updateCdnOverflow = () => {
  requestAnimationFrame(() => {
    const titleEl = cdnTitleRef.value
    const usageEl = cdnUsageRef.value

    cdnTitleOverflow.value = !!titleEl && titleEl.scrollWidth > titleEl.clientWidth
    cdnUsageOverflow.value = !!usageEl && usageEl.scrollWidth > usageEl.clientWidth
  })
}

let cdnResizeObserver: ResizeObserver | undefined

const observeCdnOverflow = async () => {
  await nextTick()
  cdnResizeObserver?.disconnect()
  cdnResizeObserver = new ResizeObserver(updateCdnOverflow)

  const elements = [cdnTitleRef.value, cdnUsageRef.value].filter(Boolean) as HTMLElement[]
  elements.forEach(el => {
    cdnResizeObserver?.observe(el)
    if (el.parentElement) {
      cdnResizeObserver?.observe(el.parentElement)
    }
  })

  updateCdnOverflow()
}

// 是否显示nodata
const show = computed(() => {
  // 无权限
  if (
    !dnsPermission.checkPermissionRes &&
    !cdnPermission.checkPermissionRes &&
    !cvmPermission.checkPermissionRes &&
    !domainPermission.checkPermissionRes
  ) {
    return true
  } else if (!props.dns?.domain && !props.cdn?.total && !userStore.user.instanceNum && !props.domain?.cnt) {
    // cdn流量/dns/云服务器/域名 无数据
    return true
  } else {
    return false
  }
})

const goto = (name: string) => {
  const prodRoute = _filterRoutes(getRouteModel(('/' + name.toLocaleLowerCase()) as any).routes)[0]
  pushRoute(prodRoute)
}

onMounted(() => {
  observeCdnOverflow()
})

onUnmounted(() => {
  cdnResizeObserver?.disconnect()
})

watch(
  () => props.cdn?.total,
  () => {
    observeCdnOverflow()
  },
)
</script>

<style lang="scss" scoped>
.natural-resources-wrap {
  /* padding: 0 10px; */

  .tit {
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 16px;
    color: #000;
  }

  .natural-resources {
    /* height: 90px; */
  }

  .item {
    /* width: 33.3%; */
    width: 25%;
    height: 90px;
    background: linear-gradient(180deg, #f5f7f9 0%, #fff 100%);
    box-shadow: 0 7px 10px 0 rgb(170 183 202 / 43%);

    .bg {
      padding: 20px;
      background-repeat: no-repeat;
      background-position: calc(100% + 5px) 50%;

      /* background-position: right; */
      background-size: auto;
      border: 2px solid #fff;
    }

    .line {
      width: 3px;
      height: 13px;
      margin-right: 10px;
      background-color: #0063ff;
    }

    .key {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #000;
    }

    .num {
      margin-right: 5px;
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 20px;
      color: #000;
    }

    .unit {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 12px;
      color: #000;
    }
  }

  .cdn {
    .t,
    .b {
      min-width: 0;
    }

    :deep(.el-tooltip__trigger) {
      flex: 0 1 auto;
      min-width: 0;
      max-width: 100%;
    }

    .cdn-overflow-text {
      display: block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .cvm {
    .bg {
      background-image: url('../../../assets/images/home/cvm-small.png');
    }
  }

  .dns {
    .bg {
      background-image: url('../../../assets/images/home/dns-small.png');
    }
  }

  .cdn {
    .bg {
      background-image: url('../../../assets/images/home/cdn-small.png');
    }
  }

  .domain {
    .bg {
      background-image: url('../../../assets/images/home/domain-small.png');
    }
  }

  .noData {
    height: 90px;

    span {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #999;
    }
  }
}
</style>
