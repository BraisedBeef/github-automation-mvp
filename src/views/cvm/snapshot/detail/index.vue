<template>
  <div>
    <PageHeader :title="title" :back-title="t('snapshot.detail.backTitle')" back-name="snapshot">
      <template #right>
        <div class="btn-wrap pd0-20">
          <!-- 回滚 -->
          <el-button
            v-if="checkPermission(permMap.snapshot.ROLLBACK_SNAPSHOT)"
            :disabled="!isRollBack(detail.state)"
            @click="changeShow(rollBackRef)"
          >
            {{ t('snapshot.detail.rollBack') }}
          </el-button>
          <!-- 删除 -->
          <el-button
            v-if="checkPermission(permMap.snapshot.EXPUNGE_SNAPSHOT)"
            :disabled="!isDelete(detail.state)"
            @click="changeShow(deleteRef)"
          >
            {{ t('snapshot.detail.delete') }}
          </el-button>
          <!-- 新建云硬盘 -->
          <el-button
            v-if="checkPermission(permMap.snapshot.CREATE_HD_FROM_SNAPSHOT)"
            :disabled="!isCreateDisk(detail.state, detail.diskType)"
            @click="createDisk"
          >
            {{ t('snapshot.detail.createDisk') }}
          </el-button>
          <!-- 新建自定义镜像 -->
          <!-- <el-button :disabled="false" @click="changeShow(createCustomImageRef)">{{ t('新建自定义镜像') }}</el-button> -->
        </div>
      </template>
    </PageHeader>

    <div class="df jsb ac tabs-wrap">
      <!-- tabs -->
      <div class="df">
        <CatTabs v-model="active" class="tabs" :tabs="tabs" @change="() => {}" />
      </div>
    </div>

    <div style="padding: 20px">
      <el-card shadow="never" class="page-box mb20" :body-style="bodyStyle">
        <div class="tit mb20">
          {{ t('snapshot.detail.info') }}
        </div>
        <table class="detail-wrap mb20 w-full">
          <tbody>
            <tr>
              <td class="pr20">
                <!-- 地域-->
                <div class="item mb20">
                  <div class="key-wrap">
                    {{ t('snapshot.detail.region') }}
                  </div>
                </div>
              </td>
              <td class="pr20 w-50">
                <div class="item mb20">
                  <div class="value">
                    {{ detail.regionName || '-' }}
                  </div>
                </div>
              </td>
              <td class="pr20">
                <!-- 磁盘属性 -->
                <div class="item mb20">
                  <div class="key-wrap">
                    {{ t('snapshot.detail.diskType') }}
                  </div>
                </div>
              </td>
              <td class="w-50">
                <div class="item mb20">
                  <div class="value">
                    {{ DISK_TYPE_MAP[detail.diskType] || '-' }}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="pr20">
                <!-- 硬盘挂载实例  -->
                <div class="item mb20">
                  <div class="key-wrap">
                    {{ t('snapshot.detail.diskMountIns') }}
                  </div>
                </div>
              </td>
              <td class="pr20 w-50">
                <div class="item mb20">
                  <div class="value">
                    {{ detail.insUuid || '-' }}
                  </div>
                </div>
              </td>
              <td class="pr20">
                <!-- 关联硬盘 -->
                <div class="item mb20">
                  <div class="key-wrap">
                    {{ t('snapshot.detail.bindDisk') }}
                  </div>
                </div>
              </td>
              <td class="w-50">
                <div class="item mb20">
                  <div class="value">
                    {{ detail.diskName || '-' }}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="pr20">
                <!-- 创建时间  -->
                <div class="item">
                  <div class="key-wrap df ac">
                    <span> {{ t('snapshot.detail.createTime') }} </span
                    ><el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                      <SvgIcon name="cat-cdn-help" class="ml10" />
                    </el-tooltip>
                  </div>
                </div>
              </td>
              <td>
                <div class="item">
                  <div class="value">
                    {{ detail.createTime ? maoYunDayJs(detail.createTime).format(FORMAT_TIME) : '-' }}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- <el-row class="detail-wrap mb20 w-full">
          <el-col :span="12"> -->
        <!-- 镜像名称 -->
        <!-- <div class="item df ac" :class="editInputRef?.show ? 'mb13 mt-negative-6' : 'mb20'">
              <div class="key-wrap">
                <span>{{ '镜像名称' }}</span>
              </div>
              <div class="value">
                <EditInput ref="editInputRef" :modelValue="imageName" @confirm="()=>{}" />
              </div>
            </div> -->
        <!-- 镜像ID -->
        <!-- <div class="item mb20 df">
              <div class="key-wrap">
                <span>{{ '镜像ID' }}</span>
              </div>
              <div class="value">{{ '-' }}</div>
            </div> -->
        <!-- 类型-->
        <!-- <div class="item mb20 df">
              <div class="key-wrap">
                <span>{{ '类型' }}</span>
              </div>
              <div class="value">{{ '-' }}</div>
            </div> -->
        <!-- </el-col>
          <el-col :span="12">
          </el-col>
        </el-row> -->
      </el-card>

      <!-- <el-card shadow="never" class="page-box" :body-style="bodyStyle">
        <div class="tit mb20">{{ '关联镜像' }}</div>
        <el-table :data="list" v-loading="loading" class="mt20 mb20 table" >
          <el-table-column min-width="200" :label="t('ID')">
            <template #default="{ row }">
              <div class="text-primary">ID</div>
            </template>
          </el-table-column>
          <el-table-column min-width="200" :label="t('名称')">
            <template #default="{ row }">
              <div class="df ac"><span>名称</span></div>
            </template>
          </el-table-column>
        </el-table>
      </el-card> -->
    </div>

    <!-- 回滚 -->
    <RollBack ref="rollBackRef" :snapshot-list="[detail]" @success="getDetail" />
    <!-- 删除 -->
    <Delete ref="deleteRef" :snapshot-list="[detail]" @success="getDetail" />
    <!-- 创建自定义镜像 -->
    <!-- <CreateCustomImage ref="createCustomImageRef" :snapshotList="[detail]" @success="getDetail" /> -->
    <!-- 创建硬盘 -->
    <CreateDisk ref="createDiskRef" :snapshot-create-config="snapshotCreateConfig" @success="getDetail" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useTempStore, useCvmStore } from '@/store'
