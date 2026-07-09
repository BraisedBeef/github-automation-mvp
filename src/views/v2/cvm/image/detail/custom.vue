<template>
  <div class="cvm-image-custom-detail-v2">
    <section class="cvm-image-custom-detail-v2__header">
      <PageBreadcrumbToolbar
        :items="[t('image.detail.backTitle'), detail.insId || '-', `(${detail.imageName || '-'})`]"
        @doc="openHelpDoc"
      >
        <template #right>
          <div class="cvm-image-custom-detail-v2__actions">
            <el-button
              v-if="checkPermission(permMap.image.IMAGE_CREATE_VM)"
              type="primary"
              :disabled="!isCreateIns(detail.state)"
              @click="changeShow(createInsRef)"
            >
              {{ t('image.detail.createIns') }}
            </el-button>
            <el-button
              v-if="checkPermission(permMap.image.SET_IMAGE_NAME)"
              :disabled="!isModify(detail.state)"
              @click="changeShow(modifyImageRef)"
            >
              {{ t('image.detail.modify') }}
            </el-button>
            <el-button
              v-if="checkPermission(permMap.image.IMAGE_DELETE_CUSTOMIZE_VM)"
              :disabled="!isDelete(detail.state)"
              @click="changeShow(deleteImageRef)"
            >
              {{ t('image.detail.delete') }}
            </el-button>
          </div>
        </template>
      </PageBreadcrumbToolbar>

      <section class="cvm-image-custom-detail-v2__tabs">
        <CatTabs v-model="active" class="cvm-image-custom-detail-v2__tabs-inner" :tabs="tabs" @change="() => {}" />
      </section>
    </section>

    <section class="cvm-image-custom-detail-v2__content">
      <section class="cvm-image-custom-detail-v2__card">
        <h3 class="cvm-image-custom-detail-v2__title">
          {{ t('image.detail.imageInfo') }}
        </h3>

        <div class="cvm-image-custom-detail-v2__grid">
          <div class="cvm-image-custom-detail-v2__field">
            <div class="cvm-image-custom-detail-v2__label">
              {{ t('image.detail.imageName') }}
            </div>
            <div class="cvm-image-custom-detail-v2__value">
              {{ detail.imageName || '-' }}
            </div>
          </div>

          <div class="cvm-image-custom-detail-v2__field">
            <div class="cvm-image-custom-detail-v2__label">
              {{ t('image.detail.id') }}
            </div>
            <div class="cvm-image-custom-detail-v2__value">
              {{ detail.insId || '-' }}
            </div>
          </div>

          <div class="cvm-image-custom-detail-v2__field">
            <div class="cvm-image-custom-detail-v2__label">
              {{ t('image.detail.state') }}
            </div>
            <div class="cvm-image-custom-detail-v2__value">
              {{ IMAGE_STATE_MAP[detail.state] || '-' }}
            </div>
          </div>

          <div class="cvm-image-custom-detail-v2__field">
            <div class="cvm-image-custom-detail-v2__label">
              {{ t('image.detail.type') }}
            </div>
            <div class="cvm-image-custom-detail-v2__value">
              {{ IMAGE_TYPE_MAP[2] }}
            </div>
          </div>

          <div class="cvm-image-custom-detail-v2__field">
            <div class="cvm-image-custom-detail-v2__label">
              {{ t('image.detail.sys') }}
            </div>
            <div class="cvm-image-custom-detail-v2__value">
              {{ detail.osName || '-' }}
            </div>
          </div>

          <div class="cvm-image-custom-detail-v2__field">
            <div class="cvm-image-custom-detail-v2__label">
              {{ t('image.detail.user') }}
            </div>
            <div class="cvm-image-custom-detail-v2__value">
              {{ detail.createUserName || '-' }}
            </div>
          </div>

          <div class="cvm-image-custom-detail-v2__field">
            <div class="cvm-image-custom-detail-v2__label">
              {{ t('image.detail.imageData') }}
            </div>
            <div class="cvm-image-custom-detail-v2__value">
              {{ t('image.detail.sysDisk') }}
            </div>
          </div>

          <div class="cvm-image-custom-detail-v2__field">
            <div class="cvm-image-custom-detail-v2__label">
              {{ t('image.detail.size') }}
            </div>
            <div class="cvm-image-custom-detail-v2__value">{{ detail.minDisk ?? 0 }}GiB</div>
          </div>

          <div class="cvm-image-custom-detail-v2__field">
            <div class="cvm-image-custom-detail-v2__label cvm-image-custom-detail-v2__label--with-tip">
              <span>{{ t('image.detail.createTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
            <div class="cvm-image-custom-detail-v2__value">
              {{ detail.createTime ? maoYunDayJs(detail.createTime).format(FORMAT_TIME) : '-' }}
            </div>
          </div>

          <div class="cvm-image-custom-detail-v2__field">
            <div class="cvm-image-custom-detail-v2__label">
              {{ t('image.detail.imageDesc') }}
            </div>
            <div class="cvm-image-custom-detail-v2__value">
              {{ detail.description || '-' }}
            </div>
          </div>
        </div>
      </section>
    </section>

    <CreateIns ref="createInsRef" :image-list="[detail]" @success="getImageInfo" />
    <DeleteImage ref="deleteImageRef" :image-list="[detail]" @success="backRoute()" />
    <ModifyImage ref="modifyImageRef" :image-list="[detail]" @success="getImageInfo" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useCvmStore } from '@/store'
import CreateIns from '@/views/cvm/image/list/components/create-ins.vue'
import DeleteImage from '@/views/cvm/image/list/components/delete-image.vue'
import ModifyImage from '@/views/cvm/image/list/components/modify-image.vue'
import { _getImageInfo } from '@/apis/cvm/image'
import { IMAGE_STATE_MAP, IMAGE_TYPE_MAP, isCreateIns, isDelete, isModify } from '@/views/cvm/image/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import { documentUrl } from '@/config/base-config'
import { backRoute } from '@/utils/router-jump'

const route = useRoute()
const id = ref<string>(route.params.id as string)
const active = ref(1)
const tabs = [{ label: t('image.detail.base'), value: 1 }]
const detail = ref<any>({})
const loading = ref(false)

const createInsRef = ref<InstanceType<typeof CreateIns>>()
const deleteImageRef = ref<InstanceType<typeof DeleteImage>>()
const modifyImageRef = ref<InstanceType<typeof ModifyImage>>()

const cvmStore = useCvmStore()
const permConfig = reactive({
  moduleId: moduleMap.image,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

const getImageInfo = async () => {
  try {
    loading.value = true
    const res = await _getImageInfo({
      imageId: id.value,
    })

    if (res.success) {
      detail.value = res.data || {}
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getImageInfo()
})
</script>

<style scoped lang="scss">
.cvm-image-custom-detail-v2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cvm-image-custom-detail-v2__header {
  display: flex;
  flex-direction: column;
  background: #fff;
}

.cvm-image-custom-detail-v2__actions {
  display: inline-flex;
  gap: 12px;
  align-items: center;
}

.cvm-image-custom-detail-v2__tabs {
  margin-top: -1px;
}

.cvm-image-custom-detail-v2__tabs-inner {
  :deep(.cat-tabs__header) {
    border-bottom-color: transparent;
  }
}

.cvm-image-custom-detail-v2__card {
  padding: 24px;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.cvm-image-custom-detail-v2__title {
  margin: 0 0 24px;
  font-size: 16px;
  font-weight: 600;
  line-height: 28px;
  color: #191c23;
}

.cvm-image-custom-detail-v2__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
  max-width: 720px;
}

.cvm-image-custom-detail-v2__field {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr);
  gap: 0;
  align-items: start;
}

.cvm-image-custom-detail-v2__label {
  font-size: 14px;
  line-height: 22px;
  color: #a0a8b8;
}

.cvm-image-custom-detail-v2__label--with-tip {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.cvm-image-custom-detail-v2__value {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  word-break: break-word;
}

@media (width <= 768px) {
  .cvm-image-custom-detail-v2__card {
    padding: 16px;
  }

  .cvm-image-custom-detail-v2__field {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>
