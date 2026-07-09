<template>
  <div id="storage" class="storage_box">
    <div class="storage_content" :style="tableClass">
      <!-- 系统盘 最多创建1个 -->
      <el-form ref="sysFormRef" :model="store.sysDiskForm" :show-message="false" :rules="sysDiskRules" label-width="0">
        <el-table :data="[{}]">
          <!-- 用途 -->
          <el-table-column min-width="200" :label="t('ins.custom.purpose')">
            <template #default>
              <div>{{ t('ins.custom.sysDisk') }}</div>
            </template>
          </el-table-column>
          <!-- 类型 -->
          <el-table-column min-width="200" :label="t('ins.custom.diskType')">
            <template #default>
              <el-form-item label="" prop="diskType">
                <el-select
                  ref="moreOptsRef"
                  v-model="store.sysDiskForm.diskType"
                  class="select-opts mr20"
                  :placeholder="t('ins.custom.diskPh')"
                  @change="() => {}"
                >
                  <el-option v-for="item in diskTypeList" :key="item.id" :label="item.diskName" :value="item.id" />
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <!-- 容量 -->
          <el-table-column min-width="300" :label="t('ins.custom.size')">
            <template #default>
              <el-form-item label="" prop="size">
                <el-tooltip class="box-item" effect="dark" :content="t('ins.custom.sysDiskSizeDesc')" placement="top">
                  <el-input-number
                    v-model="store.sysDiskForm.size"
                    :min="SYS_DISK_SIZE_MIN"
                    :max="SYS_DISK_SIZE_MAX"
                    @change="
                      () => {
                        if (!store.sysDiskForm.size) {
                          store.sysDiskForm.size = SYS_DISK_SIZE_MIN
                        }
                      }
                    "
                  />
                </el-tooltip>

                <span class="ml10">GiB</span>
              </el-form-item>
            </template>
          </el-table-column>
          <!-- 数量 -->
          <el-table-column min-width="300" :label="t('ins.custom.num')">
            <template #default>
              <el-form-item label="" prop="diskCount">
                <div>{{ store.sysDiskForm.diskCount }}</div>
              </el-form-item>
            </template>
          </el-table-column>
          <!-- 总性能 -->
          <el-table-column :min-width="optionsClass" :label="''">
            <template>
              <!-- <span class="mr20">基准性能：2550IOPS, 110MiB/s 带宽</span> -->
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <!-- 数据盘 最多创建20个 -->
      <el-form
        v-for="config in store.dataDiskFormList"
        :key="config.formRefKey"
        :ref="
          (el: any) => {
            config.formRef = el
          }
        "
        :rules="dataDiskRules"
        label-width="0"
        :model="config.tableData[0]"
      >
        <el-table :show-header="false" :data="config.tableData">
          <!-- 用途 -->
          <el-table-column min-width="200" :label="t('ins.custom.purpose')">
            <template #default>
              <div>{{ t('ins.custom.dataDisk') }}</div>
            </template>
          </el-table-column>
          <!-- 类型 -->
          <el-table-column min-width="200" :label="t('ins.custom.diskType')">
            <template #default="{ row }">
              <el-form-item label="" prop="diskType">
                <el-select
                  ref="moreOptsRef"
                  v-model="row.diskType"
                  class="select-opts mr20"
                  :placeholder="t('ins.custom.diskPh')"
                  @change="() => {}"
                >
                  <el-option v-for="item in diskTypeList" :key="item.id" :label="item.diskName" :value="item.id" />
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <!-- 容量 -->
          <el-table-column min-width="300" :label="t('ins.custom.size')">
            <template #default="{ row }">
              <el-form-item label="" prop="size">
                <el-tooltip class="box-item" effect="dark" :content="t('ins.custom.dataDiskSizeDesc')" placement="top">
                  <el-input-number
                    v-model="row.size"
                    :min="row.snapshot.size || DATA_DISK_SIZE_MIN"
                    :max="DATA_DISK_SIZE_MAX"
                    @change="changeDataDiskSize(row)"
                  />
                </el-tooltip>
                <span class="ml10">GiB</span>
              </el-form-item>
            </template>
          </el-table-column>
          <!-- 数量 -->
          <el-table-column min-width="300" :label="t('ins.custom.num')">
            <template #default="{ row }">
              <div>
                <el-form-item label="" prop="diskCount">
                  <el-input-number
                    v-model="row.diskCount"
                    :min="1"
                    :max="dataDiskResidueLen + row.diskCount"
                    @change="
                      () => {
                        if (!row.diskCount) {
                          row.diskCount = 1
                        }
                      }
                    "
                  />
                </el-form-item>
              </div>
            </template>
          </el-table-column>
          <!-- 总性能 -->
          <el-table-column :min-width="optionsClass" :label="''">
            <template #default="{ row }">
              <div class="df ac">
                <!-- 有快照 -->
                <div v-if="row.snapshot.id" class="df ac">
                  <span class="mr10 text-primary pointer">{{ row.snapshot.name }} </span>
                  <SvgIcon name="transfer-delete" class="mr20 pointer" @click="removeSnapshot(row)" />
                </div>
                <!-- 无快照 -->
                <span v-else class="mr20 text-primary pointer" @click="snapshotCreateDisk(row)"
                  >{{ t('ins.custom.snapshotCreateDisk') }}
                </span>

                <span class="mr20 text-primary pointer" @click="removeDataDiskForm(config.formRefKey)">{{
                  t('ins.custom.delete')
                }}</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <div class="df ac jc">
        <p v-if="dataDiskResidueLen" class="mt20 desc cursor-pointer" @click="addDataDiskForm">
          <span class="text-primary mr10">{{ t('ins.custom.addDataDisk') }}</span>
          <span>{{ t('ins.custom.addDataDiskDesc', [dataDiskResidueLen]) }} </span>
        </p>
      </div>
    </div>

    <!-- 用快照创建硬盘 -->
    <SnapshotCreateDisk
      ref="snapshotCreateDiskRef"
      :region-id="regionId"
      :disk-type="dataDiskCur.diskType"
      :disk-size="dataDiskCur.size || DATA_DISK_SIZE_MIN"
      @success="changeSnapshot"
    />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { FormRules } from 'element-plus/es'
