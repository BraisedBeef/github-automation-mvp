<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.export.title')"
    width="550px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="() => {}"
    @open="open"
    @close="close"
  >
    <!-- <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange" class="mb20">
      {{ t('ins.export.all') }}
    </el-checkbox>
    <el-checkbox-group v-model="checkedList" @change="handleCheckedChange">
      <el-row>
        <el-col :span="8" v-for="(item, index) in list" :key="index" class="mb20">
          <el-checkbox :label="item.value">
            {{ item.label }}
          </el-checkbox>
        </el-col>
      </el-row>
    </el-checkbox-group> -->
    <!-- 暂时只能全选 -->
    <el-checkbox :model-value="true" :indeterminate="isIndeterminate" class="mb20" @change="handleCheckAllChange">
      {{ t('ins.export.all') }}
    </el-checkbox>
    <el-row>
      <el-col v-for="(item, index) in list" :key="index" :span="8" class="mb20">
        <el-checkbox :label="item.value" :model-value="true" class="export-checkbox">
          <EllipsisTooltip :text="String(item.label)" width="100%" />
        </el-checkbox>
      </el-col>
    </el-row>

    <div class="df ac radio-wrap">
      <div class="key">
        {{ t('ins.export.range') }}
      </div>
      <el-radio-group v-model="exportType">
        <!-- 导出全部实例 -->
        <el-radio :label="1">
          {{ t('ins.export.allExport') }}
        </el-radio>
        <!-- 导出部分实例 -->
        <el-radio :label="2" :disabled="ids.length ? false : true">
          {{ t('ins.export.someExport') }}
        </el-radio>
      </el-radio-group>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { downloadExportFiles } from '@/utils/download'
import { _exportInstance } from '@/apis/cvm/ins'
import { useCvmStore } from '@/store'
import EllipsisTooltip from '@/components/common/ellipsis-tooltip/index.vue'

interface PropType {
  ids?: any[]
  curSearch: any
}
interface CheckItemType {
  label: string | number
  value: string | number
}

const props = withDefaults(defineProps<PropType>(), {
  ids: () => [],
  curSearch: () => ({}),
})
const emits = defineEmits<{
  (event: 'success'): void
}>()
const cvmStore = useCvmStore()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const checkAll = ref(false)
const isIndeterminate = ref(true)
const checkedList = ref<(string | number)[]>([
  'ID',
  'gpu',
  'subNet',
  'insName',
  'imageId',
  'createTime',
  'area',
  'sys',
  'expiredTime',
  'zone',
  'bandwidth',
  'insCostType',
  'state',
  'ipv4PubIp',
  'netCostType',
  'insType',
  'insPrivateIp',
  'project',
  'specificate',
  'VpcID',
  'cpuUnit',
  'vpcName',
  'memory',
  'subId',
])
const list: CheckItemType[] = [
  { label: 'ID', value: 'ID' },
  { label: t('ins.export.gpu'), value: 'gpu' },
  { label: t('ins.export.subNet'), value: 'subNet' },
  { label: t('ins.export.insName'), value: 'insName' },
  { label: t('ins.export.imageId'), value: 'imageId' },
  { label: t('ins.export.createTime'), value: 'createTime' },
  { label: t('ins.export.area'), value: 'area' },
  { label: t('ins.export.sys'), value: 'sys' },
  { label: t('ins.export.expiredTime'), value: 'expiredTime' },
  { label: t('ins.export.zone'), value: 'zone' },
  { label: t('ins.export.bandwidth'), value: 'bandwidth' },
  { label: t('ins.export.insCostType'), value: 'insCostType' },
  { label: t('ins.export.state'), value: 'state' },
  { label: t('ins.export.ipv4PubIp'), value: 'ipv4PubIp' },
  { label: t('ins.export.netCostType'), value: 'netCostType' },
  { label: t('ins.export.insType'), value: 'insType' },
  { label: t('ins.export.insPrivateIp'), value: 'insPrivateIp' },
  { label: t('ins.export.project'), value: 'project' },
  { label: t('ins.export.specificate'), value: 'specificate' },
  { label: 'Vpc ID', value: 'VpcID' },
  { label: t('ins.export.cpuUnit'), value: 'cpuUnit' },
  { label: t('ins.export.vpcName'), value: 'vpcName' },
  { label: t('ins.export.memory'), value: 'memory' },
  { label: t('ins.export.subId'), value: 'subId' },
]
const exportType = ref<1 | 2>(1) // 导出类型

// 切换全选
const handleCheckAllChange = (val: any) => {
  const check = list.map(el => el.value)
  console.log(`handleCheckAllChange===>`, check)

  checkedList.value = val ? check : []
  isIndeterminate.value = false
}

// item切换
const handleCheckedChange = (value: string[]) => {
  const checkedCount = value.length
  checkAll.value = checkedCount === list.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < list.length
}

const confirmHandle = () => {
  exportInstance()
}

// 弹窗打开
const open = () => {}

// 弹窗关闭
const close = () => {
  exportType.value = 1
}

// 镜像导出
const exportInstance = async () => {
  const params =
    exportType.value === 1
      ? {
          regionId: cvmStore.areaSelect.id,
          ...props.curSearch,
        }
      : {
          ids: props.ids,
        }

  comfirmLoading.value = true
  try {
    const res = await _exportInstance(params)

    console.log(`_exportInstance===>`, res)

    if (!res.code) {
      show.value = false
      const fileName = `ins.xlsx`
      downloadExportFiles(res, fileName)
      message.success(t('common.operationSuccess'))
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
.radio-wrap {
  .key {
    margin-right: 40px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }
}

.export-checkbox {
  max-width: 100%;

  :deep(.el-checkbox__label) {
    min-width: 0;
    max-width: calc(100% - 24px);
  }
}
</style>
