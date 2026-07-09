<template>
  <div class="cvm-ins-create-v2">
    <div class="cvm-ins-create-v2__title">
      {{ t('ins.create.title') }}
    </div>
    <div class="cvm-ins-create-v2__tabs">
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
import { useCvmStore } from '@/store'

import { initState as initStateFast } from '@/store/cvm-ins-fast-create'
import { initState as initStateCustom } from '@/store/cvm-ins-create'
import { PUBLIC_IP_CONFIG_LIST } from '@/views/cvm/ins/config'
import { _getCacheParam } from '@/apis/cvm/ins'
import { replaceRoute } from '@/utils/router-jump'

const { cvmInsCreateStore, cvmInsFastCreateStore, isDefaultCreate, listInstanceDetail, getSpecificationsList } =
  useIns()
const route = useRoute()
const cvmStore = useCvmStore()

const initEnd = ref(false)

const tabs = computed(() => {
  if (isDefaultCreate) {
    return [
      { label: t('ins.create.fast'), value: 1 },
      { label: t('ins.create.custom'), value: 2 },
    ]
  } else {
    return [{ label: t('ins.create.custom'), value: 2 }]
  }
})

const listInstanceDetailFn = () => {
  const instanceId = route.query.instanceId as string
  const params = {
    instanceId,
  }

  const cb = (res: any) => {
    if (res.success) {
      const insData = res.data?.[0]

      cvmInsCreateStore.tab = 2

      if (insData.instanceChargeType) {
        cvmInsCreateStore.costTypeConfig.cur = insData.instanceChargeType
      }
      if (insData.regionId) {
        let region: any = {}

        for (const el of cvmStore.areaList) {
          const res = el.regionDTOS?.find(item => item.id === insData.regionId)

          if (res) {
            region = res
            break
          }
        }

        cvmInsCreateStore.region = region
      }
      if (insData.zoneId) {
        cvmInsCreateStore.zoneConfig.cur.id = insData.zoneId
      }
      if (insData.specificationInfo?.instanceFamilyId) {
        cvmInsCreateStore.insConfig.familyCur.id = insData.specificationInfo?.instanceFamilyId
      }
      if (insData.specificationInfo?.instanceTypeId) {
        cvmInsCreateStore.insConfig.typeCur.id = insData.specificationInfo?.instanceTypeId
      }
      if (insData.specificationInfo?.id) {
        cvmInsCreateStore.insConfig.rowCur.id = insData.specificationInfo?.id
      }
      if (insData.imageInfo?.imageType) {
        cvmInsCreateStore.sysConfig.imageTypeCur = insData.imageInfo?.imageType
      }
      if (insData.imageInfo?.platform) {
        cvmInsCreateStore.sysConfig.platformCur.platform = insData.imageInfo?.platform
      }
      if (insData.imageInfo?.id) {
        cvmInsCreateStore.sysConfig.imageCur = insData.imageInfo?.id
      }
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
        const mainNetwork = insData.networkInfos.find(el => el.primaryType === 1)
        if (mainNetwork) {
          cvmInsCreateStore.netConfig.vpcCur = mainNetwork?.vpcId || ''
          cvmInsCreateStore.netConfig.subnetCur = mainNetwork?.subNetworkId || ''

          cvmInsCreateStore.publicIpConfig.checked = PUBLIC_IP_CONFIG_LIST.map(el => el.value).includes(
            mainNetwork.networkChangeType,
          )

          cvmInsCreateStore.publicIpConfig.size = mainNetwork.mainPublicBandwidth
          cvmInsCreateStore.publicIpConfig.chargeTypeCur = mainNetwork.networkChangeType
          cvmInsCreateStore.setStep(cvmInsCreateStore.publicIpConfig.chargeTypeCur === 3 ? 'b' : 'c')
          cvmInsCreateStore.publicIpConfig.lineTypeCur = mainNetwork.eips?.[0].lineType
          cvmInsCreateStore.securityGroupConfig.already.checked =
            mainNetwork.securityGroups?.map(el => el.groupId) || []
          cvmInsCreateStore.securityGroupConfig.cur = 2
        }
      }
      if (insData.projectId) {
        cvmInsCreateStore.projectConfig.cur = insData.projectId
      }
      if (insData.autoRenew) {
        cvmInsCreateStore.autoRenewConfig.checked = insData.autoRenew
      }
      cvmInsCreateStore.loginConfig.cur = 3
    }
  }

  return listInstanceDetail(params, cb)
}

