<template>
  <el-form ref="domainRef" :model="form" label-position="left" label-width="auto" class="mt20 mr20">
    <el-form-item
      prop="domain"
      :rules="{
        validator: (r, v) => validHandle(v),
        message: form.domain ? t('domain.batch-operate.108723-0') : '',
        trigger: 'change',
      }"
    >
      <div class="df">
        <div class="df fdc">
          <el-input
            v-model="form.domain"
            :placeholder="t('domain.batch-operate.108723-1')"
            type="textarea"
            rows="8"
            resize="none"
            style="width: 640px"
            @input="inputHandle"
          />
          <div>
            <el-link type="primary" @click="openDomainHandle">
              {{ t('domain.batch-operate.108723-2') }}
            </el-link>
          </div>
        </div>
        <div class="upload-container ml20">
          <div class="upload-c df jc ac">
            <el-button type="primary" @click="uploadFile">
              {{ t('domain.batch-operate.108723-3') }}
            </el-button>
          </div>
          <div>
            <input id="upload" type="file" accept=".xls,.xlsx" style="display: none" @change="changeFileHandle" />
          </div>
          <div class="tip-info mt10">
            <el-text type="info">
              {{ t('domain.batch-operate.108723-4') }}
            </el-text>
            <el-link type="primary" class="ml4" style="display: inline" @click="download(domainTemplateXlsx)">
              {{ t('domain.batch-operate.108723-5') }}
            </el-link>
            <div class="tip-info">
              {{ t('domain.batch-operate.108723-6') }}
            </div>
          </div>
        </div>
      </div>
    </el-form-item>
  </el-form>

  <CatDialog
    v-model:dialog="domain.show"
    :title="t('domain.batch-operate.108723-7')"
    width="70%"
    destroy-on-close
    @confirm="updateDomain"
  >
    <div class="df domain-container">
      <div class="left mr20">
        <div>{{ t('domain.batch-operate.108723-8') }}</div>
        <el-input v-model="domain.query" :placeholder="t('domain.batch-operate.108723-9')" class="mt20" />
        <el-table
          :data="domain.rawTable.filter(v => v.domain.includes(domain.query))"
          show-overflow-tooltip
          :loading="domain.loading"
          height="400px"
          table-layout="auto"
          class="mt20"
        >
          <el-table-column prop="check" width="55">
            <template #header>
              <el-checkbox v-model="domain.allCheck" @change="allCheck" />
            </template>
            <template #default="{ row }">
              <el-checkbox v-model="row.check" @change="rowCheck" />
            </template>
          </el-table-column>
          <el-table-column prop="domain" :label="t('domain.batch-operate.108723-10')" />
          <el-table-column prop="expired" :label="t('domain.batch-operate.108723-11')">
            <template #header>
              <div class="df ac">
                {{ t('domain.batch-operate.108723-11') }}
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon class="ml10" name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              {{ row.expired ? maoYunDayJs(row.expired).format(FORMAT_TIME) : '-' }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="right">
        <div class="df">
          <div>
            {{ t('domain.batch-operate.108723-12') }}{{ domain.rawTable.filter(v => v.check).length }} /
            {{ domain.rawTable.length }}
          </div>
          <el-link style="margin-left: auto" type="primary" @click="resetDomainHandle">
            {{ t('domain.batch-operate.108723-13') }}
          </el-link>
        </div>
        <el-table
          :data="domain.rawTable.filter(v => v.check)"
          show-overflow-tooltip
          height="454px"
          table-layout="auto"
          class="mt20"
        >
          <el-table-column prop="domain" :label="t('domain.batch-operate.108723-10')" />
          <el-table-column prop="expired" :label="t('domain.batch-operate.108723-11')">
            <template #header>
              <div class="df ac">
                {{ t('domain.batch-operate.108723-11') }}
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon class="ml10" name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              {{ row.expired ? maoYunDayJs(row.expired).format(FORMAT_TIME) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="date" width="50">
            <template #default="{ row }">
              <SvgIcon name="cat-cdn-delete" class="icon-hover" @click="deleteDomainHandle(row.id)" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import * as XLSX from 'xlsx'
import { getDateDayjs } from '@/utils/format-time'
import { ElMessage } from 'element-plus'
import { _getDomainList } from '@/apis/domain'
import t from '@/utils/i18n'
import { validTopDomain, validTopDomainSuffix, domainTemplateXlsx } from '@/views/domain/config'
import { download } from '@/utils/download'

const domainRef = ref(null)
defineExpose({ domainRef })
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  exclude: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['update:modelValue'])
const form = reactive({
  domain: '',
})
watch(
  () => props.modelValue,
  n => {
    form.domain = n
  },
)

const validHandle = v => {
  if (props.exclude) {
    return validTopDomain(v) && validTopDomainSuffix(v)
  } else {
    return validTopDomain(v)
  }
}

const inputHandle = () => {
  emits('update:modelValue', form.domain)
}
const uploadFile = () => {
  ;(document.querySelector('#upload') as HTMLInputElement).click()
}
const processFileContent = data => {
  if (!data.length) {
    return
  }
  let domain: string[] = data.map(d => d[0]).filter(v => validHandle((v || '').toString()))

  if (domain.length > 100) {
    ElMessage.warning(t('domain.batch-operate.108723-16'))
    domain = domain.slice(0, 100)
  }
  form.domain = domain.join('\n')
  emits('update:modelValue', form.domain)
}
const changeFileHandle = e => {
  const file = e.target.files[0]
  if (!file) {
    return
  }
  const reader = new FileReader()
  reader.onload = event => {
    e.target.value = null
    const data = event.target!.result
    const workbook = XLSX.read(data, { type: 'binary' })
    const sheetNames = workbook.SheetNames

    sheetNames.forEach(sheetName => {
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
        blankrows: false,
        defval: '',
      })
      processFileContent(sheetData)
    })
  }
  reader.onerror = () => {
    ElMessage.error(t('domain.batch-operate.108723-14'))
  }
  if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    reader.readAsBinaryString(file)
  } else if (file.type === 'application/vnd.ms-excel') {
    let buffer = ''
    reader.onloadend = () => {
      const arr = new Uint8Array(file)
      for (let i = 0; i < arr.length; i++) {
        buffer += String.fromCharCode(arr[i])
      }
      const bstr = btoa(buffer)
      XLSX.read(bstr, { type: 'base64' })
    }
    reader.readAsArrayBuffer(file)
  } else {
    ElMessage.error(t('domain.batch-operate.108723-15'))
  }
}

