<template>
  <div class="h-full df domain-config">
    <OssMenu
      :title="t('oss.fileList.DomainConfig')"
      default-active="1"
      :menus="[{ label: t('oss.s7.customDomainName'), index: '1' }]"
      @select="handleMenuSelect"
    />

    <div class="domain-config-container">
      <div class="df content-title-box">
        <p class="content-title">
          {{ t('oss.s7.customDomainName') }}
        </p>
        <p class="content-desc">
          {{ t('oss.s7.customDomainNameTip') }}
        </p>
      </div>
      <Tip :text="[{ main: t('oss.s7.pleaseGoToYourDomainNameResolver') }]" />
      <el-button type="primary" @click="domainChange('add')">
        {{ t('oss.s7.addDomainName') }}
      </el-button>

      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="dataList"
        class="mt20"
        :max-height="tableHeight"
        tooltip-effect="light"
      >
        <el-table-column prop="customDomain" :label="t('oss.s7.domainName')" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="df ac">
              <p>{{ row.customDomain }}</p>
              <el-tooltip effect="light" :content="t('oss.s7.noValidCnameRecord')" placement="top">
                <SvgIcon v-if="!row.valid" name="warn-red" class="ml10" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="cname" label="CNAME" min-width="220" show-overflow-tooltip />
        <el-table-column prop="status" :label="t('oss.fileList.status')" min-width="100">
          <template #default="{ row }">
            <div>
              <span v-if="!row.isEdit">{{ row.status ? t('oss.s7.online') : t('oss.s7.offline') }}</span>
              <el-select v-else v-model="row.status">
                <el-option :label="t('oss.s7.online')" :value="1" />
                <el-option :label="t('oss.s7.offline')" :value="0" />
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="actions" :label="t('oss.fileList.status')" width="120">
          <template #default="{ row, $index }">
            <div v-if="!row.isEdit" class="df ac" style="gap: 24px">
              <DisableText :disabled="false" :text="t('oss.edit')" @click="domainChange('edit', row, $index)" />
              <el-tooltip
                :disabled="!row.status"
                effect="light"
                :content="t('oss.s7.pleaseModifyDomainNameToOfflineStatus')"
                placement="top"
              >
                <DisableText :disabled="!!row.status" :text="t('oss.delete')" @click="domainChange('delete', row)" />
              </el-tooltip>
            </div>
            <div v-else class="df ac" style="gap: 24px">
              <DisableText :disabled="false" :text="t('oss.save')" @click="domainChange('save', row, $index)" />
              <DisableText :disabled="false" :text="t('oss.cancel')" @click="(getDomainList(), (row.isEdit = false))" />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加自定义域名 -->
    <CatDialog
      v-if="domainDialog"
      v-model:dialog="domainDialog"
      :title="t('oss.s7.addCustomDomainName')"
      :width="680"
      :disabled="confirmDisabled"
      :loading="dialogLoading"
      @confirm="domainDialogConfirm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100" label-position="left">
        <el-form-item :label="t('oss.s7.domainName')" prop="domain">
          <el-input v-model="form.domain" :placeholder="t('oss.s7.pleaseEnterDomainName')" />
        </el-form-item>
        <p style="margin-left: 100px" class="form-domain-desc">
          {{ t('oss.s7.pleaseEnterDomainNameTip') }}
        </p>
        <el-form-item label="CNAME">
          <p>{{ ossStore.bucketInfo.defaultDomain }}</p>
        </el-form-item>
      </el-form>
    </CatDialog>

    <!-- 添加自定义域名失败提示 -->
    <CatDialog
      v-if="addErrorDomainDialog"
      v-model:dialog="addErrorDomainDialog"
      :title="addErrorDomainInfo.title"
      :width="680"
      icon="warn-red"
      @confirm="addErrorDomainDialog = false"
    >
      <p class="delete-domain-desc">
        {{ addErrorDomainInfo.desc }}
      </p>
      <div v-if="addErrorDomainInfo.domain" class="mt20">
        <span style="color: #999">{{ t('oss.s7.boundBucket') }}</span>
        <span class="ml10">{{ addErrorDomainInfo.domain }}</span>
      </div>
    </CatDialog>

    <!-- 删除 -->
    <CatDialog
      v-if="delDomainDialog"
      v-model:dialog="delDomainDialog"
      :title="t('oss.s7.confirmDeleteDomainName')"
      :width="680"
      icon="warn-red"
      @confirm="confirmDeleteDomain"
    >
      <!-- <p class="delete-domain-desc">
        确定要删除自定义域名<span class="domain"> {{ currSelectDomain }} </span>吗？ 删除后将无法通过该域名访问存储桶。
      </p> -->
      <i18n-t keypath="oss.s7.deleteDomainTip" tag="p" class="delete-domain-desc">
        <span class="domain"> {{ currSelectDomain }} </span>
      </i18n-t>
    </CatDialog>
  </div>
</template>

<script lang="ts" setup>
import t from '@/utils/i18n'
import OssMenu from './oss-menu.vue'
import { useTableHeight } from '@/views/oss/hooks/use-table-height'
import {
  _createBucketDomain,
  _deleteBucketDomain,
  _editBucketDomain,
  _getBucketDomainList,
} from '@/apis/oss/storage-list'
import { BucketInfo } from '@/views/oss/hooks/use-oss'

import { useOssStore } from '@/store'
import { notify } from '@/utils/notification'

const dataList = ref<any[]>([])
const loading = ref(false)
const tableRef = ref(null)
const { tableHeight } = useTableHeight(tableRef)

const ossStore = useOssStore()

