<template>
  <div class="border-wrap mb20">
    <p class="df ac jsb top mb20">
      <span class="title">{{ t('ins.custom.baseInsConfig') }}</span>
      <span class="text-primary cursor-pointer" @click="store.setStep('a')">{{ t('ins.custom.edit') }}</span>
    </p>

    <el-row :gutter="20" class="bottom">
      <el-col :span="8">
        <table class="list-table">
          <tbody>
            <tr>
              <td class="pr20">
                <!-- 主机计费模式 -->
                <div class="item mb20">
                  <div class="key">
                    {{ t('ins.custom.insCostType') }}
                  </div>
                </div>
              </td>
              <td class="pr20">
                <div class="item mb20">
                  <span class="value">{{ costType }}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td class="pr20">
                <div class="item mb20">
                  <div class="key">
                    {{ t('ins.custom.ins') }}
                  </div>
                </div>
              </td>
              <td class="pr20">
                <div class="item mb20">
                  <span class="value">{{ insConfigSelect }}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td class="pr20">
                <div class="item mb20">
                  <div class="key">
                    {{ t('ins.custom.dataDisk') }}
                  </div>
                </div>
              </td>
              <td>
                <div class="item mb20">
                  <template v-if="dataDisk.length > 1">
                    <span class="value">{{ t('ins.custom.piece', [dataDisk.length]) }}</span>
                    <el-popover placement="top" :width="200" trigger="hover">
                      <template #reference>
                        <span class="value ml20 pointer">{{ t('ins.custom.seeDetail') }}</span>
                      </template>
                      <template #default>
                        <p v-for="(item, index) in dataDisk" :key="index" class="item">
                          {{ item }}
                        </p>
                      </template>
                    </el-popover>
                  </template>
                  <template v-else>
                    <span class="value">{{ dataDisk?.[0] || '-' }}</span>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </el-col>
      <el-col :span="8">
        <table class="list-table">
          <tbody>
            <tr>
              <td class="pr20">
                <!-- 地域 -->
                <div class="item mb20">
                  <div class="key">
                    {{ t('ins.custom.area') }}
                  </div>
                </div>
              </td>
              <td class="pr20">
                <div class="item mb20">
                  <span class="value">{{ areaNmae }}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td class="pr20">
                <!-- 镜像 -->
                <div class="item mb20">
                  <div class="key">
                    {{ t('ins.custom.image') }}
                  </div>
                </div>
              </td>
              <td class="pr20">
                <div class="item mb20">
                  <span class="value">{{ image }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </el-col>
      <el-col :span="8">
        <table class="list-table">
          <tbody>
            <tr>
              <td class="pr20">
                <!-- 可用区 -->
                <div class="item mb20">
                  <div class="key">
                    {{ t('ins.custom.zone') }}
                  </div>
                </div>
              </td>
              <td>
                <div class="item mb20">
                  <span class="value">{{ zoneName }}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td class="pr20">
                <!-- 系统盘 -->
                <div class="item mb20">
                  <div class="key">
                    {{ t('ins.custom.sysDisk') }}
                  </div>
                </div>
              </td>
              <td>
                <div class="item mb20">
                  <span class="value">{{ sysDisk }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { COST_TYPE_MAP } from '@/views/cvm/ins/config'
import { IMAGE_TYPE_MAP } from '@/views/cvm/image/config'
import { useDisk } from '@/views/cvm/hooks/use-disk'
import { useIns } from '@/views/cvm/hooks/use-ins'
import { _groupImages } from '@/apis/cvm/image'
import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'

const { cvmInsCreateStore: store, getSpecificationsList } = useIns()
const { listDiskPrice } = useDisk()
const { listByRegionId, getListWithRegionByWhitelist } = useBaseConfig()

const diskTypeList = ref<any[]>([]) // 硬盘类型集合
const areaList = ref<any[]>([]) // 地域集合

// 主机计费模式
const costType = computed(() => {
  return COST_TYPE_MAP[store.costTypeConfig?.cur]
})

// 地域
const areaNmae = computed(() => {
  let allArea: any[] = [] // 所有地区
  for (const el of areaList.value) {
    const regionDTOS = el.regionDTOS || []
    allArea.push(...regionDTOS)
  }
  const area = store.region
  const res = allArea.find(el => el.id === area?.id)
  return res?.regionName
})

// 可用区
const zoneName = computed(() => {
  const zoneRes = store.zoneConfig.list.find(el => el.id === store.zoneConfig.cur.id)
  return zoneRes ? zoneRes.zoneName : '-'
})

// 实例
const insConfigSelect = computed(() => {
  const insRes = store.insConfig.rowCur
  const text = t('ins.custom.insConfigSelect', [
    insRes?.specificationName,
    insRes?.typeName,
    insRes?.vcpus,
    insRes?.ram,
  ])

  return insRes ? text : '-'
})

// 镜像
const image = computed(() => {
  const imageCur = store.sysConfig?.imageCur
  const platformRes = store.sysConfig.list.find(el => el.platform === store.sysConfig.platformCur.platform)
  const images = platformRes ? platformRes?.images : []
  const imageRes = images?.find(el => el.id === imageCur)

  const text = imageRes
    ? `${IMAGE_TYPE_MAP[imageRes?.imageType]} | ${imageRes?.platform} | ${imageRes?.imageName} | ${imageRes?.insId} | ${imageRes?.size}GB`
    : '-'

  return text
})

// 系统盘
const sysDisk = computed(() => {
  const sysDiskForm = store.sysDiskForm
  const res = diskTypeList.value?.find(el => el.id === sysDiskForm?.diskType)
  console.log(`sysDisk===>`, res, sysDiskForm?.diskType)

  return `${res?.diskName || ''} | ${sysDiskForm?.size || ''}GiB`
})

// 数据盘
const dataDisk = computed(() => {
  const dataDiskFormList = store.dataDiskFormList?.map(el => el.tableData[0])
  const arr: any[] = mergeArray(dataDiskFormList)
  // console.log(`dataDisk===>`, arr)

  const newData: any = arr.map(item => {
    const res = diskTypeList.value?.find(el => el.id === item?.diskType)

    return `${res?.diskName} x ${item?.diskCount}，${item?.size}GiB`
  })

  return newData
})

// 将 diskType 和 size 相同的元素合并，并累加它们的 num，返回一个新的数组
const mergeArray = (arr: Array<{ diskType: any; size: number; diskCount: number }>) => {
  console.log(`mergeArray===>`, arr)

  const result: any[] = []

  arr.forEach(item => {
    // 查找 result 中是否已存在相同的 diskType 和 size
    const existingItem: any = result?.find(i => i.diskType === item.diskType && i.size === item.size)

    if (existingItem) {
      // 如果存在，则累加 diskCount
      existingItem.diskCount += item.diskCount
    } else {
      // 如果不存在，直接加入 result 数组
      result.push({ ...item })
    }
  })

  return result
}

// 硬盘类型列表
const listDiskPriceFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      diskTypeList.value = res.data || []
    }
  }

  const params = {
    costType: store.costTypeConfig.cur,
    regionId: store.region.id,
  }

  listDiskPrice(params, cb)
}

