<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ipGroup.deleteIpGroup')"
    width="740px"
    :loading="state.comfirmLoading"
    @confirm="confirmHandle"
  >
    <p class="df ac jsb">
      <span class="len">{{ t('ipGroup.selectedIpGroup', [list.length]) }}</span>
      <span class="text-primary close cursor-pointer" @click="() => (state.isCollapse = !state.isCollapse)">{{
        state.isCollapse ? t('ipGroup.retract') : t('ipGroup.expand')
      }}</span>
    </p>
    <el-collapse-transition>
      <div v-show="state.isCollapse" class="mt20">
        <el-table :data="list">
          <!-- IP地址 -->
          <el-table-column min-width="100" :label="t('ipGroup.ipAddress')">
            <template #default="{ row }">
              <div class="text-primary">
                {{ row.groupUuid }}
              </div>
              <div>{{ row.name }}</div>
            </template>
          </el-table-column>
          <!-- 备注 -->
          <el-table-column :label="t('ipGroup.remark')">
            <template #default="{ row }">
              <p>{{ row.description }}</p>
            </template>
          </el-table-column>
          <!-- 关联资源 -->
          <!-- <el-table-column :label="t('关联资源')">
            <template>
              <p class="text-primary">关联资源</p>
            </template>
          </el-table-column> -->
        </el-table>
      </div>
    </el-collapse-transition>
    <div class="mt20 confirm-box">
      {{ t('ipGroup.confirmSelectIpGroup') }}
    </div>
    <div class="mt20">
      <!-- tip -->
      <Tip :text="tips" type="OneToOne" theme="danger" hide-margin-bottom />
    </div>
  </CatDialog>
</template>
<script lang="ts" setup>
import t from '@/utils/i18n'
import { deleteIpGroup } from '@/apis/network/ip-group'
import { message } from '@/utils/message'

interface PropType {
  regionId: number
}

const props = withDefaults(defineProps<PropType>(), {})

const emits = defineEmits<{
  (event: 'success'): void
}>()

const tips = computed(() => [
  {
    main: t('ipGroup.deleteIpGroupTip'),
  },
])

const show = ref<boolean>(false) // 弹窗显示
const list = ref<any[]>([]) // 列表

const state = reactive<{
  comfirmLoading: boolean
  isCollapse: boolean
}>({
  comfirmLoading: false,
  isCollapse: true,
})

const confirmHandle = async () => {
  const params = {
    regionId: props.regionId,
    ids: list.value.map(item => item.id),
  }
  state.comfirmLoading = true
  try {
    const res = await deleteIpGroup(params)
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
<style lang="scss" scoped></style>
