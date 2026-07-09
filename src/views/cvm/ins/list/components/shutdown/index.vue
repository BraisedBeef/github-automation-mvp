<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.shutdown.title')"
    width="960px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="close"
    @open="open"
  >
    <Collapse v-model="isCollapse" :text="t('ins.shutdown.selectIns', [insList.length])">
      <el-table :data="insList" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('ins.shutdown.idName')" show-overflow-tooltip>
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
        <el-table-column min-width="200" :label="t('ins.shutdown.insType')">
          <template #default="{ row }">
            <div class="df ac">
              <span class="mr10">{{ row.specificationInfo?.typeName }}</span>
              <SvgIcon style="width: 17px; height: 17px" :name="INS_SYS_SVG_MAP[row.imageInfo.platform]?.actived" />
            </div>
          </template>
        </el-table-column>
        <!-- 实例配置 -->
        <el-table-column min-width="300" :label="t('ins.shutdown.insConfig')" show-overflow-tooltip>
          <template #default="{ row }">
            <div style="padding: 14px 0" class="table-td_tooltip">
              <p class="text-over">
                <span class="mr10">{{ t('ins.shutdown.cores', [row.specificationInfo?.vcpus]) }}</span
                ><span class="mr10">{{ row.specificationInfo?.ram }}GB</span
                ><span class="mr10">{{ handleRowMainPublicBandwidth(row) }}Mbps</span>
              </p>
              <p class="text-over">{{ t('ins.shutdown.sysDisk') }}{{ handleRowSysDiskName(row) }}</p>
              <p class="text-over">{{ t('ins.shutdown.net') }}{{ handleRowVpcName(row) }}</p>
            </div>
          </template>
        </el-table-column>
        <!-- 实例计费模式 -->
        <el-table-column min-width="220" :label="t('ins.shutdown.insCostType')" show-overflow-tooltip>
          <template #header>
            <div class="df ac">
              <span>{{ t('ins.shutdown.insCostType') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="ml10" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div class="text-over">
                {{ COST_TYPE_MAP[row.instanceChargeType] }}
              </div>
              <div v-if="row.instanceChargeType === 1" class="text-over">
                {{
                  t('ins.shutdown.createDesc', [row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : ''])
                }}
              </div>
              <div v-if="row.instanceChargeType === 2" class="text-over">
                {{
                  t('ins.shutdown.expiredDesc', [
                    row.expiresTime ? maoYunDayJs(row.expiresTime).format(FORMAT_TIME) : '',
                  ])
                }}
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>

    <p class="mt20 mb20 df ac">
      <span class="method">{{ t('ins.shutdown.shutdownMethod') }}</span>
      <el-radio-group v-model="checked">
        <el-radio label="SOFT" size="large">
          {{ t('ins.shutdown.shutdown') }}
        </el-radio>
        <el-radio label="HARD" size="large">
          {{ t('ins.shutdown.forceShutdown') }}
        </el-radio>
      </el-radio-group>
    </p>

    <!-- tip -->
    <Tip :text="tips" type="OneToMany" hide-margin-bottom />
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { COST_TYPE_MAP, INS_SYS_SVG_MAP } from '@/views/cvm/ins/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { _batchStopServers } from '@/apis/cvm/ins'
import { useCvmStore } from '@/store'
import { useInsTableRow } from '@/views/cvm/hooks/use-ins-table-row'

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
const checked = ref('SOFT')

const tips = computed(() => [
  {
    main: t('ins.shutdown.tipsMain'),
    sub: [t('ins.shutdown.tipsSub')],
  },
])

const confirmHandle = () => {
  batchStopServers()
}

// 弹窗打开
const open = () => {}

// 弹窗关闭
const close = () => {
  checked.value = 'SOFT'
}

// 批量关闭云服务器
const batchStopServers = async () => {
  try {
    comfirmLoading.value = true
    const serverIds = props.insList.map(el => el.id)

    const res = await _batchStopServers({
      regionId: cvmStore.areaSelect.id,
      serverIds, // 服务器ID
      type: checked.value, // SOFT：表示软关机 HARD：表示硬关机
    })

    console.log(`_batchStopServers===>`, res)

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
.method {
  margin-right: 44px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #999;
}
</style>
