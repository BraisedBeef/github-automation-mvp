<template>
  <el-card shadow="never" class="page-box product-wrap" :body-style="bodyStyle">
    <div class="tit">
      {{ t('home.allProduct') }}
    </div>

    <el-row>
      <el-col :span="16">
        <el-row class="h-full">
          <el-col :span="24" class="df">
            <!-- 计算 -->
            <div class="item df">
              <div>
                <SvgIcon :name="calcConfig?.icon || ''" class="icon" />
              </div>
              <div>
                <div class="big mb20 pointer">
                  {{ calcConfig.big }}
                </div>
                <div
                  v-for="(item, index) in calcConfig.smalls"
                  :key="index"
                  class="small mb20 pointer"
                  @click="goConsole(item)"
                >
                  {{ item.label }}
                </div>
              </div>
            </div>
            <!-- 存储 -->
            <div class="item df">
              <div>
                <SvgIcon :name="storageConfig?.icon || ''" class="icon" />
              </div>
              <div>
                <div class="big mb20 pointer">
                  {{ storageConfig.big }}
                </div>
                <div
                  v-for="(item, index) in storageConfig.smalls"
                  :key="index"
                  class="small mb20 pointer"
                  @click="goConsole(item)"
                >
                  {{ item.label }}
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="24" class="df">
            <!-- 视频服务 -->
            <div class="item df">
              <div>
                <SvgIcon :name="videoConfig?.icon || ''" class="icon" />
              </div>
              <div>
                <div class="big mb20 pointer">
                  {{ videoConfig.big }}
                </div>
                <div
                  v-for="(item, index) in videoConfig.smalls"
                  :key="index"
                  class="small mb20 pointer"
                  @click="goConsole(item)"
                >
                  {{ item.label }}
                </div>
              </div>
            </div>
            <!-- CDN与边缘平台 -->
            <div class="item df">
              <div>
                <SvgIcon :name="cdnConfig?.icon || ''" class="icon" />
              </div>
              <div>
                <div class="big mb20 pointer">
                  {{ cdnConfig.big }}
                </div>
                <div
                  v-for="(item, index) in cdnConfig.smalls"
                  :key="index"
                  class="small pointer"
                  :class="index !== cdnConfig.smalls.length - 1 && 'mb20'"
                  @click="goConsole(item)"
                >
                  {{ item.label }}
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="8" class="df">
        <!-- 云上网络 -->
        <div class="item df w-full">
          <div>
            <SvgIcon :name="networkConfig?.icon || ''" class="icon" />
          </div>
          <div>
            <div class="big mb20 pointer">
              {{ networkConfig.big }}
            </div>
            <div
              v-for="(item, index) in networkConfig.smalls"
              :key="index"
              class="small pointer"
              :class="index !== networkConfig.smalls.length - 1 && 'mb20'"
              @click="goConsole(item)"
            >
              {{ item.label }}
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'

import { productOverviews } from '@/views/product/overview/config'
import { calcList, storageList, videoList, cdnList, networkList } from '../config'
import { useBaseStore, useUserStore } from '@/store'
import { ACCELERATOR_KEY } from '@/config/constant-config'
import { pushRoute } from '@/utils/router-jump'

const bodyStyle = { height: '100%' }

const baseStore = useBaseStore()
const userStore = useUserStore()

const calcConfig = ref<any>({}) // 计算列表
const storageConfig = ref<any>({}) // 基础存储服务
const videoConfig = ref<any>({}) // 视频服务
const cdnConfig = ref<any>({}) // CDN与边缘平台列表
const networkConfig = ref<any>({}) // 云上网络列表

//跳转控制台
const goConsole = item => {
  console.log(`goConsole===>`, item)

  // 产品未上线
  if (!item.online) {
    console.log(`产品未上线===>`)

    // 猫云加速器产品 无需跳概览页
    if (ACCELERATOR_KEY === item.value) {
      const url = productOverviews[item.value]?.official
      window.open(url, '_blank')
    } else {
      // 需跳概览页
      pushRoute({
        name: 'product_overview',
        query: {
          product: item.value,
          productId: item.productId,
        },
      })
    }
  } else {
    // 产品已上线
    if (item.flag) {
      console.log(`产品开通服务===>`)

      // 产品开通服务 直接跳转对应模块
      const consoleConf = productOverviews[item.value]?.console || {}
      const { routeName } = consoleConf

      if (routeName) {
        pushRoute({ name: routeName })
      }
    } else {
      console.log(`未开通服务===>`)
      // 未开通服务 跳转概览页
      pushRoute({
        name: 'product_overview',
        query: {
          product: item.value,
          productId: item.productId,
        },
      })
    }
  }
}

// 获取产品列表
const getConfig = (list: any) => {
  const productDTOS = userStore.user.productDTOS || []
  let config: any = {}

  config = { ...list }

  config.smalls = config.smalls.map(el => {
    const product = productDTOS.find(product => product.productId === el.productId)
    // console.log(`getConfig===>`, product)

    return {
      ...el,
      ...product,
      online: product ? true : false,
    }
  })
  return config
}

onMounted(() => {
  calcConfig.value = getConfig(calcList)
  storageConfig.value = getConfig(storageList)
  videoConfig.value = getConfig(videoList)
  cdnConfig.value = getConfig(cdnList)
  networkConfig.value = getConfig(networkList)
})
</script>

<style lang="scss" scoped>
.product-wrap {
  min-height: 325px;
  padding: 0 10px;

  .tit {
    margin-bottom: 30px;
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 16px;
    color: #000;
  }

  .item {
    flex: 1;
    width: 50%;

    .icon {
      width: 22px;
      height: 22px;
      margin-right: 8px;
    }

    .big {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 16px;
      color: #282e3e;
    }

    .small {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #555;

      &:hover {
        color: #0063ff;
      }
    }
  }
}
</style>
