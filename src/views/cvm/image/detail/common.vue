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
                <!-- 镜像描述-->
                <div class="item mb20">
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
                    {{ IMAGE_TYPE_MAP[1] }}
                  </div>
                </div>
                <div class="item mb20">
                  <div class="value">
                    {{ detail.osName }}
                  </div>
                </div>
                <div class="item mb20">
                  <div class="value">
                    {{ detail.description || '-' }}
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 创建实例 -->
    <CreateIns ref="createInsRef" :image-list="[detail]" @success="getImageInfo" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useTempStore, useCvmStore } from '@/store'
import CreateIns from '../list/components/create-ins.vue'
import { _getImageInfo } from '@/apis/cvm/image'
import { IMAGE_STATE_MAP, IMAGE_TYPE_MAP, isCreateIns } from '@/views/cvm/image/config'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'

/**
 * @desc 快照和镜像暂时没有绑定关系
 */
const route = useRoute()

const bodyStyle = { height: '100%' }
const active = ref(1)
const tabs = [
  { label: t('image.detail.base'), value: 1 }, // 基本信息
]

const id = ref<string>(route.params.id as string) // id
const detail = ref<any>({}) // 详情
const loading = ref<boolean>(false)

const createInsRef = ref<InstanceType<typeof CreateIns>>() // 创建实例

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
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const nameInputRef = ref<any>(null)
const editLoading = ref<boolean>(false)

// 取消编辑
const cancelRowNameFn = () => {
  editLoading.value = false
  nameInputRef.value.show = false
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
</style>
