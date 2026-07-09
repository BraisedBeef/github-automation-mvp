<template>
  <div class="oss-file-list-v2 page-box">
    <div class="oss-file-list-v2__toolbar">
      <div class="oss-file-list-v2__actions">
        <!-- 新建 -->
        <el-button type="primary" @click="updataFileFn">
          <SvgIcon name="cat-cdn-upload" />
          {{ $t('oss.fileList.uploadFile') }}
        </el-button>
        <el-button @click="((createFolderDialog = true), (folder.name = ''))">
          {{ $t('oss.fileList.createFolder') }}
        </el-button>
        <template v-if="ossStore.folders.length === 0">
          <el-badge is-dot :hidden="!showFragmentManagementDot">
            <el-button @click="fileFragmentationDialog = true">
              {{ $t('oss.fileList.fragmentManagement') }}
            </el-button>
          </el-badge>
          <el-button @click="clearBucketDialog = true">
            {{ $t('oss.fileList.clearBucket') }}
          </el-button>
        </template>
        <!-- 更多操作 -->
        <Select
          class="oss-file-list-v2__more"
          :list="[
            { label: $t('oss.delete'), value: 'delete', disabled: !isSelect },
            { label: $t('oss.s6.copyFile'), value: 'copy', disabled: !isSelect },
            { label: $t('oss.s6.pasteFile'), value: 'paste', disabled: !isPaste },
            { label: $t('oss.fileList.modifyAccessPermission'), value: 'access', disabled: !isSelect },
            { label: $t('oss.s6.modifyEncryptionMethod'), value: 'encryption', disabled: !isSelect },
          ]"
          two-menu-align="lt"
          :one-menu-width="moreSelectOneMenuWidth"
          :select-width="moreSelectOneMenuWidth"
          :ph="t('ins.list.more')"
          @opt-click="moreOptClickFn"
        />
      </div>

      <div class="oss-file-list-v2__search-wrap">
        <div class="oss-file-list-v2__search">
          <el-input
            v-model="search.search"
            :placeholder="
              search.searchType === 'prefix' ? t('oss.fileList.searchFileTip') : t('oss.fileList.searchFileTip1')
            "
            @keydown.enter="() => searchFiles()"
          >
            <template #prepend>
              <el-select v-model="search.searchType">
                <el-option :label="t('oss.fileList.prefixSearch')" value="prefix" />
                <el-option :label="t('oss.fileList.fuzzySearch')" value="fuzzy" />
              </el-select>
            </template>
            <template #prefix>
              <SvgIcon class="oss-file-list-v2__search-icon" name="dns-search" @click="searchFiles()" />
            </template>
            <template #suffix>
              <SvgIcon
                v-if="search.search"
                style="cursor: pointer"
                name="transfer-delete"
                @click="search.search = ''"
              />
            </template>
          </el-input>
        </div>
        <CdnIconButton class="oss-file-list-v2__refresh" @click="refresh">
          <SvgIcon name="refresh" />
        </CdnIconButton>
      </div>
    </div>

    <div class="oss-file-list-v2__table">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="getCurrentPageData"
        :max-height="tableHeight"
        @selection-change="handleRowSelectChange"
      >
        <el-table-column type="selection" width="76" />
        <el-table-column min-width="220" :label="t('oss.fileList.fileName')" class-name="file-name-column">
          <template #default="{ row }">
            <div class="df ac" @mouseenter="hoveredRow = row.key" @mouseleave="hoveredRow = null">
              <el-tooltip effect="light" placement="top">
                <template #content>
                  <Copy style="max-width: 90vw" :text="row.type === 'file' ? row.name : row.name + '/'" />
                </template>
                <div v-if="row.type === 'file'" style="padding: 5px" class="flex1 line3">
                  {{ row.name }}
                </div>
                <div v-else class="text-primary pointer mr10" @click="enterFolder(row.key)">
                  <SvgIcon name="storage-folder" class="mr5" />
                  <span>{{ row.name + '/' }}</span>
                </div>
              </el-tooltip>
              <el-tooltip
                effect="light"
                placement="top"
                :content="
                  row.type === 'file'
                    ? t('oss.fileList.renameObject')
                    : t('oss.fileList.virtualDirectoryRenameNotSupported')
                "
              >
                <SvgIcon v-show="hoveredRow === row.key" name="cat-cdn-edit" class="ml10" @click="renameFile(row)" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="100">
          <template #header>
            <div class="df ac">
              <span>{{ t('oss.fileList.fileSize') }}</span>
              <div class="ml10" />
              <SvgIcon
                v-if="_paginationConfig.total < 1000"
                :name="
                  search.sortField === 'size'
                    ? !search.sortOrder
                      ? 'sort'
                      : search.sortOrder === 'asc'
                        ? 'sort-up'
                        : 'sort-down'
                    : 'sort'
                "
                @click="sortOrdersChange('size')"
              />
            </div>
          </template>
          <template #default="{ row }">
            <div class="df ac">
              <div class="flex1">
                {{ row.type === 'file' ? formatFileSize(row.size) : '-' }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          min-width="100"
          :label="t('oss.fileList.StorageType')"
          :formatter="row => (row.type === 'file' ? STORAGE_TYPE[row.storageClass] : '-')"
        />
        <el-table-column min-width="220" :label="t('oss.createTime')">
          <template #header>
            <div class="df ac">
              <span>{{ t('oss.createTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="ml10" />
              </el-tooltip>
              <div class="ml10" />
              <SvgIcon
                v-if="_paginationConfig.total < 1000"
                :name="
                  search.sortField === 'lastModified'
                    ? !search.sortOrder
                      ? 'sort'
                      : search.sortOrder === 'asc'
                        ? 'sort-up'
                        : 'sort-down'
                    : 'sort'
                "
                @click="sortOrdersChange('lastModified')"
              />
            </div>
          </template>
          <template #default="{ row }">
            <div>{{ row.lastModified ? maoYunDayJs(row.lastModified * 1000).format(FORMAT_TIME) : '-' }}</div>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column fixed="right" :width="operationWidth" :label="$t('oss.operation')">
          <template #default="{ row }">
            <div v-if="row.type === 'file'" class="df ac" style="gap: 24px">
              <DisableText :disabled="false" :text="t('oss.fileList.details')" @click="showFileDetail(row)" />
              <DisableText :disabled="false" :text="t('oss.fileList.download')" @click="downloadFileChange(row)" />
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  <div class="more-list df fdc">
                    <el-button @click="deleteFileChange(row)">
                      {{ t('oss.delete') }}
                    </el-button>
                    <el-button @click="changeAccess(row)">
                      {{ t('oss.fileList.modifyAccessPermission') }}
                    </el-button>
                    <el-button @click="copyFileChange(row)">
                      {{ t('oss.s6.copyFile') }}
                    </el-button>
                  </div>
                </template>
                <el-link type="primary">
                  {{ t('more') }}
                  <SvgIcon name="cat-cdn-select-more" class="ml4" />
                </el-link>
              </el-tooltip>
            </div>
            <div v-else class="df ac" style="gap: 24px">
              <DisableText :disabled="false" :text="t('oss.fileList.setPermission')" @click="changeAccess(row)" />
              <DisableText :disabled="false" :text="t('oss.s6.copy')" @click="copyFileChange(row)" />
              <DisableText :disabled="false" :text="t('oss.delete')" @click="deleteFileChange(row)" />
            </div>
          </template>
        </el-table-column>
      </el-table>

      <CatPagination
        v-model:pagination="_paginationConfig"
        class="oss-file-list-v2__pagination"
        :total="_paginationConfig.total"
        :custom-keys="['page', 'pageSize']"
        :page-size="[50, 100, 200]"
        :custom-total="_paginationConfig.total > 999 ? '999+' : _paginationConfig.total"
        @change="paginationChange"
      />
      <!-- <CustomPagination
        v-model:page="_paginationConfig.page"
        v-model:pageSize="_paginationConfig.pageSize"
        :total="_paginationConfig.total"
        :is-truncated="_paginationConfig.isTruncated"
        @change="paginationChange"
      /> -->
    </div>

    <!-- 上传文件 -->
    <UploadDialog v-model:show="uploadDialog" />
    <!-- 清空桶 -->
    <ClearBucket v-model:show="clearBucketDialog" :curr-select-bucket="currSelectBucket" @success="getFileList" />
    <!-- 删除 -->
    <CatDialog
      v-if="delStorageDialog"
      v-model:dialog="delStorageDialog"
      :title="
        delType === 'single'
          ? delFileList[0]?.type === 'file'
            ? $t('oss.fileList.confirmDeleteObject')
            : $t('oss.fileList.confirmDeleteFolder')
          : $t('oss.fileList.confirmDeleteFilesFolders')
      "
      :width="680"
      icon="warn-red"
      :disabled="delFileList.length === 0"
      @confirm="confirmDeleteStorageObject"
    >
      <Tip v-if="delType === 'single'" :text="[{ main: t('oss.fileList.deleteWarning') }]" />

      <Tip
        v-else
        type="OneToMany"
        :text="[
          {
            main: t('oss.fileList.deleteWarningTip1'),
            sub: [t('oss.fileList.deleteWarningTip2'), t('oss.fileList.deleteWarningTip3')],
          },
        ]"
      />

      <el-table
        ref="delFileTableRef"
        :data="delFileList"
        :max-height="delFileTableHeightValue < 200 ? 200 : delFileTableHeightValue"
        tooltip-effect="light"
      >
        <el-table-column
          min-width="220"
          :label="t('oss.fileList.fileName')"
          show-overflow-tooltip
          :popper-class="'line-break'"
        >
          <template #default="{ row }">
            <div class="df ac">
              <div v-if="row.type === 'file'" class="flex1 ellipsis">
                {{ row.name }}
              </div>
              <div v-else class="text-primary pointer mr10">
                <SvgIcon name="storage-folder" class="mr5" />
                <span>{{ row.name }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="220" :label="t('oss.fileList.modifiedTime')">
          <template #default="{ row }">
            <div>{{ row.lastModified ? maoYunDayJs(row.lastModified * 1000).format(FORMAT_TIME) : '-' }}</div>
          </template>
        </el-table-column>
      </el-table>
    </CatDialog>

    <!-- 修改访问权限 -->
    <CatDialog
      v-if="changeAccessDialog"
      v-model:dialog="changeAccessDialog"
      :title="t('oss.fileList.modifyAccessPermission')"
      :width="680"
      @confirm="confirmAccessChange"
    >
      <div class="form-item">
        <p class="label" style="width: 100px">
          {{ t('oss.fileList.publicPermission') }}
        </p>
        <div>
          <el-radio-group v-model="access">
            <el-radio :label="'default'">
              {{ t('oss.fileList.inheritedPermission') }}
            </el-radio>
            <el-radio :label="'private'">
              {{ t('oss.privateReadWrite') }}
            </el-radio>
            <el-radio :label="'public-read'">
              {{ t('oss.publicReadPrivateWrite') }}
            </el-radio>
          </el-radio-group>
          <p v-if="access === 'default'" class="desc">
            {{ t('oss.fileList.inheritedPermissionTip') }}
          </p>
          <p v-else-if="access === 'private'" class="desc">
            <i18n-t keypath="oss.fileList.accessDesc">
              <span style="color: #000"> {{ t('oss.fileList.setAccessPermission') }} </span>
            </i18n-t>
          </p>
          <p v-else class="desc df">
            <el-tag type="danger" class="mr10">
              {{ t('oss.highRisk') }} </el-tag
            >{{ t('oss.fileList.noAuthReadWarning') }}
          </p>
        </div>
      </div>
    </CatDialog>

    <!-- 修改加密方式 -->
    <CatDialog
      v-if="changeEncryptionDialog"
      v-model:dialog="changeEncryptionDialog"
      :title="t('oss.s6.modifyEncryptionMethod')"
      :width="680"
      @confirm="confirmEncryptionChange"
    >
      <div class="form-item">
        <p class="label" style="width: 100px">
          {{ t('oss.fileList.publicPermission') }}
        </p>
        <div>
          <el-radio-group v-model="encryption">
            <el-radio label="default" :disabled="currSelectBucket?.sseAlgorithm === 'AES256'">
              {{ t('oss.noEncryption') }}
            </el-radio>
            <el-radio :label="'AES256'">
              <div class="df ac">
                {{ t('oss.sseCosEncryption') }}
                <el-tooltip :content="t('oss.sseCosEncryptionTip')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="ml10" />
                </el-tooltip>
              </div>
            </el-radio>
          </el-radio-group>
          <p v-if="currSelectBucket?.sseAlgorithm === 'AES256'" class="desc">
            {{ t('oss.s6.sseOssEncrypted') }}
          </p>
        </div>
      </div>
    </CatDialog>
    <!-- 创建文件夹 -->
    <CatDialog
      v-if="createFolderDialog"
      v-model:dialog="createFolderDialog"
      :title="t('oss.fileList.createNewFolder')"
      :width="680"
      :disabled="!folder.name || !folderFormValid"
      @confirm="createFolder"
    >
      <div style="width: 60%">
        <el-form ref="folderFormRef" :model="folder" class="create-oss-form" label-width="auto" label-position="left">
          <el-form-item
            prop="name"
            :rules="[
              {
                validator: (rule, value, callback) => {
                  // 检查是否为空
                  if (!value) {
                    callback(new Error(t('oss.fileList.createNewFolderRuleTip1')))
                    return
                  }
                  // 检查是否以 / 开头
                  if (value.startsWith('/')) {
                    callback(new Error(t('oss.fileList.createNewFolderRuleTip2')))
                    return
                  }
                  // 检查是否包含连续的 /
                  if (value.includes('//')) {
                    callback(new Error(t('oss.fileList.createNewFolderRuleTip3')))
                    return
                  }
                  // 检查是否包含 .. 作为文件夹名称
                  const folders = value.split('/')
                  if (folders.some(folder => folder === '..')) {
                    callback(new Error(t('oss.fileList.createNewFolderRuleTip4')))
                    return
                  }
                  // 检查是否包含合法字符
                  const validPattern = /^[a-zA-Z0-9\u4e00-\u9fa5\-_./]+$/
                  if (!validPattern.test(value)) {
                    callback(new Error(t('oss.fileList.createNewFolderRuleTip5')))
                    return
                  }
                  callback()
                },
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <template #label>
              <p class="label">
                {{ t('oss.fileList.folderName') }} <span style="color: #f53f3f">*</span>
                <el-tooltip effect="light" placement="bottom">
                  <template #content>
                    <div>
                      <p>{{ t('oss.fileList.folderNameTip1') }}</p>
                      <p>{{ t('oss.fileList.folderNameTip2') }}</p>
                      <p>{{ t('oss.fileList.folderNameTip3') }}</p>
                      <p>{{ t('oss.fileList.folderNameTip4') }}</p>
                    </div>
                  </template>
                  <SvgIcon name="cat-cdn-help" class="ml4" />
                </el-tooltip>
              </p>
            </template>
            <el-input
              v-model="folder.name"
              :placeholder="t('oss.fileList.enterFolderName')"
              style="width: 100%"
              @keydown.enter.prevent
            />
          </el-form-item>
        </el-form>
      </div>
    </CatDialog>

    <!-- 碎片管理 -->
    <FileFragmentation
      v-model:show="fileFragmentationDialog"
      :curr-select-bucket="currSelectBucket"
      @delete-success="getFragmentationList"
    />

    <!-- 重命名文件 -->
    <CatDialog
      v-if="renameFileDialog"
      v-model:dialog="renameFileDialog"
      :title="t('oss.fileList.renameObject')"
      :width="500"
      icon="warn-red"
    >
      <p style="margin-bottom: 8px; color: #555; overflow-wrap: break-word">
        {{ t('oss.fileList.renameObjectTip', [currSelectObject.name]) }}
      </p>
      <!-- 输入框校验 -->
      <el-form :model="rename" class="create-oss-form" label-width="auto" label-position="left">
        <el-form-item prop="name" :rules="[{ validator: validateObjectName, trigger: 'blur' }]">
          <el-input
            v-model="rename.name"
            :placeholder="t('oss.fileList.fileNameCannotContainSlash')"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="cat-dialog-footer">
          <el-button :disabled="!isCanRename" type="primary" class="mb20" @click="renameStorageObject">
            {{ t('oss.confirm') }}
          </el-button>
          <el-button class="mb20" @click="((renameFileDialog = false), (isCanRename = false))">
            {{ t('oss.cancel') }}
          </el-button>
        </div>
      </template>
    </CatDialog>

    <!-- 存在同名的弹窗 -->
    <CatDialog
      v-if="sameNameFileDialog"
      v-model:dialog="sameNameFileDialog"
      :title="t('oss.fileList.sameFileNameExists')"
      :width="500"
      icon="warn-red"
    >
      <i18n-t keypath="oss.fileList.confirmRenameDesc">
        <span style="color: #000"> {{ rename.name }} </span>
      </i18n-t>

      <template #footer>
        <div class="cat-dialog-footer">
          <el-button :disabled="!isCanRename" type="primary" class="mb20" @click="confirmRenameFile">
            {{ t('oss.confirm') }}
          </el-button>
          <el-button class="mb20" @click="((sameNameFileDialog = false), (renameFileDialog = true))">
            {{ t('oss.cancel') }}
          </el-button>
        </div>
      </template>
    </CatDialog>

    <!-- 文件详情 -->
    <FileDetail
      v-model:show="fileDetailDialog"
      :file-info="{
        bucketName: currSelectBucket.name,
        region: currSelectBucket.region,
        objectKey: currSelectObject?.key,
        objectName: currSelectObject?.name,
      }"
    />

    <!-- 复制文件 -->
    <CatDialog v-if="copyFileDialog" v-model:dialog="copyFileDialog" :title="t('oss.s6.copyFile')" :width="600">
      <Tip theme="warning" :text="[{ main: t('oss.s6.confirmCopy', [copyFileNum]) }]" />

      <el-table
        ref="copyFileTableRef"
        :data="confirmCopyFiles"
        :max-height="copyFileTableHeightValue < 200 ? 200 : copyFileTableHeightValue"
        tooltip-effect="light"
      >
        <el-table-column min-width="220" :label="t('oss.fileList.fileName')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="df ac">
              <div v-if="row.type === 'file'" class="flex1">
                {{ row.name }}
              </div>
              <div v-else class="text-primary pointer mr10">
                <SvgIcon name="storage-folder" class="mr5" />
                <span>{{ row.name }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="220" :label="t('oss.fileList.modifiedTime')">
          <template #default="{ row }">
            <div>{{ row.lastModified ? maoYunDayJs(row.lastModified * 1000).format(FORMAT_TIME) : '-' }}</div>
          </template>
        </el-table-column>
      </el-table>

      <div class="df ac mt20">
        <span class="label" style="width: 72px; color: #999">{{ t('oss.operation') }}</span>
        <el-radio-group v-model="copyFileOption">
          <el-radio label="skip">
            {{ t('oss.s6.skip') }}
          </el-radio>
          <el-radio label="cover">
            {{ t('oss.s6.overwrite') }}
          </el-radio>
        </el-radio-group>
      </div>

      <template #footer>
        <div class="cat-dialog-footer">
          <el-button type="primary" class="mb20" @click="confirmCopyFile">
            {{ t('oss.confirm') }}
          </el-button>
          <el-button class="mb20" @click="cancelCopyFile">
            {{ t('oss.cancel') }}
          </el-button>
        </div>
      </template>
    </CatDialog>
  </div>
</template>

<script lang="ts" setup>
import t from '@/utils/i18n'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { FORMAT_TIME, maoYunDayJs } from '@/utils/mao-yun-day-js'
import UploadDialog from './upload-dialog.vue'
import FileFragmentation from './file-fragmentation.vue'
import FileDetail from './file-detail.vue'
import ClearBucket from '../../list/components/clear-bucket.vue'
import {
  _batchCopyObjects,
  _batchCopyObjectsConfirm,
  _batchUpdateObjectsAcl,
  _batchUpdateObjectsEncryption,
  _checkStorageObjectRename,
  _deleteStorageObjects,
  _getDownloadStsToken,
  _getStorageObjectList,
  _getUploadStsToken,
  _listMultipartUploads,
  _renameStorageObject,
  _updateStorageObjectMeta,
} from '@/apis/oss/storage-list'
import { encodeToSafeBase64, formatFileSize } from '@/views/oss/utils/upload'

import { getCosInstance } from '@/views/oss/utils/cos-utils'
import { download } from '@/utils/download'
import { events } from '@/utils/mitt'
import SvgIcon from '@/components/common/svg-icon/index.vue'
import { useOssStore } from '@/store'
import { useTableHeight } from '@/views/oss/hooks/use-table-height'
import { useClipboard } from '@/views/oss/hooks/use-clipboard'
import { BucketInfo } from '@/views/oss/hooks/use-oss'
import { useTaskManager } from '@/views/oss/hooks/use-task-manager'
import { TaskType, TaskTypeRes } from '@/views/oss/types'
import { _debounce } from '@/utils/timing-utils'
import { usePaginationCache } from '@/views/oss/hooks/use-pagination-cache'
import { notify } from '@/utils/notification'
const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const moreSelectOneMenuWidthMap = {
  [ja]: 160,
  [en]: 210,
  [zh]: 120,
}
const operationMap = {
  [ja]: 240,
  [en]: 280,
  [zh]: 200,
}
const moreSelectOneMenuWidth = useI18nStyle(moreSelectOneMenuWidthMap)
const operationWidth = useI18nStyle(operationMap)

const { addTask } = useTaskManager()

defineProps<{
  folders: string[]
}>()
const emits = defineEmits(['changeTitle'])

const STORAGE_TYPE = {
  STANDARD: t('oss.fileList.standardStorage'),
  STANDARD_IA: t('oss.fileList.infrequentAccess'),
  ARCHIVE: t('oss.fileList.archiveStorage'),
}
let notification: any = null
const search = ref({
  search: '',
  searchType: 'prefix',
  sortField: '',
  sortOrder: '',
  prefix: '',
})
// const dataList = ref([])
const selectedRowKeys = ref<any>([])
// const loading = ref(false)
// const paginationConfig = reactive<IPagination & { isTruncated: boolean }>({
//   pagination: {
//     pageSize: 50,
//     page: 1,
//   },
//   total: 0,
//   isTruncated: false,
// })

// 用于控制编辑图标的显示状态
const hoveredRow = ref(null)

const tableRef = ref(null)
const { tableHeight } = useTableHeight(tableRef)

const delFileTableRef = ref(null)
const { tableHeight: delFileTableHeightValue, calculateTableHeight } = useTableHeight(delFileTableRef, 0)

const isSelect = computed(() => {
  return selectedRowKeys.value.length > 0
})
// 当前选择的元对象
const currSelectObject = ref<any>(null)

const { isPaste, copyToClipboard, readFromClipboard } = useClipboard()
// 点击更多操作opt
const moreOptClickFn = async (item: any) => {
  // 将选中的对象信息存入剪贴板
  const copyData = selectedRowKeys.value.map(item => ({
    key: item.key,
    type: item.type,
  }))
  const currentPath = ossStore.folders.join('/') ? ossStore.folders.join('/') : '/'

  switch (item.value) {
    case 'delete':
      delType.value = 'multiple'
      delStorageDialog.value = true
      delFileList.value = selectedRowKeys.value
      break
    case 'copy':
      console.log(item, 'copy', selectedRowKeys.value)
      copyToClipboard({ path: currentPath, bucket: currSelectBucket.name, files: copyData })
      break
    case 'paste':
      handlePaste()
      break
    case 'access':
      access.value = 'default'
      changeAccessDialog.value = true
      isBatchChangeAccess.value = true
      break
    case 'encryption':
      encryption.value = currSelectBucket?.sseAlgorithm === 'AES256' ? 'AES256' : 'default'

      changeEncryptionDialog.value = true
      break
    default:
      console.log(item, 'default')

      break
  }
}

// 粘贴操作
const handlePaste = async () => {
  const data = await readFromClipboard()
  if (!data || typeof data !== 'object' || !('path' in data)) return

  const currentPath = ossStore.folders.join('/') ? ossStore.folders.join('/') : '/'
  console.log(data, currentPath)

  copyFileNum.value = data.files.length
  // 情况1：原目录粘贴
  if (data.path === currentPath) {
    notify.error({
      message: t('oss.s6.notAllowPaste'),
    })
    return
  }
  console.log(data.path, currentPath)

  // 情况2：父目录粘贴到子目录
  if (data.files.some(file => file.type === 'dir' && (currentPath + '/' + file.key).startsWith(data.path))) {
    notify.error({
      message: t('oss.s6.notAllowPasteToChild'),
    })
    return
  }

  // 情况4：检查同名文件
  const duplicates = await _batchCopyObjects({
    bucketName: currSelectBucket.name,
    region: currSelectBucket.region,
    target: ossStore.folders.join('/') ? ossStore.folders.join('/') + '/' : '', // 目标文件夹，根目录为空字符串
    objectKeys: data.files.filter(file => file.type === 'file').map(file => file.key),
    dirs: data.files.filter(file => file.type === 'dir').map(file => file.key),
  })

  confirmCopyTaskId.value = duplicates.data.taskId
  if (duplicates.data.confirm.dirs || duplicates.data.confirm.files) {
    copyFileDialog.value = true
    copyCalculateTableHeight()
    const list: any = (duplicates.data.confirm.files || []).map(item => ({ ...item, type: 'file', name: item.key }))
    confirmCopyFiles.value = list.concat(
      (duplicates.data.confirm.dirs || []).map(item => ({ type: 'dir', name: item })),
    )
    return
  }
  notification && notification.close()
  notification = notify({
    message: t('oss.s7.startBatchCopyFiles'),
    icon: h(SvgIcon, { name: 'loading', style: 'font-size: 16px' }),
    offset: 100,
    duration: 2000,
  })
  // 情况3：正常粘贴
  addTask(
    {
      taskId: confirmCopyTaskId.value,
      type: TaskType.COPY_OBJECT,
    },
    () => {
      notification && notification.close()
      notify.success({
        message: t('oss.s6.copyFileCompleted'),
      })
      getFileList()
    },
  )
}

/**复制文件 */
const copyFileDialog = ref(false)
const copyFileOption = ref<'skip' | 'over' | 'cancel'>('skip')
const confirmCopyFiles = ref<any>([])
const confirmCopyTaskId = ref<string>('')
const copyFileNum = ref(0)
const copyFileTableRef = ref(null)
const { tableHeight: copyFileTableHeightValue, calculateTableHeight: copyCalculateTableHeight } =
  useTableHeight(copyFileTableRef)

const copyFileChange = row => {
  const currentPath = currSelectBucket.name + '/' + ossStore.folders.join('/')
  const copyData: any = {
    key: row.key,
    type: row.type,
  }
  console.log([copyData])

  copyToClipboard({ path: currentPath, bucket: currSelectBucket.name, files: [copyData] })
}

const confirmCopyFile = async () => {
  const res = await _batchCopyObjectsConfirm({
    action: copyFileOption.value,
    taskId: confirmCopyTaskId.value,
    bucketName: currSelectBucket.name,
    region: currSelectBucket.region,
  })
  if (res.code === 200) {
    copyFileDialog.value = false
    /**
     * 取消复制不添加任务
     * 复制的文件数量等于重复的文件数量选择跳过时也不添加任务
     * 复制的文件数量等于重复的文件数量选择覆盖时添加任务
     * 复制的文件数量不等于重复的文件数量时添加任务
     * copyFileNum.value 是复制的文件总数量
     * confirmCopyFiles.value.length 是重复的文件数量
     */

    if (copyFileOption.value === 'cancel') {
      // 取消复制，直接返回

      // 重置选项为默认值
      copyFileOption.value = 'skip'
      return
    }

    // 当所有文件都重复且选择跳过时，不添加任务
    if (copyFileNum.value === confirmCopyFiles.value.length && copyFileOption.value === 'skip') {
      return
    }

    notification && notification.close()
    notification = notify({
      message: t('oss.s7.startBatchCopyFiles'),
      icon: h(SvgIcon, { name: 'loading', style: 'font-size: 16px' }),
      offset: 100,
      duration: 2000,
    })
    // 其他情况（覆盖或不全重复）都添加任务
    addTask(
      {
        taskId: confirmCopyTaskId.value,
        type: TaskType.COPY_OBJECT,
      },
      () => {
        notification && notification.close()
        notify.success({
          message: t('oss.s6.copyFileCompleted'),
        })
        getFileList()
      },
    )

    // 重置选项为默认值
    copyFileOption.value = 'skip'
  }
}

const cancelCopyFile = () => {
  copyFileOption.value = 'cancel'
  confirmCopyFile()
}

// 刷新
const refresh = () => {
  console.log('刷新')
  getFileList()
}

// 行选中
const handleRowSelectChange = (val: any) => {
  console.log('handleRowSelectChange', val)
  selectedRowKeys.value = val
}

// 排序顺序切换
const sortOrdersChange = (sortField: string) => {
  search.value.sortField = sortField
  search.value.sortOrder = search.value.sortOrder === 'desc' ? 'asc' : 'desc'
  sortFiles()
}

// 分页切换
const paginationChange = e => {
  _paginationConfig.value.page = e.page
  _paginationConfig.value.pageSize = e.pageSize
}

/****上传文件 */
const uploadDialog = ref(false)

// 上传
const updataFileFn = () => {
  uploadDialog.value = true
}

/***清空桶 */
const clearBucketDialog = ref(false)

// 当前桶信息
const currSelectBucket = inject<BucketInfo>('currSelectBucket', {
  name: '',
  region: '',
  sseAlgorithm: '',
})

/********删除对象  start */
const delStorageDialog = ref(false)
const delType = ref<'single' | 'multiple'>('single')
const delFileList = ref<any>([])

const deleteFileChange = row => {
  delType.value = 'single'
  delFileList.value = [row]
  delStorageDialog.value = true
}

watch(
  () => delStorageDialog.value,
  val => {
    if (val) {
      nextTick(() => {
        if (delFileTableRef.value) {
          calculateTableHeight()
        }
      })
    }
  },
)

const confirmDeleteStorageObject = async () => {
  const bucketName = currSelectBucket.name
  const region = currSelectBucket.region

  // 分离文件和目录
  const files = delFileList.value.filter(item => item.type === 'file').map(item => ({ key: item.key }))

  const dirs = delFileList.value.filter(item => item.type === 'dir').map(item => item.key)

  notification && notification.close()
  notification = notify({
    message: t('oss.fileList.deleting'),
    icon: h(SvgIcon, { name: 'loading', style: 'font-size: 16px' }),
    offset: 100,
    duration: 2000,
  })
  _deleteStorageObjects({
    bucketName,
    region,
    dirs,
    files,
  }).then(res => {
    if (res.code === 200) {
      const { action, taskId } = res.data
      console.log(action, taskId)
      delStorageDialog.value = false

      const isFile = delFileList.value[0].type === 'file'
      const isAddTask = delType.value === 'multiple' || !isFile

      const onTaskComplete = message => {
        console.log('onTaskComplete', message)
        notification && notification.close()
        const data = message.data || {}
        if (message.type === TaskTypeRes.BATCH_DELETE_RES) {
          if (data.total_status.total === 1 && data.total_status.success === 1) {
            notify.success({
              message: t('oss.fileList.deleteSuccess'),
            })
          }
          delFileList.value = []
          getFileList()
        }
      }
      addTask({ taskId, type: TaskType.BATCH_DELETE, isAddTask: !isAddTask }, onTaskComplete)
      // sseManager.connect(
      //   `${httpUrl}/oss/task/sse`,
      //   { action, taskId },
      //   handleSSEMessage,
      //   handleSSEError,
      //   handleSSEOpen,
      // )
    }
  })
}

/****文件碎片 */
const fileFragmentationDialog = ref(false)
const showFragmentManagementDot = ref(false) // 是否显示分片管理的小圆点
// 获取文件碎片列表
const getFragmentationList = async () => {
  const res = await _listMultipartUploads({
    bucketName: currSelectBucket.name,
    region: currSelectBucket.region,
    prefix: '',
  })
  showFragmentManagementDot.value = (res.data.uploads || []).length > 0
}

/****修改访问权限 */
const changeAccessDialog = ref(false)
const access = ref('default')
// 是否批量修改访问权限
const isBatchChangeAccess = ref(false)

const changeAccess = row => {
  changeAccessDialog.value = true
  access.value = row['objectAcl'] || 'default'
  currSelectObject.value = row
}

const confirmAccessChange = async () => {
  if (isBatchChangeAccess.value) {
    confirmBatchAccessChange()
    return
  }
  if (currSelectObject.value) {
    await _updateStorageObjectMeta({
      bucketName: currSelectBucket.name,
      region: currSelectBucket.region,
      objectKey: currSelectObject.value.key,
      'x-oss-acl': access.value,
    })
    notify.success({
      message: t('oss.fileList.accessPermissionModifiedSuccessfully'),
    })
    changeAccessDialog.value = false
    currSelectObject.value = null
    getFileList()
  }
}

// 批量修改访问权限
const confirmBatchAccessChange = async () => {
  notification && notification.close()
  notification = notify({
    message: t('oss.s7.startBatchModifyAccessPermission'),
    icon: h(SvgIcon, { name: 'loading', style: 'font-size: 16px' }),
    offset: 100,
    duration: 2000,
  })
  const res = await _batchUpdateObjectsAcl({
    bucketName: currSelectBucket.name,
    region: currSelectBucket.region,
    objectKeys: selectedRowKeys.value.map(item => item.key),
    'x-oss-acl': access.value,
  })
  addTask(
    {
      taskId: res.data.taskId,
      type: TaskType.BATCH_UPDATE_ACL,
      taskNumber: selectedRowKeys.value.length,
    },
    () => {
      notification && notification.close()
    },
  )
  changeAccessDialog.value = false
  isBatchChangeAccess.value = false
  console.log(res)
}

/*****修改加密方式 */
const changeEncryptionDialog = ref(false)
const encryption = ref('default')

const confirmEncryptionChange = async () => {
  try {
    notification && notification.close()
    notification = notify({
      message: t('oss.s7.startBatchModifyEncryptionMethod'),
      icon: h(SvgIcon, { name: 'loading', style: 'font-size: 16px' }),
      offset: 100,
      duration: 2000,
    })
    const res = await _batchUpdateObjectsEncryption({
      bucketName: currSelectBucket.name,
      region: currSelectBucket.region,
      dirs: selectedRowKeys.value.filter(item => item.type === 'dir').map(item => item.key),
      objectKeys: selectedRowKeys.value.filter(item => item.type === 'file').map(item => item.key),
      'x-oss-server-side-encryption': encryption.value,
    })
    if (res.code === 200) {
      console.log(res.data.taskId)
      addTask(
        {
          taskId: res.data.taskId,
          type: TaskType.BATCH_UPDATE_ENCRYPTION,
          taskNumber: selectedRowKeys.value.length,
        },
        () => {
          notification && notification.close()
        },
      )
    } else if (res.code === 40006) {
      notify.error({
        message: t('oss.s7.networkConnectionFailed'),
      })
    }
    changeEncryptionDialog.value = false
  } catch (error) {
    console.log(error)
  }
}

/*****创建文件夹 */
const folderFormRef = ref<any>(null)
const createFolderDialog = ref(false)
const folder = ref({
  name: '',
})
const folderFormValid = ref(false)

watch(
  () => folder.value.name,
  async () => {
    if (folderFormRef.value) {
      try {
        await folderFormRef.value.validate()
        folderFormValid.value = true
      } catch {
        folderFormValid.value = false
      }
    }
  },
)

const createFolder = async () => {
  folderFormRef.value &&
    folderFormRef.value.validate(async valid => {
      if (valid) {
        try {
          let folderName = folder.value.name
          // 确保文件夹名称以斜杠结尾
          if (!folderName.endsWith('/')) {
            folderName += '/'
          }

          const cos = await getCosInstance(currSelectBucket.name, currSelectBucket.region, _getUploadStsToken)
          const folderPath = ossStore.folders.join('/')
          const prefix = folderPath ? `${folderPath}/` : ''
          if (prefix) {
            folderName = prefix + folderName
          }
          console.log(cos)

          // 创建文件夹实际上是创建一个以斜杠结尾的空对象
          await cos.putObject(
            {
              Bucket: cos.bucket?.bucketName, // 存储桶名称
              Region: cos.bucket?.region, // 存储桶所在地域
              Key: folderName, // 文件夹名称，以 `/` 结尾
              Body: '', // 文件夹内容为空
            },
            async (err: any, data: any) => {
              if (err?.message?.startsWith('CORS blocked or network error')) {
                notify.error(t('oss.s7.checkNetworkOrCrossDomainSettings'))
                return
              }
              // await _uploadCallback({
              //   bucketName: currSelectBucket.name,
              //   region: currSelectBucket.region,
              //   objects: [{ key: folderName, size: 0 }],
              // })
              notify.success({
                message: t('oss.fileList.folderCreatedSuccessfully'),
              })
              createFolderDialog.value = false
              folder.value.name = ''

              getFileList()
            },
          )
        } catch (error) {
          console.log(error)
        }
      }
    })
}

// 获取文件列表
const getFileList = async () => {
  search.value.search = ''
  search.value.searchType = 'prefix'
  await init()
  getFragmentationList()
}

/***文件详情 */
const fileDetailDialog = ref(false)
// 获取文件详情
const showFileDetail = async (row: any) => {
  currSelectObject.value = row
  fileDetailDialog.value = true
}

/***重命名 */
const renameFileDialog = ref(false)
const rename = ref({
  name: '',
})
const isCanRename = ref(false)
const sameNameFileDialog = ref(false)
// 重命名文件名
const renameFile = async (row: any) => {
  if (row.type === 'dir') return
  currSelectObject.value = row
  rename.value.name = row.name
  isCanRename.value = false
  renameFileDialog.value = true
}

const renameStorageObject = async () => {
  const f = ossStore.folders.join('/') ? ossStore.folders.join('/') + '/' : ''
  const res = await _checkStorageObjectRename({
    bucketName: currSelectBucket.name,
    region: currSelectBucket.region,
    objectKey: f + rename.value.name.trim(),
  })

  if (res.code === 23001) {
    confirmRenameFile()
  } else if (res.code === 200) {
    sameNameFileDialog.value = true
    renameFileDialog.value = false
  }
}

const confirmRenameFile = async () => {
  const f = ossStore.folders.join('/') ? ossStore.folders.join('/') + '/' : ''
  console.log(f + rename.value.name.trim())

  const renameRes = await _renameStorageObject({
    bucketName: currSelectBucket.name,
    region: currSelectBucket.region,
    objectKey: encodeToSafeBase64(f + rename.value.name.trim()),
    oldObjectKey: currSelectObject.value.key,
  })
  if (renameRes.code === 200) {
    notify.success({
      message: t('oss.fileList.renameSuccess'),
    })
    sameNameFileDialog.value = false
    renameFileDialog.value = false
    getFileList()
  }
}

// 添加对象键名校验函数
const validateObjectName = (rule: any, value: string, callback: any) => {
  // 检查编码长度（最大850字节）
  if (new TextEncoder().encode(value).length > 850) {
    callback(new Error(t('oss.fileList.renameRuleTip')))
    return
  }

  // 检查是否以斜杠开头
  if (value.startsWith('/') || value.startsWith('\\')) {
    callback(new Error(t('oss.fileList.renameRuleTip1')))
    return
  }

  // 不能包含斜杠
  if (value.includes('/')) {
    callback(new Error(t('oss.fileList.fileNameCannotContainSlash')))
    return
  }

  // 检查是否包含控制字符
  const controlChars = [24, 25, 26, 27] // CAN, EM, SUB, ESC
  for (const char of value) {
    const code = char.charCodeAt(0)
    if (controlChars.includes(code)) {
      callback(new Error(t('oss.fileList.renameRuleTip2')))
      return
    }
  }
  isCanRename.value = currSelectObject.value.key !== value
  callback()
}

const downloadFileChange = async (row: any) => {
  notify({
    message: t('oss.fileList.downloadingFile'),
    icon: h(SvgIcon, { name: 'loading', style: 'font-size: 16px' }),
    offset: 100,
    duration: 2000,
  })
  const res = await _getDownloadStsToken({
    bucketName: currSelectBucket.name,
    region: currSelectBucket.region,
    objectKey: row.key,
  })
  if (res.code !== 200) {
    notify.error({
      message: t('oss.fileList.getDownloadUrlFailed'),
    })
    return
  }
  download(res.data.url, row.name)
}

// 进入文件夹
const enterFolder = (folderName: string) => {
  emits('changeTitle', folderName)
  search.value.prefix = folderName
  getFileList()
}

const ossStore = useOssStore()

const _paginationConfig = ref({
  page: 1,
  pageSize: 50,
  total: 0,
  isTruncated: false,
})
const { loading, getCurrentPageData, init, searchFiles, sortFiles } = usePaginationCache(
  async (marker?: string, delimiter = '/') => {
    const bucketName = currSelectBucket.name
    const region = currSelectBucket.region
    const folderPath = ossStore.folders.join('/')
    const prefix =
      search.value.searchType === 'prefix'
        ? (folderPath ? `${folderPath}/` : '') + search.value.search
        : folderPath
          ? `${folderPath}/`
          : ''
    const res = await _getStorageObjectList({ bucketName, region, marker, prefix, maxKeys: 1000, delimiter })
    return {
      data: res.data.list,
      isTruncated: res.data.isTruncated,
      nextMarker: res.data.nextMarker,
    }
  },
  _paginationConfig,
  search,
)

// 监听页码变化
// watch(() => _paginationConfig.value.page, handlePageChange)

onMounted(async () => {
  if (ossStore.folders.length > 0) {
    search.value.prefix = ossStore.folders.join('/') ? ossStore.folders.join('/') + '/' : ''
  }
  await getFileList()
  // 监听上传完成后的刷新事件
  events.on(
    'refreshFileList',
    _debounce(
      () => {
        getFileList()
      },
      500,
      true,
    ),
  )
})

onBeforeUnmount(() => {
  events.off('refreshFileList') // 取消事件监听
  ossStore.clearFolders()
})

// 暴露给父组件的方法
defineExpose({
  getFileList(val) {
    search.value.prefix = val ? val + '/' : ''
    getFileList()
  },
})
</script>

<style lang="scss" scoped>
.oss-file-list-v2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #fff;

  &__toolbar,
  &__actions,
  &__search-wrap {
    display: flex;
    align-items: center;
  }

  &__toolbar {
    gap: 16px;
    justify-content: space-between;
  }

  &__actions {
    flex-shrink: 0;
    gap: 16px;

    :deep(.el-button) {
      height: 34px;
      padding: 6px 12px;
      margin-left: 0;
      font-size: 14px;
      line-height: 22px;
      border-radius: 0;
    }

    :deep(.el-button > span) {
      gap: 8px;
    }

    :deep(.el-button svg) {
      width: 16px;
      height: 16px;
    }

    :deep(.el-badge) {
      display: inline-flex;
    }
  }

  &__more {
    margin-left: 0 !important;

    :deep(.el-select__wrapper) {
      min-height: 34px;
      border-radius: 0;
      box-shadow: 0 0 0 1px #dcdfe6 inset;
    }
  }

  &__search-wrap {
    flex-shrink: 0;
    gap: 16px;
    width: 403px;
  }

  &__search {
    width: 353px;

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
      min-height: 34px;
      border-radius: 0;
      box-shadow: 0 0 0 1px #dcdfe6 inset;
    }

    :deep(.el-input-group__prepend) {
      padding: 0;
      background: #fff;
      border-radius: 0;
      box-shadow: none;
    }

    :deep(.el-input-group__prepend .el-select) {
      width: 108px;
      margin: 0;
    }

    :deep(.el-input-group__prepend .el-select__wrapper) {
      box-shadow: 0 0 0 1px #dcdfe6 inset;
    }

    :deep(.el-input__prefix-inner) {
      color: #828b9c;
    }
  }

  &__search-icon {
    cursor: pointer;
  }

  &__refresh {
    width: 34px;
    height: 34px;
    padding: 0;
    border-radius: 0;
  }

  &__table {
    overflow: hidden;
    border: 1px solid #e8ecf3;
  }

  :deep(.el-table) {
    --el-table-border-color: #e8ecf3;
    --el-table-header-bg-color: #f9fafc;
    --el-table-header-text-color: #191c23;
    --el-table-row-hover-bg-color: #f9fbff;
    --el-table-text-color: #191c23;
  }

  :deep(.el-table__inner-wrapper::before),
  :deep(.el-table__border-left-patch) {
    display: none;
  }

  :deep(.el-table__header-wrapper th.el-table__cell) {
    height: 46px;
    padding: 0;
    font-size: 12px;
    font-weight: 500;
    line-height: 20px;
    background: #f9fafc;
  }

  :deep(.el-table__body-wrapper td.el-table__cell) {
    height: 56px;
    padding: 0;
    font-size: 14px;
    line-height: 22px;
    background: #fff;
  }

  :deep(.el-table__cell) {
    border-right: 1px solid #e8ecf3;
  }

  :deep(.el-table__cell .cell) {
    padding: 0 16px;
  }

  :deep(.el-table-column--selection .cell) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :deep(.el-checkbox) {
    --el-checkbox-input-width: 16px;
    --el-checkbox-input-height: 16px;
  }

  :deep(.el-table__fixed),
  :deep(.el-table__fixed-right) {
    box-shadow: none;
  }

  :deep(.el-table__fixed-right-patch) {
    background: #f9fafc;
    border-left: 1px solid #e8ecf3;
  }

  :deep(.el-table__row:hover > td.el-table__cell) {
    background: #f9fbff;
  }

  :deep(.file-name-column .cell) {
    width: 80%;
    word-break: break-all;
    white-space: break-spaces;
  }

  &__pagination {
    min-height: 64px;
    padding: 16px 20px 15px;
    border-top: 1px solid #e8ecf3;

    :deep(.total) {
      font-family: inherit;
      font-size: 14px;
      line-height: 22px;
      color: rgb(0 0 0 / 45%);
    }

    :deep(.pager .page-size) {
      display: none;
    }

    :deep(.el-pagination) {
      gap: 8px;
      font-weight: 400;
    }

    :deep(.el-pagination__sizes) {
      order: -1;
      margin-right: 8px;
    }

    :deep(.btn-prev),
    :deep(.btn-next),
    :deep(.el-pager li),
    :deep(.el-input__wrapper) {
      min-width: 32px;
      height: 32px;
      margin: 0;
      background: #fff;
      border: 1px solid #dcdfe6;
      border-radius: 0;
      box-shadow: none;
    }

    :deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
      background: #06f;
      border-color: #06f;
    }

    :deep(.el-input__wrapper) {
      padding: 0 10px;
    }
  }
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
}

.el-radio-group :deep(.el-radio.is-checked) .el-radio__input .el-radio__inner {
  background: var(--success-color);
  border: 1px solid var(--success-color);
}

.more-list {
  align-items: start;

  .el-button {
    justify-content: start;
    width: 100%;
    margin-bottom: 4px;
    margin-left: 0 !important;
    border: none;

    &:hover {
      background-color: rgb(241 242 252);
    }

    &:last-of-type {
      margin-bottom: 0;
    }
  }

  .el-popper {
    .popper-text {
      width: max-content;
    }
  }
}

.form-item {
  display: flex;
  gap: 20px;
  line-height: 34px;

  .label,
  .desc {
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }
}

@media (width <= 1280px) {
  .oss-file-list-v2 {
    &__toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    &__actions {
      flex-wrap: wrap;
    }

    &__search-wrap {
      align-self: flex-end;
    }
  }
}

@media (width <= 720px) {
  .oss-file-list-v2 {
    &__search-wrap,
    &__search {
      width: 100%;
    }
  }
}
</style>
