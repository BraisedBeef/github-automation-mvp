<template>
  <CatDialog v-model:dialog="show" :title="'设置为到期不续'" width="960px" destroy-on-close @confirm="() => {}">
    <!-- tips -->
    <div class="tip-wrap mb20 df ac">
      <SvgIcon name="warn-primary" class="mr4" />
      <span class="text-primary"
        >下列资源到期后将不再续费，我们不会提供任何通知打扰您，资源到期当日会自动进行停服、回收。
      </span>
    </div>

    <el-table v-loading="loading" :data="[{}]" show-overflow-tooltip>
      <el-table-column label="资源ID/资源名">
        <template #default="{ row }" />
      </el-table-column>
      <el-table-column label="产品描述">
        <template #default="{ row }" />
      </el-table-column>
      <el-table-column label="当前到期时间">
        <template #default="{ row }" />
      </el-table-column>
    </el-table>
  </CatDialog>
</template>

<script lang="ts" setup>
import { message } from '@/utils/message'
const show = ref<boolean>(false) // 弹窗显示
const loading = ref<boolean>(false)

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.tip-wrap {
  height: 34px;
  padding-left: 15px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 34px;
  background: #e5e8ff;
}
</style>
