<template>
  <div class="setUpCrossDomain">
    <div class="content-title-box">
      <p class="content-title">
        {{ t('oss.s7.crossDomainAccessSetting') }}
      </p>
      <p class="content-desc">
        {{ t('oss.s7.crossDomainAccessSettingTip') }}
      </p>
    </div>

    <Tip
      :text="[
        {
          main: t('oss.s7.crossDomainAccessSettingTip1'),
        },
      ]"
    />

    <div class="actions mt20 mb20">
      <el-button type="primary" @click="openAdd">
        {{ t('oss.s7.addRule') }}
      </el-button>
    </div>

    <tableV2 ref="tableRef" v-loading="loading" :data="dataList" :max-height="tableHeight" tooltip-effect="light">
      <el-table-column :label="t('oss.s7.sourceOrigin')" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">
          <div>
            <p v-for="(o, idx) in row.allowedOrigins" :key="idx" class="origin-line">
              {{ o }}
            </p>
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="t('oss.s7.operationMethods')" min-width="160">
        <template #default="{ row }">
          <p v-for="m in row.allowedMethods" :key="m" class="origin-line">
            {{ m }}
          </p>
        </template>
      </el-table-column>

      <el-table-column prop="allowHeaders" label="Allow-Headers" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <p v-for="h in row.allowedHeaders" :key="h" class="origin-line">
            {{ h }}
          </p>
        </template>
      </el-table-column>

      <el-table-column prop="exposeHeaders" label="Expose-Headers" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <p v-for="h in row.exposeHeaders" :key="h" class="origin-line">
            {{ h }}
          </p>
        </template>
      </el-table-column>

      <el-table-column prop="maxAge" :label="t('oss.s7.timeoutMaxAge')" width="120">
        <template #default="{ row }">
          <div>{{ row.maxAgeSeconds ?? 0 }}</div>
        </template>
      </el-table-column>

      <el-table-column :label="t('oss.operation')" width="160" fixed="right">
        <template #default="{ row }">
          <div class="df ac" style="gap: 12px">
            <DisableText :disabled="false" :text="t('oss.edit')" @click="openEdit(row)" />
            <DisableText :disabled="false" :text="t('oss.delete')" @click="openDelete(row.id)" />
          </div>
        </template>
      </el-table-column>
    </tableV2>

    <!-- 添加 / 编辑 弹窗 -->
    <CatDialog
      v-model:dialog="dialogVisible"
      :title="dialogTitle"
      :width="720"
      :disabled="confirmDisabled"
      :loading="visibleLoading"
      @confirm="onConfirm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="150" label-position="left">
        <el-form-item :label="t('oss.s7.sourceOrigin')" prop="allowedOrigins">
          <el-input
            v-model="form.allowedOrigins"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 8 }"
            :placeholder="t('oss.s7.addRuleTip')"
          />
          <p class="form-desc">
            {{ t('oss.s7.addRuleTip1') }}
          </p>
        </el-form-item>

        <el-form-item :label="t('oss.s7.operationMethods')" prop="methods">
          <el-checkbox-group v-model="form.methods" style="display: flex; gap: 40px">
            <el-checkbox label="GET"> Get </el-checkbox>
            <el-checkbox label="POST"> Post </el-checkbox>
            <el-checkbox label="PUT"> Put </el-checkbox>
            <el-checkbox label="DELETE"> Delete </el-checkbox>
            <el-checkbox label="HEAD"> Head </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="Allow-Headers" prop="allowHeaders">
          <el-input
            v-model="form.allowHeaders"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 6 }"
            :placeholder="t('oss.s7.addRuleTip2')"
          />
          <p class="form-desc">
            {{ t('oss.s7.addRuleTip3') }}
          </p>
        </el-form-item>

        <el-form-item label="Expose-Headers" prop="exposeHeaders">
          <el-input
            v-model="form.exposeHeaders"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 6 }"
            :placeholder="t('oss.s7.addRuleTip4')"
          />
          <p class="form-desc">
            {{ t('oss.s7.addRuleTip5') }}
          </p>
        </el-form-item>

        <el-form-item :label="t('oss.s7.timeoutMaxAge') + '(s)'" prop="maxAge">
          <el-input-number v-model="form.maxAge" :min="0" :controls="false" /> s
          <p class="form-desc">
            {{ t('oss.s7.addRuleTip6') }}
          </p>
        </el-form-item>
      </el-form>
    </CatDialog>

    <!-- 删除确认 -->
    <CatDialog
      v-model:dialog="delDialog"
      :title="t('oss.s7.deleteCrossDomainRule')"
      :width="560"
      icon="warn-red"
      @confirm="confirmDelete"
    >
      <p class="delete-desc">
        {{ t('oss.s7.confirmDeleteCrossDomainRule') }}
      </p>
    </CatDialog>
  </div>
