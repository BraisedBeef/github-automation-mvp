<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('securityGroup.delectSecurityGroupRule')"
    width="660px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="() => {}"
    @open="open"
  >
    <div>
      <el-table :data="ruleList" show-overflow-tooltip>
        <!-- 来源 -->
        <el-table-column min-width="160" :label="t('securityGroup.source')">
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div v-if="row.type === 1">
                {{ row.remoteIpPrefix }}
              </div>
              <div v-else-if="row.type === 2">
                <div class="text-primary text-over">
                  {{ row.remoteGroupId }}
                </div>
                <div class="text-over">
                  {{ row.remoteGroupName || '' }}
                </div>
              </div>
              <div v-else-if="row.type === 3">
                <div class="text-primary text-over">
                  {{ row.remoteAddressGroupId }}
                </div>
                <div class="text-over">
                  {{ row.remoteAddressGroupName || '' }}
                </div>
              </div>
            </div>
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
        <el-table-column min-width="160" :label="t('securityGroup.remark')">
          <template #default="{ row }">
            {{ row.description }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="props.insNum > 0" class="mt20">
      <Tip :text="tips" type="OneToOne" hide-margin-bottom />
    </div>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { actionMap } from '../../../list/config'
import { deleteSecurityGroupRule } from '@/apis/network/security-group'
import { message } from '@/utils/message'

interface PropType {
  regionId: number
  groupId: number
  direction: string
  insNum: number
}

const props = withDefaults(defineProps<PropType>(), {})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const tips = computed(() => [
  {
    main: t('securityGroup.securityGroupAssociationInsNum', [props.insNum]),
  },
])

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const ruleList = ref<any[]>([])

const confirmHandle = async () => {
  const params = {
    regionId: props.regionId,
    groupId: props.groupId,
    direction: props.direction,
    groupRuleIds: ruleList.value.map(item => item.id),
  }
  comfirmLoading.value = true
  try {
    const res = await deleteSecurityGroupRule(params)
    comfirmLoading.value = false
    if (res.success) {
      message.success(t('securityGroup.deleteSuccess'))
      show.value = false
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
    comfirmLoading.value = false
  }
}
// 弹窗打开
const open = () => {}

defineExpose({
  show,
  ruleList,
})
</script>
<style scoped lang="scss"></style>