// 根据镜像类型获取镜像列表
const groupImages = async () => {
  try {
    const res = await _groupImages({
      regionId: store.region.id,
      imageType: store.sysConfig.imageTypeCur, // 1 公共镜像 2 私有镜像
    })

    console.log(`groupImages===>`, res)

    if (res.success) {
      // imagesList.value = res.data || []
      store.sysConfig.list = res.data || []
      const platformRes = store.sysConfig.list.find(el => el.platform === store.sysConfig.platformCur.platform)

      if (platformRes) {
        store.sysConfig.platformCur = platformRes
        store.sysConfig.imagesList = store.sysConfig.platformCur.images || []
      }
    }
  } catch (error) {
    console.log(error)
  }
}

// 根据地区id获取可用区列表
const listByRegionIdFn = () => {
  const cb = (res: any) => {
    if (res.success) {
      // zoneList.value = res.data || []
      store.zoneConfig.list = res.data || []
      const cur = store.zoneConfig.list.find(el => el.id === store.zoneConfig.cur.id)
      if (cur) {
        store.zoneConfig.cur = cur
      }
    }
  }
  const params = {
    regionId: store.region.id,
  }
  return listByRegionId(params, cb)
}

// 购买实例-自定义配置-查询创建服务器规格列表
const getSpecificationsListFn = () => {
  const params = {
    regionId: store.region.id,
    zoneId: store.zoneConfig.cur.id,
    instanceFamilyId: store.insConfig.familyCur.id, // 实例族
    instanceTypeId: store.insConfig.typeCur.id, // 类型
    vcpus: store.insConfig.vcpus,
    ram: store.insConfig.ram,
    pageIndex: 1,
    pageSize: 999,
    costType: store.costTypeConfig.cur,
  }
  const cb = (res: any) => {
    if (res.success) {
      const insList = res.data?.list || []

      const rowCurIndexRes = insList.findIndex(el => el.id === store.insConfig.rowCur.id)
      if (rowCurIndexRes !== -1) {
        const rowCur = insList[rowCurIndexRes]
        store.insConfig.rowCur = rowCur
        store.insConfig.pagination.page = Math.ceil(insList.length / store.insConfig.pagination.pageSize)
      }
    }
  }

  getSpecificationsList(params, cb)
}

// 获取大区列表及其地区
const getListWithRegionFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      areaList.value = res.data || []
    }
  }
  getListWithRegionByWhitelist(cb)
}

onMounted(() => {
  listDiskPriceFn()
  groupImages()
  listByRegionIdFn()
  getSpecificationsListFn()
  getListWithRegionFn()
})
</script>

<style lang="scss" scoped>
.list-left {
  margin-right: 20px;
}

.border-wrap {
  padding: 20px;
  background: #f9fafc;

  .top {
    span {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 14px;
      color: #000;
    }

    .title {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 14px;
      color: #000;
    }
  }

  .bottom {
    .item {
      min-height: 21px;
    }

    .key {
      min-width: 28px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #999;
      white-space: nowrap;
    }

    .value {
      display: inline-block;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #000;
      overflow-wrap: break-word; /* 在必要时单词内部断行 */
      overflow-wrap: anywhere;
      white-space: normal; /* 允许换行 */
    }
  }
}

.pr20 {
  padding-right: 20px;
}

.list-table {
  td {
    vertical-align: top;
  }
}
</style>
