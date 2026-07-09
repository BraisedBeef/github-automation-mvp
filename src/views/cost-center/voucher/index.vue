<template>
  <div class="wrap">
    <!-- tips -->
    <div class="tip-wrap mb20">
      <SvgIcon name="warn-primary" class="mr4" />
      <span class="text-primary"
        >代金券不可抵扣欠费金额、不支持延长有效期、转移至其他账号、提现、开票。申请退款时，代金券不支持退还</span
      >
    </div>

    <div class="page-box">
      <CatTabs v-model="active" class="mb20" :tabs="tabs" @change="() => {}">
        <!-- 待使用 -->
        <CatTabPane :value="1">
          <div class="pd20">
            <el-table v-loading="loading" :data="[]" show-overflow-tooltip>
              <el-table-column prop="tradeNo" label="适用产品" />
              <el-table-column prop="productName" label="面额" />
              <el-table-column prop="subProductNameList" label="生效时间／失效时间" />
              <el-table-column label="代金券类型／编号" />
            </el-table>
          </div>
        </CatTabPane>
        <!-- 已使用(12) -->
        <CatTabPane :value="2">
          <div class="pd20">
            <el-table v-loading="loading" :data="[]" show-overflow-tooltip>
              <el-table-column prop="tradeNo" label="适用产品" />
              <el-table-column prop="productName" label="面额" />
              <el-table-column prop="subProductNameList" label="生效时间／失效时间" />
              <el-table-column label="代金券类型／编号" />
              <el-table-column label="">
                <template #default="{ row }">
                  <span class="text-primary cursor-pointer" @click="() => {}">使用记录</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </CatTabPane>
        <!-- 已过期(24) -->
        <CatTabPane :value="3">
          <div class="pd20">
            <el-table v-loading="loading" :data="[]" show-overflow-tooltip>
              <el-table-column prop="tradeNo" label="适用产品" />
              <el-table-column prop="productName" label="面额" />
              <el-table-column prop="subProductNameList" label="生效时间／失效时间" />
              <el-table-column label="代金券类型／编号" />
            </el-table>
          </div>
        </CatTabPane>
      </CatTabs>
    </div>

    <CatDialog
      v-model:dialog="show"
      :title="'使用记录'"
      width="940px"
      destroy-on-close
      confirm-text="提交"
      @confirm="confirmHandle"
      @update:dialog="closeHandle"
    >
      <p class="desc mb20">代金券（3535362626262626262626622）累计已使用100.00元，剩余 0.00元</p>

      <el-table v-loading="loading" :data="[]" show-overflow-tooltip>
        <el-table-column prop="tradeNo" label="适用产品" />
        <el-table-column prop="productName" label="订单号" />
        <el-table-column prop="subProductNameList" label="使用时间" />
        <el-table-column label="使用金额（元）" />
      </el-table>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
const loading = ref<boolean>(false)
const active = ref<number>(1)
const tabs = [
  { label: '待使用', value: 1 },
  { label: '已使用(12)', value: 2 },
  { label: '已过期(24)', value: 3 },
]
const show = ref<boolean>(false) // 弹窗显示

const confirmHandle = async () => {}
const closeHandle = async () => {}
</script>

<style lang="scss" scoped>
.wrap {
  .tip-wrap {
    height: 34px;
    padding-left: 15px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 34px;
    background: #e5e8ff;
  }

  .desc {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--common-text);
  }
}
</style>
