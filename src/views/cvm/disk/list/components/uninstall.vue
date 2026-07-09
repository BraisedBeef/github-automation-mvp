<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('disk.uninstall.title')"
    width="770px"
    :loading="comfirmLoading"
    :cancel-text="t('disk.uninstall.cancelText')"
    @confirm="confirmHandle"
    @update:dialog="cancel"
    @open="open"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <Collapse v-model="isCollapse" :text="t('disk.uninstall.selectDisk', [diskList.length])">
      <el-table v-loading="loading" :data="diskList" class="mt20 table" max-height="600px">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('disk.uninstall.idName')">
          <template #default="{ row }">
            <div class="text-primary text-over">
              {{ row.diskId }}
            </div>
            <div class="text-over">
              {{ row.diskName }}
            </div>
          </template>
        </el-table-column>
        <!-- 计费模式 -->
        <el-table-column min-width="200" :label="t('disk.uninstall.costType')">
          <template #default="{ row }">
            <span>{{ COST_TYPE_MAP[row.costType] }}</span>
          </template>
        </el-table-column>
        <!-- 创建/到期时间 包年包月-->
        <el-table-column
          v-if="isTimeCost(props.diskList[0].costType)"
          min-width="220"
          :label="t('disk.uninstall.time')"
          show-overflow-tooltip
        >
          <template #header>
            <div class="df ac">
              <span class="mr10">{{ t('disk.uninstall.time') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div class="text-over">
              {{
                t('disk.uninstall.createTime', [row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : ''])
              }}
            </div>
            <div class="text-over">
              {{
                t('disk.uninstall.expiresTime', [
                  row.expiredTime ? maoYunDayJs(row.expiredTime).format(FORMAT_TIME) : '',
                ])
              }}
            </div>
          </template>
        </el-table-column>
        <!-- 创建时间 按量计费-->
        <el-table-column v-else min-width="220" :label="t('disk.uninstall.time_create')" show-overflow-tooltip>
          <template #header>
            <div class="df ac">
              <span class="mr10">{{ t('disk.uninstall.time_create') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div class="text-over">
              {{
                t('disk.uninstall.createTime', [row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : ''])
              }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { _detachDisk } from '@/apis/cvm/disk'
import { COST_TYPE_MAP } from '@/views/cvm/ins/config'
import { isTimeCost } from '@/views/cvm/disk/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'

interface PropType {
  diskList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  diskList: () => [],
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const loading = ref<boolean>(false)
const isCollapse = ref<boolean>(false) // 是否收起

const tips = computed(() => [
  {
    main: t('disk.uninstall.tipsMain'),
    sub: [
      t('disk.uninstall.tipsSub1'),
      t('disk.uninstall.tipsSub2'),
      t('disk.uninstall.tipsSub3'),
      t('disk.uninstall.tipsSub4'),
    ],
  },
])

const confirmHandle = () => {
  detachDisk()
}

// 弹窗打开
const open = () => {}

// 弹窗关闭
const cancel = () => {
  isCollapse.value = false
}

// 卸载硬盘
const detachDisk = async () => {
  try {
    comfirmLoading.value = true
    const ids = props.diskList.map(el => el.id)

    const res = await _detachDisk({
      ids, // 硬盘id
    })

    console.log(`_detachDisk===>`, res)

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

<style lang="scss" scoped></style>
