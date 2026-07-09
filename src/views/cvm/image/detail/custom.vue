<template>
  <div>
    <PageHeader :title="title" :back-title="t('image.detail.backTitle')" back-name="image">
      <template #right>
        <div class="btn-wrap pd0-20">
          <!-- 创建实例 -->
          <el-button
            v-if="checkPermission(permMap.image.IMAGE_CREATE_VM)"
            :type="isCreateIns(detail.state) ? 'primary' : ''"
            :disabled="!isCreateIns(detail.state)"
            @click="changeShow(createInsRef)"
          >
            {{ t('image.detail.createIns') }}
          </el-button>
          <!-- 修改 -->
          <el-button
            v-if="checkPermission(permMap.image.SET_IMAGE_NAME)"
            :disabled="!isModify(detail.state)"
            @click="changeShow(modifyImageRef)"
          >
            {{ t('image.detail.modify') }}
          </el-button>
          <!-- 删除 -->
          <el-button
            v-if="checkPermission(permMap.image.IMAGE_DELETE_CUSTOMIZE_VM)"
            :disabled="!isDelete(detail.state)"
            @click="changeShow(deleteImageRef)"
          >
            {{ t('image.detail.delete') }}
          </el-button>
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
      <!-- 基本信息 -->
      <el-card v-if="active === 1" v-loading="loading" shadow="never" class="page-box mb20" :body-style="bodyStyle">
        <div class="tit mb20">
          {{ t('image.detail.imageInfo') }}
        </div>

        <el-row class="detail-wrap mb20 w-full">
          <el-col :span="24">
            <div class="df">
              <div class="detail-wrap-left">
                <!-- 镜像名称 -->
                <div class="item mb20">
                  <div class="key-wrap">
                    {{ t('image.detail.imageName') }}
                  </div>
                </div>
                <!-- 镜像ID -->
                <div class="item mb20">
                  <div class="key-wrap">
                    {{ t('image.detail.id') }}
                  </div>
                </div>
                <!-- 状态-->
                <div class="item mb20">
                  <div class="key-wrap">
                    {{ t('image.detail.state') }}
                  </div>
                </div>
                <!-- 类型-->
                <div class="item mb20">
                  <div class="key-wrap">
                    {{ t('image.detail.type') }}
                  </div>
                </div>
                <!-- 操作系统-->
                <div class="item mb20">
                  <div class="key-wrap">
                    {{ t('image.detail.sys') }}
                  </div>
                </div>
                <!-- 创建者-->
                <div class="item mb20">
                  <div class="key-wrap">
                    {{ t('image.detail.user') }}
                  </div>
                </div>
                <!-- 镜像包含数据-->
                <div class="item mb20">
                  <div class="key-wrap">
                    {{ t('image.detail.imageData') }}
                  </div>
                </div>
                <!-- 镜像硬盘大小-->
                <div class="item mb20">
                  <div class="key-wrap">
                    {{ t('image.detail.size') }}
                  </div>
                </div>
                <!-- 创建时间-->
                <div class="item mb20">
                  <div class="key-wrap df ac">
                    <span class="mr10">{{ t('image.detail.createTime') }}</span>
                    <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                      <SvgIcon name="cat-cdn-help" />
                    </el-tooltip>
                  </div>
                </div>
                <!-- 镜像描述-->
                <div class="item">
                  <div class="key-wrap">
                    {{ t('image.detail.imageDesc') }}
                  </div>
                </div>
              </div>
              <div class="detail-wrap-right">
                <div class="item mb20">
                  <div class="value">
                    {{ detail.imageName }}
                  </div>
                </div>
                <div class="item mb20">
                  <div class="value">
                    {{ detail.insId }}
                  </div>
                </div>
                <div class="item mb20">
                  <div class="value">
                    {{ IMAGE_STATE_MAP[detail.state] }}
                  </div>
                </div>
                <div class="item mb20">
                  <div class="value">
                    {{ IMAGE_TYPE_MAP[2] }}
                  </div>
                </div>
                <div class="item mb20">
                  <div class="value">
                    {{ detail.osName }}
                  </div>
                </div>
                <div class="item mb20">
                  <div class="value">
                    {{ detail.createUserName }}
                  </div>
                </div>
                <div class="item mb20">
                  <div class="value">
                    {{ t('image.detail.sysDisk') }}
                  </div>
                </div>
                <div class="item mb20">
                  <div class="value">{{ detail.minDisk }}GiB</div>
                </div>
                <div class="item mb20">
                  <div class="value">
                    {{ detail.createTime ? maoYunDayJs(detail.createTime).format(FORMAT_TIME) : '-' }}
                  </div>
                </div>
                <div class="item" :class="nameInputRef?.show ? 'mt-negative-6' : ''">
                  <!-- <div class="value">{{ detail.description || '-' }}</div> -->
                  <EditInput
                    ref="nameInputRef"
                    v-model="editDescription"
                    v-loading="editLoading"
                    :show-edit-icon="checkPermission(permMap.image.SET_IMAGE_NAME) as boolean"
                    :rules="rules"
                    :cancel-fn="cancelRowNameFn"
                    :confirm-text="t('general.confirm')"
                    input-style="max-width: 380px;width: 380px"
                    :max-length="256"
                    @confirm="confirmRowNameFn"
                  />
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
      <!-- 关联快照 -->
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
          <el-table-column min-width="200" :label="t('属性')">
            <template #default="{ row }">
              <div class="df ac"><span>属性</span></div>
            </template>
          </el-table-column>
          <el-table-column min-width="200" :label="t('大小')">
            <template #default="{ row }">
              <div class="df ac"><span>大小</span></div>
            </template>
          </el-table-column>
        </el-table>
      </el-card> -->
    </div>

    <!-- 创建实例 -->
    <CreateIns ref="createInsRef" :image-list="[detail]" @success="getImageInfo" />
    <!-- 删除自定义镜像 -->
    <DeleteImage ref="deleteImageRef" :image-list="[detail]" @success="backRoute()" />
    <!-- 修改自定义镜像 -->
    <ModifyImage ref="modifyImageRef" :image-list="[detail]" @success="getImageInfo" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useTempStore, useCvmStore } from '@/store'
