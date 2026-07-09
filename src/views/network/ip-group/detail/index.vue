<template>
  <div>
    <PageHeader :title="state.detail?.groupUuid" :back-title="t('ipGroup.ipGroup')">
      <template #right>
        <div />
      </template>
    </PageHeader>
    <div class="df jsb ac tabs-wrap">
      <!-- tabs -->
      <div class="df">
        <CatTabs v-model="pageActive" class="tabs" :tabs="pageTabs" />
      </div>
    </div>

    <div v-if="pageActive === 1">
      <div style="padding: 20px">
        <el-card v-loading="state.loading" shadow="never" class="page-box" :body-style="bodyStyle">
          <div class="tit mb20">
            {{ t('ipGroup.basicInfo') }}
          </div>
          <div class="detail-wrap df oh">
            <div class="detail-wrap-left">
              <!-- IP地址组ID -->
              <div class="item mb20">
                <div class="name lh21">
                  {{ t('ipGroup.ipGroupId') }}
                </div>
              </div>
              <!-- IP地址组名称 -->
              <div class="item" :class="nameInputRef?.show ? 'mb44' : 'mb20'">
                <div class="name lh21">
                  {{ t('ipGroup.ipGroupName') }}
                </div>
              </div>
              <!-- IP类型 -->
              <div class="item mb20">
                <div class="name">
                  {{ t('ipGroup.ipType') }}
                </div>
              </div>
              <!-- 已使用/可使用 -->
              <div class="item mb20">
                <div class="name">
                  {{ t('ipGroup.usedOrAvailable') }}
                </div>
              </div>
              <!-- 创建时间 -->
              <div class="item mb20">
                <div class="name df ac">
                  <span class="mr10">{{ t('ipGroup.createTime') }}</span>
                  <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                    <SvgIcon name="cat-cdn-help" />
                  </el-tooltip>
                </div>
              </div>
              <!-- 备注 -->
              <div class="item">
                <div class="name lh21">
                  {{ t('ipGroup.remark') }}
                </div>
              </div>
            </div>
            <div class="detail-wrap-right">
              <div class="item mb20">
                <div class="value">
                  <Copy :text="state.detail.groupUuid" />
                </div>
              </div>
              <div class="item" :class="nameInputRef?.show ? 'mb13 mt-negative-6' : 'mb20'">
                <div class="value">
                  <EditInput
                    ref="nameInputRef"
                    v-model="state.name"
                    :rules="nameRules"
                    :cancel-fn="cancelName"
                    input-style="max-width: 380px;width: 380px"
                    :max-length="60"
                    @confirm="updateName"
                  />
                  <p v-show="nameInputRef?.show" class="tips">
                    {{ t('privateNetwork.nameRule') }}
                  </p>
                </div>
              </div>
              <div class="item mb20">
                <div class="value">
                  {{ state.detail.etherType }}
                </div>
              </div>
              <div class="item mb20">
                <div class="value">{{ state.detail?.usedCount || 0 }}/{{ state.detail?.totalCount || 0 }}</div>
              </div>
              <div class="item mb20">
                <div class="value">
                  {{ state.detail?.createTime ? maoYunDayJs(state.detail?.createTime).format(FORMAT_TIME) : '-' }}
                </div>
              </div>
              <div class="item" :class="descriptionInputRef?.show ? 'mb4 mt-negative-7' : 'mb10'">
                <div class="value">
                  <EditInput
                    ref="descriptionInputRef"
                    v-model="state.description"
                    :max-length="256"
                    :cancel-fn="cancelDescription"
                    input-style="max-width: 400px;width: 400px"
                    @confirm="updateDescription"
                  />
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <div style="padding: 0 20px 20px">
        <el-card v-loading="state.loading" shadow="never" class="page-box" :body-style="bodyStyle">
          <div class="oh">
            <div>
              <el-button
                v-if="checkPermission(permMap.ipGroup.ADD_IP_ADDRESS)"
                type="primary"
                @click="changeShow(setAddIpRef)"
              >
                {{ t('ipGroup.addIpAddress') }}
              </el-button>
              <el-button
                v-if="checkPermission(permMap.ipGroup.DELETE_IP_ADDRESSES_BULK)"
                :disabled="!state.selectIpList.length"
                @click="batchDelete(setDeleteIpRef)"
              >
                {{ t('ipGroup.delete') }}
              </el-button>
            </div>
            <el-table :data="state.ipList" class="mt20 table" @selection-change="handleRowSelectChange">
              <el-table-column type="selection" width="40" />
              <!-- IP地址 -->
              <el-table-column min-width="200" :label="t('ipGroup.ipAddress')">
                <template #default="{ row }">
                  <Copy :text="row.ip" />
                </template>
              </el-table-column>
              <!-- 描述 -->
              <el-table-column min-width="200" :label="t('ipGroup.describe')" show-overflow-tooltip>
                <template #default="{ row }">
                  <div class="table-td_tooltip">
                    <div class="text-over">
                      {{ row?.description && row.description !== '' ? row.description : '-' }}
                    </div>
                  </div>
                </template>
              </el-table-column>
              <!-- 操作 -->
              <el-table-column min-width="140" :label="t('ipGroup.operate')">
                <template #default="{ row }">
                  <span
                    v-if="checkPermission(permMap.ipGroup.DELETE_IP_ADDRESS_SINGLE)"
                    class="text-primary cursor-pointer"
                    @click="deleteFn(setDeleteIpRef, row)"
                    >{{ t('ipGroup.delete') }}</span
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </div>
    </div>
    <div v-else>
      <div style="padding: 20px">
        <el-card shadow="never" class="page-box" :body-style="bodyStyle">
          <el-table v-loading="state.resourceLoading" :data="state.resourceList" class="mt20 table">
            <!-- ID -->
            <el-table-column min-width="200" :label="t('ID')">
              <template #default="{ row }">
                <div class="text-primary cursor-pointer" @click="() => goSecurityGroup(row)">
                  {{ row.id }}
                </div>
              </template>
            </el-table-column>
            <!-- 名称 -->
            <el-table-column min-width="200" :label="t('ipGroup.name')" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="table-td_tooltip">
                  <div class="text-over">
                    {{ row.name }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <!-- 类别 -->
            <el-table-column min-width="200" :label="t('ipGroup.category')">
              <template #default>
                <div>{{ t('ipGroup.secrityGroup') }}</div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </div>
    <!-- 新建IP地址 -->
    <SetAddIp ref="setAddIpRef" :detail="state.detail" @success="getDetail" />
    <!-- 删除IP地址 -->
    <SetDeleteIp ref="setDeleteIpRef" :detail="state.detail" @success="getDetail" />
  </div>
</template>

<script setup lang="ts">
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import dayjs from 'dayjs'
import { useCvmStore } from '@/store'
import { useBaseStore, useTempStore } from '@/store'
import { pageTabs } from './config'
import SetAddIp from './components/set-add-ip/index.vue'
import SetDeleteIp from './components/set-delete-ip/index.vue'
import { getIpGroupDetail } from '@/apis/network/ip-group'
import { message } from '@/utils/message'
import { updateIpGroup, ipListSecurityGroup } from '@/apis/network/ip-group'
import { nameRules } from '@/views/network/private-network/list/config'
import { permMap, moduleMap, useCvmAndNetworkPermission } from '@/hooks/permission/use-cvm-and-network-permission'
import { pushRoute } from '@/utils/router-jump'

const cvmStore = useCvmStore()

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.ipGroup,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const route = useRoute()
const router = useRouter()

const bodyStyle = { height: '100%' }

const pageActive = ref<number>(1)

const state = reactive<{
  id: number
  regionId: number
  loading: boolean
  name: string // 编辑的名称
  description: string // 编辑的备注
  detail: any
  ipList: any[] // ip地址列表
  selectIpList: any[] // 已选择的IP地址列表
  resourceList: any[] // 关联资源列表
  resourceLoading: boolean
  nameLoading: boolean // 名称修改loading
  remarkLoading: boolean // 备注修改loading
}>({
  id: 0,
  regionId: cvmStore.areaSelect.id,
  loading: false,
  name: '',
  description: '',
  detail: {},
  ipList: [],
  selectIpList: [],
  resourceList: [],
  resourceLoading: false,
  nameLoading: false,
  remarkLoading: false,
})

const nameInputRef = ref<any>(null)
const descriptionInputRef = ref<any>(null)

// 获取ip组详情
const getDetail = async () => {
  const params = { groupId: state.id }
  state.loading = true
  try {
    const res = await getIpGroupDetail(params)
    state.loading = false
    if (res.success) {
      state.detail = res.data
      state.name = res.data?.name || ''
      state.description = res.data?.description || ''
      state.ipList = res.data?.ipList || []
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.loading = false
    console.log('error', err)
  }
}

// 获取关联资源
const getIpListSecurityGroup = async () => {
  const params = {
    id: state.id,
    regionId: state.regionId,
  }
  state.resourceLoading = true
  try {
    const res = await ipListSecurityGroup(params)
    state.resourceLoading = false
    if (res.success) {
      state.resourceList = res.data?.list || []
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.resourceLoading = false
    console.log('error', err)
  }
}

// 修改提交
const updateFn = async params => {
  try {
    const res = await updateIpGroup(params)
    state.remarkLoading = false
    state.nameLoading = false
    if (res.success) {
      message.success(t('ipGroup.modifySuccess'))
      descriptionInputRef.value.show = false
      nameInputRef.value.show = false
      getDetail()
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.nameLoading = false
    state.remarkLoading = false
    console.log('error', err)
  }
}

// 更新名称
const updateName = () => {
  state.nameLoading = true
  const params = {
    ...state.detail,
    name: state.name,
  }
  updateFn(params)
}

// 取消更新名称
const cancelName = () => {
  state.name = state.detail.name
}

// 更新备注
const updateDescription = () => {
  state.remarkLoading = true
  const params = {
    ...state.detail,
    description: state.description,
  }
  updateFn(params)
}

// 取消更新备注
const cancelDescription = () => {
  state.description = state.detail.description
}

// 切换选择ip地址
const handleRowSelectChange = val => {
  state.selectIpList = val
}

const setAddIpRef = ref<InstanceType<typeof SetAddIp>>() // 新建
const setDeleteIpRef = ref<InstanceType<typeof SetDeleteIp>>() // 删除

const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

// 批量删除
const batchDelete = (ins: any) => {
  changeShow(ins)
  ins.list = state.selectIpList
}
// 删除
const deleteFn = (ins: any, row: any) => {
  changeShow(ins)
  ins.list = [row]
}

// 跳转安全组详情
const goSecurityGroup = row => {
  pushRoute({
    name: 'network_security_security_group_detail',
    query: { id: row.id, name: row.name },
  })
}

onMounted(async () => {
  useTempStore().setPageHeader(false)
  if (route.query?.id) {
    state.id = Number(route.query.id)
    getDetail()
    getIpListSecurityGroup()
  }
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
.tabs-wrap {
  /* margin-left: -20px; */

  /* width: calc(100% + 40px); */

  /* margin-top: -20px; */
  box-sizing: border-box;
  background: #fff;

  :deep(.cat-tabs__header) {
    /* padding-left: 8px; */
    border-color: transparent;
  }
}

.tit {
  font-family: PingFangSC, 'PingFang SC';

  // font-weight: 500;
  font-size: 16px;
  line-height: 22px;
  color: #000;
}

.detail-wrap {
  /* margin-top: 40px; */

  /* margin-bottom: 40px; */

  .detail-wrap-left {
    flex-shrink: 0;
    margin-right: 20px;
  }

  .detail-wrap-right {
    .tips {
      margin-top: 10px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 17px;
      color: #999;
      text-align: left;
    }
  }

  .item {
    .key-wrap {
      width: 125px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #999;
    }

    .name {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #999;
      white-space: nowrap;
    }

    .lh21 {
      line-height: 21px;
    }

    .value {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--primary-text);
      overflow-wrap: break-word; /* 在必要时单词内部断行 */
      overflow-wrap: anywhere;
      white-space: normal; /* 允许换行 */
    }

    .value-wrap {
      height: 40px;
      padding: 0 16px;
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 16px;
      line-height: 40px;
      color: #000;
      background: #f1f7ff;
    }
  }

  .mt-negative-6 {
    margin-top: -6px;
  }

  .mt-negative-7 {
    margin-top: -7px;
  }

  .mb13 {
    margin-bottom: 13px;
  }

  .mb10 {
    margin-bottom: 10px;
  }

  .mb4 {
    margin-bottom: 4px;
  }

  .mb44 {
    margin-bottom: 44px;
  }
}

.oh {
  overflow: hidden;
}

:deep(.el-table .el-tooltip) {
  text-overflow: initial;
}

:deep(.el-form-item__error) {
  min-width: 330px;
}
</style>
