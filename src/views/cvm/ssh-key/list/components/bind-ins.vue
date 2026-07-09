<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('sshKey.bindIns.title')"
    width="1000px"
    :loading="comfirmLoading"
    :confirm-text="t('sshKey.bindIns.confirmText')"
    :cancel-text="t('sshKey.bindIns.cancelText')"
    @confirm="confirmHandle"
    @update:dialog="cancel"
    @open="open"
  >
    <p class="tit mb10">
      <span v-html="t('sshKey.bindIns.selectSshKey', [sshKey.sshInsId])" />
    </p>
    <div class="df ac mb20">
      <div class="key-wrap mr20">
        <span v-html="t('sshKey.bindIns.selectArea')" />
      </div>
      <!-- 地域 -->
      <el-select v-model="area" class="select-opts mr20" :placeholder="t('sshKey.bindIns.areaPh')">
        <el-option v-for="item in areaOpts" :key="item.id" :label="item.regionName" :value="item.id">
          <div class="df ac opt-wrap w-full h-full">
            <div>{{ item.regionName }}</div>
          </div>
        </el-option>
      </el-select>
      <!-- 可用区 -->
      <el-select
        v-model="zoneId"
        class="select-opts"
        :placeholder="t('sshKey.bindIns.zonePh')"
        @change="listInstanceFn"
      >
        <el-option v-for="item in zoneList" :key="item.id" :label="item.zoneName" :value="item.id">
          <div class="df ac opt-wrap w-full h-full">
            <div>{{ item.zoneName }}</div>
          </div>
        </el-option>
      </el-select>
    </div>
    <el-row justify="space-between" :gutter="20">
      <!-- left -->
      <el-col :span="12">
        <div class="left-list-wrap">
          <div class="search-wrap mb10">
            <el-input v-model.trim="condition" :placeholder="t('sshKey.bindIns.searchPh')">
              <template #suffix>
                <SvgIcon name="dns-search" class="cursor-pointer" @click="listInstanceFn" />
              </template>
            </el-input>
          </div>

          <!-- 不做分页，滚动展示 -->
          <el-table
            ref="tableLeftRef"
            v-loading="loading"
            max-height="370px"
            :data="list"
            header-row-class-name="header-row"
            :row-class-name="tableRowClassName"
            @selection-change="handleRowSelectChange"
          >
            <el-table-column type="selection" :selectable="row => isSetSshKey(row.state, row.imageInfo?.platform)" />
            <el-table-column :label="t('sshKey.bindIns.insIdName')" min-width="200">
              <template #default="{ row }">
                <div class="df ac h-full">
                  <div>
                    <p class="text-primary">
                      {{ row.insUuid }}
                    </p>
                    <p>{{ row.instanceName }}</p>
                  </div>
                </div>
              </template>
            </el-table-column>
            <!-- 状态 -->
            <el-table-column :label="t('sshKey.bindIns.state')" min-width="150">
              <template #default="{ row }">
                <div class="df ac h-full">
                  <p>{{ INS_STATE_MAP[row.state] }}</p>
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="t('sshKey.bindIns.bindSshKeyAble')" min-width="240">
              <template #default="{ row }">
                <div class="df ac h-full">
                  <p>{{ row.sshId > 0 ? t('sshKey.bindIns.yes') : t('sshKey.bindIns.no') }}</p>
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="t('sshKey.bindIns.mainPublicIp')" min-width="200">
              <template #default="{ row }">
                <div class="df ac h-full">
                  <div>
                    <p>{{ handleRowIp(row).mainPublicIp }}</p>
                    <p>{{ handleRowIp(row).mainPrivateIp }}</p>
                  </div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <!-- right -->
      <el-col :span="12">
        <div class="right-list-wrap">
          <el-table
            v-loading="loading"
            max-height="410px"
            :data="selectList"
            header-row-class-name="header-row"
            :row-class-name="'row'"
          >
            <el-table-column :label="t('sshKey.bindIns.insIdName')" min-width="200">
              <template #default="{ row }">
                <div class="df ac h-full">
                  <div>
                    <p class="text-primary">
                      {{ row.insUuid }}
                    </p>
                    <p>{{ row.instanceName }}</p>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="t('sshKey.bindIns.state')" min-width="150">
              <template #default="{ row }">
                <div class="df ac h-full">
                  <p>{{ INS_STATE_MAP[row.state] }}</p>
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="t('sshKey.bindIns.bindSshKeyAble')" min-width="240">
              <template #default="{ row }">
                <div class="df ac h-full">
                  <p>{{ row.sshId > 0 ? t('sshKey.bindIns.yes') : t('sshKey.bindIns.no') }}</p>
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="t('sshKey.bindIns.mainPublicIp')" min-width="200">
              <template #default="{ row }">
                <div class="df ac h-full">
                  <div>
                    <p>{{ handleRowIp(row).mainPublicIp }}</p>
                    <p>{{ handleRowIp(row).mainPrivateIp }}</p>
                  </div>
                </div>
              </template>
            </el-table-column>
            <!-- 操作 -->
            <el-table-column width="48">
              <template #default="{ row }">
                <div class="df ac h-full">
                  <!-- 删除 -->
                  <el-icon @click="deleteSelectRowList(row)">
                    <CircleCloseFilled />
                  </el-icon>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </CatDialog>
</template>

