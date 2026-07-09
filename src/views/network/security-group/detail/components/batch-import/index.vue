<template>
  <CatDialog
    v-model:dialog="show"
    :title="setTitle"
    :confirm-text="t('securityGroup.startImport')"
    :width="dialogWidth"
    :loading="state.comfirmLoading"
    :disabled="!isSubmit || state.tableData.length === 0"
    @confirm="confirmHandle"
    @close="initFn"
    @open="open"
  >
    <div>
      <el-form
        ref="formRef"
        require-asterisk-position="right"
        label-width="auto"
        :model="state.form"
        label-position="left"
      >
        <el-form-item :label="t('securityGroup.selectFile')" prop="name">
          <div class="template-wrap">
            <div class="update-input">
              <el-input
                v-model.trim="state.form.name"
                :placeholder="t('securityGroup.updateFilePlaceholder')"
                disabled
                style="width: 400px"
              />
            </div>
            <el-upload action accept=".xlsx" :auto-upload="false" :show-file-list="false" :on-change="handleFn">
              <el-button v-loading="state.updateLoading" type="primary">
                {{ t('securityGroup.addFile') }}
              </el-button>
            </el-upload>
            <div class="ml20">
              <span class="text-primary cursor-pointer" @click="downloadTemplate">{{
                t('ipGroup.downloadTemplate')
              }}</span>
            </div>
          </div>
          <div v-if="state.uploadFileError" style="color: #fe4d4f">
            {{ t('securityGroup.batchUploadError') }}
          </div>
        </el-form-item>
      </el-form>
      <el-table v-loading="state.updateLoading" :data="state.tableData" class="mt20 table" show-overflow-tooltip border>
        <!-- 源IP地址 -->
        <el-table-column min-width="160" :label="t('securityGroup.sourceIpAddress')">
          <template #default="{ row }">
            {{ row.remoteIpPrefix }}
          </template>
        </el-table-column>
        <!-- 协议端口 -->
        <el-table-column min-width="120" :label="t('securityGroup.protocolPort')">
          <template #default="{ row }">
            {{ row.protocol }}{{ row?.multiport && row.multiport !== '' ? `:${row.multiport}` : '' }}
          </template>
        </el-table-column>
        <!-- 策略 -->
        <el-table-column min-width="80" :label="t('securityGroup.strategy')">
          <template #default="{ row }">
            {{ actionMap.get(row.action) }}
          </template>
        </el-table-column>
        <!-- 规则类型 -->
        <el-table-column min-width="100" :label="t('securityGroup.ruleType')">
          <template #default="{ row }">
            {{ ruleTabs.find(item => item.value === row.direction)?.label }}
          </template>
        </el-table-column>
        <!-- 备注 -->
        <el-table-column min-width="140" :label="t('securityGroup.remark')">
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div class="text-over">
                {{ actionMap.get(row.action) }}
              </div>
              <div class="text-over">
                {{ row.description }}
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 校验 -->
        <el-table-column min-width="80" :label="t('securityGroup.check')">
          <template #default="{ row }">
            <el-icon v-if="row.check" style="color: rgb(2 222 109)">
              <Check />
            </el-icon>
            <el-icon v-else style="color: #fe4d4f">
              <Close />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column :label="t('securityGroup.operate')" fixed="right" width="100">
          <template #default="{ row, $index }">
            <span class="text-primary cursor-pointer" @click="deleteRow($index)">{{ t('securityGroup.delete') }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </CatDialog>
</template>
<script lang="ts" setup>
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import * as XLSX from 'xlsx/xlsx.mjs'
import { importTable, multiportAllProtocolTypeList } from '../../config'
import { actionMap } from '../../../list/config'
import { Check, Close } from '@element-plus/icons-vue'
import { addSecurityGroupRule, getExportTemplate } from '@/apis/network/security-group'
import { securityGroutRules, ruleTabs } from '../../config'
import { downloadExportFiles } from '@/utils/download'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const dialogMap = {
  [ja]: '930px',
  [en]: '820px',
  [zh]: '820px',
}

const dialogWidth = useI18nStyle(dialogMap)

interface PropType {
  regionId: number
  groupId: number
  ruleActive: string
}

const props = withDefaults(defineProps<PropType>(), {})

const emits = defineEmits<{
  (event: 'success'): void
}>()

// 设置当前页面标题
const setTitle = computed(() => {
  return `${t('ipGroup.batchImport')}-${props.ruleActive === 'ingress' ? t('ins.custom.egressRule') : t('ins.custom.ingressRule')}`
})

const isSubmit = computed(() => {
  return state.tableData.every(item => item.check)
})

const show = ref<boolean>(false) // 弹窗显示

const state = reactive<{
  comfirmLoading: boolean
  form: { name: string }
  updateLoading: boolean
  tableData: any[]
  uploadFileError: boolean // 上传文件是否err
}>({
  comfirmLoading: false,
  form: { name: '' },
  updateLoading: false,
  tableData: [],
  uploadFileError: false,
})

// 校验表格内容格式是否正确
const checkList = item => {
  if (!securityGroutRules.direction(item.direction)) {
    return false
  } else if (!securityGroutRules.action(item.action)) {
    return false
  } else if (!securityGroutRules.multiport(item.multiport.toString(), item.protocol)) {
    return false
  } else if (!securityGroutRules.protocol(item.protocol)) {
    return false
  } else if (!securityGroutRules.remoteIpPrefix(item.remoteIpPrefix)) {
    return false
  } else if (!securityGroutRules.priority(item.priority)) {
    return false
  }
  return true
}

// 文件读取
const readFile = file => {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.readAsArrayBuffer(file) // 以二进制的方式读取
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      resolve((ev.target as FileReader).result)
    }
  })
}
// 解析上传的xlsx文件
const handleFn = async ev => {
  const file = ev.raw
  state.uploadFileError = false
  if (!file) {
    message.warning(t('securityGroup.fileOpenFail'))
    return
  } else {
    // 判断文件格式
    const fileTypeName = file.name.split('.').pop()
    if (fileTypeName !== 'xlsx') {
      state.uploadFileError = true
      state.form.name = file?.name || ''
      return
    }
    state.updateLoading = true
    try {
      const data = await readFile(file)
      state.updateLoading = false
      const workbook = XLSX.read(data, { type: 'binary' }) // 解析二进制格式数据
      const worksheet = workbook.Sheets[workbook.SheetNames[0]] // 获取第一个Sheet
      const result = XLSX.utils.sheet_to_json(worksheet) || [] // json数据格式
      state.tableData = result.map(item => {
        const obj = { type: 1 }
        Object.keys(item).forEach((val: string) => {
          obj[importTable.get(val) as string] = item[val]
        })
        // 校验字段合法性
        obj['check'] = checkList(obj)
        if (multiportAllProtocolTypeList.findIndex(i => i === obj['protocol']) >= 0) {
          obj['multiport'] = ''
        }
        return obj
      })
      state.form.name = file?.name || ''
    } catch (err) {
      state.updateLoading = false
      console.log('error', err)
    }
  }
}

