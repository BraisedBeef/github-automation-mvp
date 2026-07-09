<template>
  <div class="h-full df safety-management">
    <OssMenu
      :title="t('oss.fileList.safetyManagement')"
      :default-active="activeMenu"
      :menus="[
        { label: t('oss.serverEncryption'), index: '1' },
        { label: t('oss.s6.antiLeechSetting'), index: '2' },
        { label: t('oss.s7.crossDomainAccessSetting'), index: '3' },
      ]"
      @select="handleMenuSelect"
    />

    <div v-loading="loading" class="safety-container">
      <div v-if="activeMenu === '1'" class="server-encryption">
        <div class="df content-title-box">
          <p class="content-title">
            {{ t('oss.serverEncryption') }}
          </p>
          <DisableText
            v-if="!securitySettings.encryption"
            :disabled="false"
            :text="t('oss.edit')"
            @click="securitySettings.encryption = true"
          />
        </div>
        <p class="text">
          {{ t('oss.s6.serverSideEncryption') }}
        </p>
        <div v-if="!securitySettings.encryption" class="desc-box">
          <span class="label">{{ t('oss.s6.currentStatus') }}</span>
          <span class="value">{{ E_MAP[formData['x-oss-server-side-encryption']] }}</span>
        </div>
        <div v-else class="edit-btn">
          <span class="label" :style="{ width: labelWidth }">{{ t('oss.fileList.encryptionMethod') }}</span>
          <div>
            <el-radio-group v-model="formData['x-oss-server-side-encryption']">
              <el-radio label="default">
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
            <div class="btns">
              <el-button type="primary" @click="saveBucketInfo('1')">
                {{ t('oss.save') }}
              </el-button>
              <el-button @click="getBucketInfo(activeMenu)">
                {{ t('oss.cancel') }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="activeMenu === '2'" class="anti-leech">
        <div class="df content-title-box">
          <p class="content-title">
            {{ t('oss.s6.antiLeechSetting') }}
          </p>
          <DisableText
            v-if="!securitySettings.antiLeech"
            :disabled="false"
            :text="t('oss.edit')"
            @click="securitySettings.antiLeech = true"
          />
        </div>
        <p class="text">
          {{ t('oss.s6.antiLeechSettingTip') }}
        </p>
        <div v-if="!securitySettings.antiLeech">
          <div class="desc-box">
            <span class="label">{{ t('oss.s6.currentStatus') }}</span>
            <span class="value">{{ A_MAP[`${formData.status}`] }}</span>
          </div>
          <template v-if="formData.status">
            <div class="desc-box">
              <span class="label">{{ t('oss.s6.sourceType') }}</span>
              <span class="value">{{ R_MAP[`${formData.refererType}`] }}</span>
            </div>
            <div class="desc-box">
              <span class="label">Referer</span>
              <span class="value">
                <p v-for="item in formData.domainList" :key="item">{{ item }}</p>
              </span>
            </div>
            <div class="desc-box">
              <span class="label">
                <span>{{ t('oss.s6.emptyReferer') }}</span>
                <el-tooltip :content="t('oss.s6.emptyRefererTip')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="ml10" />
                </el-tooltip>
              </span>
              <span class="value">{{ Referer_MAP[`${formData.allowEmptyReferer}`] }}</span>
            </div>
          </template>
        </div>
        <el-form v-else ref="formRef" :model="formData" :rules="rules" :label-width="labelWidth" label-position="left">
          <el-form-item :label="t('oss.s6.configStatus')">
            <el-switch v-model="formData.status" active-color="#13ce66" inactive-color="#ff4949" />
          </el-form-item>

          <template v-if="formData.status">
            <el-form-item :label="t('oss.s6.sourceType')">
              <el-radio-group v-model="formData.refererType">
                <el-radio v-for="(label, key) in R_MAP" :key="key" :label="key">
                  {{ label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="t('Referer')" prop="domain">
              <el-input
                v-model="formData.domain"
                style="width: 240px"
                :autosize="{ minRows: 3, maxRows: 10 }"
                type="textarea"
                :placeholder="t('oss.s6.pleaseEnterDomainOrIP')"
              />
            </el-form-item>
            <p class="formItemDesc" :style="{ marginLeft: labelWidth }">
              {{ t('oss.s6.pleaseEnterDomainOrIPTip') }}
            </p>
            <el-form-item :label="t('oss.s6.configStatus')">
              <template #label>
                <p class="label">
                  <span>{{ t('oss.s6.emptyReferer') }}</span>
                  <el-tooltip :content="t('oss.s6.emptyRefererTip')" placement="top" effect="light">
                    <SvgIcon name="cat-cdn-help" class="ml10" />
                  </el-tooltip>
                </p>
              </template>
              <el-radio-group v-model="formData.allowEmptyReferer">
                <el-radio :label="false">
                  {{ Referer_MAP.false }}
                </el-radio>
                <el-radio :label="true">
                  {{ Referer_MAP.true }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </template>
          <el-form-item>
            <div class="btns">
              <el-button type="primary" @click="saveBucketInfo('2')">
                {{ t('oss.save') }}
              </el-button>
              <el-button @click="getBucketInfo(activeMenu)">
                {{ t('oss.cancel') }}
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <div v-if="activeMenu === '3'">
        <SetUpCrossDomain :data-list="crossDomainRules" @get-list="getBucketInfo('3')" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import t from '@/utils/i18n'
import OssMenu from './oss-menu.vue'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { BucketInfo } from '@/views/oss/hooks/use-oss'
import {
  _getBucketCrossDomain,
  _getBucketEncryption,
  _getBucketReferer,
  _updateBucketEncryption,
  _updateBucketReferer,
} from '@/apis/oss/storage-list'
import SetUpCrossDomain from './set-up-cross-domain.vue'
import { notify } from '@/utils/notification'
const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const labelWidth = useI18nStyle({
  [ja]: '120px',
  [en]: '120px',
  [zh]: '100px',
})

const E_MAP: any = {
  default: t('oss.noEncryption'),
  AES256: t('oss.sseCosEncryption'),
}

const A_MAP: any = {
  true: t('oss.open'),
  false: t('oss.close'),
}

const Referer_MAP: any = {
  true: t('oss.s6.allow'),
  false: t('oss.s6.reject'),
}

const R_MAP: any = {
  'White-List': t('oss.s6.whiteList'),
  'Black-List': t('oss.s6.blackList'),
}

// 当前桶信息
const currSelectBucket = inject<BucketInfo>('currSelectBucket', {
  name: '',
  region: '',
})

const activeMenu = ref('1')
const loading = ref(false)
const formRef = ref<any>(null)

const handleMenuSelect = (index: string) => {
  activeMenu.value = index
  securitySettings.value = {
    encryption: false,
    antiLeech: false,
    crossDomain: false,
  }
}

interface SecuritySettings {
  encryption: boolean
  antiLeech: boolean
  crossDomain: boolean
}

// 编辑状态
const securitySettings = ref<SecuritySettings>({
  encryption: false,
  antiLeech: false,
  crossDomain: false,
})

const formData = ref({
  'x-oss-acl': 'default',
  'x-oss-server-side-encryption': 'default',
  status: false,
  domainList: [],
  domain: '',
  allowEmptyReferer: false,
  refererType: 'White-List',
})

// 跨域访问规则
const crossDomainRules = ref([])

const rules = {
  domain: [
    { required: true, message: t('oss.s6.pleaseEnterDomainOrIP'), trigger: ['blur', 'change'] },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (formData.value.status) {
          const domains = value
            .split('\n')
            .map(item => item.trim())
            .filter(Boolean)

          // 检查是否为空
          if (domains.length === 0) {
            callback(new Error(t('oss.s6.pleaseEnterDomainOrIP')))
            return
          }

          // 检查行数限制
          if (domains.length > 10) {
            callback(new Error(t('oss.s6.maxInput10Lines')))
            return
          }

          // 检查每个域名/IP的格式
          for (const domain of domains) {
            // 检查字符数
            if (domain.length > 200) {
              callback(new Error(t('oss.s6.maxCharacter200')))
              return
            }

            // 检查是否包含协议
            if (domain.startsWith('http://') || domain.startsWith('https://')) {
              callback(new Error(t('oss.s6.noNeedProtocol')))
              return
            }

            // 检查域名/IP格式
            if (!validDomainOrIP(domain)) {
              callback(new Error(t('oss.s6.domainOrIPFormatError')))
              return
            }
          }

          callback()
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change'],
    },
  ],
}

// 辅助函数：验证域名或IP格式
const validDomainOrIP = (value: string) => {
  // 域名正则（支持通配符）
  const DOMAIN_WI_REG = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/
  // IPv4正则
  const IPv4_REG = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

  // 分离主机和端口
  const hostPort = value.split(':')
  const host = hostPort[0]
  const port = hostPort[1]

  // 如果有端口，验证端口格式 端口号范围：1-65535
  if (port !== undefined) {
    const portNum = parseInt(port)
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      return false
    }
  }

  // 支持通配符域名
  if (host.startsWith('*.')) {
    return DOMAIN_WI_REG.test(host.slice(2))
  }

  // 支持普通域名和IP
  return DOMAIN_WI_REG.test(host) || IPv4_REG.test(host)
}

// 获取桶信息
const getBucketInfo = async (menu: string) => {
  try {
    loading.value = true
    const params = {
      bucketName: currSelectBucket.name,
      region: currSelectBucket.region,
    }
    let fn
    if (menu === '1') {
      fn = _getBucketEncryption
    } else if (menu === '2') {
      fn = _getBucketReferer
    } else if (menu === '3') {
      fn = _getBucketCrossDomain
    }
    const res = await fn(params)
    if (menu === '1') {
      formData.value['x-oss-server-side-encryption'] = res.data.sseAlgorithm
    } else if (menu === '2') {
      formData.value.status = res.data.status
      formData.value.domainList = res.data.domainList || []
      formData.value.domain = (res.data.domainList || []).join('\n')
      formData.value.allowEmptyReferer = res.data.allowEmptyReferer
      formData.value.refererType = res.data.refererType
    } else if (menu === '3') {
      crossDomainRules.value = res.data.rules || []
    }
    securitySettings.value[menu === '1' ? 'encryption' : 'antiLeech'] = false
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 修改桶信息
const editBucketInfo = async (menu: string) => {
  try {
    loading.value = true
    const params = {
      bucketName: currSelectBucket.name,
      region: currSelectBucket.region,
    }
    let fn
    if (menu === '1') {
      params['x-oss-server-side-encryption'] = formData.value['x-oss-server-side-encryption']
      fn = _updateBucketEncryption
    } else if (menu === '2') {
      if (formData.value.status) {
        const valid = await formRef.value.validate(b => b)
        if (!valid) return false

        params['allowEmptyReferer'] = formData.value.allowEmptyReferer
        params['domainList'] = formData.value.domain
          .split('\n')
          .map(item => item.trim())
          .filter(Boolean)
        params['refererType'] = formData.value.refererType
      }
      params['status'] = formData.value.status
      fn = _updateBucketReferer
    }
    const res = await fn(params)
    notify.success(t('oss.s7.setSuccess'))
    return res
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const saveBucketInfo = async (menu: string) => {
  const res = await editBucketInfo(menu)
  console.log(res, 'saveBucketInfo')

  if (res) {
    await getBucketInfo(menu)
    securitySettings.value[menu === '1' ? 'encryption' : 'antiLeech'] = false
  }
}

watch(
  () => activeMenu.value,
  async val => {
    await getBucketInfo(val)
  },
  {
    immediate: true,
  },
)
</script>

<style lang="scss" scoped>
.el-radio-group :deep(.el-radio.is-checked) .el-radio__input .el-radio__inner {
  background: var(--success-color);
  border: 1px solid var(--success-color);
}

.safety-management {
  gap: 20px;

  .safety-container {
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

      .content-desc {
        margin-top: 12px;
        font-size: 14px;
        font-weight: 400;
        color: #999;
      }
    }

    .text {
      padding-top: 12px;
      margin-bottom: 20px;
      font-size: 14px;
      font-weight: 400;
      color: #999;
    }

    .desc-box + .desc-box {
      margin-top: 20px;
    }

    .desc-box {
      display: flex;
      gap: 20px;
      align-items: center;

      .label {
        flex-shrink: 0;
        font-size: 14px;
        font-weight: 400;
        color: #999;
      }

      .value {
        width: 100%;
        max-height: 300px;
        overflow: auto;
        font-size: 14px;
        font-weight: 400;
        color: #000;
      }
    }

    .edit-btn {
      display: flex;

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

    .formItemDesc {
      margin-top: -20px;
      margin-bottom: 20px;
      font-size: 14px;
      font-weight: 400;
      color: #999;
    }
  }
}
</style>
