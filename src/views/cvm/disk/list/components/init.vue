<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('重新初始化云硬盘')"
    width="770px"
    :loading="comfirmLoading"
    cancel-text="关闭"
    @confirm="confirmHandle"
    @update:dialog="() => {}"
    @open="open"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <el-checkbox v-model="checked" class="mt20 mb20" size="large">
      我确认重新初始化以上云硬盘，数据将重置为初始化状态。
      <span class="text-error">我已知晓当前云硬盘中的数据将被清除且无法找回。</span>
    </el-checkbox>

    <Collapse v-model="isCollapse" text="已选择1块云硬盘">
      <el-table v-loading="loading" :data="list" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('ID/名称')">
          <template #default="{ row }">
            <div>ID/名称</div>
          </template>
        </el-table-column>
        <!-- 计费模式 -->
        <el-table-column min-width="200" :label="t('计费模式')">
          <template #default="{ row }">
            <div class="df ac">
              <span>计费模式</span>
            </div>
          </template>
        </el-table-column>
        <!-- 创建/到期时间 -->
        <el-table-column min-width="200" :label="t('创建/到期时间')">
          <template #default="{ row }">
            <div class="df ac">
              <span>创建/到期时间</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'

interface PropType {}

const props = withDefaults(defineProps<PropType>(), {})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const loading = ref<boolean>(false)
const list = ref<any[]>([]) // 列表
const isCollapse = ref<boolean>(false) // 是否收起
const checked = ref<boolean>(false)

const tips = computed(() => [
  {
    main: t('确定要初始化选中的云硬盘吗？ '),
    sub: [
      '· 您所选择的云硬盘将执行重新初始化操作。',
      '· 初始创建时为空盘的云硬盘将恢复至空盘状态，初始由快照创建而来的云硬盘将恢复至该快照状态。',
      ' · 强烈建议您首先制作快照备份数据。',
    ],
  },
])

const confirmHandle = () => {
  show.value = false
}

// 弹窗打开
const open = () => {}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped></style>
