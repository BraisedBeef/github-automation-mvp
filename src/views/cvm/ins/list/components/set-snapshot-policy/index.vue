<template>
  <!-- 设置定时快照策略 -->
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.setSnapshot.title')"
    :width="dialogClass"
    :loading="comfirmLoading"
    :disabled="!diskList.length"
    @confirm="confirmHandle(formRef)"
    @update:dialog="cancel(formRef)"
    @open="open"
  >
    <Collapse v-model="isCollapse" :text="t('ins.setSnapshot.selectDisk', [diskList.length])">
      <el-table :data="diskList" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('ins.setSnapshot.idName')">
          <template #default="{ row }">
            <div class="text-primary">
              {{ row.diskId }}
            </div>
            <div>{{ row.diskName }}</div>
          </template>
        </el-table-column>
        <!-- 配置 -->
        <el-table-column min-width="200" :label="t('ins.setSnapshot.config')">
          <template #default="{ row }">
            <div class="df ac">
              {{ row.diskTypeName }}
            </div>
            <div class="df ac">
              <span>{{ DISK_TYPE_MAP[row.type] }}{{ row.size || 0 }}GiB</span>
            </div>
          </template>
        </el-table-column>
        <!-- 计费模式 -->
        <el-table-column min-width="200" :label="t('ins.setSnapshot.costType')">
          <template #default="{ row }">
            <div class="df ac">
              <span>{{ COST_TYPE_MAP[row.costType] }}</span>
            </div>
          </template>
        </el-table-column>
        <!-- 实例信息 -->
        <el-table-column min-width="200" :label="t('ins.setSnapshot.insInfo')">
          <template #default="{ row }">
            <div class="df ac">
              <span>{{ row.insConfig.insUuid }}</span>
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
        :label-width="labelClass"
        :model="form"
        :rules="rules"
        label-position="left"
      >
        <!-- 定期快照策略下拉 -->
        <el-form-item :label="t('ins.setSnapshot.snapshot')" prop="snapshotPolicy">
          <div class="df ac">
            <el-select
              v-model="form.snapshotPolicy"
              class="select-opts"
              style="width: 580px"
              :placeholder="t('ins.setSnapshot.snapshotPh')"
            >
              <el-option
                v-for="(item, index) in snapshotPolicyList"
                :key="index"
                :label="
                  t('ins.setSnapshot.snapshotSelectItem', [
                    `${item.name} |`,
                    `${dayOfWeekText(item)} |`,
                    `${dayOfHourText(item)} |`,
                    item.reserveDay,
                  ])
                "
                :value="item.id"
              >
                <div class="df ac opt-wrap w-full h-full">
                  <div class="item text-over">
                    {{ item.name }}
                  </div>
                  <div class="item text-over mr10">
                    {{ dayOfWeekText(item) }}
                  </div>
                  <div class="item text-over mr10">
                    {{ dayOfHourText(item) }}
                  </div>
                  <div class="item text-over">
                    {{ t('ins.setSnapshot.snapshotSelectItemDay', [item.reserveDay]) }}
                  </div>
                </div>
              </el-option>
            </el-select>
            <span class="ml20 text-primary cursor-pointer" @click="showCreate = true">{{
              t('ins.setSnapshot.create')
            }}</span>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <p class="confirm-text mb20" :style="`margin-left: ${labelClass}`">
      {{ t('ins.setSnapshot.desc') }}
    </p>

    <!-- tip -->
    <Tip :text="tips" type="OneToMany" hide-margin-bottom />
  </CatDialog>
  <!-- 新建快照策略 -->
  <CatDialog
    v-model:dialog="showCreate"
    :title="t('ins.setSnapshot.titleCreate')"
    width="810px"
    :loading="createComfirmLoading"
    @confirm="confirmHandleCreate(createFormRef)"
    @update:dialog="cancelCreate(createFormRef)"
    @open="open"
  >
    <!-- tip -->
    <Tip :text="tipsCreate" type="OneToOne" />

    <!-- form -->
    <div class="form-wrap mt20">
      <el-form
        ref="createFormRef"
        require-asterisk-position="right"
        label-width="auto"
        :model="createForm"
        :rules="createRules"
        label-position="left"
      >
        <!-- 名称 -->
        <el-form-item :label="t('ins.setSnapshot.name')" prop="name">
          <el-input v-model.trim="createForm.name" style="width: 400px" :placeholder="t('ins.setSnapshot.namePh')" />
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
            <el-checkbox-group v-model="createForm.dayOfWeek">
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
            <el-checkbox-group v-model="createForm.hour">
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
                v-model="createForm.reserveDay"
                :class="saveTimeClass"
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
import { FormInstance, FormRules } from 'element-plus/es'
import { DISK_TYPE_MAP, isDataDisk } from '@/views/cvm/disk/config'
import { COST_TYPE_MAP, isSetSnapshot } from '@/views/cvm/ins/config'
import {
  SNAPSHOT_STRAGETY_WEEK_MAP,
  SNAPSHOT_STRAGETY_HOUR_MAP,
  SNAPSHOT_STRAGETY_NAME_REG,
} from '@/views/cvm/snapshot/config'
import { useCvmStore } from '@/store'
import { _saveSnapshotPolicy, _listSnapshotPolicy, _bindSnapshotPolicy } from '@/apis/cvm/snapshot'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const dialogMap = {
  [ja]: '1000px',
  [en]: '1000px',
  [zh]: '950px',
}
const labelMap = {
  [ja]: '200px',
  [en]: '220px',
  [zh]: '130px',
}

