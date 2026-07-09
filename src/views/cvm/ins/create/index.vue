<template>
  <div class="page">
    <div class="title">
      {{ t('ins.create.title') }}
    </div>
    <div class="mb20">
      <CatTabs2 v-model="cvmInsCreateStore.tab" class="tabs" :tabs="tabs" />
    </div>
    <Fast v-if="cvmInsCreateStore.tab === 1 && initEnd" />
    <Custom v-if="cvmInsCreateStore.tab === 2 && initEnd" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import Fast from './components/fast/index.vue'
import Custom from './components/custom/index.vue'
import { useIns } from '@/views/cvm/hooks/use-ins'
import { useTempStore, useCvmStore } from '@/store'

import { initState as initStateFast } from '@/store/cvm-ins-fast-create'
import { initState as initStateCustom } from '@/store/cvm-ins-create'
import { PUBLIC_IP_CONFIG_LIST } from '@/views/cvm/ins/config'
import { _getCacheParam } from '@/apis/cvm/ins'
import { replaceRoute } from '@/utils/router-jump'

const tempStore = useTempStore()
const { cvmInsCreateStore, cvmInsFastCreateStore, isDefaultCreate, listInstanceDetail, getSpecificationsList } =
  useIns()
const route = useRoute()
const cvmStore = useCvmStore()

// 是否完成初始化
const initEnd = ref(false)

const tabs = computed(() => {
  if (isDefaultCreate) {
    return [
      { label: t('ins.create.fast'), value: 1 }, // 快速配置
      { label: t('ins.create.custom'), value: 2 }, // 自定义配置
    ]
  } else {
    return [{ label: t('ins.create.custom'), value: 2 }] // 购买相同配置+镜像创建实例+官网购买
  }
})

// 获取服务器详细信息
const listInstanceDetailFn = () => {
  const instanceId = route.query.instanceId as string
  const params = {
    instanceId,
  }

  const cb = (res: any) => {
    if (res.success) {
      const insData = res.data?.[0]

      // tab
      cvmInsCreateStore.tab = 2

      // 计费模式
      if (insData.instanceChargeType) {
        cvmInsCreateStore.costTypeConfig.cur = insData.instanceChargeType
      }
      // 地域
      if (insData.regionId) {
        let region: any = {}

        for (const el of cvmStore.areaList) {
          const res = el.regionDTOS?.find(item => item.id === insData.regionId)

          if (res) {
            region = res
            break
          }
        }

        // cvmInsCreateStore.region.id = id
        // cvmInsCreateStore.region.locationId = locationId
        cvmInsCreateStore.region = region
      }
      // 可用区
      if (insData.zoneId) {
        cvmInsCreateStore.zoneConfig.cur.id = insData.zoneId
      }
      // 实例族
      if (insData.specificationInfo?.instanceFamilyId) {
        cvmInsCreateStore.insConfig.familyCur.id = insData.specificationInfo?.instanceFamilyId
      }
      // 实例类型
      if (insData.specificationInfo?.instanceTypeId) {
        cvmInsCreateStore.insConfig.typeCur.id = insData.specificationInfo?.instanceTypeId
      }
      // 实例规格
      if (insData.specificationInfo?.id) {
        cvmInsCreateStore.insConfig.rowCur.id = insData.specificationInfo?.id
      }
      // 镜像类型
      if (insData.imageInfo?.imageType) {
        cvmInsCreateStore.sysConfig.imageTypeCur = insData.imageInfo?.imageType
      }
      // 镜像系统
      if (insData.imageInfo?.platform) {
        cvmInsCreateStore.sysConfig.platformCur.platform = insData.imageInfo?.platform
      }
      // 镜像
      if (insData.imageInfo?.id) {
        cvmInsCreateStore.sysConfig.imageCur = insData.imageInfo?.id
      }
      // 硬盘
      if (insData.diskInfos) {
        const sys = insData.diskInfos.find(el => el.type === 1)
        if (sys) {
          cvmInsCreateStore.sysDiskForm.diskType = sys.diskTypeId
          cvmInsCreateStore.sysDiskForm.size = sys.size
          cvmInsCreateStore.sysDiskForm.diskCount = 1
        }

        const datas = insData.diskInfos.filter(el => el.type === 2)
        if (datas.length) {
          cvmInsCreateStore.dataDiskFormList = datas.map(el => ({
            tableData: [{ diskType: el.diskTypeId, size: el.size, diskCount: 1, snapshot: {} }],
            formRef: {},
          }))
        }
      }

      if (insData.networkInfos) {
        const mainNetwork = insData.networkInfos.find(el => el.primaryType === 1) // 主网卡
        if (mainNetwork) {
          // vpc
          cvmInsCreateStore.netConfig.vpcCur = mainNetwork?.vpcId || ''
          // 子网
          cvmInsCreateStore.netConfig.subnetCur = mainNetwork?.subNetworkId || ''

          // 公网ip
          cvmInsCreateStore.publicIpConfig.checked = PUBLIC_IP_CONFIG_LIST.map(el => el.value).includes(
            mainNetwork.networkChangeType,
          )
            ? true
            : false

          // 带宽值
          cvmInsCreateStore.publicIpConfig.size = mainNetwork.mainPublicBandwidth
          // 带宽计费模式
          cvmInsCreateStore.publicIpConfig.chargeTypeCur = mainNetwork.networkChangeType
          // step 带宽计费模式为共享流量包，则跳转到第二步，其他默认第三步
          cvmInsCreateStore.setStep(cvmInsCreateStore.publicIpConfig.chargeTypeCur === 3 ? 'b' : 'c')
          // 线路类型
          cvmInsCreateStore.publicIpConfig.lineTypeCur = mainNetwork.eips?.[0].lineType
          // 安全组
          cvmInsCreateStore.securityGroupConfig.already.checked =
            mainNetwork.securityGroups?.map(el => el.groupId) || []
          cvmInsCreateStore.securityGroupConfig.cur = 2
        }
      }
      // 项目
      if (insData.projectId) {
        cvmInsCreateStore.projectConfig.cur = insData.projectId
      }
      // 自动续费
      if (insData.autoRenew) {
        cvmInsCreateStore.autoRenewConfig.checked = insData.autoRenew
      }
      // 登录方式
      cvmInsCreateStore.loginConfig.cur = 3
    }
  }

  return listInstanceDetail(params, cb)
}

