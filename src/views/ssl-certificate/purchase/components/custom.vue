<template>
  <div class="custom">
    <CatKVList class="tips-list-group" :gutter="10">
      <CatKVItem>
        <template #label>
          <span class="label">{{ t('ssl-certificate.purchase.custom.755827-0') }}</span>
        </template>
        {{ t('ssl-certificate.purchase.custom.755827-1') }}
      </CatKVItem>
      <CatKVItem>
        <template #label>
          <span class="label">{{ t('ssl-certificate.purchase.custom.755827-2') }}</span> </template
        >{{ t('ssl-certificate.purchase.custom.755827-3') }}
      </CatKVItem>
    </CatKVList>
    <CatKVList class="product-list-group" :gutter="10">
      <CatKVItem class="product-item">
        <template #label>
          <span class="label">{{ t('ssl-certificate.purchase.custom.755827-4') }}</span>
        </template>
        <div
          v-if="certConfigMap.encryption_standards && certConfigMap.encryption_standards.length > 0"
          class="product-item-value"
        >
          <div class="df">
            <div
              v-for="item in certConfigMap.encryption_standards"
              :key="item.id"
              class="df brand-group"
              :class="{ active: formStore.encryption_standard === item.id }"
              @click="formStore.encryption_standard = item.id"
            >
              <SvgIcon class="icon" :name="item.iconName" />
              <div class="info">
                <p class="t t1">
                  {{ item.name }}
                </p>
                <p class="t t2">
                  {{ item.remark }}
                </p>
              </div>
            </div>
          </div>
          <div class="tips">
            {{ t('ssl-certificate.purchase.custom.755827-5') }}
          </div>
        </div>
        <el-empty
          v-else
          :image-size="40"
          :description="t('ssl-certificate.purchase.custom.755827-6')"
          style="width: 450px"
        />
      </CatKVItem>
      <CatKVItem class="product-item">
        <template #label>
          <span class="label">{{ t('ssl-certificate.purchase.custom.755827-7') }}</span>
        </template>
        <div class="product-item-value df">
          <div
            v-for="item in factoryList"
            :key="item.id"
            :class="{ active: formStore.factory_id == item.id }"
            class="df brand-group"
            @click="formStore.factory_id = item.id"
          >
            <SvgIcon class="icon" :name="item.iconName" />
            <div class="info">
              <p class="t t1">
                {{ item.name }}
              </p>
              <p class="t t2">
                {{ item.remark }}
              </p>
            </div>
          </div>
          <el-empty
            v-if="!factoryList || factoryList.length <= 0"
            :image-size="40"
            :description="t('ssl-certificate.purchase.custom.755827-6')"
            style="width: 450px"
          />
        </div>
      </CatKVItem>
      <CatKVItem class="product-item">
        <template #label>
          <span class="label">{{ t('ssl-certificate.purchase.custom.755827-8') }}</span>
        </template>
        <div class="product-item-value df">
          <div
            v-for="item in certConfigMap.cert_types"
            :key="item.id"
            class="type-group"
            :class="{ active: formStore.cert_type === item.id }"
            @click="formStore.cert_type = item.id"
          >
            <div class="title">
              {{ item.fullName }}
            </div>
            <ul class="desc-group">
              <div v-for="t in item.remark.split('|')" :key="t" class="item">· {{ t }}</div>
            </ul>
            <SvgIcon class="icon" name="corner-mark" />
          </div>
        </div>
        <el-empty
          v-if="!certConfigMap.cert_types || certConfigMap.cert_types.length <= 0"
          :image-size="40"
          :description="t('ssl-certificate.purchase.custom.755827-6')"
          style="width: 450px"
        />
      </CatKVItem>
      <CatKVItem class="product-item">
        <template #label>
          <span class="label">{{ t('ssl-certificate.purchase.custom.755827-10') }}</span>
        </template>
        <template v-if="certConfigMap.cert_domain_types && certConfigMap.cert_domain_types.length > 0">
          <CatBlockSelect v-model="formStore.cert_domain_type" :list="certConfigMap.cert_domain_types || []" />
          <p
            class="type-tips"
            style="min-height: 40px"
            v-html="certConfigMap.cert_domain_types.find(item => item.value === formStore.cert_domain_type)?.remark"
          />
        </template>
        <el-empty
          v-else
          :image-size="40"
          :description="t('ssl-certificate.purchase.custom.755827-6')"
          style="width: 450px"
        />
      </CatKVItem>
      <CatKVItem class="product-item">
        <template #label>
          <span class="label">{{ t('ssl-certificate.purchase.custom.755827-11') }}</span>
        </template>
        <el-checkbox v-model="store.agreeConfig" size="large" class="mr10" style="align-items: start; margin-top: 3px">
          <p style="margin-top: -4px; white-space: normal">
            {{ t('ssl-certificate.purchase.custom.755827-12') }}
            <a class="link" target="_blank" @click="toCvmAgreement">{{
              t('ssl-certificate.purchase.custom.755827-13')
            }}</a>
            {{ t('ssl-certificate.purchase.custom.755827-14') }}
            <a class="link" target="_blank" @click="toPrivacyPolicy">{{
              t('ssl-certificate.purchase.custom.755827-15')
            }}</a
            >{{ t('ssl-certificate.purchase.custom.755827-16') }}
          </p>
        </el-checkbox>
      </CatKVItem>
    </CatKVList>
    <div class="fixed-wrap df jsb ac">
      <div class="lt">
        <div class="df">
          <!-- 购买时长 -->
          <span class="label mr20">{{ t('ssl-certificate.purchase.custom.755827-17') }}</span>
          <div class="item">
            <div class="top df ac">
              <el-select
                ref="moreOptsRef"
                v-model="formStore.cert_validity"
                :teleported="false"
                class="select-opts"
                :placeholder="''"
                @change="() => {}"
              >
                <el-option v-for="item in BUY_TIME_MAP" :key="item.value" :value="item.value" :label="item.label" />
              </el-select>
              <!-- TODO 购买数量 -->
              <!-- <div class="df ac">
                <span class="name mr20">数量</span>
                <el-input-number disabled v-model="formStore.nums" :min="1" @change="() => {}" />
              </div> -->
            </div>
            <p class="tips">
              {{
                t('ssl-certificate.purchase.custom.755827-18', [
                  BUY_TIME_MAP.find(item => formStore.cert_validity === item.value)?.label,
                ])
              }}
            </p>
          </div>
        </div>
      </div>
      <div class="rt df">
        <div class="price-group df">
          <!-- TODO 配置费用 -->
          <!-- <p class="config mr20">配置费用</p> -->
          <!-- <div class="num-wrap"> -->
          <!-- <p class="text-warning real-num">免费</p> -->
          <!-- TODO 优惠 -->
          <!-- <p class="discount-num">已省: $26.78 USD</p> -->
          <!-- </div> -->
        </div>
        <el-button :loading="store.loading || configLoading" type="primary" @click="submit">
          {{ t('ssl-certificate.purchase.custom.755827-19') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { CatKVList, CatKVItem } from '@/components/common/cat-kv-list'
import { message } from '@/utils/message'
import { _s_setItem } from '@/utils/storage'
import { filterArray } from '@/utils/filter'
import { _createOrder, _getFactoryList, _getCertConfig } from '@/apis/ssl-certificate/purchase'
import type { CreateOrderReq, FactoryListResp, FactoryConfigResp } from '@/apis/ssl-certificate/purchase/type'
import {
  BUY_TIME_MAP,
  ENCRYPTION_STANDARDS_AMP,
  CERTIFICATE_TYPES_MAP,
  CERT_DOMAIN_TYPES_MAP,
  CertDomainTypes,
  CertificateIds,
  CertificateBrandsIds,
} from '../../config'
import { SSL_CERTIFICATE_CERT_DOMAIN_TYPE, SSL_CERTIFICATE_FACTORY_ID } from '../../management/config'
import { toCvmAgreement, toPrivacyPolicy } from '@/utils/to-html'
import { CERTIFICATE_BRANDS_MAP } from '../config'
import { pushRoute } from '@/utils/router-jump'

const router = useRouter()
const route = useRoute()
const { factoryId } = route.query as unknown as { factoryId?: CertificateBrandsIds }

const store = reactive({
  agreeConfig: false,
  loading: false,
})
const formStore = reactive<CreateOrderReq>({
  cert_domain_type: CertDomainTypes.SINGLE,
  cert_type: CertificateIds.DV,
  cert_validity: 1,
  encryption_standard: 1,
  factory_id: 1,
  nums: 1,
  price: 0,
})

// 配置信息
const configLoading = ref(false)
const certConfig = ref<FactoryConfigResp>()
// 根据配置id，获取信息映射
const certConfigMap = computed(() => {
  if (!certConfig.value) return {}
  return {
    encryption_standards: ENCRYPTION_STANDARDS_AMP.filter(item =>
      certConfig.value?.encryption_standards?.includes(item.id.toString()),
    ),
    cert_types: CERTIFICATE_TYPES_MAP.filter(item => certConfig.value?.cert_types?.includes(item.id.toString())),
    cert_domain_types: CERT_DOMAIN_TYPES_MAP.filter(item =>
      certConfig.value?.cert_domain_types?.includes(item.id.toString()),
    ).map<(typeof CERT_DOMAIN_TYPES_MAP)[0] & { label: string; value: number }>(item => ({
      ...item,
      label: item.name,
      value: item.id,
    })),
  }
})
// 获取配置信息
const getCertConfig = async (factory_id: number) => {
  configLoading.value = true
  const { code, msg, data } = await _getCertConfig({ factory_id })
  configLoading.value = false
  if (code === 200 && data) {
    certConfig.value = data

    // 如果当前选中的加密标准不在配置信息中，则默认选中第一个
    // @ts-ignore
    if (!data.encryption_standards.includes(formStore.encryption_standard))
      formStore.encryption_standard = Number(data.encryption_standards.split(',')[0])
    // @ts-ignore
    if (!data.cert_types.includes(formStore.cert_type)) formStore.cert_type = Number(data.cert_types.split(',')[0])
    // @ts-ignore
    if (!data.cert_domain_types.includes(formStore.cert_domain_type))
      formStore.cert_domain_type = Number(data.cert_domain_types.split(',')[0])
  } else {
    message.error(msg || t('ssl-certificate.purchase.custom.755827-20'))
  }
}
watch(
  () => formStore.factory_id,
  factory_id => {
    // 获取配置信息
    getCertConfig(factory_id)
  },
)

// 证书品牌列表
const factoryList = ref<(FactoryListResp['items'][0] & { iconName: string })[]>()
// 品牌列表图标
const iconNames = ['windmill', 'encryption']
// 获取厂商列表
const getFactoryList = async () => {
  const { code, msg, data } = await _getFactoryList()
  if (code === 200 && data && data.items && data.items.length > 0) {
    factoryList.value = data.items
      .filter(item => item.status == 1)
      .map((item, i) => ({
        ...item,
        iconName: iconNames[i % iconNames.length],
        remark: filterArray(CERTIFICATE_BRANDS_MAP, 'id', item.id)?.remark || '',
      }))
    // 默认选中第一个， 并获取配置信息
    formStore.factory_id = factoryId || factoryList.value[0].id
    getCertConfig(formStore.factory_id)
  } else {
    message.error(msg || t('ssl-certificate.purchase.custom.755827-21'))
  }
}
onMounted(() => {
  getFactoryList()
})

const submit = async () => {
  if (!store.agreeConfig) {
    message.warning(t('ssl-certificate.purchase.custom.755827-22'))
    return
  }

  try {
    store.loading = true
    const { code, msg, data } = await _createOrder({
      ...formStore,
      cert_validity: BUY_TIME_MAP.find(item => item.value === formStore.cert_validity)!.validity,
    })
    if (code === 200 && data) {
      // message.success('购买成功')
      // 跳转到提交申请页面
      _s_setItem(SSL_CERTIFICATE_CERT_DOMAIN_TYPE, formStore.cert_domain_type)
      _s_setItem(SSL_CERTIFICATE_FACTORY_ID, formStore.factory_id)
      pushRoute({
        name: 'ssl_certificate_apply',
        query: { cert_id: data.cert_id, factory_id: formStore.factory_id, cert_type: formStore.cert_type },
      })
    } else {
      message.error(msg || t('ssl-certificate.purchase.custom.755827-23'))
    }
  } finally {
    store.loading = false
  }
}
</script>

<style lang="scss" scoped>
.custom {
  position: relative;
  margin-bottom: 127px;
  background-color: #fff;

  .tips-list-group {
    margin-bottom: 40px;

    .label {
      width: 100%;
      padding: 2px 4px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #999;
      background: #f5f7fa;
      border-radius: 4px;
    }
  }

  .product-list-group {
    .label {
      width: 100%;
      padding: 2px 4px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #999;
    }

    .product-item {
      .type-tips {
        margin-top: 17px;
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        color: #999;
      }

      .link {
        color: #0063ff;
        cursor: pointer;

        &:hover {
          color: #0062ffb0;
        }
      }

      &:not(:last-child) {
        margin-bottom: 40px;
      }
    }

    .product-item-value {
      flex-wrap: wrap;

      .brand-group {
        width: 350px;
        padding: 20px 26px;
        margin-bottom: 8px;
        overflow: hidden;
        cursor: pointer;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;

        .icon {
          margin-right: 12px;
          font-size: 36px;
          filter: grayscale(100%) brightness(130%);
        }

        .t {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          color: #999;

          &.t1 {
            color: #000;
          }
        }

        &.active {
          color: #0063ff;
          background: #f1f7ff;
          border-color: #0063ff;

          .icon {
            filter: grayscale(0%) brightness(100%);
          }

          .t {
            color: #0063ff;

            &.t1 {
              color: #0063ff;
            }
          }
        }

        &:not(:last-child) {
          margin-right: 8px;
        }
      }

      .type-group {
        position: relative;
        width: 350px;
        margin-bottom: 8px;
        overflow: hidden;
        cursor: pointer;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;

        .title {
          height: 40px;
          padding: 8px 20px;
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 500;
          color: #000;
          background: #f1f7ff;
        }

        .desc-group {
          padding: 12px 20px 20px;

          .item {
            font-family: PingFangSC, 'PingFang SC';
            font-size: 14px;
            font-weight: 400;
            color: #000;

            &:not(:last-child) {
              margin-bottom: 4px;
            }
          }
        }

        .icon {
          position: absolute;
          right: 0;
          bottom: 0;
          display: none;
          font-size: 24px;
        }

        &.active {
          border-color: #0063ff;

          .title {
            color: #0063ff;
          }

          .icon {
            display: block;
          }
        }

        &:not(:last-child) {
          margin-right: 8px;
        }
      }

      .tips {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: #999;
      }
    }
  }

  .fixed-wrap {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 99;
    flex-wrap: wrap;
    width: 100%;
    padding: 30px 120px;
    text-align: center;
    background-color: #fff;
    border-top: 1px solid #eee;

    .lt {
      .label {
        margin-top: 6px;
        font-size: 14px;
        font-weight: 400;
        color: #999;
      }

      .item {
        .select-opts {
          margin-right: 40px;
        }

        .name {
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          color: #999;
          text-align: left;
        }

        .tips {
          margin-top: 12px;
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          color: #999;
          text-align: left;
        }
      }
    }

    .rt {
      .config {
        margin-top: 6px;
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: #000;
        text-decoration-line: underline;
      }

      .num-wrap {
        margin-right: 24px;
        text-align: right;

        .real-num {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 24px;
          font-weight: 500;
          color: #ff6700;
        }

        .discount-num {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 12px;
          font-weight: 400;
          color: #999;
        }
      }
    }
  }
}
</style>
