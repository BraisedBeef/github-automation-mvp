<template>
  <div class="df">
    <!-- lt -->
    <div class="lt">
      <!-- top -->
      <el-card shadow="never" class="page-box top mb20" :body-style="bodyStyle">
        <div style="padding: 0 10px">
          <!-- 最近访问 -->
          <Access />
          <!-- 我的资源 -->
          <NaturalResources :cdn="flowMetric" :dns="dns" :domain="domain" />
        </div>
      </el-card>

      <!-- center -->
      <div class="center df ac mb20">
        <!-- CDN -->
        <div class="page-box cdn mr20">
          <div class="desc mb20">
            <div class="df ac jsb">
              <span class="tit">CDN</span>
              <div class="df ac mark pointer" @click="goCdn">
                <span style="margin-right: 10px">{{ t('home.accelerating') }}</span>
                <span class="mr4">{{ cdn?.deployed || 0 }}/{{ cdn?.total || 0 }}</span>
                <el-icon>
                  <ArrowRight />
                </el-icon>
              </div>
            </div>
          </div>

          <div class="df ac mb20">
            <!-- 昨日流量消耗 -->
            <div class="flow mr20">
              <div class="text mb10">
                {{ t('home.yesterdayDataUsage') }}
              </div>
              <div class="mb20">
                <span class="num">{{ getFluxDetail(flowMetric.total).count }}</span>
                <span class="unit">{{ getFluxDetail(flowMetric.total).unit }}</span>
              </div>
              <div class="p">
                <div class="line-hart df ac">
                  <el-tooltip
                    :content="`${getFluxDetail(flowMetric.inland).count} ${getFluxDetail(flowMetric.inland).unit}`"
                    placement="top"
                    popper-class="table-header_tooltip"
                  >
                    <!-- 境内 -->
                    <div
                      class="blue h-full"
                      :style="{
                        width: flowMetric.inlandP,
                      }"
                    />
                  </el-tooltip>

                  <el-tooltip
                    :content="`${getFluxDetail(flowMetric.overseas).count} ${getFluxDetail(flowMetric.overseas).unit}`"
                    placement="top"
                    popper-class="table-header_tooltip"
                  >
                    <!-- 境外 -->
                    <div
                      class="green h-full"
                      :style="{
                        width: flowMetric.overseasP,
                      }"
                    />
                  </el-tooltip>
                </div>
              </div>
            </div>
            <!-- 昨日次数消耗 -->
            <div class="use">
              <div class="text mb10">
                {{ t('home.yesterdayConsumption') }}
              </div>
              <div class="mb20">
                <span class="num">{{ getRequestDetail(reqMetric.total)?.count }}</span>
                <span class="unit">{{ getRequestDetail(reqMetric.total)?.unit }}</span>
              </div>
              <div class="p">
                <div class="line-hart df ac">
                  <el-tooltip
                    :content="`${getRequestDetail(reqMetric.inland)?.count} ${getRequestDetail(reqMetric.inland)?.unit}`"
                    placement="top"
                    popper-class="table-header_tooltip"
                  >
                    <!-- 境内 -->
                    <div
                      class="blue h-full"
                      :style="{
                        width: reqMetric.inlandP,
                      }"
                    />
                  </el-tooltip>
                  <el-tooltip
                    :content="`${getRequestDetail(reqMetric.overseas)?.count} ${getRequestDetail(reqMetric.overseas)?.unit}`"
                    placement="top"
                    popper-class="table-header_tooltip"
                  >
                    <!-- 境外 -->
                    <div
                      class="green h-full"
                      :style="{
                        width: reqMetric.overseasP,
                      }"
                    />
                  </el-tooltip>
                </div>
              </div>
            </div>
          </div>
          <!-- legend -->
          <div class="legend-wrap df ac">
            <div class="df ac" style="margin-right: 40px">
              <div class="dot blue" />
              <span>{{ t('home.domestic') }}</span>
            </div>
            <div class="df ac">
              <div class="dot green" />
              <span>{{ t('home.overseas') }}</span>
            </div>
          </div>
        </div>
        <!-- 域名服务 -->
        <div class="page-box domain h-full">
          <div class="tit mb20">
            {{ t('home.domainServices') }}
          </div>

          <div>
            <!-- t -->
            <div class="item-new df t">
              <!-- 域名注册 -->
              <div class="register col">
                {{ t('home.domainRegisterNum') }}
              </div>
              <!-- DNS解析域名 -->
              <div class="parse col">
                {{ t('home.dnsNum') }}
              </div>
              <!-- SSL证书 -->
              <div class="ssl col">
                {{ t('home.sslNum') }}
              </div>
            </div>
            <!-- c -->
            <div class="item-new df c">
              <!-- 域名注册 -->
              <div class="register col">
                {{ domain?.cnt || 0 }}
              </div>
              <!-- DNS解析域名 -->
              <div class="parse col">
                {{ dns.domain }}
              </div>
              <!-- SSL证书 -->
              <div class="ssl col">
                {{ 0 }}
              </div>
            </div>
            <div class="item-new" />
            <!-- b -->
            <div class="item-new df b">
              <!-- 域名注册 -->
              <div class="register col">
                <span class="pointer" @click="registerDomain">{{ t('home.registerDomain') }}</span>
              </div>
              <!-- DNS解析域名 -->
              <div class="parse col">
                <!-- 有异常 -->
                <template v-if="dns.invalid_domain">
                  <div class="text-error">
                    <span class="pointer" @click="addDns">{{ t('home.error') }} {{ dns.invalid_domain }}</span>
                  </div>
                </template>
                <!-- 无异常 -->
                <template v-else>
                  <!-- 数量为0 -->
                  <div v-show="!dns.domain" class="text-primary">
                    <span class="pointer" @click="addDns">{{ t('home.addDns') }}</span>
                  </div>
                  <!-- 数量不为0 -->
                  <div v-show="dns.domain" class="text-primary">
                    <span class="pointer" @click="addDns">{{ t('home.normal') }} {{ dns.effective_domain }}</span>
                  </div>
                </template>
              </div>
              <!-- SSL证书 -->
              <div class="ssl col disabled">
                {{ t('home.applySsl') }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 全部产品 -->
      <Product />
    </div>
    <!-- rt -->
    <div class="rt">
      <!-- user -->
      <el-card shadow="never" class="page-box mb20 user-wrap df ac" :body-style="bodyStyle">
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
            <div class="name text-over">
              {{ userStore.user.userName || '-' }}
            </div>
            <div class="id df ac">
              <span>{{ t('home.account') }}{{ userStore.user.id }}</span>
              <SvgIcon class="pointer" name="dns-copy" @click.stop="handleCopy(userStore.user.id)" />
            </div>
          </div>
        </div>
      </el-card>
      <!-- 费用中心 -->
      <el-card shadow="never" class="page-box cost-wrap mb20" :body-style="bodyStyle">
        <div class="tit mb20 df ac jsb">
          <span>{{ t('home.cost') }}</span>
          <span class="text-primary order pointer" @click="toOrder">{{ t('home.order') }}</span>
        </div>

        <div class="balance">
          <div class="key">
            {{ t('home.accountPrice') }}
          </div>
          <div class="df ac jsb">
            <div class="num">{{ userStore.user.balance || 0 }} USD</div>
            <el-button type="primary" @click="toRecharge">
              {{ t('home.recharge') }}
            </el-button>
          </div>
        </div>

        <div class="info df">
          <!-- 待支付订单 -->
          <div class="border-box" style="margin-right: 10px">
            <div class="t df ac">
              <div class="line" />
              <div class="key">
                {{ t('home.payOrder') }}
              </div>
            </div>
            <div class="b">
              <span class="num">{{ userStore.user.orderNum || 0 }}</span>
            </div>
          </div>
          <!-- 30天内到期资源 -->
          <div class="border-box">
            <div class="t df" :class="naturalResourcesClass">
              <div class="line" :class="lineClass" />
              <div class="key">
                {{ t('home.day30') }}
              </div>
            </div>
            <div class="b">
              <span class="num">{{ userStore.user.expireNum || 0 }}</span>
            </div>
          </div>
        </div>
      </el-card>
      <!-- 访问控制 -->
      <el-card shadow="never" class="page-box access-control-wrap mb20" :body-style="bodyStyle">
        <div class="tit mb20">
          {{ t('home.accessControl') }}
        </div>

        <div class="df ac">
          <!-- 用户 -->
          <div class="item">
            <div class="t">
              {{ t('home.user') }}
            </div>
            <div class="c">
              {{ userStore.user.userNum }}
            </div>
            <div class="b text-primary pointer" @click="toUserCreate">
              {{ t('home.addUser') }}
            </div>
          </div>
          <!-- 角色 -->
          <div class="item">
            <div class="t">
              {{ t('home.role') }}
            </div>
            <div class="c">
              {{ userStore.user.roleNum }}
            </div>
            <div class="b text-primary pointer" @click="toRoleCreate">
              {{ t('home.addRole') }}
            </div>
          </div>
        </div>
      </el-card>
      <!-- 产品文档 -->
      <Doc />
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'

import { useBaseStore, useUserStore } from '@/store'
import { message } from '@/utils/message'
import { handleCopyValue } from '@/utils/dom-utils'
import { _getDomainCount, _getMetricValue, _getDnsDomain, _domainRegisterCnt } from '@/apis/home'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import { ArrowRight } from '@element-plus/icons-vue'
import { getFluxDetail } from '@/utils/unit'
import Product from './product.vue'
import Doc from './doc.vue'
import Access from './access.vue'
import NaturalResources from './natural-resources.vue'
import { getRequestDetail } from '@/utils/unit'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { pushRoute } from '@/utils/router-jump'

const bodyStyle = { height: '100%' }
const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const lineClassMap = {
  [ja]: 'negative_mt5px',
  [en]: 'negative_mt5px',
  [zh]: '',
}
const naturalResourcesClassMap = {
  [ja]: '',
  [en]: '',
  [zh]: 'ac',
}

const lineClass = useI18nStyle(lineClassMap)
const naturalResourcesClass = useI18nStyle(naturalResourcesClassMap)
const userStore = useUserStore()
const baseStore = useBaseStore()

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
  inland: number
  overseas: number
  total: number
  overseasP: string
  inlandP: string
}>({
  inland: 0,
  overseas: 0,
  total: 0,
  overseasP: '0%',
  inlandP: '0%',
}) // cdn流量

