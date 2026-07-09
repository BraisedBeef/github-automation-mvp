<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ipGroup.addIpGroup')"
    :width="dialogWidth"
    :loading="state.comfirmLoading"
    @confirm="confirmHandle"
    @close="closeFn"
    @open="open"
  >
    <div class="form-wrap">
      <el-form
        ref="formRef"
        require-asterisk-position="right"
        label-width="auto"
        :model="state.form"
        :rules="rules"
        label-position="left"
      >
        <!-- 名称 -->
        <el-form-item :label="t('ipGroup.name')" prop="name">
          <el-input v-model="state.form.name" maxlength="64" :placeholder="t('common.plsEnter')" />
        </el-form-item>
        <!-- IP类型 -->
        <el-form-item :label="t('ipGroup.ipType')" prop="etherType">
          <div class="w200">
            <el-select
              v-model="state.form.etherType"
              class="select-opts w-full"
              :placeholder="t('ipGroup.placeSelect')"
              @change="changeEtherType"
            >
              <el-option v-for="item in etherTypeOptions" :key="item.value" :label="item.label" :value="item.value">
                <div class="df ac opt-wrap w-full h-full">
                  <div>{{ item.label }}</div>
                </div>
              </el-option>
            </el-select>
          </div>
        </el-form-item>
        <!-- IP类型 -->
        <el-form-item :label="t('ipGroup.ipType')" prop="ipList">
          <div class="w-100">
            <div class="w-100 relative-box">
              <el-input
                v-model="state.form.ipList"
                type="textarea"
                :rows="4"
                :placeholder="t('ipGroup.ipTypePlaceholder')"
                @input="inputFn"
              />
              <div class="num-box">{{ state.ipNum }}/20</div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label=" " prop="" class="mt-7">
          <div class="w-100">
            <div class="">
              {{ t('ipGroup.batchImport') }}
            </div>
            <div class="mt10 flex-box">
              <div class="label-box">
                {{ t('ipGroup.selectFile') }}
              </div>
              <div class="ml20 w300">
                <el-input v-model="state.fileName" disabled />
              </div>
              <div class="ml20">
                <el-upload action accept=".xlsx" :auto-upload="false" :show-file-list="false" :on-change="addFile">
                  <el-button v-loading="state.updateLoading">
                    {{ t('ipGroup.addFile') }}
                  </el-button>
                </el-upload>
              </div>
              <div class="ml20">
                <span class="text-primary cursor-pointer" @click="downloadTemplate">{{
                  t('ipGroup.downloadTemplate')
                }}</span>
              </div>
            </div>
            <div class="mt20 form-msg">
              <p>{{ t('ipGroup.addIpGroupTipOne', ['|']) }}</p>
              <p>{{ t('ipGroup.addIpGroupTipTwo') }}</p>
              <p>{{ t('ipGroup.addIpGroupTipThree') }}</p>
              <p>{{ t('ipGroup.addIpGroupTipFour') }}</p>
              <p>{{ t('ipGroup.addIpGroupTipFive') }}</p>
            </div>
          </div>
        </el-form-item>
        <!-- 备注 -->
        <el-form-item :label="t('ipGroup.remark')" prop="subnetName">
          <el-input v-model="state.form.description" maxlength="256" show-word-limit />
        </el-form-item>
      </el-form>
    </div>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { _debounce } from '@/utils/timing-utils'
import { FormInstance, FormRules } from 'element-plus/es'
import { downloadExportFiles } from '@/utils/download'
import { securityGroutRules } from '../../../../security-group/detail/config'
import { addIpGroup, exportIpGroupTemplate } from '@/apis/network/ip-group'
import { message } from '@/utils/message'
import { etherTypeOptions } from './comfig'
import * as XLSX from 'xlsx/xlsx.mjs'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

interface PropType {
  regionId: number
}

const props = withDefaults(defineProps<PropType>(), {})

interface Form {
  name: string
  etherType: string
  ipList: string
  description: string
}

const emits = defineEmits<{
  (event: 'success'): void
}>()

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const dialogMap = {
  [ja]: '900px',
  [en]: '840px',
  [zh]: '740px',
}

const dialogWidth = useI18nStyle(dialogMap)

const formRef = ref<FormInstance>()
const show = ref<boolean>(false) // 弹窗显示

const state = reactive<{
  comfirmLoading: boolean
  form: Form
  fileName: string
  ipNum: number
  updateLoading: boolean
}>({
  comfirmLoading: false,
  form: {
    name: '',
    etherType: 'IPv4',
    ipList: '',
    description: '',
  },
  fileName: '',
  ipNum: 0,
  updateLoading: false,
})

