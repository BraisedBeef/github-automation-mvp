<template>
  <CatDialog v-model:dialog="show" :title="'修改自动续费周期'" width="960px" destroy-on-close @confirm="() => {}">
    <!-- tips -->
    <div class="tip-wrap mb20 df ac">
      <SvgIcon name="warn-primary" class="mr4" />
      <span class="text-primary"
        >下列资源到期后将按设定的自动续费周期续费，请确保资源到期时账户余额充足，若续费时有可用的代金券，系统将自动使用代金券续费。
      </span>
    </div>

    <div class="df ac mb20">
      <span class="mr20">统一设置自动续费周期</span
      ><el-select
        v-model="time"
        :teleported="true"
        style="width: 120px"
        class="select-tr"
        :placeholder="''"
        @change="() => {}"
      >
        <el-option :value="1" :label="'1个月'" />
      </el-select>
    </div>

    <el-table v-loading="loading" :data="[{}]" show-overflow-tooltip>
      <el-table-column label="资源ID">
        <template #default="{ row }" />
      </el-table-column>
      <el-table-column label="资源名 产品描述">
        <template #default="{ row }" />
      </el-table-column>
      <el-table-column label="当前到期时间">
        <template #default="{ row }" />
      </el-table-column>
      <el-table-column label="续费时长">
        <template #default="{ row }" />
      </el-table-column>
      <el-table-column label="续费后到期时间">
        <template #default="{ row }" />
      </el-table-column>
      <el-table-column label="单价">
        <template #default="{ row }" />
      </el-table-column>
      <el-table-column label="续费金额">
        <template #default="{ row }" />
      </el-table-column>
    </el-table>
  </CatDialog>
</template>

<script lang="ts" setup>
import { message } from '@/utils/message'
const show = ref<boolean>(false) // 弹窗显示
const loading = ref<boolean>(false)
const time = ref({
  value: 1,
  label: '1个月',
}) // 时间周期

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