// 购买实例-自定义配置-查询创建服务器规格列表
const getSpecificationsListFn = () => {
  const params = {
    regionId: cvmInsCreateStore.region.id,
    zoneId: cvmInsCreateStore.zoneConfig.cur.id,
    instanceFamilyId: cvmInsCreateStore.insConfig.familyCur.id, // 实例族
    instanceTypeId: cvmInsCreateStore.insConfig.typeCur.id, // 类型
    vcpus: cvmInsCreateStore.insConfig.vcpus,
    ram: cvmInsCreateStore.insConfig.ram,
    pageIndex: 1,
    pageSize: 999,
    costType: cvmInsCreateStore.costTypeConfig.cur,
  }
  const cb = (res: any) => {
    if (res.success) {
      const insList = res.data?.list || []

      // 获取实例规格在后端分页的页数
      const rowCurIndexRes = insList.findIndex(el => el.id === cvmInsCreateStore.insConfig.rowCur.id)
      if (rowCurIndexRes !== -1) {
        const rowCur = insList[rowCurIndexRes]
        cvmInsCreateStore.insConfig.rowCur = rowCur
        cvmInsCreateStore.insConfig.pagination.page = Math.ceil(
          (rowCurIndexRes + 1) / cvmInsCreateStore.insConfig.pagination.pageSize,
        )
      }
    }
  }
  console.log(`params---`, params)

  return getSpecificationsList(params, cb)
}

// 镜像创建实例
const imageCreateInsInit = () => {
  // tab
  cvmInsCreateStore.tab = 2
  // step =>自定义创建第一步是不知道公网ip的参数 所以不需要执行setStep方法
  cvmInsCreateStore.step = 'a'
  // region
  cvmInsCreateStore.region.id = cvmStore.areaSelect.id
  cvmInsCreateStore.region.locationId = cvmStore.areaSelect.locationId

  const imageType = route.query.imageType as string
  const platform = route.query.platform as string
  const imageId = route.query.imageId as string

  // 镜像类型
  if (imageType) {
    cvmInsCreateStore.sysConfig.imageTypeCur = Number(imageType)
  }

  // 镜像系统
  if (platform) {
    cvmInsCreateStore.sysConfig.platformCur.platform = platform
  }

  // 镜像
  if (imageId) {
    cvmInsCreateStore.sysConfig.imageCur = Number(imageId)
  }
}

