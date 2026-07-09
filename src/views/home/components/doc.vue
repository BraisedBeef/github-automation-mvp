<template>
  <el-card shadow="never" class="page-box doc-wrap" :body-style="bodyStyle">
    <div class="tit mb20">
      <span>{{ t('home.doc') }}</span>
    </div>

    <el-row>
      <el-col
        v-for="(item, index) in productList"
        :key="index"
        class="mb20 pointer df item"
        :span="user.accountType == 1 ? 12 : 24"
      >
        <div>
          <SvgIcon name="menu-order" class="icon" />
        </div>
        <span @click="goOfficial(item.productId)">{{ item.name }}</span>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { _productApilist } from '@/apis/home'
import { documentUrl } from '@/config/base-config'

const bodyStyle = { height: '100%' }

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const productList = ref<any[]>([])

// 获取产品列表
const getProductList = async () => {
  try {
    const res = await _productApilist()
    if (res.code === 10000) {
      productList.value = res?.data || []
    }
  } catch (err) {
    console.log('err', err)
  }
}

// 跳转文档中心
const goOfficial = (productId: number) => {
  const url = `${documentUrl}document/detail/${productId}`
  window.open(url, '_blank')
}

getProductList()
</script>

<style lang="scss" scoped>
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
</style>