const getSpecificationsListFn = () => {
  const params = {
    regionId: cvmInsCreateStore.region.id,
    zoneId: cvmInsCreateStore.zoneConfig.cur.id,
    instanceFamilyId: cvmInsCreateStore.insConfig.familyCur.id,
    instanceTypeId: cvmInsCreateStore.insConfig.typeCur.id,
    vcpus: cvmInsCreateStore.insConfig.vcpus,
    ram: cvmInsCreateStore.insConfig.ram,
    pageIndex: 1,
    pageSize: 999,
    costType: cvmInsCreateStore.costTypeConfig.cur,
  }
  const cb = (res: any) => {
    if (res.success) {
      const insList = res.data?.list || []
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

  return getSpecificationsList(params, cb)
}

const imageCreateInsInit = () => {
  cvmInsCreateStore.tab = 2
  cvmInsCreateStore.step = 'a'
  cvmInsCreateStore.region.id = cvmStore.areaSelect.id
  cvmInsCreateStore.region.locationId = cvmStore.areaSelect.locationId

  const imageType = route.query.imageType as string
  const platform = route.query.platform as string
  const imageId = route.query.imageId as string

  if (imageType) {
    cvmInsCreateStore.sysConfig.imageTypeCur = Number(imageType)
  }

  if (platform) {
    cvmInsCreateStore.sysConfig.platformCur.platform = platform
  }

  if (imageId) {
    cvmInsCreateStore.sysConfig.imageCur = Number(imageId)
  }
}

const getCacheParam = async () => {
  cvmInsCreateStore.tab = 2
  cvmInsCreateStore.step = 'a'

  const id = route.query.id as string
  const res = await _getCacheParam({ id })
  if (res.success) {
    const insData = res.data

    cvmInsCreateStore.tab = 2
    cvmInsCreateStore.step = 'a'
    if (insData?.instanceChargeType) {
      cvmInsCreateStore.costTypeConfig.cur = insData.instanceChargeType
    }
    if (insData?.regionId) {
      cvmInsCreateStore.region.id = insData.regionId
    }
    if (insData?.zoneId) {
      cvmInsCreateStore.zoneConfig.cur.id = insData.zoneId
    }
    if (insData?.instanceFamilyId) {
      cvmInsCreateStore.insConfig.familyCur.id = insData.instanceFamilyId
    }
    if (insData?.instanceTypeId) {
      cvmInsCreateStore.insConfig.typeCur.id = insData.instanceTypeId
    }
    if (insData?.specificateId) {
      cvmInsCreateStore.insConfig.rowCur.id = insData.specificateId
    }
    if (insData?.imageType) {
      cvmInsCreateStore.sysConfig.imageTypeCur = insData.imageType
    }
    if (insData?.platform) {
      cvmInsCreateStore.sysConfig.platformCur.platform = insData.platform
    }
    if (insData?.imageId) {
      cvmInsCreateStore.sysConfig.imageCur = insData.imageId
    }
    cvmInsCreateStore.publicIpConfig.checked = insData.ipChecked ?? false
    if (insData?.bandwidth) {
      cvmInsCreateStore.publicIpConfig.size = insData.bandwidth
    }
    if (insData?.networkChangeType) {
      cvmInsCreateStore.publicIpConfig.chargeTypeCur = insData.networkChangeType
    }
    if (insData?.lineType) {
      cvmInsCreateStore.publicIpConfig.lineTypeCur = insData.lineType
    }
    if (insData.sysDisk && insData.sysDisk.length) {
      const sys = insData.sysDisk[0]
      if (sys) {
        cvmInsCreateStore.sysDiskForm.diskType = sys.diskTypeId
        cvmInsCreateStore.sysDiskForm.size = sys.size
        cvmInsCreateStore.sysDiskForm.diskCount = 1
      }
    }
    if (insData.dataDisk && insData.dataDisk.length) {
      const datas = insData.dataDisk
      cvmInsCreateStore.dataDiskFormList = datas.map(el => ({
        tableData: [{ diskType: el.diskTypeId, size: el.size, diskCount: el.diskCount, snapshot: {} }],
        formRef: {},
      }))
    }
    if (insData?.periodNum) {
      cvmInsCreateStore.periodNum = insData.periodNum
    }
    if (insData?.insCount) {
      if (insData.insCount > cvmInsCreateStore.insCountConfig.max) {
        cvmInsCreateStore.insCountConfig.num = cvmInsCreateStore.insCountConfig.max
      } else if (insData.insCount < cvmInsCreateStore.insCountConfig.min) {
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
    const pageWrapDom = document.getElementById('page-wrap')
    if (pageWrapDom) {
      pageWrapDom.scrollTop = 0
    }
  },
)

onBeforeMount(async () => {
  try {
    const isInitStr = route.query.isInit as string
    const isInit = isInitStr === 'true'

    if (isDefaultCreate) {
      if (isInit) {
        cvmInsCreateStore.tab = 2
        const fastState = initStateFast()
        fastState.region.id = cvmStore.areaSelect.id
        fastState.region.locationId = cvmStore.areaSelect.locationId
        cvmInsFastCreateStore.setState(fastState)

        const customState = initStateCustom()
        customState.region.id = cvmStore.areaSelect.id
        customState.region.locationId = cvmStore.areaSelect.locationId
        cvmInsCreateStore.setState(customState)
      }
    } else {
      if (isInit) {
        const customState = initStateCustom()
        cvmInsCreateStore.setState(customState)

        const entry = route.query.entry as string

        switch (entry) {
          case 'insSameConfig':
            await listInstanceDetailFn()
            await getSpecificationsListFn()
            break

          case 'imageCreateIns':
            imageCreateInsInit()
            break

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

    replaceRoute({
      name: 'ins_create',
      query: {
        isDefaultCreate: isDefaultCreate ? 'true' : 'false',
      },
    })
  } catch (error) {
    console.log(error)
  } finally {
    initEnd.value = true
  }
})
</script>

<style scoped lang="scss">
.cvm-ins-create-v2 {
  min-height: 100%;
  padding: 16px 56px 140px;
  background: #fff;
}

.cvm-ins-create-v2__title {
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  line-height: 28px;
  color: #101828;
}

.cvm-ins-create-v2__tabs {
  margin-bottom: 24px;

  :deep(.tabs) {
    --cat-tabs-active-color: #1570ef;
  }
}

@media (width <= 900px) {
  .cvm-ins-create-v2 {
    padding: 20px 16px 180px;
  }
}
</style>
