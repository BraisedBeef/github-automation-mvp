<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.setAutoRenew.title')"
    width="950px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="cancel"
    @open="open"
  >
    <Collapse v-model="isCollapse" :text="t('ins.setAutoRenew.selectIns', [insList.length, insList.length, diskLen])">
      <el-table :data="insList" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('ins.setAutoRenew.idName')">
          <template #default="{ row }">
            <div class="text-primary">
              {{ row.insUuid }}
            </div>
            <div>{{ row.instanceName }}</div>
          </template>
        </el-table-column>
        <!-- 实例类型 -->
        <el-table-column min-width="200" :label="t('ins.setAutoRenew.insType')">
          <template #default="{ row }">
            <div class="df ac">
              <span class="mr10">{{ row.specificationInfo?.typeName }}</span>
              <SvgIcon style="width: 17px; height: 17px" :name="INS_SYS_SVG_MAP[row.imageInfo.platform]?.actived" />
            </div>
          </template>
        </el-table-column>
        <!-- 实例配置 -->
        <el-table-column min-width="300" :label="t('ins.setAutoRenew.insConfig')">
          <template #default="{ row }">
            <div style="padding: 14px 0">
              <p>
                <span class="mr10">{{ t('ins.setAutoRenew.cores', [row.specificationInfo?.vcpus]) }}</span
                ><span class="mr10">{{ row.specificationInfo?.ram }}GB</span
                ><span class="mr10">{{ handleRowMainPublicBandwidth(row) }}Mbps</span>
              </p>
              <p>{{ t('ins.setAutoRenew.sysDisk') }}{{ handleRowSysDiskName(row) }}</p>
              <p>{{ t('ins.setAutoRenew.net') }}{{ handleRowVpcName(row) }}</p>
            </div>
          </template>
        </el-table-column>
        <!-- 到期时间 -->
        <el-table-column min-width="220" :label="t('ins.setAutoRenew.expiredTime')">
          <template #header>
            <div class="df ac">
              <span>{{ t('ins.setAutoRenew.expiredTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="ml10" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div class="df ac">
              <span>{{ row.expiresTime ? maoYunDayJs(row.expiresTime).format(FORMAT_TIME) : '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <!-- 自动续费状态 -->
        <el-table-column min-width="200" :label="t('ins.setAutoRenew.state')">
          <template #default="{ row }">
            <div class="df ac">
              <span>{{ row.autoRenew ? t('ins.setAutoRenew.open') : t('ins.setAutoRenew.close') }}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>

    <div class="mt20">
      <ItemList ref="itemListRef">
        <!-- 实例自动续费 -->
        <div class="df item">
          <Item>
            <template #key>
              <div class="name h-full df ac">
                {{ t('ins.setAutoRenew.insAutoRenew') }}
              </div>
            </template>
            <template #value>
              <el-radio-group v-model="instanceAutoRenew">
                <el-radio :label="true" size="large">
                  {{ t('ins.setAutoRenew.start') }}
                </el-radio>
                <el-radio :label="false" size="large">
                  {{ t('ins.setAutoRenew.end') }}
                </el-radio>
              </el-radio-group>
            </template>
          </Item>
        </div>

        <!-- 关联资源 -->
        <div v-if="showDiskCheckBox || showEipCheckBox" class="df item">
          <Item>
            <template #key>
              <div class="name">
                {{ t('ins.setAutoRenew.associatedResources') }}
              </div>
            </template>
            <template #value>
              <div v-if="showDiskCheckBox">
                <el-checkbox v-model="diskAutoRenew" :label="t('ins.setAutoRenew.mountedDataDisk')" size="large" />
              </div>
              <div v-if="showEipCheckBox">
                <el-checkbox v-model="eipAutoRenew" :label="t('ins.setAutoRenew.timeCostEip', [0])" size="large" />
              </div>

              <p v-if="showEipCheckBox" class="desc">
                {{ t('ins.setAutoRenew.noTimeCostEip') }}
              </p>
            </template>
          </Item>
        </div>
      </ItemList>
    </div>

    <!-- tip -->
    <Tip :text="tips" type="OneToMany" hide-margin-bottom />
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { useInsTableRow } from '@/views/cvm/hooks/use-ins-table-row'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { _setInstanceAutoRenew } from '@/apis/cvm/ins'
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

const { handleRowSysDiskName, handleRowVpcName, handleRowMainPublicBandwidth } = useInsTableRow()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const isCollapse = ref<boolean>(false) // 是否收起
const diskAutoRenew = ref<boolean>(false)
const eipAutoRenew = ref<boolean>(false)
const instanceAutoRenew = ref<boolean>(true)
const itemListRef = ref<any>(null)

const tips = computed(() => [
  {
    main: t('ins.setAutoRenew.tipsMain'),
    sub: [
      t('ins.setAutoRenew.tipsSub1'),
      t('ins.setAutoRenew.tipsSub2'),
      t('ins.setAutoRenew.tipsSub3'),
      t('ins.setAutoRenew.tipsSub4'),
      t('ins.setAutoRenew.tipsSub5'),
      t('ins.setAutoRenew.tipsSub6'),
    ],
  },
])

const diskLen = computed(() => {
  let sum = 0
  for (const el of props.insList) {
    sum = sum + el.diskInfos.length || 0
  }

  return sum
})

const showDiskCheckBox = computed(() => {
  return Boolean(diskLen.value)
})

const showEipCheckBox = computed(() => {
  // 所有类型eip 按量计费 包年包月 共享流量包
  let eips: any[] = []

  for (const el of props.insList) {
    const networkInfos = el.networkInfos

    for (const networkInfo of networkInfos) {
      if (networkInfo?.eips) {
        eips = [...eips, ...networkInfo.eips]
      }
    }
  }

  // 公网ip
  const publicIps = eips.filter(el => Boolean(el.publicIp))

  // 包年包月的eip
  const timeCostEips = publicIps.filter(el => el.chargeType === 2)

  return Boolean(timeCostEips.length)
})

const confirmHandle = () => {
  setInstanceAutoRenew()
}

// 弹窗打开
const open = () => {
  itemListRef.value?.calcMaxKeyWidth()
}

// 弹窗关闭
const cancel = () => {
  diskAutoRenew.value = false
  instanceAutoRenew.value = false
  eipAutoRenew.value = false
}

// 设置云服务器自动续费状态
const setInstanceAutoRenew = async () => {
  comfirmLoading.value = true

  const serverIds = props.insList.map(el => el.id)
  let params: any = {
    serverIds,
    instanceAutoRenew: instanceAutoRenew.value,
    diskAutoRenew: diskAutoRenew.value,
    eipAutoRenew: eipAutoRenew.value,
  }

  try {
    const res = await _setInstanceAutoRenew(params)

    console.log(`_bindKeypair===>`, res)

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
  min-width: 90px;
  margin-right: 20px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #999;
}

.item {
  .name {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;

    /* line-height: 20px; */
    white-space: nowrap;
  }
}

.desc {
  margin-left: 24px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #999;
}
</style>
