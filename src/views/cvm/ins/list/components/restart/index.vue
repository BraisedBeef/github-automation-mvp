<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.restart.title')"
    width="760px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="close"
    @open="open"
  >
    <Collapse v-model="isCollapse" :text="t('ins.restart.selectIns', [insList.length])">
      <el-table :data="insList" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('ins.restart.idName')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div class="text-primary">
                {{ row.insUuid }}
              </div>
              <div class="text-over">
                {{ row.instanceName }}
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 实例类型 -->
        <el-table-column min-width="200" :label="t('ins.restart.insType')">
          <template #default="{ row }">
            <div class="df ac">
              <span class="mr10">{{ row.specificationInfo?.typeName }}</span>
              <SvgIcon style="width: 17px; height: 17px" :name="INS_SYS_SVG_MAP[row.imageInfo.platform]?.actived" />
            </div>
          </template>
        </el-table-column>
        <!-- 实例配置 -->
        <el-table-column min-width="200" :label="t('ins.restart.insConfig')" show-overflow-tooltip class-name="pdx-14">
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <p class="text-over">
                <span class="mr10">{{ t('ins.restart.cores', [row.specificationInfo?.vcpus]) }}</span
                ><span class="mr10">{{ row.specificationInfo?.ram }}GB</span
                ><span class="mr10">{{ handleRowMainPublicBandwidth(row) }}Mbps</span>
              </p>
              <p class="text-over">{{ t('ins.restart.sysDisk') }}{{ handleRowSysDiskName(row) }}</p>
              <p class="text-over">{{ t('ins.restart.net') }}{{ handleRowVpcName(row) }}</p>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>

    <p class="mt20 mb20 confirm-text">
      {{ t('ins.restart.desc') }}
    </p>

    <p class="mt20 mb20 df ac">
      <el-checkbox v-model="checked" :label="t('ins.restart.restartChecked')" size="large" />
    </p>

    <!-- tip -->
    <Tip :text="tips" type="OneToMany" hide-margin-bottom />
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { _batchRebootServers } from '@/apis/cvm/ins'
import { useCvmStore } from '@/store'
import { useInsTableRow } from '@/views/cvm/hooks/use-ins-table-row'
import { INS_SYS_SVG_MAP } from '@/views/cvm/ins/config'

interface PropType {
  insList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  insList: () => [],
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const cvmStore = useCvmStore()
const { handleRowSysDiskName, handleRowVpcName, handleRowMainPublicBandwidth } = useInsTableRow()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const isCollapse = ref<boolean>(false) // 是否收起
const checked = ref<boolean>(false)

const tips = computed(() => [
  {
    main: t('ins.restart.tipsMain'),
    sub: [t('ins.restart.tipsSub')],
  },
])

const confirmHandle = () => {
  batchRebootServers()
}

// 弹窗打开
const open = () => {}

// 弹窗关闭
const close = () => {
  checked.value = false
}

// 批量重启云服务器
const batchRebootServers = async () => {
  try {
    comfirmLoading.value = true
    const serverIds = props.insList.map(el => el.id)

    const res = await _batchRebootServers({
      regionId: cvmStore.areaSelect.id,
      serverIds, // 服务器ID
      type: checked.value ? 'HARD' : 'SOFT', // 重启类型 SOFT：表示软关机 HARD：表示硬关机
    })

    console.log(`_batchRebootServers===>`, res)

    if (res.success) {
      message.success(res.msg)

      show.value = false
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    comfirmLoading.value = false
  }
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.confirm-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #222;
}

:deep(.pdx-14) {
  padding: 14px 0 !important;
}
</style>
