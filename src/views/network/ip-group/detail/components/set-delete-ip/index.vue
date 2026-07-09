<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ipGroup.deleteIpAddress')"
    width="740px"
    :loading="state.comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="() => {}"
  >
    <el-table :data="list">
      <!-- IP地址 -->
      <el-table-column :label="t('ipGroup.ipAddress')">
        <template #default="{ row }">
          <Copy :text="row.ip" />
        </template>
      </el-table-column>
      <!-- 备注 -->
      <el-table-column :label="t('ipGroup.remark')">
        <template #default="{ row }">
          <p>{{ row.description || '-' }}</p>
        </template>
      </el-table-column>
    </el-table>
    <div class="mt20">
      <!-- tip -->
      <Tip :text="tips" type="OneToOne" theme="danger" hide-margin-bottom />
    </div>
  </CatDialog>
</template>
<script lang="ts" setup>
import t from '@/utils/i18n'
import { updateIpGroup } from '@/apis/network/ip-group'
import { message } from '@/utils/message'
import { text } from 'stream/consumers'

interface PropType {
  detail: any
}

const props = withDefaults(defineProps<PropType>(), {})

const emits = defineEmits<{
  (event: 'success'): void
}>()

const tips = computed(() => [
  {
    main: t('ipGroup.deleteIpTip'),
  },
])

const show = ref<boolean>(false)
const list = ref<any[]>([])

const state = reactive<{
  comfirmLoading: boolean
}>({
  comfirmLoading: false,
})

const confirmHandle = async () => {
  const ipList = props.detail.ipList.filter(item => {
    return list.value.findIndex(val => val.id === item.id) < 0
  })
  const params = {
    ...props.detail,
    ipList,
  }
  console.log('params', params)
  try {
    state.comfirmLoading = true
    const res = await updateIpGroup(params)
    state.comfirmLoading = false
    if (res.success) {
      message.success(t('ipGroup.deleteSuccess'))
      emits('success')
      show.value = false
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
  }
}

defineExpose({
  show,
  list,
})
</script>
<style lang="scss" scoped>
.tip-msg {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #555;
}
</style>
