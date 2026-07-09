<template>
  <el-watermark :font="font" :content="t('invoice.preview')" :gap="[200, 200]">
    <div class="wrap">
      <div class="top df ac jsb">
        <SvgIcon :name="logoTextName" style="width: 97px; height: 32px" />
        <p class="right">{{ t('invoice.invoiceId') }}{{ '-' }}</p>
      </div>
      <div class="center">
        <div class="title">
          <p>{{ t('invoice.previewTit') }}</p>
          <p>{{ t('invoice.previewSubTit') }}</p>
        </div>

        <div class="info df jsb mb20">
          <div class="left">
            <!-- 公司名称 -->
            <div class="item df mb20">
              <div class="key-wrap" :style="keyWrapStyle">
                {{ t('invoice.companyNameTem') }}
              </div>
              <div class="value">
                {{ detail.companyName }}
              </div>
            </div>
            <!-- 姓名 -->
            <div class="item df mb20">
              <div class="key-wrap" :style="keyWrapStyle">
                {{ t('invoice.nameTem') }}
              </div>
              <div class="value">
                {{ detail.name }}
              </div>
            </div>
            <!-- 联系电话 -->
            <div class="item df mb20">
              <div class="key-wrap" :style="keyWrapStyle">
                {{ t('invoice.phoneTem') }}
              </div>
              <div class="value">
                {{ detail.phone }}
              </div>
            </div>
            <!-- 公司地址 -->
            <div class="item df mb20">
              <div class="key-wrap" :style="keyWrapStyle">
                {{ t('invoice.addressTem') }}
              </div>
              <div class="value">
                {{ detail.address }}
              </div>
            </div>
          </div>
          <div class="right">
            <!-- 开票日期 -->
            <div class="item df mb20">
              <div class="key-wrap" :style="keyWrapStyle">
                {{ t('invoice.endTimeTem') }}
              </div>
              <div class="value">
                {{ detail.endTime ? maoYunDayJs(detail.endTime).format(FORMAT_TIME) : '-' }}
              </div>
            </div>
            <!-- 发票类型 -->
            <div class="item df mb20">
              <div class="key-wrap" :style="keyWrapStyle">
                {{ t('invoice.invoiceType') }}
              </div>
              <div class="value">
                {{ t('invoice.onlineInvoice') }}
              </div>
            </div>
            <!-- 开票类型 -->
            <div class="item df mb20">
              <div class="key-wrap" :style="keyWrapStyle">
                {{ t('invoice.openInvoiceTypeTem') }}
              </div>
              <div class="value">
                {{ t('invoice.billSum') }}
              </div>
            </div>
            <!-- 付款方式 -->
            <div class="item df mb20">
              <div class="key-wrap" :style="keyWrapStyle">
                {{ t('invoice.payTem') }}
              </div>
              <div class="value">
                {{ t('invoice.onlinePay') }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bottom">
        <!-- 和后端约定，暂时前端写死列表数据 -->
        <el-table :data="[{}]" show-overflow-tooltip>
          <el-table-column width="100" type="index" :label="t('invoice.indexTem')" />
          <el-table-column :label="t('invoice.productId')">
            <template #default>
              {{ '-' }}
            </template>
          </el-table-column>
          <el-table-column :label="t('invoice.numberTem')">
            <template #default>
              {{ '-' }}
            </template>
          </el-table-column>
          <el-table-column :label="t('invoice.billingMode')">
            <template #default>
              {{ '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="cashAmount" :label="t('invoice.amountTem')">
            <template #default>
              {{ '-' }}
            </template>
          </el-table-column>
        </el-table>

        <div class="remark df ac jsb">
          <div>{{ t('invoice.remark', [detail.totalAmount]) }}-</div>
          <p class="right">
            {{ t('invoice.taotalTem', [detail.totalAmount]) }}
          </p>
        </div>

        <div class="desc df ac">
          <p>
            {{ t('invoice.descTem', [detail.totalAmount]) }}
          </p>
        </div>

        <div class="copyright">Copyright@Virtual Private Server Cloud Information Technology Co.,Ltd.</div>
      </div>
    </div>
  </el-watermark>
</template>

<script setup lang="ts">
import { _preInvoice } from '@/apis/cost-center/expense-bill'
import * as ExpenseBillType from '@/apis/cost-center/expense-bill/type'
import t from '@/utils/i18n'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { logoTextName } from '@/config/base-config'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const keyWrapStyleMap = {
  [ja]: {
    width: '100px',
  },
  [en]: {
    width: '150px',
  },
  [zh]: {
    width: '80px',
  },
}

const keyWrapStyle = useI18nStyle(keyWrapStyleMap)
const route = useRoute()

const detail = ref<any>({})
const font = reactive<{
  color: string
  fontSize: number
}>({
  color: 'rgba(0, 0, 0, .15)',
  fontSize: 70,
})

// 获取待开票金额及发票信息
const preInvoice = async () => {
  const invoiceType = Number(route.query.invoiceType)
  const data: ExpenseBillType.GetPreInvoiceReq = {
    invoiceType,
  }

  if (invoiceType == 1) {
    const billIds = route.query.billIds === 'all' ? [] : (route.query.billIds as string)?.split('_')
    data.billIds = billIds
  } else {
    const months = route.query.months === 'all' ? [] : (route.query.months as string)?.split('_')
    data.months = months
  }

  const res = await _preInvoice(data)
  console.log(`_preInvoice===>`, res)
  if (res.success) {
    detail.value = res.data || {}
  }
}

onMounted(() => {
  preInvoice()
})
</script>

<style lang="scss" scoped>
.wrap {
  padding-right: 40px;

  /* height: 1265px; */
  padding-left: 40px;
  border: 1px solid var(--border-c);

  .top {
    height: 80px;
    line-height: 80px;
    border-bottom: 1px solid var(--border-c);

    .right {
      font-size: 14px;
      font-weight: 300;
      line-height: 20px;
      color: var(--primary-text);
    }
  }

  .center {
    padding-top: 46px;

    .title {
      margin-bottom: 68px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 30px;
      font-weight: 600;
      color: var(--primary-text);
      text-align: center;
    }

    .info {
      .left {
        width: 50%;
        margin-right: 20px;

        .item {
          .key-wrap {
            flex-shrink: 0;
            width: 80px;

            .key {
              font-family: PingFangSC, 'PingFang SC';
              font-size: 14px;
              font-weight: 400;
              color: var(--common-text);
            }
          }
        }
      }

      .right {
        width: 50%;

        .item {
          .key-wrap {
            width: 80px;

            .key {
              font-family: PingFangSC, 'PingFang SC';
              font-size: 14px;
              font-weight: 400;
              color: var(--common-text);
            }
          }
        }
      }
    }
  }

  .bottom {
    padding-bottom: 30px;

    .remark {
      height: 60px;
      padding: 0 20px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 60px;
      color: var(--primary-text);
      border-bottom: 1px solid var(--border-c);
    }

    .desc {
      height: 150px;
    }

    .copyright {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 12px;
      font-weight: 400;
      color: var(--primary-text);
      text-align: center;
    }
  }
}
</style>
