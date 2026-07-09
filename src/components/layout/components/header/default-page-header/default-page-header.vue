<template>
  <div ref="dns_header" class="page-header p1">
    <div class="page-header-left">
      <!-- 如需添加返回按钮，请在路由配置 -->
      <div v-if="route.meta.backHeader" class="back cat-flex" @click="pushRoute((route.meta as any).backHeader?.path)">
        <SvgIcon name="sub-back" pointer />
        <div>{{ route.meta.backHeader ? route.meta.backHeader.title : '' }}</div>
        <div class="line" />
      </div>

      <div class="page-title">
        {{ route.meta.title ? route.meta.title : '' }}
        {{ route.meta.backHeader?.detail ? route.meta.backHeader.detail : '' }}
      </div>
    </div>

    <div v-if="products.includes(productType)" class="page-header-right" @click="handleHelp">
      <SvgIcon name="help-document" pointer />
      <span>{{ t('common.docHelper') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store'
import t from '@/utils/i18n'
import { documentUrl } from '@/config/base-config'
import { pushRoute } from '@/utils/router-jump'

const route: any = useRoute()
const router = useRouter()
const products = useUserStore().user.productDTOS.map(v => v.symbol.toLocaleLowerCase())
const productType = computed(() => route.path.split('/')[1])

const handleHelp = () => {
  window.open(documentUrl + `document/detail?type=${productType.value}`)
}
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  /* height: var(--header-h); */
  height: var(--page-header-h);
  background-color: #fff;

  /* border-bottom: 1px solid var(--border-c); */
  .page-header-left {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    max-width: 75%;
    height: 100%;
    font-family: 'PingFang SC-Regular', 'PingFang SC';
    font-size: 16px;
    font-weight: 400;
    color: var(--primary-text);

    .back {
      position: relative;
      height: 100%;

      /* padding: 0 44px 0 32px; */
      padding: 0 20px 0 18px;

      /* border-right: 1px solid var(--border-c); */
      cursor: pointer;
      user-select: none;

      /* flex-shrink: 0; */

      svg {
        width: 16px;
        height: 16px;
        margin-right: 8px;
        color: var(--primary-color);
      }

      &:hover {
        color: var(--primary-color);
      }

      .line {
        position: absolute;
        top: 50%;
        right: 0;
        display: inline-block;
        width: 1px;
        height: 20px;
        background-color: #ddd;
        transform: translateY(-50%);
      }
    }

    .page-title {
      position: relative;
      max-width: 600px;

      /* padding-left: 40px; */
      padding-left: 20px;
      color: #000;

      &.with-back {
        padding-left: 28px;
      }
    }
  }

  .page-header-right {
    display: flex;
    align-items: center;
    padding-right: 20px;
    font-family: 'PingFang SC-Regular', 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #555;
    cursor: pointer;

    svg {
      width: 16px;
      height: 16px;
      margin-right: 7px;
    }

    &:hover {
      color: var(--primary-color);
      text-decoration: underline;
    }
  }
}
</style>
