<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('flowPacket.removeEipTwo')"
    width="950px"
    :loading="state.comfirmLoading"
    @confirm="confirmHandle"
  >
    <p class="df ac jsb">
      <span class="len">{{ t('flowPacket.selectedSomeEip', [list.length]) }}</span>
      <span class="text-primary close cursor-pointer" @click="() => (state.isCollapse = !state.isCollapse)">{{
        state.isCollapse ? t('flowPacket.retract') : t('flowPacket.expand')
      }}</span>
    </p>
    <el-collapse-transition>
      <div v-show="state.isCollapse" class="mt20">
        <el-table :data="list" show-overflow-tooltip>
          <!-- ID/名称 -->
          <el-table-column min-width="200" :label="t('flowPacket.idOrName')">
            <template #default="{ row }">
              <div class="table-td_tooltip text-over">
                <span class="text-primary"> {{ row.eipUuid }} </span>/<span class="text-over">
                  {{ row.name }}
                </span>
              </div>
            </template>
          </el-table-column>
          <!-- 状态 -->
          <el-table-column prop="network" :label="t('flowPacket.state')" min-width="100">
            <template #default="{ row }">
              {{ typeList.find(item => item.value === row.state)?.label }}
            </template>
          </el-table-column>
          <!-- 公网IP地址 -->
          <el-table-column prop="ipArea" :label="t('flowPacket.eipAddress')" min-width="120">
            <template #default="{ row }">
              {{ row.eip }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-collapse-transition>
    <div class="mt20 confirm-box">
      {{ t('flowPacket.confirmRemoveEip') }}
    </div>
    <div class="mt20">
      <!-- tip -->
      <Tip :text="tips" type="OneToOne" hide-margin-bottom />
    </div>
  </CatDialog>
</template>
<script lang="ts" setup>
import t from '@/utils/i18n'
import { shareTrafficPackageRemoveEip } from '@/apis/network/flow-packet'
import { message } from '@/utils/message'
import { typeList } from '@/views/network/public-ip/list/config'

interface PropType {
  pkgId: number | string
}

const props = withDefaults(defineProps<PropType>(), {})

const emits = defineEmits<{
  (event: 'success'): void
}>()

const tips = computed(() => [
  {
    main: t('flowPacket.removeEipTip'),
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
    pkgId: props.pkgId,
    eipIds: list.value.map(item => item.eipId),
  }
  state.comfirmLoading = true
  try {
    const res = await shareTrafficPackageRemoveEip(params)
    if (res.success) {
      message.success(t('flowPacket.removeEipSuccess'))
      emits('success')
      show.value = false
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    state.comfirmLoading = false
  }
}

defineExpose({
  show,
  list,
})
</script>
<style lang="scss" scoped></style>