import SnapshotCreateDisk from './snapshot-create-disk.vue'
import { useDisk } from '@/views/cvm/hooks/use-disk'
import { useIns } from '@/views/cvm/hooks/use-ins'
import { SYS_DISK_SIZE_MAX, SYS_DISK_SIZE_MIN, DATA_DISK_SIZE_MAX, DATA_DISK_SIZE_MIN } from '@/views/cvm/disk/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const tableMap = {
  [ja]: 'min-width: 1340px',
  [en]: 'min-width: 1300px',
  [zh]: 'min-width: 1240px',
}

const optionsMap = {
  [ja]: '340',
  [en]: '300',
  [zh]: '240',
}

const optionsClass = useI18nStyle(optionsMap)
const tableClass = useI18nStyle(tableMap)

interface DataForm {
  diskType: number | string
  size: number
  diskCount: number
}

interface PropType {
  costType: number // 计费模式
  regionId: number // 地区
  zoneId: number // 可用区
  specificationId: number // 服务器规格ID
}

const props = withDefaults(defineProps<PropType>(), {
  costType: 1,
  regionId: 0,
  zoneId: 0,
})

const { cvmInsCreateStore: store } = useIns()
const { listDiskPrice } = useDisk()

const maxLenDataForm = 20 // 数据盘最大创建个数

const sysDiskRules = reactive<FormRules<DataForm>>({
  diskType: [{ required: true, message: '', trigger: 'change' }],
  size: [{ required: true, message: '', trigger: 'blur' }],
  diskCount: [{ required: true, message: '', trigger: 'blur' }],
})

const dataDiskRules = reactive<FormRules<DataForm>>({
  diskType: [{ required: true, message: '', trigger: 'change' }],
  size: [{ required: true, message: '', trigger: 'blur' }],
  diskCount: [{ required: true, message: '', trigger: 'blur' }],
})

const diskTypeList = ref<any[]>([]) // 硬盘类型集合
const defaultDiskType = ref<number | string>('') // 默认硬盘类型
const dataDiskCur = ref<any>({}) // 当前数据盘

const sysFormRef = ref<any>() // 系统盘
const snapshotCreateDiskRef = ref<InstanceType<typeof SnapshotCreateDisk>>() // 用快照创建硬盘

// 更新数据盘容量
const changeDataDiskSize = (row: any) => {
  const minSize = row.snapshot.size || DATA_DISK_SIZE_MIN
  // 非法值
  if (!row.size) {
    row.size = minSize
  }
}

