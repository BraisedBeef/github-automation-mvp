<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('networkCard.deleteExpandNetworkCard')"
    width="950px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="() => {}"
    @open="open"
    @close="closeFn"
  >
    <p class="df ac jsb">
      <span class="len">{{ t('networkCard.selectExpandNetworkCardNumber', [list.length]) }}</span>
      <span class="text-primary close cursor-pointer" @click="isCollapse = !isCollapse">{{
        isCollapse ? t('networkCard.retract') : t('networkCard.expand')
      }}</span>
    </p>
    <el-collapse-transition>
      <div v-show="isCollapse" class="mt20">
        <el-table :data="list" max-height="170">
          <!-- ID/名称 -->
          <el-table-column min-width="100" :label="t('networkCard.idOrName')">
            <template #default="{ row }">
              <div class="text-primary">
                {{ row.eniUuid }}
              </div>
              <div>{{ row.name }}</div>
            </template>
          </el-table-column>
          <!-- 绑定资源 -->
          <el-table-column :label="t('networkCard.bindResources')">
            <template #default="{ row }">
              <div v-if="!!row.resourceId || row.resourceName">
                <div class="text-primary">
                  {{ row.resourceId }}
                </div>
                <div>{{ row.resourceName }}</div>
              </div>
              <div v-else>-</div>
            </template>
          </el-table-column>
          <!-- 所属网络 -->
          <el-table-column :label="t('networkCard.belongingNetwork')" min-width="150">
            <template #default="{ row }">
              <div class="text-primary">
                {{ row.vpcUuid }}
              </div>
              <div>{{ row.vpcName }}</div>
            </template>
          </el-table-column>
          <!-- 绑定的弹性公网IP -->
          <el-table-column :label="t('networkCard.bindingPublicIp')" min-width="150">
            <template #default="{ row }">
              <div>{{ row?.publicIp ? row.publicIp : '-' }}</div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-collapse-transition>
    <div class="mt20 confirm-box">
      {{ t('networkCard.confirmDeleteNetworkCard') }}
    </div>
    <div class="mt20">
      <!-- tip -->
      <Tip :text="tips" type="OneToMany" hide-margin-bottom />
    </div>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { deleteEni } from '@/apis/network/network-card'
import { message } from '@/utils/message'

const emits = defineEmits<{
  (event: 'success'): void
}>()

const tips = computed(() => [
  {
    main: t('networkCard.beCareful'),
    sub: [t('networkCard.deleteExpandNetworkCardTip')],
  },
])

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const list = ref<any[]>([])
const isCollapse = ref<boolean>(true) // 是否收起

const confirmHandle = async () => {
  const params = { eniIds: list.value.map(item => item.eniId) }
  comfirmLoading.value = true
  try {
    const res = await deleteEni(params)
    comfirmLoading.value = false
    if (res.success) {
      message.success(t('networkCard.deleteIxpandNetworkCardSuccess'))
      show.value = false
      isCollapse.value = true
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    comfirmLoading.value = false
    console.log('error', err)
  }
}

const closeFn = () => {
  show.value = false
  isCollapse.value = true
}

// 弹窗打开
const open = () => {}

defineExpose({
  show,
  list,
})
</script>
<style scoped lang="scss">
.msg {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #555;
}

.mb9 {
  margin-bottom: 9px;
}

.mb18 {
  margin-bottom: 18px;
}

.confirm-box {
  font-family: PingFangSC, 'PingFang SC';

  // font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #000;
}
</style>