const domain = reactive<{
  show: boolean
  query: string
  loading: boolean
  allCheck: boolean
  rawTable: any[]
}>({
  show: false,
  query: '',
  loading: false,
  allCheck: false,
  rawTable: [],
})
const allCheck = bool => {
  domain.rawTable.filter(v => v.domain.includes(domain.query)).forEach(v => (v.check = bool))
}
const rowCheck = () => {
  domain.allCheck = domain.rawTable.every(v => v.check)
}
const getDomainList = () => {
  domain.loading = true
  _getDomainList({ page: 1, limit: 9999 } as any)
    .then(res => {
      domain.rawTable = res.data.list.map(v => ({ ...v, check: false, expired: getDateDayjs(v.expired, 'string') }))
    })
    .finally(() => {
      domain.loading = false
    })
}
const openDomainHandle = () => {
  domain.show = true
  getDomainList()
}
const resetDomainHandle = () => {
  domain.query = ''
  domain.allCheck = false
  domain.rawTable.forEach(v => (v.check = false))
}
const deleteDomainHandle = id => {
  domain.rawTable.forEach(v => {
    if (v.id === id) {
      v.check = false
    }
  })
  domain.allCheck = false
}
const updateDomain = () => {
  form.domain = domain.rawTable
    .filter(v => v.check)
    .map(v => v.domain)
    .join('\n')
  domain.rawTable = []
  domain.query = ''
  domain.allCheck = false
  domain.show = false
  emits('update:modelValue', form.domain)
}
</script>

<style scoped lang="scss">
@import '@/views/domain/config';

.upload-container {
  width: 500px;

  .upload-c {
    height: 130px;
    cursor: pointer;
    border: 1px dashed var(--border-c);
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      border: 1px dashed var(--primary-color);
    }
  }
}

.tip-info {
  line-height: 20px !important;

  /* height: 20px !important; */
  :deep(*) {
    /* height: 20px !important; */
    line-height: 20px !important;
  }
}

.domain-container {
  .left,
  .right {
    flex: 1 1 0;
    width: 0;
  }
}
</style>
