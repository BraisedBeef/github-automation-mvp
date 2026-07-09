<template>
  <div class="header-cost">
    <el-dropdown trigger="hover" popper-class="cost-dropdown" placement="bottom-start" :teleported="false">
      <div class="cost-center" @click.stop="handleDefault">
        {{ t('model.cost') }}
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <div class="line-1">
            <div class="t">
              {{ t('header.availableCost') }}
            </div>
            <div class="usd">
              <div>{{ userStore.user.balance || 0 }} <span>USD</span></div>
              <el-button type="primary" @click="toRecharge">
                {{ t('header.toCost') }}
              </el-button>
            </div>
            <div class="txt">
              <div>
                <span>{{ t('header.discountCoupon') }}</span>
                <span>0</span>
              </div>
              <div>
                <span>{{ t('header.invokable') }}(USD)</span>
                <span class="text-over" :title="userStore.user.invoiceAmount">{{
                  userStore.user.invoiceAmount || 0
                }}</span>
              </div>
            </div>
          </div>
          <div class="line-2">
            <!-- 我的订单 -->
            <div @click.stop="handleClick('order')">
              <span class="l" :class="{ 'has-order': userStore.user.orderNum }">{{
                t('costCenterRoutes.myOrder')
              }}</span>
              <span v-if="userStore.user.orderNum" class="v">
                {{ t('header.unpaid', { orderNum: userStore.user.orderNum }) }}
              </span>
            </div>
            <!-- 收支明细 -->
            <div @click.stop="handleClick('income_expenditure')">
              <span class="l">{{ t('costCenterRoutes.incomeExpenditure') }}</span>
              <span class="v" />
            </div>
            <!-- 费用账单 -->
            <div @click.stop="handleClick('expense_bill')">
              <span class="l">{{ t('costCenterRoutes.expenseBill') }}</span>
              <span class="v" />
            </div>
          </div>
          <div class="line-3" @click.stop="handleDefault">
            {{ t('costCenterRoutes.costCenter') }}
          </div>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'

import { useBaseStore, useUserStore } from '@/store'
import { pushRoute } from '@/utils/router-jump'
const baseStore = useBaseStore(),
  userStore = useUserStore()

// 费用中心
const handleDefault = () => {
  handleClick('cost_center_account')
}

// 去充值
const toRecharge = () => {
  // handleClick('cost_center_account_recharge')
  pushRoute({
    name: 'cost_center_account_recharge',
    query: {
      title: 'accountCostCenter.accountInfo',
      path: '/cost-center/account/info',
    },
  })
}

// 跳转路由: 传入路由的name就行
const handleClick = (name: string) => {
  console.log(`handleClick===>`, name)

  // baseStore.routeModel = '/cost'
  // baseStore.selectedKeys = name
  pushRoute({
    name,
  })
}
</script>

<style scoped lang="scss">
@mixin fb {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@mixin fc {
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-cost {
  .line-1,
  .line-2,
  .line-3 {
    /* min-width: 290px; */
  }

  .line-1 {
    padding: 20px;
    border-bottom: 1px solid #eee;

    .t {
      margin-bottom: 12px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #000;
    }

    .usd {
      @include fb;

      margin-bottom: 20px;
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 20px;
      line-height: 28px;
      color: #000;

      span {
        font-size: 12px;
      }
    }

    .txt {
      /* display: grid;
            grid-template-columns: repeat(2, 1fr);
            column-gap: 10px; */
      @include fb;

      & > div {
        width: 126px;
        height: 60px;
        padding: 9px;
        font-family: PingFangSC, 'PingFang SC';
        font-size: 12px;
        font-weight: 400;
        white-space: nowrap;
        cursor: pointer;
        background: #f9fafc;
        border-radius: 4px;
        transition: all 0.25s;

        &:hover {
          background-color: #f5f5f5;
        }

        span {
          display: block;
        }

        span:first-child {
          margin-bottom: 6px;
          line-height: 17px;
          color: #555;
        }

        span:last-child {
          line-height: 20px;
          color: #000;

          // font-weight: 500;
        }
      }

      & > div:first-child {
        margin-right: 10px;
      }
    }
  }

  .line-2 {
    padding: 11px 8px;

    & > div {
      @include fb;

      height: 34px;
      padding: 0 12px;
      margin-bottom: 4px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #000;
      cursor: pointer;
      border-radius: 4px;

      &:hover {
        color: var(--primary-color);
        background-color: var(--selected-bgc);
      }
    }

    & > div:first-child {
      .l.has-order {
        position: relative;

        &::before {
          position: absolute;
          top: 50%;
          right: -10px;
          display: inline-block;
          width: 6px;
          height: 6px;
          content: '';
          background-color: var(--warning-color);
          border-radius: 50%;
          transform: translateY(-50%);
        }
      }

      .v {
        color: var(--warning-color);
      }
    }

    & > div:last-child {
      margin-bottom: 0;
    }
  }

  .line-3 {
    @include fc;

    height: 60px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: #000;
    cursor: pointer;
    border-top: 1px solid #eee;

    &:hover {
      // font-weight: 500;
    }
  }

  :deep(.cost-dropdown) {
    .el-scrollbar {
      .el-scrollbar__wrap {
        .el-dropdown__list {
          .el-dropdown-menu {
            padding: 0;
          }
        }
      }
    }
  }
}
</style>