// 当前桶信息
const currSelectBucket = inject<BucketInfo>('currSelectBucket', {
  name: '',
  region: '',
})

const domainDialog = ref(false)
const formRef = ref<any>(null)
const form = reactive({
  domain: '',
})

const confirmDisabled = ref(true)

const rules = reactive({
  domain: [
    { required: true, message: t('oss.s7.pleaseEnterDomainName'), trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        // 检查是否包含非法字符（空格、下划线、中文字符）
        if (/[\s_\u4e00-\u9fa5]/.test(value)) {
          callback(new Error(t('oss.s7.pleaseEnterDomainNameTip1')))
          confirmDisabled.value = true
          return
        }

        // 检查是否带有协议、端口或路径
        if (/^(https?:\/\/)|:\d+|\/.*/.test(value)) {
          callback(new Error(t('oss.s7.pleaseEnterDomainNameTip2')))
          confirmDisabled.value = true
          return
        }

        // 检查是否是泛域名
        if (value.startsWith('*.')) {
          callback(new Error(t('oss.s7.pleaseEnterDomainNameTip3')))
          confirmDisabled.value = true
          return
        }

        // 检查是否是完整的二级或多级域名
        if (!/^(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,6}$/.test(value)) {
          callback(new Error(t('oss.s7.pleaseEnterDomainNameTip4')))
          confirmDisabled.value = true
          return
        }

        // 所有检查通过
        callback()
        confirmDisabled.value = false
      },
      trigger: 'blur',
    },
  ],
})

const dialogLoading = ref(false)
const delDomainDialog = ref(false)
const currSelectDomain = ref('')

const addErrorDomainDialog = ref(false)
const addErrorDomainInfo = ref({
  title: '',
  desc: '',
  domain: '',
})

type DomainChangeType = 'add' | 'edit' | 'save' | 'delete'
const domainChange = (type: DomainChangeType, row?: any, index?: number) => {
  if (type === 'edit' && index !== undefined) {
    dataList.value[index].isEdit = true
  } else if (type === 'save' && index !== undefined) {
    dataList.value[index].isEdit = false
    _editBucketDomain({
      bucketName: currSelectBucket.name,
      region: currSelectBucket.region,
      customDomain: row.customDomain,
      status: row.status,
    }).then(res => {
      console.log('域名修改成功:', res)
      if (res.code === 200) {
        notify.success(t('oss.s7.customDomainNameConfigSuccess'))
      }
      getDomainList()
    })
  } else if (type === 'add') {
    form.domain = ''
    confirmDisabled.value = true
    domainDialog.value = true
  } else if (type === 'delete') {
    delDomainDialog.value = true
    currSelectDomain.value = row.customDomain
  }
}

const confirmDeleteDomain = () => {
  _deleteBucketDomain({
    bucketName: currSelectBucket.name,
    region: currSelectBucket.region,
    customDomain: currSelectDomain.value,
  })
    .then(res => {
      if (res.code === 200) {
        notify.success({
          message: t('oss.fileList.deleteSuccess'),
        })
      }
      getDomainList()
    })
    .finally(() => {
      delDomainDialog.value = false
    })
}

const domainDialogConfirm = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      try {
        dialogLoading.value = true
        const res = await _createBucketDomain({
          customDomain: form.domain,
          bucketName: currSelectBucket.name,
          region: currSelectBucket.region,
        })
        if (res.code === 200) {
          notify.success({
            message: t('oss.s7.domainNameBindingSuccess'),
          })
          getDomainList()
          domainDialog.value = false
          // 重置表单
          form.domain = ''
          confirmDisabled.value = true
        } else if (res.code === 40002) {
          addErrorDomainInfo.value.title = t('oss.s7.domainNameNotRegistered')
          addErrorDomainInfo.value.desc = t('oss.s7.domainNameNotRegisteredTip')
          domainDialog.value = false
          addErrorDomainDialog.value = true
          confirmDisabled.value = true
        } else if (res.code === 40003) {
          addErrorDomainInfo.value.title = t('oss.s7.addFailed')
          addErrorDomainInfo.value.desc = t('oss.s7.addFailedTip')
          addErrorDomainInfo.value.domain = res.msg || ''

          domainDialog.value = false
          addErrorDomainDialog.value = true
          confirmDisabled.value = true
        } else if (res.code === 40004) {
          notify.error({
            message: t('oss.s7.addFailedTip1'),
          })
        }
      } catch (error) {
        console.log('error', error)
      } finally {
        dialogLoading.value = false
      }
    } else {
      console.log('表单验证失败')
      return false
    }
  })
}

const handleMenuSelect = (index: string) => {
  console.log(index)
}

// 获取域名列表
const getDomainList = async () => {
  loading.value = true
  const res = await _getBucketDomainList({
    bucketName: currSelectBucket.name,
    region: currSelectBucket.region,
  })
  dataList.value = res.data.customDomains || []
  console.log('域名列表:', res)
  loading.value = false
}
onMounted(() => {
  getDomainList()
})
</script>

<style lang="scss" scoped>
.domain-config {
  gap: 20px;

  .domain-config-container {
    width: 100%;
    height: fit-content;
    padding: 20px;
    background: #fff;

    .content-title-box {
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;

      .content-title {
        font-size: 16px;
        font-weight: 500;
        color: #000;
      }

      .content-desc {
        font-size: 14px;
        font-weight: 400;
        color: #999;
      }
    }
  }

  .form-domain-desc {
    margin-bottom: 20px;
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }

  .delete-domain-desc {
    font-size: 14px;
    font-weight: 400;
    color: #999;

    .domain {
      color: #000;
    }
  }
}
</style>
