<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.setAutoRenew.title')"
    width="1200px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="cancel"
    @open="open"
  >
    <Collapse v-model="isCollapse" :text="t('publicIp.selectEIP', [insList.length])">
      <el-table :data="insList" class="mt20 table" show-overflow-tooltip>
        <!-- ID/名称 -->
        <el-table-column min-width="170" :label="t('ins.setAutoRenew.idName')">
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div class="text-primary">
                {{ row.eipUuid }}
              </div>
              <div class="text-over">
                {{ row.name }}
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 实例类型 -->
        <el-table-column min-width="150" :label="t('publicIp.chargeType')">
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div class="text-over">
                {{ chargeTypeList.find(item => item.value === row.chargeType)?.label }}
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 绑定资源 -->
        <el-table-column min-width="330" :label="t('publicIp.bindResources')">
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div v-if="row.bindInstanceType === 1">
                <div class="text-primary cursor-pointer">
                  <Copy :text="row.insUuid" />
                </div>
                <div class="text-over">
                  {{ row.insName }}
                </div>
              </div>
              <div v-else-if="row.bindInstanceType === 2">
                <div class="text-primary cursor-pointer">
                  <Copy :text="row.insUuid" />
                </div>
                <div class="text-over">
                  {{ row.insName }}
                </div>
              </div>
              <div v-else>-</div>
            </div>
          </template>
        </el-table-column>
        <!-- 实例配置 -->
        <el-table-column min-width="230" :label="t('publicIp.EIPSetting')">
          <template #default="{ row }">
            <div class="table-td_tooltip" style="padding: 14px 0">
              <p class="text-over">{{ t('publicIp.eipArea') }}：{{ row.eip }}</p>
              <p class="text-over">
                <span class="mr10">{{ t('publicIp.bandwidthLimit') + '：' + row.size }} Mbps</span>
              </p>
              <p class="text-over">
                {{ t('columns.lineType') + '：' }}{{ lineTypeList.find(item => item.value === row.lineType)?.label }}
              </p>
            </div>
          </template>
        </el-table-column>
        <!-- 到期时间 -->
        <el-table-column min-width="220" :label="t('ins.setAutoRenew.expiredTime')">
          <template #default="{ row }">
            {{ row.deadlineTime ? maoYunDayJs(row.deadlineTime).format(FORMAT_TIME) : '-' }}
          </template>
        </el-table-column>
        <!-- 自动续费状态 -->
        <el-table-column min-width="140" :label="t('ins.setAutoRenew.state')">
          <template #default="{ row }">
            {{ row.renewFlag === 2 ? t('ins.setAutoRenew.open') : t('ins.setAutoRenew.close') }}
          </template>
        </el-table-column>
      </el-table>
    </Collapse>

    <p class="mt20 mb20 df ac">
      <span class="instanceAutoRenew">{{ t('publicIp.automaticRenewal') }}</span>
      <el-radio-group v-model="instanceAutoRenew">
        <el-radio :label="true" size="large" :disabled="insList[0].renewFlag === 2">
          {{ t('ins.setAutoRenew.start') }}
        </el-radio>
        <el-radio :label="false" size="large" :disabled="insList[0].renewFlag === 1">
          {{ t('ins.setAutoRenew.close') }}
        </el-radio>
      </el-radio-group>
    </p>

    <!-- tip -->
    <Tip :text="tips" type="OneToMany" hide-margin-bottom />
  </CatDialog>
</template>

<script setup lang="ts">
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { useInsTableRow } from '@/views/cvm/hooks/use-ins-table-row'
import dayjs from 'dayjs'
import { _setInstanceAutoRenew } from '@/apis/cvm/ins'
import { typeList, chargeTypeList, lineTypeList } from '../../config'
import { batchModifyEipRenewFlag } from '@/apis/network/public-ip'

interface PropType {
  insList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  insList: () => [],
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const { handleRowSysDiskName, handleRowVpcName, handleRowMainPublicBandwidth } = useInsTableRow()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const isCollapse = ref<boolean>(false) // 是否收起
const diskAutoRenew = ref<boolean>(false)
const instanceAutoRenew = ref<boolean>(true)

const tips = computed(() => [
  {
    main: t('ins.setAutoRenew.tipsMain'),
    sub: [
      t('ins.setAutoRenew.tipsSub1'),
      t('ins.setAutoRenew.tipsSub2'),
      t('ins.setAutoRenew.tipsSub3'),
      t('ins.setAutoRenew.tipsSub4'),
    ],
  },
])

const confirmHandle = () => {
  console.log(props.insList)
  setInstanceAutoRenew()
}

// 弹窗打开
const open = () => {
  instanceAutoRenew.value = props.insList[0].renewFlag === 1 ? true : false
}

// 弹窗关闭
const cancel = () => {
  diskAutoRenew.value = false
  instanceAutoRenew.value = false
}

// 设置云服务器自动续费状态
const setInstanceAutoRenew = async () => {
  comfirmLoading.value = true

  const eipIds = props.insList.map(el => el.eipId)
  let params: any = {
    eipIds,
    renewFlag: instanceAutoRenew.value ? 2 : 1,
  }

  try {
    const res = await batchModifyEipRenewFlag(params)
    console.log(`batchModifyEipRenewFlag===>`, res)
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
.instanceAutoRenew,
.diskAutoRenew {
  margin-right: 44px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #999;
}
</style>