// 删除行
const deleteRow = index => {
  state.tableData.splice(index, 1)
}

// 下载模板
const downloadTemplate = async () => {
  const blob = await getExportTemplate()
  downloadExportFiles(blob, `${t('securityGroup.template')}.xlsx`)
}

const initFn = () => {
  state.form = { name: '' }
  state.tableData = []
  show.value = false
}

const confirmHandle = async () => {
  const params = {
    regionId: props.regionId,
    groupId: props.groupId,
    rules: state.tableData
      .filter(item => item.check)
      .map(item => ({
        ...item,
        // 如果协议为['icmp','icmpv6', 'gre', 'all']中的一个 端口固定为all
        multiport: multiportAllProtocolTypeList.findIndex(val => val === item.protocol) >= 0 ? 'all' : item.multiport,
      })),
  }
  state.comfirmLoading = true
  try {
    const res = await addSecurityGroupRule(params)
    state.comfirmLoading = false
    if (res.success) {
      message.success(t('securityGroup.importSuccess'))
      emits('success')
      initFn()
    } else {
      message.error(res.msg || t('securityGroup.importFail'))
    }
  } catch (err) {
    state.comfirmLoading = false
    console.log('error', err)
  }
}
// 弹窗打开
const open = () => {
  console.log(props, '12')

  state.uploadFileError = false
}

defineExpose({
  show,
})
</script>
<style lang="scss" scoped>
.update-input {
  margin-right: 20px;
}

.mt20 {
  margin-top: 20px;
}

.template-wrap {
  display: flex;
  align-items: center;
}
</style>
