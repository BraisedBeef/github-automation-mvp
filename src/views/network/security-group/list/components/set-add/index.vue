<template>
  <div>
    <CatDialog
      v-model:dialog="show"
      :title="t('securityGroup.addSecurityGroup')"
      width="740px"
      :loading="state.comfirmLoading"
      @confirm="confirmHandle"
      @close="initData"
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
          <!-- 模版 -->
          <el-form-item :label="t('securityGroup.template')" prop="template" class="template-wrap">
            <el-select
              v-model="state.form.template"
              class="select-opts w-full"
              :placeholder="t('securityGroup.placeSelectTemplate')"
              style="width: 400px"
              @change="changeTemplate"
            >
              <el-option v-for="item in props.templateList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <!-- 名称 -->
          <el-form-item :label="t('securityGroup.name')" prop="name">
            <el-input
              v-model.trim="state.form.name"
              :placeholder="t('securityGroup.placeInputName')"
              maxlength="60"
              style="width: 400px"
            />
            <!-- <p class="name-desc">{{ t('securityGroup.addNameCondition') }}</p> -->
          </el-form-item>
          <!-- 备注 -->
          <el-form-item :label="t('securityGroup.remark')" prop="description">
            <el-input
              v-model.trim="state.form.description"
              type="textarea"
              :rows="5"
              :placeholder="''"
              show-word-limit
              maxlength="250"
            />
          </el-form-item>
        </el-form>
      </div>
      <div class="mt20">
        <div class="flex">
          <CatTabsBox v-model="state.ruleTab" :list="ruleArr" />
          <span class="text-primary close cursor-pointer ml20" @click="changeRuleTable">{{
            t('securityGroup.hideTemplateRule')
          }}</span>
        </div>
        <el-collapse-transition>
          <div v-show="state.isCollapse">
            <el-table
              :data="state.ruleList[state.ruleTab]"
              class="mt20 table"
              show-overflow-tooltip
              border
              max-height="250"
            >
              <!-- 源IP地址 -->
              <el-table-column
                min-width="160"
                :label="
                  state.ruleTab === 'ingressRules'
                    ? t('securityGroup.sourceIpAddress')
                    : t('securityGroup.targetIpAddress')
                "
              >
                <template #default="{ row }">
                  {{ row.remoteIpPrefix }}
                </template>
              </el-table-column>
              <!-- 协议端口 -->
              <el-table-column min-width="160" :label="t('securityGroup.protocolPort')">
                <template #default="{ row }"> {{ row.protocol }}:{{ row.multiport }} </template>
              </el-table-column>
              <!-- 策略 -->
              <el-table-column min-width="140" :label="t('securityGroup.strategy')">
                <template #default="{ row }">
                  {{ actionMap.get(row.action) }}
                </template>
              </el-table-column>
              <!-- 备注 -->
              <el-table-column min-width="200" :label="t('securityGroup.remark')">
                <template #default="{ row }">
                  {{ row.description }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-collapse-transition>
      </div>
    </CatDialog>
    <CatDialog
      v-model:dialog="showTip"
      :title="t('securityGroup.prompt')"
      width="550px"
      :confirm-text="t('securityGroup.setRulesImmediately')"
      @confirm="tipConfirmHandle"
      @close="tipCloseFn"
    >
      <div>{{ t('securityGroup.setRulesTip') }}</div>
    </CatDialog>
  </div>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { FormRules } from 'element-plus/es/components/form/src/types'
import { CreateSecurityGroupType } from '../../type'
import { actionMap } from '../../config'
import { getCreateSecurityGrout } from '@/apis/network/security-group'
import { SecurityGroutRule } from '@/apis/network/type/security-group'
import { TemplateListInterface } from '../../type'
import { pushRoute } from '@/utils/router-jump'

const router = useRouter()

interface PropType {
  templateList: TemplateListInterface[]
  regionId: number
}

const props = withDefaults(defineProps<PropType>(), {})

const emits = defineEmits<{
  (event: 'success'): void
}>()

const ruleArr = ref([
  { label: t('securityGroup.inboundRules'), value: 'ingressRules', disabled: false },
  { label: t('securityGroup.egressRules'), value: 'egressRules', disabled: false },
])

const initRuleList = { ingressRules: [], egressRules: [] }

const show = ref<boolean>(false) // 弹窗显示
const showTip = ref<boolean>(false) // 提示弹窗显示

const state = reactive<{
  form: CreateSecurityGroupType
  comfirmLoading: boolean
  ruleTab: string //  入站规则，出站规则 tab切换
  isCollapse: boolean // 显示/隐藏规则列表
  ruleList: { ingressRules: SecurityGroutRule[]; egressRules: SecurityGroutRule[] } // 规则列表数据
  addQuery: { id?: number; name?: string; gid?: string }
}>({
  form: {
    template: '',
    name: '',
    description: '',
  },
  comfirmLoading: false,
  ruleTab: 'ingressRules',
  isCollapse: true,
  ruleList: initRuleList,
  addQuery: {},
})

const formRef = ref<any>()

const rules = reactive<FormRules<CreateSecurityGroupType>>({
  template: [{ required: true, message: '', trigger: 'blur' }],
  name: [
    { required: true, message: '', trigger: 'blur' },
    {
      pattern: /^[\w\u4e00-\u9fa5.-]{1,60}$/,
      message: t('securityGroup.addNameCondition'),
      trigger: 'blur',
    },
    // {
    //   validator: (rule, value, callback) => {
    //     if (value === '') {
    //       callback(new Error(t('')))
    //     } else if (!/^[\w\u4e00-\u9fa5.-]{1,60}$/.test(value)) {
    //       callback(new Error(t('')))
    //     } else {
    //       callback()
    //     }
    //   },
    //   trigger: 'blur',
    // },
  ],
  description: [{ required: true, message: '', trigger: 'blur' }],
})

// 选择模板
const changeTemplate = val => {
  state.ruleList =
    val === 0
      ? initRuleList
      : (props.templateList.find(item => item.id === val) as {
          ingressRules: SecurityGroutRule[]
          egressRules: SecurityGroutRule[]
        })
  formRef.value.validateField('template')
}

// 切换显示/隐藏规则列表
const changeRuleTable = () => {
  state.isCollapse = !state.isCollapse
}

// 初始化数据
const initData = (type = true) => {
  state.form = {
    template: '',
    name: '',
    description: '',
  }
  ;((state.ruleTab = 'ingressRules'), (state.isCollapse = true))
  state.ruleList = initRuleList
  formRef.value.resetFields()
  show.value = false
}

const confirmHandle = async () => {
  await formRef.value.validate()
  const params = {
    regionId: props.regionId,
    name: state.form.name,
    description: state.form.description,
    rules: [...state.ruleList.egressRules, ...state.ruleList.ingressRules],
  }
  state.comfirmLoading = true
  try {
    const res = await getCreateSecurityGrout(params)
    state.comfirmLoading = false
    if (res.success) {
      message.success(t('securityGroup.addSuccess'))
      // 如果新建安全组时选择了“自定义”模板，创建完成后可单击立即设置规则，进行 添加安全组规则。
      if (state.form.template === 0) {
        show.value = false
        state.addQuery = {
          id: res.data?.sgId,
          name: params.name,
          gid: res.data?.groupUuid,
        }
        showTip.value = true
      } else {
        emits('success')
        initData()
      }
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
    state.comfirmLoading = false
  }
}

// 提示弹框确认方法
const tipConfirmHandle = () => {
  showTip.value = false
  initData()
  pushRoute({
    name: 'network_security_security_group_detail',
    query: { ...state.addQuery },
  })
  state.addQuery = {}
}

// 提示弹框关闭方法
const tipCloseFn = () => {
  emits('success')
  state.addQuery = {}
  showTip.value = false
  initData()
}

// 弹窗打开
const open = () => {}

defineExpose({
  show,
})
</script>
<style scoped lang="scss">
.close {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #0063ff;
}

.name-desc {
  margin-top: 10px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 12px;
  font-weight: 400;
  line-height: 17px;
  color: #999;
}

:deep(.el-form-item__error) {
  line-height: initial !important;
}

:deep(.el-form .el-form-item .el-form-item__content .el-form-item__error) {
  position: absolute;
}
</style>
