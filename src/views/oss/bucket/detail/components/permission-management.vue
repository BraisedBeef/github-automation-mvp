<template>
  <div class="permission-management h-full df">
    <OssMenu
      :title="t('oss.fileList.permissionManagement')"
      default-active="1"
      :menus="[
        { label: t('oss.s6.bucketAccessPermission'), index: '1' },
        { label: t('oss.s6.accessManagementCAM'), index: '2' },
      ]"
      @select="handleMenuSelect"
    />

    <div class="permission-container">
      <div v-if="activeMenu === '1'">
        <div class="df content-title-box">
          <p class="content-title">
            {{ t('oss.s6.bucketAccessPermission') }}
          </p>
          <DisableText
            v-if="!securitySettings.bucketAccess"
            :disabled="false"
            :text="t('oss.edit')"
            @click="securitySettings.bucketAccess = true"
          />
        </div>
        <div v-if="!securitySettings.bucketAccess" class="desc-box">
          <span class="label">{{ t('oss.s6.currentStatus') }}</span>
          <span class="value">{{ ACL_MAP[formData['x-oss-acl']] }}</span>
        </div>
        <div v-else class="edit-btn">
          <span class="label" :style="{ width: labelWidth }">{{ t('oss.fileList.publicPermission') }}</span>
          <div>
            <el-radio-group v-model="formData['x-oss-acl']">
              <el-radio label="private">
                {{ t('oss.privateReadWrite') }}
              </el-radio>
              <el-radio label="public-read-write">
                <div class="df ac">
                  {{ t('oss.publicReadPrivateWrite')
                  }}<el-tag type="danger" class="ml10">
                    {{ t('oss.highRisk') }}
                  </el-tag>
                </div>
              </el-radio>
              <el-radio label="public-read">
                <div class="df ac">
                  {{ t('oss.publicReadWrite')
                  }}<el-tag type="danger" class="ml10">
                    {{ t('oss.highRisk') }}
                  </el-tag>
                </div>
              </el-radio>
            </el-radio-group>
            <p v-if="formData['x-oss-acl'] === 'private'" class="desc">
              {{ t('oss.readWriteTip1') }}
            </p>
            <template
              v-else-if="formData['x-oss-acl'] === 'public-read-write' || formData['x-oss-acl'] === 'public-read'"
            >
              <p v-if="formData['x-oss-acl'] === 'public-read-write'" class="desc">
                {{ t('oss.readWriteTip2') }}
              </p>
              <p v-else class="desc">
                {{ t('oss.readWriteTip3') }}
              </p>
              <p class="desc df ac">
                <el-tag type="warning" class="mr10">
                  {{ t('oss.billing') }} </el-tag
                >{{ t('oss.readWriteTip4') }}
              </p>
              <p class="desc df ac">
                <el-tag type="danger" class="mr10">
                  {{ t('oss.attention') }} </el-tag
                >{{ t('oss.readWriteTip5') }}
              </p>
            </template>
            <div class="btns">
              <el-button type="primary" @click="bucketAccessEdit">
                {{ t('oss.save') }}
              </el-button>
              <el-button @click="getBucketAccess">
                {{ t('oss.cancel') }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="activeMenu === '2'">
        <div class="df content-title-box">
          <p class="content-title">
            {{ t('oss.s6.accessManagementCAM') }}
          </p>
        </div>
        <p class="text">
          {{ t('oss.s6.accessManagementCAMTip') }}
        </p>
        <el-button type="primary" @click="pushRoute({ name: 'access_overview' })">
          {{ t('oss.s6.goCAMConsole') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import t from '@/utils/i18n'
import OssMenu from './oss-menu.vue'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useI18nStyle } from '@/hooks/use-i18n-style'

import { _getBucketAcl, _updateBucketAcl } from '@/apis/oss/storage-list'
import { BucketInfo } from '@/views/oss/hooks/use-oss'
import { notify } from '@/utils/notification'
import { pushRoute } from '@/utils/router-jump'
const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const labelWidth = useI18nStyle({
  [ja]: '120px',
  [en]: '120px',
  [zh]: '80px',
})

// 当前桶信息
const currSelectBucket = inject<BucketInfo>('currSelectBucket', {
  name: '',
  region: '',
})

const ACL_MAP: any = {
  private: t('oss.privateReadWrite'),
  'public-read-write': t('oss.publicReadPrivateWrite'),
  'public-read': t('oss.publicReadWrite'),
}
const activeMenu = ref('1')

const formData = ref({
  'x-oss-acl': 'private',
  'x-oss-server-side-encryption': 'default',
})

// 编辑状态
const securitySettings = reactive({
  bucketAccess: false,
})

const handleMenuSelect = (index: string) => {
  activeMenu.value = index

  securitySettings.bucketAccess = false
}

// 获取存储桶访问权限
const getBucketAccess = async () => {
  const res = await _getBucketAcl({
    bucketName: currSelectBucket.name,
    region: currSelectBucket.region,
  })
  if (res.data) {
    formData.value['x-oss-acl'] = res.data.acl
  }
  securitySettings.bucketAccess = false
}

const bucketAccessEdit = async () => {
  try {
    await _updateBucketAcl({
      bucketName: currSelectBucket.name,
      region: currSelectBucket.region,
      acl: formData.value['x-oss-acl'],
    })
    notify.success(t('oss.s7.setSuccess'))
    await getBucketAccess()
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  getBucketAccess()
})
</script>

<style lang="scss" scoped>
.el-radio-group :deep(.el-radio.is-checked) .el-radio__input .el-radio__inner {
  background: var(--success-color);
  border: 1px solid var(--success-color);
}

.permission-management {
  gap: 20px;

  .permission-container {
    flex: 1;
    width: 0;
    height: fit-content;
    padding: 20px;
    background: #fff;

    .content-title-box {
      gap: 12px;
      align-items: flex-end;

      .content-title {
        font-size: 16px;
        font-weight: 500;
        color: #000;
      }
    }

    .text {
      padding-top: 12px;
      margin-bottom: 20px;
      font-size: 14px;
      font-weight: 400;
      color: #999;
    }

    .desc-box {
      display: flex;
      gap: 20px;
      align-items: center;
      margin-top: 20px;

      .label {
        flex-shrink: 0;
        font-size: 14px;
        font-weight: 400;
        color: #999;
      }

      .value {
        font-size: 14px;
        font-weight: 400;
        color: #000;
      }
    }

    .edit-btn {
      display: flex;
      margin-top: 20px;

      .label {
        flex-shrink: 0;
        margin-top: 6px;
        font-size: 14px;
        font-weight: 400;
        color: #999;
      }

      .btns {
        margin-top: 20px;
      }
    }

    .desc {
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 400;
      color: #999;
    }
  }
}
</style>
