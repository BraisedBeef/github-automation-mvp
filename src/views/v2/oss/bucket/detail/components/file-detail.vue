<template>
  <div>
    <el-drawer
      v-model="drawer"
      size="70%"
      direction="rtl"
      class="detail-drawer"
      :before-close="handleClose"
      @open="open"
    >
      <template #header>
        <div class="detail-header">
          <p class="title">
            {{ t('oss.fileList.fileDetails') }}
          </p>
          <div class="line" />
          <p class="fileName ellipsis">
            {{ fileInfo.objectName }}
          </p>
        </div>
      </template>
      <div v-loading="loading" class="detail-content">
        <p class="subheading">
          {{ t('oss.basicInformation') }}
        </p>
        <div class="info">
          <div class="info-text">
            <div class="df ac">
              <span class="label" :style="{ width: labelWidth }">{{ t('oss.fileList.objectName') }}</span>
              <span>{{ fileInfo.objectName }}</span>
            </div>
            <div class="df ac">
              <span class="label" :style="{ width: labelWidth }">{{ t('oss.fileList.objectSize') }}</span>
              <span>{{ formatFileSize(fileDetail['content-length']) }}</span>
            </div>
            <div class="df ac">
              <span class="label" :style="{ width: labelWidth }">{{ t('oss.fileList.modifiedTime') }}</span>
              <span>{{
                fileDetail['last-modified'] ? maoYunDayJs(fileDetail['last-modified'] * 1000).format(FORMAT_TIME) : '-'
              }}</span>
            </div>
            <div class="df ac">
              <span class="label" :style="{ width: labelWidth }">Etag</span>
              <span>{{ fileDetail['etag'] }}</span>
            </div>
            <div class="df">
              <span class="label" :style="{ width: labelWidth }"
                >{{ t('oss.fileList.specifyDomainName') }}
                <el-tooltip :content="t('oss.fileList.specifyDomainNameTip')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="ml10" /> </el-tooltip
              ></span>
              <div>
                <div class="mb10">
                  <el-select v-model="domain" placeholder="" @change="domainChange">
                    <el-option :label="t('oss.fileList.defaultOriginDomainName')" :value="1" />
                    <el-option :label="t('oss.s7.customDomainName')" :value="2" />
                  </el-select>
                  <el-tag type="danger" class="ml10">
                    {{ t('oss.highRisk') }}
                  </el-tag>
                </div>
                <el-select v-if="domain === 2" v-model="customDomain" placeholder="" @change="customDomainChange">
                  <el-option
                    v-for="item in domainList"
                    :key="item"
                    :label="item.customDomain"
                    :value="item.customDomain"
                  />
                </el-select>
              </div>
            </div>
            <div class="df">
              <span class="label" :style="{ width: labelWidth }"
                >{{ t('oss.fileList.objectUrl')
                }}<el-tooltip :content="t('oss.fileList.objectUrlTip')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="ml10" /> </el-tooltip
              ></span>
              <TableCopy :text="fileDetail['url']" />
            </div>
          </div>
          <div class="img-box">
            <img :src="fileDetail['url']" alt="" />
            <p>{{ t('oss.fileList.previewNotSupported') }}</p>
          </div>
        </div>

        <div class="df subheading-box">
          <p class="subheading">
            {{ t('oss.fileList.objectAccessPermission') }}
          </p>
          <DisableText
            v-if="!isAccessEdit"
            :disabled="isAccessEdit"
            :text="t('oss.edit')"
            @click="((isAccessEdit = true), (formData['x-oss-acl'] = fileDetail['x-oss-acl']))"
          />
        </div>
        <div class="df access">
          <span class="label" :style="{ width: labelWidth }">{{ t('oss.fileList.publicPermission') }}</span>
          <span v-if="!isAccessEdit" class="text">{{ ACL_MAP[fileDetail['x-oss-acl']] }}</span>
          <div v-else>
            <div>
              <el-radio-group v-model="formData['x-oss-acl']">
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
              <!-- <p v-if="formData['x-oss-acl'] === 'default'" class="desc">该文件的访问权限以存储桶访问权限为准。</p>
              <p v-else-if="formData['x-oss-acl'] === 'private'" class="desc">
                <i18n-t keypath="oss.fileList.accessDesc">
                  <span style="color: #000000"> {{ t('设置访问权限') }} </span>
                </i18n-t>
              </p>
              <p v-else class="desc df">
                <el-tag type="danger" class="mr10">{{ t('oss.highRisk') }}</el-tag
                >无需身份验证，即可读取您存储桶中的数据，安全风险高，不推荐此配置。写操作需要进行身份验证。
              </p> -->
            </div>
            <div class="btns">
              <el-button type="primary" class="mb20" @click="accessEdit">
                {{ t('oss.save') }}
              </el-button>
              <el-button class="mb20" @click="isAccessEdit = false">
                {{ t('oss.cancel') }}
              </el-button>
            </div>
          </div>
        </div>

        <div class="df subheading-box encryption">
          <p class="subheading">
            {{ t('oss.serverEncryption') }}
          </p>
          <DisableText
            v-if="!isEncryption"
            :disabled="false"
            :text="t('oss.edit')"
            @click="
              () => {
                isEncryption = true
                formData['x-oss-server-side-encryption'] = fileDetail['x-oss-server-side-encryption']
              }
            "
          />
        </div>
        <div class="df access">
          <span class="label" :style="{ width: labelWidth }">{{ t('oss.fileList.encryptionMethod') }}</span>
          <span v-if="!isEncryption" class="text">{{ E_MAP[fileDetail['x-oss-server-side-encryption']] }}</span>
          <div v-else>
            <el-radio-group v-model="formData['x-oss-server-side-encryption']">
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
            <p v-if="currSelectBucket?.sseAlgorithm === 'AES256'">
              {{ t('oss.s6.sseOssEncrypted') }}
            </p>
            <div class="btns">
              <el-button type="primary" class="mb20" @click="encryptionEdit">
                {{ t('oss.save') }}
              </el-button>
              <el-button class="mb20" @click="isEncryption = false">
                {{ t('oss.cancel') }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { _getBucketDomainList, _getStorageObjectDetail, _updateStorageObjectMeta } from '@/apis/oss/storage-list'
import { LANGUAGE_MAP } from '@/config/constant-config'
import t from '@/utils/i18n'
import { FORMAT_TIME, maoYunDayJs } from '@/utils/mao-yun-day-js'
import { encodeToSafeBase64, formatFileSize } from '@/views/oss/utils/upload'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { BucketInfo } from '@/views/oss/hooks/use-oss'
const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const labelWidth = useI18nStyle({
  [ja]: '120px',
  [en]: '120px',
  [zh]: '120px',
})

const props = defineProps<{
  show: boolean
  fileInfo: {
    bucketName: string
    region: string
    objectKey: string
    objectName: string
  }
}>()
const emit = defineEmits(['update:show'])

const currSelectBucket = inject<BucketInfo>('currSelectBucket')

const drawer = computed({
  get: () => props.show,
  set: (val: boolean) => emit('update:show', val),
})

const fileDetail = ref({})
const domain = ref(1)
const loading = ref(false)

const isAccessEdit = ref(false)
const isEncryption = ref(false)
const formData = ref({
  'x-oss-acl': 'default',
  'x-oss-server-side-encryption': 'default',
})

const ACL_MAP: any = {
  default: t('oss.fileList.inheritedPermission'),
  private: t('oss.privateReadWrite'),
  'public-read': t('oss.publicReadPrivateWrite'),
}

const E_MAP: any = {
  default: t('oss.noEncryption'),
  AES256: t('oss.sseCosEncryption'),
}

const handleClose = () => {
  emit('update:show', false)
}

const open = () => {
  getFileDetail()
  getDomainList()
  customDomain.value = ''
  domain.value = 1
}

const getFileDetail = async () => {
  try {
    loading.value = true
    const res = await _getStorageObjectDetail({
      bucketName: props.fileInfo.bucketName,
      region: props.fileInfo.region,
      // base64 编码避免中文路径问题
      objectKey: encodeToSafeBase64(props.fileInfo.objectKey),
    })
    fileDetail.value = res.data
    formData.value['x-oss-acl'] = res.data['x-oss-acl']
    formData.value['x-oss-server-side-encryption'] = res.data['x-oss-server-side-encryption']
    isAccessEdit.value = false
    isEncryption.value = false
  } catch (error) {
    console.log(error)
    emit('update:show', false)
  } finally {
    loading.value = false
  }
}

const domainList = ref<any>([])
const customDomain = ref('')
// 获取域名列表
const getDomainList = async () => {
  const res = await _getBucketDomainList({
    bucketName: props.fileInfo.bucketName,
    region: props.fileInfo.region,
    status: 1,
  })
  domainList.value = res.data.customDomains || []
  console.log('域名列表:', res)
}

const accessEdit = async () => {
  await editObjectMeta({ 'x-oss-acl': formData.value['x-oss-acl'] })
  isAccessEdit.value = false
}

const encryptionEdit = async () => {
  await editObjectMeta({ 'x-oss-server-side-encryption': formData.value['x-oss-server-side-encryption'] })
  isEncryption.value = false
}

// 修改对象元数据
const editObjectMeta = async data => {
  try {
    loading.value = true
    await _updateStorageObjectMeta({
      bucketName: props.fileInfo.bucketName,
      region: props.fileInfo.region,
      objectKey: props.fileInfo.objectKey,
      ...data,
    })
    getFileDetail()

    domain.value = 1
  } catch (error) {
    console.log(error)
  }
}

const domainChange = val => {
  if (val === 1) {
    getFileDetail()
  }
}

const customDomainChange = val => {
  fileDetail.value['url'] = fileDetail.value['url'].replace(/https?:\/\/.*?\//, `https://${val}/`)
}
</script>

<style lang="scss" scoped>
.el-radio-group :deep(.el-radio.is-checked) .el-radio__input .el-radio__inner {
  background: var(--success-color);
  border: 1px solid var(--success-color);
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
}

.detail-drawer {
  .detail-header {
    display: flex;
    align-items: center;
    font-size: 21px;
    font-weight: 500;
    color: #000;

    .line {
      width: 1px;
      height: 20px;
      margin: 0 20px;
      background: #ddd;
    }
  }

  .detail-content {
    .subheading {
      font-size: 16px;
      font-weight: 500;
      color: #000;
    }

    .subheading-box {
      gap: 12px;
      align-items: end;
    }

    .info {
      display: flex;
      gap: 20px;
      margin-top: 20px;

      &-text {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 20px;
        width: 0;
        margin-bottom: 40px;
        font-size: 14px;
        font-weight: 400;
        color: #000;
        word-break: break-all;

        .label {
          flex-shrink: 0;
          font-size: 14px;
          font-weight: 400;
          color: #999;
        }
      }

      .copy-wrap {
        :deep(.text-over) {
          white-space: break-spaces;
        }
      }

      .img-box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 430px;
        height: 314px;
        background: #eee;
      }
    }

    .access {
      margin-top: 20px;

      .text {
        font-size: 14px;
        font-weight: 400;
        color: #000;
      }
    }

    .encryption {
      margin-top: 40px;
    }

    .btns {
      margin-top: 20px;
    }
  }
}
</style>