// 选中快照
const changeSnapshot = (snapshot: any) => {
  // dataDiskCur.value.size = snapshot.size
  dataDiskCur.value.snapshot = snapshot
}

// 删除快照
const removeSnapshot = (row: any) => {
  row.snapshot = {}
}

// 点击快照创建硬盘
const snapshotCreateDisk = (row: any) => {
  console.log(`snapshotCreateDisk===>`, row)

  dataDiskCur.value = row
  changeShow(snapshotCreateDiskRef.value)
}

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return

  ins.show = true
}

// 获取数据盘,系统盘
const storageConfig = () => {
  let allDataDisk: any[] = []

  for (const el of store.dataDiskFormList) {
    allDataDisk.push(...el.tableData)
  }

  return {
    sysDiskForm: store.sysDiskForm,
    dataDiskForm: store.dataDiskForm,
    dataDiskFormList: store.dataDiskFormList,
    diskTypeList: diskTypeList.value,
  }
}

// 数据盘剩余个数
const dataDiskResidueLen = computed(() => {
  let len = 0

  for (const el of store.dataDiskFormList) {
    len = el.tableData[0].diskCount + len
  }

  return maxLenDataForm - len
})

// 添加数据盘
const addDataDiskForm = () => {
  store.dataDiskFormList.push({
    tableData: [{ ...store.dataDiskForm }],
    formRef: {},
    formRefKey: maoYunDayJs().valueOf(),
  })
}

// 删除数据盘
const removeDataDiskForm = formRefKey => {
  console.log(`removeDataDiskForm===>`, formRefKey)
  const index = store.dataDiskFormList.findIndex(el => formRefKey === el.formRefKey)
  if (index !== -1) {
    store.dataDiskFormList.splice(index, 1)
  }
}

// 校验
const verify = async () => {
  try {
    // 数据盘校验
    const all = store.dataDiskFormList.map(el => el.formRef.validate())
    console.log(`数据盘校验===>`, await Promise.all(all))
    await Promise.all(all)

    console.log(`系统盘校验===>`, await sysFormRef.value.validate())
    // 系统盘校验
    await sysFormRef.value.validate()
    return true
  } catch (e) {
    console.log(`verify===>`, e)

    // 锚点错误定位
    const el = document.getElementById('storage')
    el?.scrollIntoView({ behavior: 'smooth' })
    return false
  }
}

// 硬盘类型列表
const listDiskPriceFn = () => {
  console.log(`storage listDiskPriceFn===>`)

  const cb = (res: any) => {
    if (res.success) {
      diskTypeList.value = res.data || []

      // 默认硬盘类型
      defaultDiskType.value = diskTypeList.value[0]?.id || ''

      // 处理系统盘
      const sysDiskRes = diskTypeList.value.find(el => el.id === store.sysDiskForm.diskType)
      if (!sysDiskRes) {
        store.sysDiskForm.diskType = defaultDiskType.value
      }

      // 处理数据盘
      store.dataDiskForm.diskType = defaultDiskType.value

      for (const el of store.dataDiskFormList) {
        if (el.tableData[0].diskType) {
          const dataDiskRes = diskTypeList.value.find(item => item.id === el.tableData[0].diskType)

          if (!dataDiskRes) {
            el.tableData[0].diskType = defaultDiskType.value
          }
        } else {
          el.tableData[0].diskType = defaultDiskType.value
        }
      }

      // 清除校验样式
      sysFormRef.value?.clearValidate()
      const all = store.dataDiskFormList.map(el => el.formRef?.clearValidate())
      Promise.all(all)
    }
  }

  const params = {
    costType: props.costType,
    regionId: props.regionId,
    zoneId: props.zoneId,
    specificationId: props.specificationId,
  }
  // reset()
  listDiskPrice(params, cb)
}

// 监听计费模式,可用区,地域,实例规格
watch([() => store.costTypeConfig, () => store.zoneConfig, () => store.region, () => props.specificationId], () => {
  listDiskPriceFn()
})

defineExpose({
  verify,
  storageConfig,
  listDiskPriceFn,
})
</script>

<style lang="scss" scoped>
.storage_box {
  width: 100%;
  overflow-x: auto;
}

.desc {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  text-align: center;
}
</style>