// 获取官网缓存参数 10分钟缓存
const getCacheParam = async () => {
  // tab
  cvmInsCreateStore.tab = 2
  // step =>自定义创建第一步是不知道公网ip的参数 所以不需要执行setStep方法
  cvmInsCreateStore.step = 'a'

  const id = route.query.id as string

  const res = await _getCacheParam({ id })
  if (res.success) {
    const insData = res.data

    // tab
    cvmInsCreateStore.tab = 2
    // step =>自定义创建第一步是不知道公网ip的参数 所以不需要执行setStep方法
    cvmInsCreateStore.step = 'a'
    // 计费模式
    if (insData?.instanceChargeType) {
      cvmInsCreateStore.costTypeConfig.cur = insData.instanceChargeType
    }
    // 地域
    if (insData?.regionId) {
      cvmInsCreateStore.region.id = insData.regionId
    }
    // 可用区
    if (insData?.zoneId) {
      cvmInsCreateStore.zoneConfig.cur.id = insData.zoneId
    }
    // 实例族
    if (insData?.instanceFamilyId) {
      cvmInsCreateStore.insConfig.familyCur.id = insData.instanceFamilyId
    }
    // 实例类型
    if (insData?.instanceTypeId) {
      cvmInsCreateStore.insConfig.typeCur.id = insData.instanceTypeId
    }
    // 实例规格
    if (insData?.specificateId) {
      cvmInsCreateStore.insConfig.rowCur.id = insData.specificateId
    }
    // 镜像类型
    if (insData?.imageType) {
      cvmInsCreateStore.sysConfig.imageTypeCur = insData.imageType
    }
    // 镜像系统
    if (insData?.platform) {
      cvmInsCreateStore.sysConfig.platformCur.platform = insData.platform
    }
    // 镜像
    if (insData?.imageId) {
      cvmInsCreateStore.sysConfig.imageCur = insData.imageId
    }
    // 公网ip
    cvmInsCreateStore.publicIpConfig.checked = insData.ipChecked ?? false
    // 带宽值
    if (insData?.bandwidth) {
      cvmInsCreateStore.publicIpConfig.size = insData.bandwidth
    }
    // 带宽计费模式
    if (insData?.networkChangeType) {
      cvmInsCreateStore.publicIpConfig.chargeTypeCur = insData.networkChangeType
    }
    // 线路类型
    if (insData?.lineType) {
      cvmInsCreateStore.publicIpConfig.lineTypeCur = insData.lineType
    }
    // 系统盘
    if (insData.sysDisk && insData.sysDisk.length) {
      const sys = insData.sysDisk[0]
      if (sys) {
        cvmInsCreateStore.sysDiskForm.diskType = sys.diskTypeId
        cvmInsCreateStore.sysDiskForm.size = sys.size
        cvmInsCreateStore.sysDiskForm.diskCount = 1
      }
    }
    // 数据盘
    if (insData.dataDisk && insData.dataDisk.length) {
      const datas = insData.dataDisk
      cvmInsCreateStore.dataDiskFormList = datas.map(el => ({
        tableData: [{ diskType: el.diskTypeId, size: el.size, diskCount: el.diskCount, snapshot: {} }],
        formRef: {},
      }))
    }
    // 购买时长
    if (insData?.periodNum) {
      cvmInsCreateStore.periodNum = insData.periodNum
    }
    // 购买数量
    if (insData?.insCount) {
      // 超出数量最大值
      if (insData.insCount > cvmInsCreateStore.insCountConfig.max) {
        cvmInsCreateStore.insCountConfig.num = cvmInsCreateStore.insCountConfig.max
      } else if (insData.insCount < cvmInsCreateStore.insCountConfig.min) {
        //小于数量最小值
        cvmInsCreateStore.insCountConfig.num = cvmInsCreateStore.insCountConfig.min
      } else {
        cvmInsCreateStore.insCountConfig.num = insData.insCount
      }
    }
  }
}

watch(
  () => cvmInsCreateStore.step,
  () => {
    // 项目滚动容器是div,不是整个页面
    const pageWrapDom = document.getElementById('page-wrap')
    if (pageWrapDom) {
      pageWrapDom.scrollTop = 0
    }
  },
)

onBeforeMount(async () => {
  try {
    // 是否需要初始化
    const isInitStr = route.query.isInit as string
    const isInit = isInitStr === 'true'

    // 默认创建
    if (isDefaultCreate) {
      if (isInit) {
        // 快速创建
        cvmInsCreateStore.tab = 2
        const fastState = initStateFast()
        // region
        fastState.region.id = cvmStore.areaSelect.id
        fastState.region.locationId = cvmStore.areaSelect.locationId
        cvmInsFastCreateStore.setState(fastState)

        // 自定义创建
        const customState = initStateCustom()
        // region
        customState.region.id = cvmStore.areaSelect.id
        customState.region.locationId = cvmStore.areaSelect.locationId
        cvmInsCreateStore.setState(customState)
      }
    } else {
      // 选配创建
      if (isInit) {
        // 自定义创建
        const customState = initStateCustom()
        cvmInsCreateStore.setState(customState)

        const entry = route.query.entry as string

        switch (entry) {
          // 购买相同配置
          case 'insSameConfig':
            await listInstanceDetailFn()
            await getSpecificationsListFn()
            break

          // 镜像创建实例
          case 'imageCreateIns':
            imageCreateInsInit()
            break

          // 官网购买
          case 'officialSite':
            await getCacheParam()
            await getSpecificationsListFn()
            break

          default:
            break
        }
      } else {
        cvmInsCreateStore.tab = 2
      }
    }
    // 清除路径参数,保留isDefaultCreate
    replaceRoute({
      name: 'ins_create',
      query: {
        isDefaultCreate: isDefaultCreate ? 'true' : 'false',
      },
    })
  } catch (error) {
    console.log(error)
  } finally {
    // 解决请求异步问题
    initEnd.value = true
  }
})

onBeforeMount(() => {
  console.log('onBeforeMount==>')
  tempStore.set('showSlider', false)
})

onBeforeUnmount(() => {
  // console.log('onBeforeUnmount==>')
  tempStore.set('showSlider', true)
})

onBeforeRouteLeave(() => {
  // console.log('onBeforeRouteLeave==>')
  tempStore.set('showSlider', true)
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100%;
  padding: 40px 120px;
  background: #fff;

  .title {
    margin-bottom: 25px;
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 26px;
    color: #000;
  }
}
</style>