const rules = reactive<FormRules<Form>>({
  name: [
    { required: true, message: t(''), trigger: 'blur' },
    {
      pattern: /^[\w\u4e00-\u9fa5.-]{1,64}$/,
      message: t('securityGroup.addNameCondition'),
      trigger: 'blur',
    },
    // {
    //   validator: (rule, value, callback) => {
    //     if (value === '') {
    //       callback(new Error(t('')))
    //     } else if (!/^[\w\u4e00-\u9fa5.-]{1,60}$/.test(value)) {
    //       callback(new Error(t('securityGroup.addNameCondition')))
    //     } else {
    //       callback()
    //     }
    //   },
    // },
  ],
  ipList: [
    {
      validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error(t('')))
        } else {
          const list = value.split(/\r\n|\r|\n/g)
          const ipList = list.map(item => item.split('|')[0].replace(/\s/g, '').split('/')[0])
          const repetitionsKey = ipList.length === [...new Set(ipList)].length
          if (!repetitionsKey) {
            callback(new Error(t('ipGroup.hasEqualIpEntry')))
          } else if (list.length > 20) {
            callback(new Error(t('')))
          } else {
            let key = true
            list.forEach(item => {
              const ipItem = item.split('|')
              const ip = ipItem[0].replace(/\s/g, '')
              const remark = ipItem.length > 1 ? ipItem[1].replace(/\s/g, '') : ''
              // ip校验未通过
              if (state.form.etherType === 'IPv4' && !securityGroutRules.ipv4(ip)) return (key = false)
              if (state.form.etherType === 'IPv6' && !securityGroutRules.ipv6(ip)) return (key = false)
              /*  华为那边说的规则
                针对单个IP只要填写ip地址即可，可以不添加掩码
                针对一个网段IP，需要指定具体的IP段
                如10.0.0.0/24，末尾需要是x.x.x.0
                10.0.0.1/24指定的是单个IP
               */
              /**  已在securityGroutRules.ipv6方法中添加了校验规则  */
              // if (ip.indexOf('/') > 0) {
              //   // 存在掩码的情况 末尾必须是0
              //   const ipArea = ip.split('/')[0]
              //   if (ipArea.split('.')[3] !== '0') return (key = false)
              // }
              // 描述校验未通过
              if (remark.includes('<') || remark.includes('>')) return (key = false)
            })
            if (key) {
              callback()
            } else {
              callback(new Error(t('')))
            }
          }
        }
      },
    },
  ],
})

const changeEtherType = () => {
  if (state.form.ipList !== '') {
    formRef.value?.validateField('ipList')
  }
}

// 获取输入ip的数量
const inputFn = _debounce(val => {
  const list = val.split(/\r\n|\r|\n/g)
  const ipList = list.filter(item => item !== '')
  state.ipNum = ipList?.length || 0
}, 500)

// 下载模板
const downloadTemplate = async () => {
  const blob = await exportIpGroupTemplate()
  downloadExportFiles(blob, `${t('ipGroup.template')}.xlsx`)
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
const addFile = async ev => {
  const file = ev.raw
  if (!file) {
    message.warning(t('ipGroup.fileOpenFailed'))
    return
  } else {
    state.updateLoading = true
    try {
      const data = await readFile(file)
      state.updateLoading = false
      const workbook = XLSX.read(data, { type: 'binary' }) // 解析二进制格式数据
      const worksheet = workbook.Sheets[workbook.SheetNames[0]] // 获取第一个Sheet
      const result = XLSX.utils.sheet_to_json(worksheet) || [] // json数据格式
      const tableData = result.map((item: any) => {
        return `${item[t('ipGroup.ipAddress')]} | ${item[t('ipGroup.remark')] ? item[t('ipGroup.remark')] : ''}`
      })
      state.form.ipList = tableData.join('\n')
      state.ipNum = tableData.length
      state.fileName = file?.name || ''
    } catch (err) {
      state.updateLoading = false
      console.log('error', err)
    }
  }
}

// 新建
const confirmHandle = async () => {
  const list = state.form.ipList.split(/\r\n|\r|\n/g)
  await (formRef.value as FormInstance).validate()
  const params = {
    name: state.form.name,
    etherType: state.form.etherType,
    description: state.form.description,
    regionId: props.regionId,
    ipExtraSet: list.map(item => {
      const ipItem = item.split('|')
      return {
        ip: ipItem[0].replace(/\s/g, ''),
        remarks: ipItem.length > 1 ? ipItem[1].replace(/\s/g, '') : '',
      }
    }),
  }
  state.comfirmLoading = true
  const res = await addIpGroup(params)
  try {
    state.comfirmLoading = false
    if (res.success) {
      message.success(t('ipGroup.addIpGroupSuccess'))
      emits('success')
      closeFn()
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.comfirmLoading = false
    console.log('error', err)
  }
}

const closeFn = () => {
  state.form = {
    name: '',
    etherType: 'IPv4',
    ipList: '',
    description: '',
  }
  state.fileName = ''
  state.ipNum = 0
  state.updateLoading = false
  show.value = false
  ;(formRef.value as FormInstance).resetFields()
}

// 弹窗打开
const open = () => {}

defineExpose({
  show,
})
</script>
<style scoped lang="scss">
.w200 {
  width: 200px;
}

.w300 {
  width: 300px;
}

.mt20 {
  margin-top: 20px;
}

.ml20 {
  margin-left: 20px;
}

.w-100 {
  width: 100%;
}

.label-box {
  font-family: 'PingFang SC-Regular', 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #999;
}

.form-msg {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 12px;
  font-weight: 400;
  line-height: 17px;
  color: #999;

  p {
    line-height: 17px !important;
  }
}

.flex-box {
  display: flex;
  align-items: center;
}

.relative-box {
  position: relative;
}

.num-box {
  position: absolute;
  right: 10px;
  bottom: 0;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #999;
}

:deep(.el-form .el-form-item .el-form-item__content .el-form-item__error) {
  position: absolute;
}

:deep(.el-form .el-form-item .el-form-item__content) {
  * {
    line-height: 32px;
  }
}

:deep(.el-form-item__error) {
  line-height: 20px !important;
}

.mt-7 {
  margin-top: -7px;
}
</style>