const saveTimeMap = {
  [ja]: 'mr20',
  [en]: 'ml20 mr20',
  [zh]: 'ml20 mr20',
}

const dialogClass = useI18nStyle(dialogMap)
const labelClass = useI18nStyle(labelMap)
const saveTimeClass = useI18nStyle(saveTimeMap)

interface CreateForm {
  name: string
  hour: any[]
  dayOfWeek: any[]
  reserveDay: number
}

interface Form {
  snapshotPolicy: string | number
}

interface PropType {
  insList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  insList: () => [],
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

const show = ref<boolean>(false)
const showCreate = ref<boolean>(false)
const comfirmLoading = ref<boolean>(false)
const createComfirmLoading = ref<boolean>(false)
const editComfirmLoading = ref<boolean>(false)
const isCollapse = ref<boolean>(false) // 是否收起
const snapshotPolicyList = ref<any[]>([]) // 快照策略集合
const backupCycle = ref({ label: t('ins.setSnapshot.week'), value: 1 })
const reserveType = ref({ label: t('ins.setSnapshot.day'), value: 1 })
const createForm = reactive<CreateForm>({
  name: '',
  hour: [], // 备份时间点
  dayOfWeek: [], // 备份日期
  reserveDay: 1, // 保留天数
})
const createRules = reactive<FormRules<CreateForm>>({
  name: [{ required: true, validator: checkName, trigger: 'blur' }],
  hour: [{ required: true, validator: checkHour, trigger: 'change' }],
  dayOfWeek: [{ required: true, validator: checkDayOfWeek, trigger: 'change' }],
  reserveDay: [{ required: true, message: '', trigger: 'change' }],
})
const form = reactive<Form>({
  snapshotPolicy: '', // 快照策略
})
const rules = reactive<FormRules<Form>>({
  snapshotPolicy: [{ required: true, message: '', trigger: 'change' }],
})

const formRef = ref<FormInstance>()
const createFormRef = ref<FormInstance>()

const tips = computed(() => [
  {
    main: t('ins.setSnapshot.tipsMain'),
    sub: [t('ins.setSnapshot.tipsSub1'), t('ins.setSnapshot.tipsSub2'), t('ins.setSnapshot.tipsSub3')],
  },
])

// 数据盘
const diskList = computed(() => {
  let disks: any[] = []
  for (const ins of props.insList) {
    // 和创建快照一样 排除系统盘,再筛选出数据盘
    let diskInfos = ins.diskInfos?.filter(el => isDataDisk(el.type))?.filter(el => isSetSnapshot(el.state)) || []
    diskInfos = diskInfos.map(el => ({ ...el, insConfig: { insUuid: ins.insUuid } }))

    disks = [...disks, ...diskInfos]
  }
  console.log(`diskList===>`, diskList)

  return disks
})

const tipsCreate = computed(() => [
  {
    main: t('ins.setSnapshot.tipsCreateMain'),
  },
])

// 日期格式
const dayOfWeekText = (raw: any, symbol: string = ' | ') => {
  const dayOfWeek = raw.dayOfWeek || []

  const arr = SNAPSHOT_STRAGETY_WEEK_MAP.filter(el => dayOfWeek.includes(el.value)).map(el => el.label)

  return arr.join(symbol)
}

// 时间格式
const dayOfHourText = (raw: any, symbol: string = ' | ') => {
  const hour = raw.hour || []

  const arr = SNAPSHOT_STRAGETY_HOUR_MAP.filter(el => hour.includes(el.value)).map(el => el.label)

  return arr.join(symbol)
}

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
      bindSnapshotPolicy()
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 弹窗打开
const open = () => {
  listSnapshotPolicy()
}

// 弹窗关闭
const cancel = (formEl: FormInstance | undefined) => {
  form.snapshotPolicy = ''
  if (formEl) {
    formEl.clearValidate()
  }
}

// 弹窗关闭
const cancelCreate = (formEl: FormInstance | undefined) => {
  createForm.name = ''
  createForm.hour = []
  createForm.dayOfWeek = []
  createForm.reserveDay = 1
  if (formEl) {
    formEl.clearValidate()
  }
}

const confirmHandleCreate = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
      saveSnapshotPolicy({
        name: createForm.name,
        type: backupCycle.value.value,
        hour: createForm.hour,
        dayOfWeek: createForm.dayOfWeek,
        reserveDay: createForm.reserveDay,
      })
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 保存定期快照策略
const saveSnapshotPolicy = async (params: any) => {
  try {
    createComfirmLoading.value = true
    editComfirmLoading.value = true

    const res = await _saveSnapshotPolicy(params)

    console.log(`_saveSnapshotPolicy===>`, res)

    if (res.success) {
      message.success(res.msg)
      listSnapshotPolicy()
      showCreate.value = false
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    createComfirmLoading.value = false
    editComfirmLoading.value = false
  }
}

// 定期快照策略列表
const listSnapshotPolicy = async () => {
  try {
    const res = await _listSnapshotPolicy({
      pageIndex: 1,
      pageSize: 999,
    })

    console.log(`_listSnapshotPolicy===>`, res)

    if (res.success) {
      snapshotPolicyList.value = res.data?.list || []

      if (form.snapshotPolicy) {
        const snapshotPolicyRes = snapshotPolicyList.value.find(el => el.id === form.snapshotPolicy)
        if (!snapshotPolicyRes) {
          form.snapshotPolicy = ''
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}

// 绑定定期快照策略
const bindSnapshotPolicy = async () => {
  try {
    createComfirmLoading.value = true

    const diskIds = diskList.value.map(el => el.id)

    const res = await _bindSnapshotPolicy({
      id: form.snapshotPolicy as number,
      diskIds,
    })

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
    createComfirmLoading.value = false
  }
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.opt-wrap {
  padding: 0 8px;

  &:hover {
    color: #0063ff;
    background: #f1f7ff !important;
  }

  .item {
    width: 33.33%;
    max-width: 145px;
    text-overflow: ellipsis;
  }

  .mr {
    margin-right: 10px;
  }
}

.confirm-text {
  margin-top: 8px;
  margin-left: 125px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #999;
}
</style>