const reqMetric = reactive<{
  inland: number
  overseas: number
  total: number
  overseasP: string
  inlandP: string
}>({
  inland: 0,
  overseas: 0,
  total: 0,
  overseasP: '0%',
  inlandP: '0%',
}) // cdn消耗

const goCdn = () => {
  pushRoute({ name: 'cdn_service' })

  // baseStore.routeModel = '/cdn'
  // baseStore.selectedKeys = 'cdn_service'
}

const handleCopy = async v => {
  await handleCopyValue(v)
  message.success(t('domainSet2.copySuccess'))
}

const toUserCreate = () => {
  pushRoute({
    name: 'access_user_create',
    query: {
      title: t('home.console'),
      path: '/home',
    },
  })
}

const toRoleCreate = () => {
  pushRoute({
    name: 'access_role_create',
    query: {
      title: t('home.console'),
      path: '/home',
    },
  })
}

const toOrder = () => {
  pushRoute({
    name: 'order',
    query: {
      title: t('home.console'),
      path: '/home',
    },
  })
}

const toRecharge = () => {
  pushRoute({
    name: 'cost_center_account_recharge',
    query: {
      title: t('home.console'),
      path: '/home',
    },
  })
}

const registerDomain = () => {
  pushRoute({
    name: 'domain_overview',
    query: {
      title: t('home.console'),
      path: '/home',
    },
  })
}

