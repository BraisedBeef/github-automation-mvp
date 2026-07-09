<script setup lang="ts">
import t from '@/utils/i18n'
const props = withDefaults(
  defineProps<{
    text: string | number
    title: string
    disabled?: boolean
  }>(),
  {
    disabled: true,
  },
)

const store = reactive({
  dialogVisible: false,
  dialogTitle: props.title,
})
</script>

<template>
  <div>
    {{ props.text }}
    <span v-if="props.disabled" class="look" @click="store.dialogVisible = true">{{
      t('ssl-certificate.management.912399-0')
    }}</span>
  </div>
  <el-dialog v-model="store.dialogVisible" :title="store.dialogTitle" width="500">
    <el-scrollbar class="content" max-height="200">
      <slot />
    </el-scrollbar>
    <template #footer>
      <div class="dialog-footer">
        <el-button style="width: 90px" @click="store.dialogVisible = false">
          {{ t('ssl-certificate.management.912399-1') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.look {
  color: #0063ff;
  cursor: pointer;
}

.content {
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.dialog-footer {
  text-align: center;
}
</style>
