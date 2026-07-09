<template>
  <div class="register bgcf pd20">
    <div class="d-title">
      {{ t('domain.batch-operate.803683-0') }}
    </div>
    <el-form ref="domainRef" :model="form" label-position="left" label-width="auto" class="mt20 mr20">
      <el-form-item :label="t('domain.batch-operate.803683-1')">
        <CatSelect v-model="form.year" :list="yearList" />
      </el-form-item>
      <el-form-item
        prop="domain"
        :label="t('domain.batch-operate.803683-2')"
        :rules="{
          validator: (r, v) => validTopDomain(v),
          message: form.domain ? t('domain.batch-operate.108723-0') : '',
          trigger: 'change',
        }"
      >
        <div class="df">
          <el-input
            v-model="form.domain"
            :placeholder="t('domain.batch-operate.803683-3')"
            type="textarea"
            rows="8"
            resize="none"
            style="width: 640px"
          />
          <div class="upload-container ml20">
            <div class="upload-c df jc ac">
              <el-button type="primary" @click="uploadFile">
                {{ t('domain.batch-operate.803683-4') }}
              </el-button>
            </div>
            <input id="upload" type="file" accept=".xls,.xlsx" style="display: none" @change="changeFileHandle" />
            <div class="tip-info mt10">
              <el-text type="info">
                {{ t('domain.batch-operate.803683-5') }}
              </el-text>
              <el-link type="primary" @click="download(domainTemplateXlsx)">
                {{ t('domain.batch-operate.803683-6') }}
              </el-link>
            </div>
          </div>
        </div>
      </el-form-item>
    </el-form>
    <div class="d-title mt20">
      {{ t('domain.batch-operate.803683-7') }}
    </div>
    <div class="mt20 df ac">
      <el-checkbox v-model="form.privacy" :true-label="1" :false-label="2">
        {{ t('domain.batch-operate.803683-8') }}
      </el-checkbox>
      <el-tooltip effect="light" popper-class="max-400" :content="t('domain.batch-operate.803683-9')" placement="top">
        <SvgIcon name="cat-cdn-warning" class="ml10" />
      </el-tooltip>
    </div>
    <div class="mt20 df ac">
      <el-checkbox v-model="form.auto_renew" :true-label="1" :false-label="2">
        {{ t('domain.batch-operate.803683-10') }}
      </el-checkbox>
      <el-tooltip effect="light" popper-class="max-400" :content="t('domain.batch-operate.803683-15')" placement="top">
        <SvgIcon name="cat-cdn-warning" class="ml10" />
      </el-tooltip>
    </div>
    <div class="border-btn">
      <el-button type="primary" @click="next">
        {{ t('domain.batch-operate.803683-11') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as XLSX from 'xlsx'
import { yearList, domainTemplateXlsx, validTopDomain } from '@/views/domain/config'
import { ElMessage } from 'element-plus'
import t from '@/utils/i18n'
import { download } from '@/utils/download'
import { owUrl } from '@/config/base-config'

const domainRef = ref<any>(null)

const form = reactive({
  year: 1,
  domain: '',
  privacy: 2,
  auto_renew: 2,
})
const uploadFile = () => {
  ;(document.querySelector('#upload') as HTMLInputElement).click()
}
const processFileContent = data => {
  if (!data.length) {
    return
  }
  let domain: string[] = data.map(d => d[0]).filter(v => validTopDomain((v || '').toString()))

  if (domain.length > 100) {
    ElMessage.warning(t('domain.batch-operate.803683-14'))
    domain = domain.slice(0, 100)
  }
  form.domain = domain.join('\n')
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
    ElMessage.error(t('domain.batch-operate.803683-12'))
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
    ElMessage.error(t('domain.batch-operate.803683-13'))
  }
}

const next = async () => {
  if (!(await domainRef.value?.validate(b => b))) return
  window.open(
    `${owUrl}product/domain/order?domain=${encodeURIComponent(form.domain)}&year=${form.year}&privacy=${form.privacy}`,
    '_blank',
  )
}
</script>

<style lang="scss" scoped>
@import '@/views/domain/config';
</style>