const addDns = () => {
  pushRoute({
    name: 'MyDomains',
    query: {
      title: t('home.console'),
      path: '/home',
    },
  })

  // baseStore.routeModel = '/dns'
  // baseStore.selectedKeys = 'MyDomains'
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
      cdn.value = res.data.total
    }
  } catch (error) {
    console.log(error)
  }
}

// 获取用户cdn指定指标的数据
const getMetricValue = async (metric: number) => {
  // 获取当前时间
  const now = maoYunDayJs()

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
        flowMetric.inland = res.data.inland
        flowMetric.overseas = res.data.overseas
        flowMetric.total = res.data.total

        if (res.data.total) {
          flowMetric.overseasP = (res.data.overseas / res.data.total) * 100 + '%'
          flowMetric.inlandP = (res.data.inland / res.data.total) * 100 + '%'
        } else {
          flowMetric.overseasP = '0%'
          flowMetric.inlandP = '0%'
        }
      }

      //cdn消耗
      if (metric === 2) {
        reqMetric.inland = res.data.inland
        reqMetric.overseas = res.data.overseas
        reqMetric.total = res.data.total

        if (res.data.total) {
          reqMetric.overseasP = (res.data.overseas / res.data.total) * 100 + '%'
          reqMetric.inlandP = (res.data.inland / res.data.total) * 100 + '%'
        } else {
          reqMetric.overseasP = '0%'
          reqMetric.inlandP = '0%'
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  userStore.getUser()
  getMetricValue(0)
  getMetricValue(2)
  getDomainCount()
  getDnsDomain()
  domainRegisterCnt()
})
</script>

