<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('disk.createSnapshot.title')"
    :width="dialogClass"
    :loading="comfirmLoading"
    :disabled="loading || maxSnapshotCount <= 0"
    @confirm="confirmHandle(formRef)"
    @update:dialog="cancel(formRef)"
    @open="open"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <!-- form -->
    <div class="form-wrap mt20">
      <el-form
        ref="formRef"
        require-asterisk-position="right"
        label-width="auto"
        :model="form"
        :rules="rules"
        label-position="left"
        @submit.prevent
      >
        <!-- 云硬盘ID -->
        <el-form-item :label="t('disk.createSnapshot.id')">
          <span>{{ disk.diskId || '-' }}</span>
        </el-form-item>
        <!-- 云硬盘类型 -->
        <el-form-item :label="t('disk.createSnapshot.diskType')">
          <span>{{ disk.diskType || '-' }}</span>
        </el-form-item>
        <!-- 快照名称 -->
        <el-form-item :label="t('disk.createSnapshot.snapshotName')" prop="name">
          <el-input
            v-model.trim="form.name"
            style="width: 400px"
            :placeholder="t('disk.createSnapshot.snapshotNamePh')"
            :maxlength="SNAPSHOT_NAME_LEN_MAX"
            @keydown.enter.prevent
          />
          <p class="name-desc">
            {{ nameDesc }}
          </p>
        </el-form-item>
        <!-- 云硬盘名称 -->
        <el-form-item :label="t('disk.createSnapshot.diskName')">
          <span>{{ disk.diskName || '-' }}</span>
        </el-form-item>
        <!-- 云硬盘容量 -->
        <el-form-item :label="t('disk.createSnapshot.size')">
          <span>{{ disk.size || '-' }}GiB</span>
        </el-form-item>
      </el-form>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { FormInstance, FormRules } from 'element-plus/es'
import { _createSnapshot } from '@/apis/cvm/snapshot'
import { SNAPSHOT_COUNT_MAX, SNAPSHOT_NAME_LEN_MAX, SNAPSHOT_NAME_REG } from '@/views/cvm/disk/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { _listDisk } from '@/apis/cvm/disk'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const dialogMap = {
  [ja]: '610px',
  [en]: '610px',
  [zh]: '550px',
}

const dialogClass = useI18nStyle(dialogMap)

interface PropType {
  disk: any
}

interface Form {
  name: string
}

const props = withDefaults(defineProps<PropType>(), {
  disk: () => ({}),
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

// 校验快照名称
const checkSnapshotName = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  } else if (!SNAPSHOT_NAME_REG.test(value)) {
    callback(new Error(t('disk.createSnapshot.nameRuleDesc')))
  } else {
    callback()
  }
}

const formRef = ref<FormInstance>()
const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const form = reactive<Form>({
  name: '',
})

const rules = reactive<FormRules<Form>>({
  name: [{ required: true, validator: checkSnapshotName, trigger: 'blur' }],
})

// 硬盘列表
const loading = ref<boolean>(false)
const diskInfo = ref<any>({})
const listDisk = async (id: any) => {
  try {
    loading.value = true
    const params = {
      id, // 硬盘id
      pageIndex: 1, // 页码
      pageSize: 10, // 每页数量
    }
    const res = await _listDisk(params)
    diskInfo.value = res.data.list[0] || {}
    console.log(`_listDisk===>`, res)
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 剩余创建快照数量
const maxSnapshotCount = computed(() => {
  return SNAPSHOT_COUNT_MAX - diskInfo.value.snapshotCount || 0
})
const tips = computed(() => [
  {
    main: t('disk.createSnapshot.tipsMain'),
    sub: [
      t('disk.createSnapshot.tipsSub1', [
        diskInfo.value.snapshotCount || 0,
        SNAPSHOT_COUNT_MAX - diskInfo.value.snapshotCount || 0,
      ]),
      t('disk.createSnapshot.tipsSub2'),
    ],
  },
])

// 快照名称
const nameDesc = computed(() => {
  const len = form.name.length
  return t('disk.createSnapshot.nameDesc', [60 - len])
})

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
      createSnapshot()
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 弹窗打开
const open = () => {
  listDisk(props.disk.id)
}

// 弹窗关闭
const cancel = (formEl: FormInstance | undefined) => {
  if (!formEl) return

  formEl.resetFields()
}

// 创建快照
const createSnapshot = async () => {
  try {
    comfirmLoading.value = true

    const res = await _createSnapshot({
      diskId: props.disk.id, // 硬盘id
      name: form.name, // 快照名称
      regionId: props.disk.regionId, // 区域id
    })

    console.log(`createSnapshot===>`, res)

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

<style lang="scss" scoped>
.form-wrap {
  /* width: 55%; */
}

.name-desc {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 12px;
  font-weight: 400;
  color: #999;
}
</style>
