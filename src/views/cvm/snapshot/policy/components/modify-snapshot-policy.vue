<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('snapshot.policy.editTitle')"
    width="810px"
    :loading="comfirmLoading"
    @confirm="confirmHandle(editFormRef)"
    @update:dialog="cancel(editFormRef)"
    @open="open"
  >
    <!-- tip -->
    <Tip :text="tipsCreate" type="OneToOne" />

    <!-- form -->
    <div class="form-wrap mt20">
      <el-form
        ref="editFormRef"
        require-asterisk-position="right"
        label-width="auto"
        :model="editForm"
        :rules="editRules"
        label-position="left"
      >
        <!-- 名称 -->
        <el-form-item :label="t('ins.setSnapshot.name')" prop="name">
          <el-input v-model.trim="editForm.name" style="width: 400px" :placeholder="t('ins.setSnapshot.namePh')" />
        </el-form-item>
        <!-- 所属地域 -->
        <el-form-item :label="t('ins.setSnapshot.region')">
          <span>{{ cvmStore.areaSelect.regionName }}</span>
        </el-form-item>
        <!-- 备份周期 -->
        <el-form-item :label="t('ins.setSnapshot.backupCycle')">
          <BtnsGroup
            v-model="backupCycle"
            :list="backupCycleList"
            :style="{
              width: '110px',
            }"
          />
        </el-form-item>
        <!-- 备份日期 -->
        <el-form-item :label="t('ins.setSnapshot.backupDay')" prop="dayOfWeek">
          <div class="df ac">
            <el-checkbox-group v-model="editForm.dayOfWeek">
              <el-checkbox
                v-for="(item, index) in SNAPSHOT_STRAGETY_WEEK_MAP"
                :key="index"
                :label="item.value"
                :value="item.value"
                class="mr20"
              >
                {{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>
        <!-- 备份时间点 -->
        <el-form-item :label="t('ins.setSnapshot.backupTime')" prop="hour">
          <div class="df ac">
            <el-checkbox-group v-model="editForm.hour">
              <el-checkbox
                v-for="(item, index) in SNAPSHOT_STRAGETY_HOUR_MAP"
                :key="index"
                :label="item.value"
                :value="item.value"
                class="mr20"
                style="margin-bottom: 10px"
              >
                {{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>
        <!-- 保留类型 -->
        <el-form-item :label="t('ins.setSnapshot.retenteType')">
          <BtnsGroup
            v-model="reserveType"
            :list="reserveTypeList"
            :style="{
              width: '110px',
            }"
          />
        </el-form-item>
        <!-- 保留时间 -->
        <el-form-item :label="t('ins.setSnapshot.retenteTime')" prop="reserveDay">
          <div>
            <i18n-t keypath="ins.setSnapshot.saveTime">
              <el-input-number
                v-model="editForm.reserveDay"
                class="ml20 mr20"
                :min="1"
                :max="99999"
                @change="() => {}"
              />
            </i18n-t>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import {
  SNAPSHOT_STRAGETY_WEEK_MAP,
  SNAPSHOT_STRAGETY_HOUR_MAP,
  SNAPSHOT_STRAGETY_NAME_REG,
} from '@/views/cvm/snapshot/config'
import { FormInstance, FormRules } from 'element-plus/es'
import { useCvmStore } from '@/store'
import { _saveSnapshotPolicy } from '@/apis/cvm/snapshot'

interface EditForm {
  id: number
  name: string
  hour: any[]
  dayOfWeek: any[]
  reserveDay: number
}
interface PropType {
  snapshotPolicy: any
}

const props = withDefaults(defineProps<PropType>(), {
  snapshotPolicy: () => ({}),
})

const emits = defineEmits<{
  (event: 'success'): void
}>()

const backupCycleList = [
  {
    label: t('ins.setSnapshot.week'),
    value: 1,
  },
  // {
  //   label: '按月',
  //   value: 2,
  // },
  // {
  //   label: '按年',
  //   value: 3,
  // },
]

const reserveTypeList = [{ label: t('ins.setSnapshot.day'), value: 1 }]

// 校验名称
const checkName = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  } else if (!SNAPSHOT_STRAGETY_NAME_REG.test(value)) {
    callback(new Error(t('common.formatErr')))
  } else {
    callback()
  }
}

// 校验备份时间点
const checkHour = (rule: any, value: any, callback: any) => {
  if (!value.length) {
    callback(t('ins.setSnapshot.backupTimeWarning'))
  } else {
    callback()
  }
}

// 校验备份日期
const checkDayOfWeek = (rule: any, value: any, callback: any) => {
  if (!value.length) {
    callback(t('ins.setSnapshot.backupDayWarning'))
  } else {
    callback()
  }
}

const cvmStore = useCvmStore()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const editForm = reactive<EditForm>({
  id: 0,
  name: '',
  hour: [], // 备份时间点
  dayOfWeek: [], // 备份日期
  reserveDay: 1, // 保留天数
})
const backupCycle = ref({ label: t('ins.setSnapshot.week'), value: 1 })
const reserveType = ref({ label: t('ins.setSnapshot.day'), value: 1 })
const editRules = reactive<FormRules<EditForm>>({
  name: [{ required: true, validator: checkName, trigger: 'blur' }],
  hour: [{ required: true, validator: checkHour, trigger: 'change' }],
  dayOfWeek: [{ required: true, validator: checkDayOfWeek, trigger: 'change' }],
  reserveDay: [{ required: true, message: '', trigger: 'change' }],
})

const editFormRef = ref<FormInstance>()

const tipsCreate = computed(() => [
  {
    main: t('ins.setSnapshot.tipsCreateMain'),
  },
])

// 弹窗打开
const open = () => {
  editForm.id = props.snapshotPolicy.id
  editForm.name = props.snapshotPolicy.name
  editForm.hour = props.snapshotPolicy.hour
  editForm.dayOfWeek = props.snapshotPolicy.dayOfWeek
  editForm.reserveDay = props.snapshotPolicy.reserveDay
}

// 弹窗关闭
const cancel = (formEl: FormInstance | undefined) => {
  if (!formEl) return

  formEl.resetFields()
}

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
      saveSnapshotPolicy({
        id: editForm.id,
        name: editForm.name,
        type: backupCycle.value.value,
        hour: editForm.hour,
        dayOfWeek: editForm.dayOfWeek,
        reserveDay: editForm.reserveDay,
      })
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 保存定期快照策略
const saveSnapshotPolicy = async (params: any) => {
  try {
    comfirmLoading.value = true

    const res = await _saveSnapshotPolicy(params)

    console.log(`_saveSnapshotPolicy===>`, res)

    if (res.success) {
      message.success(res.msg)
      show.value = false
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    comfirmLoading.value = false
  }
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped></style>
