<template>
  <CatDialog
    v-model:dialog="show"
    :loading="loading"
    :title="$t('oss.customListFields')"
    :width="dialogClass"
    @update:dialog="cancel"
    @open="open"
    @confirm="confirmHandle"
  >
    <Tip
      :text="[
        {
          main: t('oss.customListFieldsTip'),
        },
      ]"
      type="OneToOne"
      theme="danger"
    />
    <el-checkbox-group v-model="tempCheckList" class="checkbox-group">
      <el-checkbox v-for="item in checkOp" :key="item.value" :label="item.value" :disabled="item.disabled">
        {{ item.label }}
      </el-checkbox>
    </el-checkbox-group>
  </CatDialog>
</template>

<script lang="ts" setup>
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import t from '@/utils/i18n'

const props = defineProps<{ checkList: number[] }>()
const emits = defineEmits(['update:checkList', 'confirm'])
const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const dialogMap = {
  [ja]: '810px',
  [en]: '940px',
  [zh]: '810px',
}
const dialogClass = useI18nStyle(dialogMap)

const checkOp = [
  {
    label: t('oss.bucketName'),
    value: 1,
    disabled: true,
  },
  // {
  //   label: t('oss.tagCount'),
  //   value: 2,
  // },
  {
    label: t('oss.accessPermissions'),
    value: 3,
  },
  {
    label: t('oss.region'),
    value: 4,
  },
  {
    label: t('oss.storage'),
    value: 5,
  },
  {
    label: t('oss.createTime'),
    value: 6,
  },
  {
    label: t('oss.operation'),
    value: 7,
    disabled: true,
  },
]

const show = ref<boolean>(false)
const loading = ref<boolean>(false)
const tempCheckList = ref<number[]>([])

// 弹窗打开
const open = async () => {
  tempCheckList.value = [...props.checkList] // 打开时复制初始值
  show.value = true
}

const confirmHandle = () => {
  emits('confirm', tempCheckList.value)
  cancel()
}

// 弹窗关闭
const cancel = () => {
  tempCheckList.value = [] // 清空临时选择
  show.value = false
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.checkbox-group {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  border: 1px solid #ddd;

  .el-checkbox {
    height: 44px !important;
    padding: 0 20px;
    line-height: 44px;
  }

  .el-checkbox + .el-checkbox {
    border-top: 1px solid #ddd;
  }
}
</style>
