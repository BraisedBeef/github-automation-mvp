<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ipGroup.viewAssociatedSecurityGroups')"
    width="740px"
    :loading="state.comfirmLoading"
    @confirm="closeFn"
    @close="closeFn"
  >
    <el-table :data="state.list">
      <!-- ID -->
      <el-table-column min-width="100" :label="t('ID')">
        <template #default="{ row }">
          <div>{{ row.id }}</div>
        </template>
      </el-table-column>
      <!-- 名称 -->
      <el-table-column :label="t('ipGroup.name')">
        <template #default="{ row }">
          <p>{{ row.name }}</p>
        </template>
      </el-table-column>
      <!-- 类型 -->
      <el-table-column :label="t('ipGroup.category')">
        <template>
          <p>{{ t('ipGroup.secrityGroup') }}</p>
        </template>
      </el-table-column>
    </el-table>
  </CatDialog>
</template>
<script lang="ts" setup>
import t from '@/utils/i18n'
import { ipListSecurityGroup } from '@/apis/network/ip-group'
import { message } from '@/utils/message'

interface PropType {
  regionId: number
}

const props = withDefaults(defineProps<PropType>(), {})

const show = ref<boolean>(false)
const ipGroupId = ref<number>()

const state = reactive<{
  comfirmLoading: boolean
  list: any[]
}>({
  comfirmLoading: false,
  list: [],
})

const getipSecurityGroupList = async () => {
  const params = {
    id: ipGroupId.value as number,
    regionId: props.regionId,
  }
  state.comfirmLoading = true
  try {
    const res = await ipListSecurityGroup(params)
    state.comfirmLoading = false
    if (res.success) {
      state.list = res.data?.list || []
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.comfirmLoading = false
    console.log('error', err)
  }
}

const closeFn = () => {
  state.list = []
  show.value = false
}

defineExpose({
  show,
  ipGroupId,
  getipSecurityGroupList,
})
</script>
<style lang="scss" scoped></style>
