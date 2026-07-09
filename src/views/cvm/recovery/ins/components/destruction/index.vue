<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('recovery.ins.destruction.title')"
    width="950px"
    :loading="loading"
    :disabled="!checked"
    :confirm-text="t('recovery.common.submitDestruction')"
    :cancel-text="t('recovery.common.close')"
    @confirm="confirmHandle"
    @update:dialog="cancel"
    @open="() => {}"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <Collapse v-model="isCollapse" :text="t('ins.destruction.selectIns', [insList.length])">
      <template #text>
        <p><span v-html="t('ins.destruction.resources1')" /></p>
      </template>

      <template #default>
        <!-- 实例 -->
        <div class="item mb20">
          <p class="len">
            {{ t('ins.destruction.selectInsC', [insList.length]) }}
          </p>
          <el-table :data="insList" class="mt20 table">
            <!-- ID/名称 -->
            <el-table-column min-width="200" :label="t('ins.destruction.idName')">
              <template #default="{ row }">
                <div class="text-primary pointer">
                  {{ row.insUuid }}
                </div>
                <div>{{ row.instanceName }}</div>
              </template>
            </el-table-column>
            <!-- 内网IP -->
            <el-table-column min-width="200" :label="t('ins.destruction.privateIp')">
              <template #default="{ row }">
                <div class="df ac">
                  <span>{{ handleRowMainPrivateIp(row) }}</span>
                </div>
              </template>
            </el-table-column>
            <!-- 实例类型 -->
            <el-table-column min-width="200" :label="t('ins.destruction.insType')">
              <template #default="{ row }">
                <div class="df ac">
                  <span>{{ row.specificationInfo?.typeName }}</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!-- 系统盘 -->
        <div class="item">
          <p class="len">
            {{ t('ins.destruction.selectDisk', [sysDiskConfig.list.length]) }}
          </p>
          <el-table :data="sysDiskConfig.list" class="mt20 table">
            <!-- ID/名称 -->
            <el-table-column min-width="200" :label="t('ins.destruction.idName')">
              <template #default="{ row }">
                <div class="text-primary">
                  {{ row.diskId }}
                </div>
                <div>{{ row.diskName }}</div>
              </template>
            </el-table-column>
            <!-- 属性 -->
            <el-table-column min-width="200" :label="t('ins.destruction.attr')">
              <template #default="{ row }">
                <div class="df ac">
                  <span>{{ DISK_TYPE_MAP[row.type] }}</span>
                </div>
              </template>
            </el-table-column>
            <!-- 配置 -->
            <el-table-column min-width="200" :label="t('ins.destruction.config')">
              <template #default="{ row }">
                <div class="df ac">
                  <span>{{ row.diskTypeName }}</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
    </Collapse>
    <el-checkbox v-model="checked" class="mt20">
      {{ t('recovery.common.releaseCheckboxDesc') }}
    </el-checkbox>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { DISK_TYPE_MAP, isSysDisk } from '@/views/cvm/disk/config'
import { _releaseInstance } from '@/apis/cvm/ins'
import { message } from '@/utils/message'

interface PropType {
  insList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  insList: () => [],
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const show = ref<boolean>(false)
const loading = ref<boolean>(false)
const isCollapse = ref<boolean>(false) // 是否收起
const checked = ref<boolean>(false)

const tips = computed(() => [
  {
    main: t('recovery.ins.destruction.tipsMain'),
    sub: [t('recovery.ins.destruction.tipsSub1'), t('recovery.ins.destruction.tipsSub2')],
  },
])

// 系统盘
const sysDiskConfig = computed(() => {
  let sysDisks: any[] = []

  for (const ins of props.insList) {
    const diskInfos = ins.diskInfos || []
    sysDisks = diskInfos.filter(el => isSysDisk(el.type))
  }

  console.log(`sysDisks===>`, sysDisks)

  return { list: sysDisks }
})

// 释放
const confirmHandle = async () => {
  loading.value = true
  // 服务器ID
  const serverIds = props.insList.map(el => el.id)

  try {
    const res = await _releaseInstance({
      serverId: serverIds[0], // 服务器ID
    })
    if (res.success) {
      message.success(res.msg)
      emits('success')
      show.value = false
    } else {
      message.warning(res.msg)
    }
  } finally {
    loading.value = false
  }
}

// 主内ip地址
const handleRowMainPrivateIp = (row: any) => {
  console.log(`handleRowIp===>`, row)
  const res = row.networkInfos?.find(el => el.primaryType === 1) // 主网卡

  return res ? res.mainPrivateIp : ''
}

// 弹窗关闭
const cancel = () => {
  isCollapse.value = false
  checked.value = false
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.confirm-text {
  margin-bottom: 10px;
  font-family: PingFangSC, 'PingFang SC';

  // font-weight: 500;
  font-size: 16px;
  color: #222;
}

.item-text {
  margin-bottom: 8px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #555;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.mb10 {
  margin-bottom: 10px;
}
</style>
