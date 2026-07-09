<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.timeToFlow.title')"
    width="660px"
    :loading="comfirmLoading"
    @confirm="confirmHandle(formRef)"
    @update:dialog="() => {}"
    @open="open"
  >
    <Collapse v-model="isCollapse" :text="t('ins.timeToFlow.selectIns', [1])">
      <el-table v-loading="loading" :data="insList" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('ins.timeToFlow.idName')">
          <template #default="{ row }">
            <div class="text-primary">
              {{ row.insUuid }}
            </div>
            <div>{{ row.instanceName }}</div>
          </template>
        </el-table-column>
        <!-- 实例类型 -->
        <el-table-column min-width="200" :label="t('ins.timeToFlow.insType')">
          <template #default="{ row }">
            <div class="df ac">
              <span class="mr10">{{ row.specificationInfo?.typeName }}</span>
              <SvgIcon style="width: 17px; height: 17px" :name="INS_SYS_SVG_MAP[row.imageInfo.platform]?.actived" />
            </div>
          </template>
        </el-table-column>
        <!-- 实例配置 -->
        <el-table-column min-width="200" :label="t('ins.flowToTime.insConfig')">
          <template #default="{ row }">
            <div style="padding: 14px 0">
              <p>
                <span class="mr10">{{ t('ins.expans.cores', [row.specificationInfo?.vcpus]) }}</span
                ><span class="mr10">{{ row.specificationInfo?.ram }}GB</span
                ><span class="mr10">{{ handleRowMainPublicBandwidth(row) }}Mbps</span>
              </p>
              <p>{{ t('ins.expans.sysDisk') }}{{ handleRowSysDiskName(row) }}</p>
              <p>{{ t('ins.expans.net') }}{{ handleRowVpcName(row) }}</p>
            </div>
          </template>
        </el-table-column>
        <!-- 转换后到期时间 -->
        <el-table-column min-width="200" :label="t('ins.timeToFlow.convertExpiredTime')">
          <template #header>
            <div class="df ac">
              <span class="mr10">{{ t('ins.timeToFlow.convertExpiredTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div>
              {{
                t(
                  'ins.timeToFlow.expiredTimeFormat',
                  row.expiredTime ? maoYunDayJs(row.expiredTime).format(FORMAT_TIME) : '',
                )
              }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>

    <!-- form -->
    <div class="form-wrap mt20">
      <el-form
        ref="formRef"
        require-asterisk-position="right"
        label-width="auto"
        :model="form"
        :rules="rules"
        label-position="left"
      >
        <!-- 剩余使用天数 -->
        <el-form-item :label="t('ins.timeToFlow.remainDay')" prop="newPassword">
          <span>{{}}</span>
        </el-form-item>

        <!-- 退还费用 -->
        <el-form-item :label="t('ins.timeToFlow.returnPrice')" prop="confirmPassword">
          <span class="text-warning">${{ 0 }} USD</span>
        </el-form-item>
      </el-form>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { FormInstance, FormRules } from 'element-plus/es'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { INS_SYS_SVG_MAP } from '@/views/cvm/ins/config'
import { useInsTableRow } from '@/views/cvm/hooks/use-ins-table-row'

interface PropType {
  insList: any[]
}

interface Form {}

const props = withDefaults(defineProps<PropType>(), {})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const { handleRowSysDiskName, handleRowVpcName, handleRowMainPublicBandwidth } = useInsTableRow()

const formRef = ref<FormInstance>()
const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const loading = ref<boolean>(false)
const isCollapse = ref<boolean>(false) // 是否收起
const form = reactive<Form>({})

const rules = reactive<FormRules<Form>>({})

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
  })
}
// 弹窗打开
const open = () => {}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped></style>
