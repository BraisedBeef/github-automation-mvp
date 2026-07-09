<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.setSshKey.title')"
    width="760px"
    :loading="comfirmLoading"
    :confirm-text="t('ins.setSshKey.confirmText')"
    :cancel-text="t('ins.setSshKey.cancelText')"
    @confirm="confirmHandle"
    @update:dialog="cancel"
    @open="open"
  >
    <!-- tip -->
    <!-- <Tip :text="stopedTips" type="OneToMany" v-if="type === 'RUNNING'" />
    <Tip :text="runningTips" type="OneToOne" v-else /> -->

    <Collapse v-model="isCollapse" :text="t('ins.setSshKey.selectIns', [insList.length])">
      <el-table :data="insList" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('ins.setSshKey.idName')">
          <template #default="{ row }">
            <div class="text-primary">
              {{ row.insUuid }}
            </div>
            <div>{{ row.instanceName }}</div>
          </template>
        </el-table-column>
        <!-- 实例类型 -->
        <el-table-column min-width="200" :label="t('ins.setSshKey.insType')">
          <template #default="{ row }">
            <div class="df ac">
              <span class="mr10">{{ row.specificationInfo?.typeName }}</span>
              <SvgIcon style="width: 17px; height: 17px" :name="INS_SYS_SVG_MAP[row.imageInfo.platform]?.actived" />
            </div>
          </template>
        </el-table-column>
        <!-- 实例配置 -->
        <el-table-column min-width="300" :label="t('ins.setSshKey.insConfig')">
          <template #default="{ row }">
            <div style="padding: 14px 0">
              <p>
                <span class="mr10">{{ t('ins.setSshKey.cores', [row.specificationInfo?.vcpus]) }}</span
                ><span class="mr10">{{ row.specificationInfo?.ram }}GB</span
                ><span class="mr10">{{ handleRowMainPublicBandwidth(row) }}Mbps</span>
              </p>
              <p>{{ t('ins.setSshKey.sysDisk') }}{{ handleRowSysDiskName(row) }}</p>
              <p>{{ t('ins.setSshKey.net') }}{{ handleRowVpcName(row) }}</p>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>

    <div class="search-wrap mt20">
      <p class="mb10 key">
        {{ t('ins.setSshKey.searchDesc') }}
      </p>

      <el-input v-model="condition" :placeholder="t('ins.setSshKey.searchPh')">
        <template #suffix>
          <SvgIcon name="dns-search" class="cursor-pointer" @click="listSSh" />
        </template>
      </el-input>
    </div>

    <el-table v-loading="loading" :data="sshKeyList" max-height="170px" class="mt20 table">
      <template #empty>
        <span class="cursor-pointer">{{ t('ins.setSshKey.noSshKey') }}</span
        ><span class="text-primary cursor-pointer" @click="pushRoute({ name: 'ssh_key' })">{{
          t('ins.setSshKey.create')
        }}</span>
      </template>

      <!-- 名称 -->
      <el-table-column min-width="200" :label="t('ins.setSshKey.name')">
        <template #default="{ row }">
          <el-radio v-model="checkedSshId" :label="row.id">
            <div class="text-over">
              {{ row.sshName || '-' }}
            </div>
          </el-radio>
        </template>
      </el-table-column>
      <!-- ID -->
      <el-table-column min-width="200" :label="t('ID')">
        <template #default="{ row }">
          <div class="df ac">
            <span>{{ row.sshInsId }}</span>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <p v-if="type === 'RUNNING'" class="mt20 df ac">
      <span class="method"><span class="text-error">*</span>{{ t('ins.setSshKey.forceShutdown') }}</span>
      <el-checkbox :model-value="checked" :label="t('ins.setSshKey.forceShutdownChecked')" size="large" />
    </p>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { useInsTableRow } from '@/views/cvm/hooks/use-ins-table-row'
import { useCvmStore } from '@/store'
import { _listSSh, _bindKeypair } from '@/apis/cvm/ssh-key'

import { INS_SYS_SVG_MAP } from '@/views/cvm/ins/config'
import { pushRoute } from '@/utils/router-jump'

interface PropType {
  insList: any[]
  type: 'STOPPED' | 'RUNNING'
}

const props = withDefaults(defineProps<PropType>(), {
  insList: () => [],
  type: 'STOPPED',
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const cvmStore = useCvmStore()
const { handleRowSysDiskName, handleRowVpcName, handleRowMainPublicBandwidth } = useInsTableRow()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const loading = ref<boolean>(false)
const isCollapse = ref<boolean>(false) // 是否收起
const checked = ref<boolean>(true) // 是否强制关机
const checkedSshId = ref<number>(0) // 秘钥ID
const condition = ref<string>('') // 查询条件
const sshKeyList = ref<any[]>([]) // ssh key列表

const stopedTips = computed(() => [
  {
    main: t('ins.setSshKey.tipsMain'),
    sub: [t('ins.setSshKey.tipsSub1'), t('ins.setSshKey.tipsSub2'), t('ins.setSshKey.tipsSub3')],
  },
])

const runningTips = computed(() => [
  {
    main: t('ins.setSshKey.tipsRunningMain'),
  },
])

const confirmHandle = () => {
  if (!checkedSshId.value) {
    return message.warning(t('ins.setSshKey.sshKeyWarning'))
  }

  bindKeypair()
}
// 弹窗打开
const open = () => {
  listSSh()
}

// 弹窗关闭
const cancel = () => {
  condition.value = ''
}

// 分页查询秘钥列表
const listSSh = async () => {
  try {
    loading.value = true

    const res = await _listSSh({
      pageIndex: 1,
      pageSize: 999,
      sshName: condition.value,
      regionId: cvmStore.areaSelect.id,
    })

    console.log(`_listSSh===>`, res)

    if (res.success) {
      sshKeyList.value = res.data?.list || []
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 绑定秘钥
const bindKeypair = async () => {
  comfirmLoading.value = true

  const serverIds = props.insList.map(el => el.id)
  let params: any = {
    regionId: cvmStore.areaSelect.id, // 地域ID
    sshId: checkedSshId.value, // 秘钥ID
    serverIds, // 服务器ID
  }

  if (props.type === 'RUNNING') {
    params.forceStop = checked.value
  }

  try {
    const res = await _bindKeypair(params)

    console.log(`_bindKeypair===>`, res)

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
.method {
  margin-right: 44px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #999;
}

.search-wrap {
  .key {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #000;
  }
}
</style>