import CreateIns from '../list/components/create-ins.vue'
import DeleteImage from '../list/components/delete-image.vue'
import ModifyImage from '../list/components/modify-image.vue'
import { _getImageInfo } from '@/apis/cvm/image'
import { IMAGE_STATE_MAP, IMAGE_TYPE_MAP, isCreateIns, isDelete, isModify } from '@/views/cvm/image/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { _updateImageInfo } from '@/apis/cvm/image'
import { UpdateImageInfoReq } from '@/apis/cvm/image/type'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { backRoute } from '@/utils/router-jump'

/**
 * @desc 快照和镜像暂时没有绑定关系
 */
const route = useRoute()
const router = useRouter()

const bodyStyle = { height: '100%' }
const rules = { inputValue: [{ required: true, message: '', trigger: 'blur' }] }
// const list = ref<any[]>([]) // 列表
const active = ref(1)
const tabs = [
  { label: t('image.detail.base'), value: 1 }, // 基本信息
  // { label: '关联快照', value: 2 }, // 关联快照
]
const editDescription = ref<string>('') // 硬盘名称
const id = ref<string>(route.params.id as string) // id
const detail = ref<any>({}) // 详情
const loading = ref<boolean>(false)

const createInsRef = ref<InstanceType<typeof CreateIns>>() // 创建实例
const deleteImageRef = ref<InstanceType<typeof DeleteImage>>() // 删除镜像
const modifyImageRef = ref<InstanceType<typeof ModifyImage>>() // 修改镜像

const cvmStore = useCvmStore()
// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.sshKey,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const title = computed(() => {
  return `${detail.value.insId || '-'}(${detail.value.imageName || '-'})`
})

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return

  ins.show = true
}

// 获取镜像详情
const getImageInfo = async () => {
  try {
    loading.value = true
    const res = await _getImageInfo({
      imageId: id.value,
    })
    console.log(`_getImageInfo===>`, res)
    if (res.success) {
      detail.value = res.data || {}
      editDescription.value = res.data?.description
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const nameInputRef = ref<any>(null)
const editLoading = ref<boolean>(false)
// 修改镜像描述
const confirmRowNameFn = async () => {
  try {
    const params = {
      imageId: id.value,
      imageName: detail.value.imageName,
      description: editDescription.value,
    }
    editLoading.value = true
    await _updateImageInfo(params as UpdateImageInfoReq)
    getImageInfo()
  } catch (err) {
    console.log(err)
  } finally {
    cancelRowNameFn()
  }
}

// 取消编辑
const cancelRowNameFn = () => {
  editLoading.value = false
  nameInputRef.value.show = false
  editDescription.value = detail.value.description
}

onMounted(async () => {
  useTempStore().setPageHeader(false)
  getImageInfo()
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
  .detail-wrap-left {
    margin-right: 20px;
  }

  .item {
    .key-wrap {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #999;
    }

    .value {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--primary-text);
    }
  }
}

.mt-negative-6 {
  margin-top: -6px;
}
</style>
