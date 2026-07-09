<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('securityGroup.confirmInsRemovalSecurityGroup', [route.query.name])"
    :width="dialogWidth"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @open="open"
  >
    <div>
      <el-table :data="instanceList" show-overflow-tooltip>
        <!-- 名称 -->
        <el-table-column min-width="160" :label="t('securityGroup.name')">
          <template #default="{ row }">
            {{ row.insName }}
          </template>
        </el-table-column>
        <!-- 类型 -->
        <el-table-column min-width="140" :label="t('securityGroup.type')">
          <template #default>
            {{ t('networkCard.server') }}
          </template>
        </el-table-column>
        <!-- 私有IP地址 -->
        <el-table-column min-width="200" :label="t('securityGroup.privateIpAddress')">
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div>IPv4:{{ row.publicIp }}</div>
              <div>IPv6:--</div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="mt20">
      <Tip :text="tips" type="OneToOne" hide-margin-bottom />
    </div>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { securityGroupUnbindInstance } from '@/apis/network/security-group'
import { message } from '@/utils/message'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

interface PropType {
  detailId: number
}

const props = withDefaults(defineProps<PropType>(), {})

const emits = defineEmits<{
  (event: 'success'): void
}>()

const tips = computed(() => [
  {
    main: t('securityGroup.insRemovalSecurityGroupTip'),
  },
])

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const dialogMap = {
  [ja]: '880px',
  [en]: '900px',
  [zh]: '660px',
}

const dialogWidth = useI18nStyle(dialogMap)

const route = useRoute()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const instanceList = ref<any[]>([{}])

const confirmHandle = async () => {
  const params = {
    groupId: props.detailId,
    insIds: instanceList.value.map(i => i.insId),
  }
  comfirmLoading.value = true
  try {
    const res = await securityGroupUnbindInstance(params)
    comfirmLoading.value = false
    if (res.success) {
      message.success(t('securityGroup.removelSecurityGroupSuccess'))
      show.value = false
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    comfirmLoading.value = false
    console.log('error', err)
  }
}

// 弹窗打开
const open = () => {}

defineExpose({
  show,
  instanceList,
})
</script>
<style scoped lang="scss"></style>