</template>

<script lang="ts" setup>
import { _addBucketCrossDomain, _deleteBucketCrossDomain, _editBucketCrossDomain } from '@/apis/oss/storage-list'
import t from '@/utils/i18n'
import { DOMAIN_REG } from '@/utils/reg'
import { BucketInfo } from '@/views/oss/hooks/use-oss'
import { useTableHeight } from '@/views/oss/hooks/use-table-height'
import { notify } from '@/utils/notification'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

const props = withDefaults(
  defineProps<{
    dataList: any[]
  }>(),
  {
    dataList: () => [],
  },
)

const emit = defineEmits<{
  (e: 'getList'): void
}>()

// 当前桶信息
const currSelectBucket = inject<BucketInfo>('currSelectBucket', {
  name: '',
  region: '',
})

const loading = ref(false)
const visibleLoading = ref(false)
const tableRef = ref(null)
const { tableHeight } = useTableHeight(tableRef, 40)

const dialogVisible = ref(false)
const dialogTitle = ref('oss.s7.addRule')
const delDialog = ref(false)
const formRef = ref<any>(null)

const form = reactive({
  allowedOrigins: '',
  methods: [] as string[],
  allowHeaders: '',
  exposeHeaders: '',
  maxAge: 0,
  id: '',
})

const confirmDisabled = ref(true)

// 验证规则
const rules = reactive({
  allowedOrigins: [
    { required: true, message: t('oss.s7.pleaseEnterSource'), trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        const lines = value
          .split('\n')
          .map((l: string) => l.trim())
          .filter(Boolean)
        if (lines.length > 500) {
          callback(new Error(t('oss.s7.maxInput500')))
          return
        }
        // 简单校验每行格式：以 http:// 或 https:// 或以 * 开头（允许 *.example.com）
        for (const line of lines) {
          if (!(line.startsWith('http://') || line.startsWith('https://') || line.startsWith('*'))) {
            callback(new Error(t('oss.s7.pleaseEnterCorrectDomainName')))
            return
          }
          if (/\s/.test(line)) {
            callback(new Error(t('oss.s7.pleaseEnterCorrectDomainName1')))
            return
          }
          // 验证域名格式
          if (DOMAIN_REG.test(line)) {
            callback(new Error(t('oss.s7.pleaseEnterCorrectDomainName2')))
            return
          }
          // 一行存在2个及以上通配符
          const wildcardCount = (line.match(/\*/g) || []).length
          if (wildcardCount > 1) {
            callback(new Error(t('oss.s7.pleaseEnterCorrectDomainName')))
            return
          }
        }
        callback()
      },
      trigger: ['blur', 'change'],
    },
  ],
  methods: [{ required: true, message: t('oss.s7.pleaseSelectAtLeastOneMethod'), trigger: 'change' }],
  allowHeaders: [
    {
      required: true,
      message: t('oss.s7.pleaseEnterAllowHeaders'),
      trigger: 'blur',
    },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (value === '' || value === null || value === undefined) {
          callback()
          return
        }
        if (value.trim() === '*') {
          callback()
          return
        }
        const headers = value
          .split('\n')
          .map((l: string) => l.trim())
          .filter(Boolean)
        if (headers.length > 500) {
          callback(new Error(t('oss.s7.maxInput500')))
          return
        }
        for (const header of headers) {
          if (header.includes(' ')) {
            callback(new Error(t('oss.s7.pleaseEnterAllowHeaders1')))
            return
          }
          // 只允许 A-Z、a-z、0-9 、 “-“、”*”
          if (!/^[A-Za-z0-9\-*]+$/.test(header)) {
            callback(new Error(t('oss.s7.pleaseEnterAllowHeaders2')))
            return
          }
        }
        callback()
      },
    },
  ],
  maxAge: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (value === '' || value === null || value === undefined) {
          callback()
          return
        }
        const n = Number(value)
        if (!Number.isInteger(n) || n < 0) {
          callback(new Error(t('oss.s7.pleaseEnterPositiveInteger')))
          return
        }
        if (n.toString().length > 8) {
          callback(new Error(t('oss.s7.pleaseEnterMaxAge')))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ],
})

