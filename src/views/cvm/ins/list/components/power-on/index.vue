<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.powerOn.title')"
    width="760px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="cancel"
    @open="open"
  >
    <Collapse v-model="isCollapse" :text="t('ins.powerOn.selectIns', [insList.length])">
      <el-table :data="insList" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('ins.powerOn.idName')">
          <template #default="{ row }">
            <div class="text-primary">
              {{ row.insUuid }}
            </div>
            <div>{{ row.instanceName }}</div>
          </template>
        </el-table-column>
        <!-- 实例类型 -->
        <el-table-column min-width="200" :label="t('ins.powerOn.insType')">
          <template #default="{ row }">
            <div class="df ac">
              <span class="mr10">{{ row.specificationInfo?.typeName }}</span>
              <SvgIcon style="width: 17px; height: 17px" :name="INS_SYS_SVG_MAP[row.imageInfo.platform]?.actived" />
            </div>
          </template>
        </el-table-column>
        <!-- 实例配置 -->
        <el-table-column min-width="200" :label="t('ins.powerOn.insConfig')" show-overflow-tooltip>
          <template #default="{ row }">
            <div style="padding: 14px 0" class="table-td_tooltip">
              <p>
                <span class="mr10">{{ t('ins.powerOn.cores', [row.specificationInfo?.vcpus]) }}</span
                ><span class="mr10">{{ row.specificationInfo?.ram }}GB</span
                ><span class="mr10">{{ handleRowMainPublicBandwidth(row) }}Mbps</span>
              </p>
              <p>{{ t('ins.powerOn.sysDisk') }}{{ handleRowSysDiskName(row) }}</p>
              <p>{{ t('ins.powerOn.net') }}{{ handleRowVpcName(row) }}</p>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>

    <p class="mt20">
      <span class="comfirm-text">{{ t('ins.powerOn.desc') }}</span>
    </p>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { _batchStartServers } from '@/apis/cvm/ins'
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

const confirmHandle = () => {
  batchStartServers()
}

// 弹窗打开
const open = () => {}

// 弹窗关闭
const cancel = () => {
  isCollapse.value = false
}

// 批量开启云服务器
const batchStartServers = async () => {
  try {
    comfirmLoading.value = true
    const serverIds = props.insList.map(el => el.id)

    const res = await _batchStartServers({
      regionId: cvmStore.areaSelect.id,
      serverIds, // 服务器ID
    })

    console.log(`_batchStartServers===>`, res)

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
.comfirm-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #222;
}
</style>