<script lang="ts" setup>
import { message } from '@/utils/message'
import { CircleCloseFilled } from '@element-plus/icons-vue'
import t from '@/utils/i18n'
import { _bindKeypair } from '@/apis/cvm/ssh-key'
import { useCvmStore } from '@/store'
import { INS_STATE_MAP } from '@/views/cvm/ins/config'
import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'
import { useIns } from '@/views/cvm/hooks/use-ins'
import { isSetSshKey } from '@/views/cvm/ins/config'
import { isShowBindInsInsList } from '@/views/cvm/ssh-key/config'
interface PropType {
  sshKey: any
}

const props = withDefaults(defineProps<PropType>(), {
  sshKey: () => ({}),
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const cvmStore = useCvmStore()
const { listByRegionId } = useBaseConfig()
const { listInstance } = useIns()

const loading = ref<boolean>(false)
const comfirmLoading = ref<boolean>(false)
const selectList = ref<any[]>([]) // 选中的列表
const show = ref<boolean>(false) // 弹窗显示
const condition = ref<string>('') // 查询条件
const tableLeftRef = ref<any>()
const area = ref<number | undefined>() // 地域
const zoneId = ref<number | undefined>() // 可用区
const list = ref<any[]>([]) // 服务器列表
const zoneList = ref<any[]>([]) // 可用区列表

// 地域下拉列表
const areaOpts = computed(() => {
  return cvmStore.areaSelect.id ? [cvmStore.areaSelect] : []
})

// 处理可用区
const listByRegionIdFn = () => {
  const cb = (res: any) => {
    if (res.success) {
      zoneList.value = res.data || []
    }
  }
  const params = {
    regionId: cvmStore.areaSelect.id,
  }
  listByRegionId(params, cb)
}

// 主内ip地址
const handleRowIp = (row: any) => {
  console.log(`handleRowIp===>`, row)

  const networkInfos = row.networkInfos || []
  const res = networkInfos.find(el => el.primaryType === 1) // 主网卡
  const ipConfig: any = {}

  if (res) {
    ipConfig.mainPrivateIp = res.mainPrivateIp ? `${res.mainPrivateIp}${t('sshKey.bindIns.inside')}` : ''
    ipConfig.mainPublicIp = res.mainPublicIp ? `${res.mainPublicIp}${t('sshKey.bindIns.outside')}` : ''
  }

  return ipConfig
}

// table left 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  console.log(`handleRowSelectChange===>`, selection)
  selectList.value = selection
}

// table right 删除当前行
const deleteSelectRowList = (row: any) => {
  console.log(`deleteSelectRowList===>`, row)

  const i = selectList.value.findIndex(el => el.id === row.id)

  console.log(`deleteSelectRowList===>`, i)

  // 删除右边勾选
  if (i !== -1) {
    // console.log(`i===>`, i);

    selectList.value.splice(i, 1)
    console.log(selectList.value)
  }
  // 删除table left 勾选
  tableLeftRef.value?.toggleRowSelection(row)
}

// 设置row类名
const tableRowClassName = ({ row, rowIndex }: { row: any; rowIndex: number }) => {
  return selectList.value.includes(row) ? 'select-row row' : 'row'
}

const confirmHandle = () => {
  if (!selectList.value.length) {
    return message.warning(t('sshKey.bindIns.insWarning'))
  }

  bindKeypair()
}

// 弹窗打开
const open = () => {
  area.value = cvmStore.areaSelect.id
  condition.value = ''
  listByRegionIdFn()
  listInstanceFn()
}

// 弹窗关闭
const cancel = () => {
  condition.value = ''
}

// 分页查询服务器列表
const listInstanceFn = async () => {
  const params = {
    regionId: cvmStore.areaSelect.id,
    instanceId: condition.value,
    zoneId: zoneId.value,
  }

  const cb = (res: any) => {
    if (res.success) {
      list.value = res.data?.list?.filter(el => isShowBindInsInsList(el.state)) || []
    }
  }

  listInstance(params, cb)
}

// 绑定秘钥
const bindKeypair = async () => {
  comfirmLoading.value = true
  const serverIds = selectList.value.map(el => el.id)

  const params = {
    regionId: cvmStore.areaSelect.id, // 地域ID
    sshId: props.sshKey.id, // 秘钥ID
    serverIds, // 服务器ID
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
.tit {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #000;
}

:deep(.el-table) {
  --el-table-row-hover-bg-color: var(--selected-bgc);

  .el-table__inner-wrapper::before {
    background: transparent !important;
  }

  .header-row {
    background-color: #fff;

    .el-table__cell {
      /* border-width: 0px; */
      background-color: #fff !important;
    }
  }

  // 选中row
  .select-row {
    td {
      .cell {
        color: var(--primary-color);

        /* background: var(--el-table-current-row-bg-color); */
        background: var(--selected-bgc) !important;
      }
    }
  }

  .row {
    &:hover {
      background: var(--selected-bgc) !important;
    }

    .el-table__cell {
      border-width: 0;

      .cell {
        width: 100% !important;
        height: 100% !important;

        /* line-height: inherit; */
      }
    }
  }
}

.left-list-wrap,
.right-list-wrap {
  box-sizing: border-box;
  width: 100%;
  height: 438px;
  padding: 11px;
  border: 1px solid var(--border-c);
  border-radius: 4px;
}

.opt-wrap {
  padding: 0 8px;

  &:hover {
    color: #0063ff;
    background: #f1f7ff;
  }
}
</style>