import RollBack from '../list/components/roll-back.vue'
import Delete from '../list/components/delete.vue'
// import CreateCustomImage from '../list/components/create-custom-image.vue'
import { _getDetail } from '@/apis/cvm/snapshot'
import { DISK_TYPE_MAP } from '@/views/cvm/disk/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import CreateDisk from '@/views/cvm/disk/list/components/create-disk.vue'
import { isDelete, isRollBack, isCreateDisk } from '@/views/cvm/snapshot/config'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'

/**
 * @desc 快照和镜像暂时没有绑定关系
 */
const bodyStyle = { height: '100%' }

const route = useRoute()

const id = ref<string>(route.params.id as string) // id
// const list = ref<any[]>([]) // 镜像列表
const active = ref(1)
const tabs = [
  { label: t('snapshot.detail.base'), value: 1 }, // 基本信息
]
const detail = ref<any>({}) // 详情
const loading = ref<boolean>(false)
// const imageName = ref<string>('') // 修改镜像昵称

// 快照创建云硬盘
const snapshotCreateConfig = reactive<{
  checkSnapshot: boolean
  snapshotId?: string
  snapshotName?: string
}>({
  checkSnapshot: false, // 是否快速创建
  snapshotId: '', // 快照id
  snapshotName: '', // 快照名称
})

// const editInputRef = ref<any>(null)
const rollBackRef = ref<InstanceType<typeof RollBack>>() // 回滚
const deleteRef = ref<InstanceType<typeof Delete>>() // 删除
// const createCustomImageRef = ref<InstanceType<typeof CreateCustomImage>>() // 创建自定义镜像
const createDiskRef = ref<InstanceType<typeof CreateDisk>>() // 创建硬盘

const cvmStore = useCvmStore()
// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.snapshot,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const title = computed(() => {
  return `${detail.value.snapshotId || '-'}(${detail.value.name || '-'})`
})

// 创建云硬盘
const createDisk = (row: any) => {
  snapshotCreateConfig.checkSnapshot = true
  snapshotCreateConfig.snapshotId = row.snapshotId
  snapshotCreateConfig.snapshotName = row.name

  changeShow(createDiskRef.value)
}

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return

  ins.show = true
}

// 快照详情
const getDetail = async () => {
  try {
    loading.value = true

    const res = await _getDetail({
      id: id.value,
    })

    console.log(`_getDetail===>`, res)

    if (res.success) {
      detail.value = res.data || {}
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  useTempStore().setPageHeader(false)
  getDetail()
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
.tabs-wrap {
  /* margin-left: -20px; */

  /* width: calc(100% + 40px); */

  /* margin-top: -20px; */
  box-sizing: border-box;
  background: #fff;

  :deep(.cat-tabs__header) {
    /* padding-left: 8px; */
    border-color: transparent;
  }
}

.tit {
  font-family: PingFangSC, 'PingFang SC';

  // font-weight: 500;
  font-size: 16px;
  line-height: 22px;
  color: #000;
}

.detail-wrap {
  /* margin-top: 40px; */

  /* margin-bottom: 40px; */
  .list-left {
    margin-right: 20px;
  }

  .item {
    .key-wrap {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #999;
      white-space: nowrap;
    }

    .value {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--primary-text);
      overflow-wrap: break-word; /* 在必要时单词内部断行 */
      overflow-wrap: anywhere;
      white-space: normal; /* 允许换行 */
    }
  }
}

.mb13 {
  margin-bottom: 13px;
}

.mt-negative-6 {
  margin-top: -6.5px;
}

.pr20 {
  padding-right: 20px;
}

.w-50 {
  width: 50%;
}
</style>