<style lang="scss" scoped>
.lt {
  flex: 1;

  .top {
    // placeholder
  }

  .center {
    /* min-height: 210px; */
    align-items: stretch;

    /* 使子元素高度一致 */

    .cdn {
      flex: 1;
      width: 50%;

      /* height: 210px; */
      min-height: 210px;

      /* box-sizing: border-box; */
      padding: 20px 30px;

      .desc {
        .tit {
          font-family: PingFangSC, 'PingFang SC';

          // font-weight: 500;
          font-size: 16px;
          color: #000;
        }

        .mark {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          color: #000;
        }
      }

      .flow,
      .use {
        width: 50%;

        .text {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          color: #000;
        }

        .num {
          margin-right: 10px;
          font-family: PingFangSC, 'PingFang SC';

          // font-weight: 500;
          font-size: 20px;
          color: #000;
        }

        .unit {
          margin-right: 10px;
          font-family: PingFangSC, 'PingFang SC';

          // font-weight: 500;
          font-size: 14px;
          color: #000;
        }

        .p {
          .line-hart {
            height: 8px;
            background: #f2f4f8;

            .blue {
              background: #0063ff;
            }

            .green {
              background: #0fbe5b;
            }
          }
        }
      }

      .legend-wrap {
        .dot {
          width: 8px;
          height: 8px;
          margin-right: 10px;
          background: #0063ff;
          border-radius: 50%;
        }

        .blue {
          background: #0063ff;
        }

        .green {
          background: #0fbe5b;
        }

        span {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 12px;
          font-weight: 400;
          color: #555;
        }
      }
    }

    .domain {
      flex: 1;
      width: 50%;
      height: auto;

      /* height: 210px; */
      min-height: 210px;

      /* box-sizing: border-box; */
      padding: 20px 30px;

      .tit {
        font-family: PingFangSC, 'PingFang SC';

        // font-weight: 500;
        font-size: 16px;
        color: #000;
      }

      .item-new {
        .col {
          width: 33.3%;
        }
      }

      .t {
        margin-bottom: 15px;
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: #000;
      }

      .c {
        margin-bottom: 10px;
        font-family: PingFangSC, 'PingFang SC';

        // font-weight: 500;
        font-size: 20px;
        color: #000;
      }

      .b {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 12px;
        font-weight: 400;
        color: #0063ff;
      }

      .disabled {
        color: var(--sub-text);

        /* cursor: not-allowed; */
      }
    }
  }
}

.rt {
  width: 450px;
  margin-left: 20px;

  .user-wrap {
    height: 136px;
    padding: 0 10px;
    background-image: url('../../../assets/images/home/user-small.png');
    background-repeat: no-repeat;

    /* box-sizing: border-box; */
    background-position: right;
    background-size: auto;

    .name {
      max-width: 280px;
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

  .cost-wrap {
    padding: 0 10px;

    .tit {
      margin-bottom: 25px;
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 16px;
      color: #000;

      .order {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: #0063ff;
      }
    }

    .balance {
      margin-bottom: 25px;

      .key {
        margin-bottom: 10px;
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: #555;
      }

      .num {
        font-family: PingFangSC, 'PingFang SC';

        // font-weight: 500;
        font-size: 24px;
        color: #fc8c00;
      }
    }

    .info {
      .border-box {
        &:hover {
          /* background-color: #f9fafc; */
        }

        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        width: 50%;
        min-height: 80px;
        padding: 14px;
        background: #fff;
        border: 1px solid #eee;
        border-radius: 4px;

        .t {
          padding-top: 5px;
          margin-bottom: auto;

          /* 将第一个子盒子推到容器顶部 */

          .line {
            width: 3px;
            height: 13px;
            margin-right: 10px;
            background-color: #0063ff;
          }

          .negative_mt5px {
            margin-top: 5px;
          }

          .key {
            font-family: PingFangSC, 'PingFang SC';
            font-size: 14px;
            font-weight: 400;
            color: #000;
          }
        }

        .b {
          padding-top: 5px;
          margin-top: auto;

          /* 将第二个子盒子推到容器底部 */

          .num {
            font-family: PingFangSC, 'PingFang SC';

            // font-weight: 500;
            font-size: 20px;
            color: #000;
          }
        }
      }
    }
  }

  .access-control-wrap {
    padding: 0 10px;

    .tit {
      margin-bottom: 25px;
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 16px;
      color: #000;
    }

    .item {
      width: 50%;

      .t {
        margin-bottom: 15px;
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: #000;
      }

      .c {
        margin-bottom: 10px;
        font-family: PingFangSC, 'PingFang SC';

        // font-weight: 500;
        font-size: 20px;
        color: #000;
      }

      .b {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 12px;
        font-weight: 400;
        color: #0063ff;
      }
    }
  }

  .doc-wrap {
    padding: 0 10px;

    .tit {
      margin-bottom: 25px;
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 16px;
      color: #000;
    }

    .item {
      &:hover {
        .icon {
          color: #0063ff;
        }

        span {
          color: #0063ff;
        }
      }

      span {
        margin-left: 10px;
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: #000;
      }
    }
  }
}
</style>
