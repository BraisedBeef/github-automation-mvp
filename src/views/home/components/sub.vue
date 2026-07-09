<template>
  <div class="df">
    <!-- lt -->
    <div class="lt">
      <!-- top -->
      <div class="page-box top mb20">
        <!-- user -->
        <div class="user-wrap df ac">
          <div class="df ac">
            <div class="mr20">
              <el-avatar
                v-if="userStore.user.headImg"
                :src="userStore.user.headImg"
                :size="80"
                class="header-account-img"
              />
              <SvgIcon v-else name="cat-header-account" style="width: 80px; height: 80px" />
            </div>
            <div>
              <div class="name">
                {{ userStore.user.userName || '-' }}
              </div>
              <div class="id df ac">
                <span>{{ t('home.account') }}{{ userStore.user.id }}</span>
                <SvgIcon class="pointer" name="dns-copy" @click.stop="handleCopy(userStore.user.id)" />
              </div>
            </div>
          </div>
        </div>
        <div style="padding: 20px 30px">
          <!-- 最近访问 -->
          <Access />
          <!-- 我的资源 -->
          <NaturalResources :cdn="flowMetric" :dns="dns" :domain="domain" />
        </div>
      </div>
      <!-- 全部产品 -->
      <Product />
    </div>
    <!-- rt -->
    <div class="rt">
      <!-- 产品文档 -->
      <Doc />
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useUserStore } from '@/store'
import { message } from '@/utils/message'
import { handleCopyValue } from '@/utils/dom-utils'
import { _getDomainCount, _getDnsDomain, _getMetricValue, _domainRegisterCnt } from '@/apis/home'
import Product from './product.vue'
import Doc from './doc.vue'
import Access from './access.vue'
import NaturalResources from './natural-resources.vue'
import dayjs from 'dayjs'

const userStore = useUserStore()
const cdn = ref<any>({}) // cdn 域名数量
const domain = ref<any>({}) // 域名注册数量
const dns = ref<any>({
  domain: 0,
  invalid_domain: 0,
  effective_domain: 0,
  parse: 0,
  ssl: 0,
}) // dns 解析数量

const flowMetric = reactive<{
  total: number
}>({
  total: 0,
}) // cdn流量

const handleCopy = async v => {
  await handleCopyValue(v)
  message.success(t('domainSet2.copySuccess'))
}

// 统计-域名注册
const domainRegisterCnt = async () => {
  try {
    const res = await _domainRegisterCnt()

    console.log(`_domainRegisterCnt===>`, res)

    if (res.data) {
      domain.value = res.data
    }
  } catch (error) {
    console.log(error)
  }
}

// 统计-DNS概览数据
const getDnsDomain = async () => {
  try {
    const res = await _getDnsDomain()

    // console.log(`_getDnsDomain===>`, res)

    if (res.data) {
      dns.value = res.data
    }
  } catch (error) {
    console.log(error)
  }
}

// 获取用户cdn域名数量
const getDomainCount = async () => {
  try {
    const res = await _getDomainCount()

    // console.log(`_getDomainCount===>`, res)

    if (res.data) {
      cdn.value = res.data.cdn
    }
  } catch (error) {
    console.log(error)
  }
}

// 获取用户cdn指定指标的数据
const getMetricValue = async (metric: number) => {
  // 获取当前时间
  const now = dayjs()

  // 获取昨天的日期
  const yesterday = now.subtract(1, 'day')

  // 设置昨天的开始时间，并获取时间戳
  const startTime = yesterday.startOf('day').unix()

  // 设置昨天的结束时间，并获取时间戳
  const endTime = yesterday.endOf('day').unix()

  try {
    const params = {
      metric,
      startTime,
      endTime,
    }

    const res = await _getMetricValue(params)

    // console.log(`_getMetricValue===>`, res)

    if (res.data) {
      //cdn流量
      if (metric === 0) {
        flowMetric.total = res.data.total
      }
    }
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  userStore.getUser()
  getMetricValue(0)
  getDomainCount()
  getDnsDomain()
  domainRegisterCnt()
})
</script>

<style lang="scss" scoped>
.lt {
  flex: 1;

  .top {
    .user-wrap {
      box-sizing: border-box;
      height: 160px;
      padding: 0 30px;
      background-image: url('../../../assets/images/home/user.png');
      background-repeat: no-repeat;
      background-position: right;
      background-size: auto;

      .name {
        margin-bottom: 15px;
        font-family: PingFangSC, 'PingFang SC';

        // font-weight: 500;
        font-size: 24px;
        color: #000;
      }

      .id {
        span {
          margin-right: 10px;
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          color: #555;
        }
      }
    }
  }
}

.rt {
  width: 340px;
  margin-left: 20px;
}
</style>
