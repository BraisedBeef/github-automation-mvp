<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('disk.timeToFlow.title')"
    width="660px"
    :loading="comfirmLoading"
    @confirm="confirmHandle(formRef)"
    @update:dialog="() => {}"
    @open="open"
  >
    <Collapse v-model="isCollapse" :text="t('disk.timeToFlow.selectDisk', [1])">
      <el-table v-loading="loading" :data="list" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('disk.timeToFlow.idName')">
          <template #default="{ row }">
            <div class="text-primary">
              {{ row.insUuid }}
            </div>
            <div>{{ row.instanceName }}</div>
          </template>
        </el-table-column>
        <!-- 计费模式 -->
        <el-table-column min-width="200" :label="t('disk.timeToFlow.costType')">
          <template #default="{ row }">
            <span>{{ COST_TYPE_MAP[row.costType] }}</span>
          </template>
        </el-table-column>
        <!-- 创建/到期时间 -->
        <el-table-column min-width="200" :label="t('disk.timeToFlow.createTime')">
          <template #header>
            <div class="df ac">
              <span class="mr10">{{ t('disk.timeToFlow.createTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div>
              {{
                t(
                  'disk.timeToFlow.createTimeFormat',
                  row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '',
                )
              }}
            </div>
            <div>
              {{
                t(
                  'disk.timeToFlow.expiredTimeFormat',
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
        <el-form-item :label="t('disk.timeToFlow.remainDay')" prop="newPassword">
          <span>{{}}</span>
        </el-form-item>

        <!-- 退还费用 -->
        <el-form-item :label="t('disk.timeToFlow.returnPrice')" prop="confirmPassword">
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
import { COST_TYPE_MAP } from '@/views/cvm/ins/config'

interface PropType {}

interface Form {}

const props = withDefaults(defineProps<PropType>(), {})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const formRef = ref<FormInstance>()
const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const loading = ref<boolean>(false)
const list = ref<any[]>([]) // 列表
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
