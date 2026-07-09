<template>
  <el-form label-position="left" label-width="auto" class="mb20">
    <el-form-item label="吊销说明">
      猫云已通过域名所属权验证，请勿修改验证值。<br />
      猫云已将吊销请求提交，CA机构将会在24小时内完成吊销证书操作，请您耐心等待。
    </el-form-item>
    <el-form-item label="验证操作"> 请确保下列记录存在，否则会因为没有相关记录值而导致证书吊销失败 </el-form-item>
  </el-form>
  <el-table :data="tableData.data" :loading="tableData.loading" class="mb20" style="width: 100%">
    <el-table-column prop="date" label="域名" />
    <el-table-column prop="name" label="主机记录">
      <template #default="{ row }">
        <Copy :text="row.name" break />
      </template>
    </el-table-column>
    <el-table-column prop="date" label="记录类型" />
    <el-table-column prop="name" label="记录值">
      <template #default="{ row }">
        <Copy :text="row.name" break />
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import Copy from '@/views/ssl-certificate/management/components/copy.vue'

/// table
const tableData = reactive<any>({
  data: [],
  loading: false,
})
const getTableList = async () => {
  // TODO: 获取域名解析列表
  tableData.data = [
    {
      date: '2022-01-01',
      name: 'www111111111111111111111111scsd',
    },
    {
      date: '2022-01-01',
      name: 'www',
    },
  ]
}
onMounted(() => {
  getTableList()
})
</script>

<style lang="scss" scoped></style>