// 添加统一的验证函数
const validateForm = () => {
  // 检查 allowedOrigins
  if (!form.allowedOrigins?.trim()) {
    confirmDisabled.value = true
    return
  }

  // 检查 methods
  if (!form.methods?.length) {
    confirmDisabled.value = true
    return
  }

  // 检查 allowHeaders
  if (!form.allowHeaders?.trim()) {
    confirmDisabled.value = true
    return
  }

  // 所有必填项都符合要求
  confirmDisabled.value = false
}

// 监听表单数据变化
watch(
  [() => form.allowedOrigins, () => form.methods, () => form.allowHeaders, () => form.maxAge],
  () => {
    validateForm()
  },
  { deep: true },
)

const openAdd = () => {
  dialogTitle.value = t('oss.s7.addRule')
  form.allowedOrigins = ''
  form.methods = []
  form.allowHeaders = ''
  form.exposeHeaders = 'ETag\nContent-Length\nx-cos-request-id'
  form.maxAge = 0
  form.id = ''
  confirmDisabled.value = true
  dialogVisible.value = true
  setTimeout(() => {
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  }, 100)
}

const openEdit = (row: any) => {
  dialogTitle.value = t('oss.s7.editRule')
  form.allowedOrigins = (row.allowedOrigins || []).join('\n')
  form.methods = row.allowedMethods || []
  form.allowHeaders = row.allowedHeaders.join('\n') || ''
  form.exposeHeaders = row.exposeHeaders.join('\n') || ''
  form.maxAge = row.maxAgeSeconds ?? 0
  form.id = row.id
  validateForm()
  dialogVisible.value = true
}

const onConfirm = async () => {
  await formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return false
    try {
      visibleLoading.value = true
      // 处理数据
      const allowedOrigins = form.allowedOrigins
        .split('\n')
        .map((l: string) => l.trim())
        .filter(Boolean)
      const payload = {
        bucketName: currSelectBucket.name, // 这里需要传入当前桶的名称
        region: currSelectBucket.region, // 这里需要传入当前桶的地域
        rule: {
          allowedOrigins,
          allowedMethods: form.methods,
          allowedHeaders: form.allowHeaders
            .split('\n')
            .map((l: string) => l.trim())
            .filter(Boolean),
          exposeHeaders: form.exposeHeaders
            .split('\n')
            .map((l: string) => l.trim())
            .filter(Boolean),
          maxAgeSeconds: Number(form.maxAge) || 0,
        },
      }
      let fn
      if (form.id) {
        payload['id'] = form.id
        fn = _editBucketCrossDomain
      } else {
        fn = _addBucketCrossDomain
      }
      const res = await fn(payload)
      if (res.code === 200) {
        notify.success(t('oss.s7.setSuccess'))
        emit('getList')
      }
    } catch (error) {
      notify.error(t('oss.s7.setFailed'))
    } finally {
      visibleLoading.value = false
      dialogVisible.value = false
    }
  })
}

const openDelete = id => {
  form.id = id
  delDialog.value = true
}

const confirmDelete = () => {
  _deleteBucketCrossDomain({
    bucketName: currSelectBucket.name,
    region: currSelectBucket.region,
    id: form.id,
  })
    .then(res => {
      if (res.code === 200) {
        notify.success(t('oss.fileList.deleteSuccess'))
        emit('getList')
      }
    })
    .finally(() => {
      delDialog.value = false
    })
}
</script>

<style lang="scss" scoped>
.setUpCrossDomain {
  width: 100%;

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
      margin-bottom: 20px;
      font-size: 14px;
      font-weight: 400;
      color: #50596a;
    }
  }

  .actions {
    display: flex;
    justify-content: flex-start;
  }

  .origin-line {
    margin: 0;
    overflow: hidden;
    color: var(--primary-text);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .form-desc {
    margin-top: 6px;
    font-size: 12px;
    color: #999;
  }

  .delete-desc {
    font-size: 14px;
    color: #666;
  }
}
</style>
