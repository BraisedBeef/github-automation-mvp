<template>
  <div ref="dns_header" class="page-header p2">
    <div class="page-header-left">
      <!--  @click="pushRoute({ name: backName })" -->
      <div v-if="backTitle" class="back cat-flex" @click="handleBack">
        <SvgIcon name="sub-back" pointer />
        <div>
          {{ backTitle }}
        </div>
      </div>
      <div class="page-title">
        <slot name="title">
          {{ title }}
        </slot>
      </div>
      <slot name="left" />
    </div>

    <slot name="center" />

    <slot name="right">
      <div class="df ac">
        <slot name="right_content" />
        <div v-if="products.includes(productType)" class="page-header-right" @click="handleHelp">
          <SvgIcon name="help-document" pointer />
          <span>{{ t('common.docHelper') }}</span>
        </div>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store'
import t from '@/utils/i18n'
import { documentUrl } from '@/config/base-config'
import { backRoute, pushRoute } from '@/utils/router-jump'

const props = withDefaults(
  defineProps<{
    title?: string // 标题
    backTitle?: string // 返回标题
    backName?: string // 需要返回的页面Name
  }>(),
  {},
)

const router = useRouter()
const route = useRoute()

const handleBack = () => {
  if (props.backName) {
    pushRoute({
      name: props.backName,
    })
  } else {
    backRoute()
  }
}

const products = useUserStore().user.productDTOS.map(v => v.symbol.toLocaleLowerCase())
const productType = computed(() => route.path.split('/')[1])
const productOneOpts = {
  'public-ip': 'epnip',
  'network-card': 'eg',
}
const productTwoOpts = {
  network: 'vpc',
}

const handleHelp = () => {
  const productVal = route.path.split('/')[2]
  if (productOneOpts[productVal]) {
    window.open(documentUrl + `document/detail?type=${productOneOpts[productVal]}`)
  } else if (productTwoOpts[productType.value]) {
    window.open(documentUrl + `document/detail?type=${productTwoOpts[productType.value]}`)
  } else {
    window.open(documentUrl + `document/detail?type=${productType.value}`)
  }
}
</script>

<style scoped lang="scss">
.page-header {
  /* border-bottom: 1px solid var(--border-c); */
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: var(--page-header-h);
  background-color: #fff;

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
      flex-shrink: 0;
      height: 100%;
      padding: 0 20px;
      white-space: nowrap;
      cursor: pointer;
      user-select: none;

      svg {
        width: 16px;
        height: 16px;
        margin-right: 8px;
        color: var(--primary-color);
      }

      &:hover {
        color: var(--primary-color);
      }

      &::before {
        position: absolute;
        top: 50%;
        right: 0;
        display: inline-block;
        width: 1px;
        height: 20px;
        content: '';
        background-color: #ddd;
        transform: translateY(-50%);
      }
    }

    .page-title {
      position: relative;
      max-width: 600px;
      padding-left: 20px;
      color: #555;

      &.with-back {
        padding-left: 28px;
      }
    }
  }

  .page-header-right {
    display: flex;
    flex-shrink: 0;
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
