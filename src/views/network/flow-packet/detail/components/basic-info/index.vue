<template>
  <div>
    <div style="padding: 20px">
      <el-card v-loading="infoLoading" shadow="never" class="page-box" :body-style="bodyStyle">
        <div class="tit mb20">
          {{ t('flowPacket.basicInfo') }}
        </div>
        <table class="detail-wrap w-full">
          <tbody>
            <tr>
              <td :class="nameInputRef?.show ? 'va-inherit pr20' : 'pr20'">
                <!-- 流量包名称 -->
                <div class="item" :class="nameInputRef?.show ? 'mb46' : 'mb20'">
                  <div class="name h21">
                    {{ t('flowPacket.flowPacketName') }}
                  </div>
                </div>
              </td>
              <td class="w-50 min-w-596 pr20">
                <div class="item" :class="nameInputRef?.show ? 'mb13 mt-negative-7' : 'mb20'">
                  <div class="value">
                    <EditInput
                      ref="nameInputRef"
                      v-model="state.pkgName"
                      v-loading="state.pkgNameLoading"
                      :rules="nameRules"
                      :cancel-fn="cancelPkgName"
                      input-style="max-width: 380px;width: 380px"
                      :max-length="60"
                      @confirm="updatePkgName"
                    />
                    <p v-show="nameInputRef?.show" class="tips">
                      {{ t('flowPacket.flowPacketNameRule') }}
                    </p>
                  </div>
                </div>
              </td>
              <td :class="nameInputRef?.show ? 'va-inherit pr20' : 'pr20'">
                <!-- ID -->
                <div class="item" :class="nameInputRef?.show ? 'mb45' : 'mb20'">
                  <div class="name">ID</div>
                </div>
              </td>
              <td :class="nameInputRef?.show ? 'va-inherit pr20' : 'pr20'">
                <div class="item" :class="nameInputRef?.show ? 'mb45' : 'mb20'">
                  <div class="value">
                    {{ state.detail.pkgUuid }}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="pr20">
                <!-- 使用量/总量 -->
                <div class="item mb20">
                  <div class="name">
                    {{ t('flowPacket.usedOrAll') }}
                  </div>
                </div>
              </td>
              <td class="w-50 pr20">
                <div class="item mb20">
                  <div class="value">{{ state.detail.usedSize }}/{{ state.detail.size }}{{ state.detail.unit }}</div>
                </div>
              </td>
              <td class="pr20">
                <!-- 带宽上限 (Mbps) -->
                <div class="item mb20">
                  <div class="name">{{ t('flowPacket.maxBandwidth') }} (Mbps)</div>
                </div>
              </td>
              <td class="w-50">
                <div class="item mb20">
                  <div class="value">
                    {{ state.detail.maxBandwidth }}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="pr20">
                <!-- 创建时间 -->
                <div class="item mb20">
                  <div class="name df ac">
                    <span class="mr10">{{ t('flowPacket.creationTime') }}</span>
                    <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                      <SvgIcon name="cat-cdn-help" />
                    </el-tooltip>
                  </div>
                </div>
              </td>
              <td class="w-50 pr20">
                <div class="item mb20">
                  <div class="value">
                    {{ state.detail.createTime ? maoYunDayJs(state.detail.createTime).format(FORMAT_TIME) : '-' }}
                  </div>
                </div>
              </td>
              <td class="pr20">
                <!-- 到期时间 -->
                <div class="item mb20">
                  <div class="name df ac">
                    <span class="mr10">{{ t('flowPacket.expiredTime') }}</span>
                    <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                      <SvgIcon name="cat-cdn-help" />
                    </el-tooltip>
                  </div>
                </div>
              </td>
              <td class="w-50">
                <div class="item mb20">
                  <div class="value">
                    {{ state.detail.expiredTime ? maoYunDayJs(state.detail.expiredTime).format(FORMAT_TIME) : '-' }}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </el-card>
    </div>
    <div style="padding: 0 20px 20px">
      <el-card v-loading="eipLoading" shadow="never" class="page-box" :body-style="bodyStyle">
        <div class="tit mb20">
          {{ t('flowPacket.eipTwo') }}
        </div>
        <div class="df ac jsb">
          <div class="btn-wrap">
            <el-button v-if="checkPermission(permMap.pkg.ADD_EIP)" type="primary" @click="addEipFn">
              {{ t('flowPacket.add') }}
            </el-button>
            <el-button
              v-if="checkPermission(permMap.pkg.ALL_REMOVE_EIP)"
              :disabled="!state.selectList.length"
              @click="batchRemoveEipFn"
            >
              {{ t('flowPacket.remove') }}
            </el-button>
          </div>
          <div class="search-wrap">
            <FilterInput
              ref="filterInputRef"
              :placeholder="t('flowPacket.searchIdOrName')"
              :filter-list="filterList"
              @search="searchFn"
            />
          </div>
        </div>
        <el-table
          :data="state.eipList"
          class="mt20 table"
          show-overflow-tooltip
          @selection-change="handleRowSelectChange"
        >
          <el-table-column type="selection" width="40" />
          <!-- ID/名称 -->
          <el-table-column min-width="200" :label="t('flowPacket.idOrName')">
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-primary">
                  {{ row.eipUuid }}
                </div>
                <div class="text-over">
                  {{ row.name }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 状态 -->
          <el-table-column prop="network" :label="t('flowPacket.state')" min-width="100">
            <template #default="{ row }">
              {{ typeList.find(item => item.value === row.state)?.label }}
            </template>
          </el-table-column>
          <!-- 公网IP地址 -->
          <el-table-column prop="ipArea" :label="t('flowPacket.eipAddress')" show-overflow-tooltip min-width="200">
            <template #default="{ row }">
              {{ row.eip }}
            </template>
          </el-table-column>
          <!-- 计费模式 -->
          <el-table-column :label="t('flowPacket.chargeType')" min-width="150">
            <template #default="{ row }">
              {{ chargeTypeList.find(item => item.value === row.chargeType)?.label }}
            </template>
          </el-table-column>
          <!-- 带宽上限 -->
          <el-table-column :label="t('flowPacket.maxBandwidth')" min-width="150">
            <template #default="{ row }">
              {{ row.size ? `${row.size} Mbps` : '' }}
            </template>
          </el-table-column>
          <!-- 绑定资源 -->
          <el-table-column :label="t('flowPacket.bindResources')" min-width="150">
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div v-if="row.bindInstanceType === 1">
                  <div class="text-primary cursor-pointer">
                    <Copy :text="row.insUuid" @handle-click="goExample(row.insId, row.insUuid, row.insName)" />
                  </div>
                  <div class="text-over">
                    {{ row.insName }}
                  </div>
                </div>
                <div v-else-if="row.bindInstanceType === 2">
                  <div class="text-primary cursor-pointer">
                    <Copy :text="row.insUuid" @handle-click="goNetworkCard(row.eniId, row.insUuid)" />
                  </div>
                  <div class="text-over">
                    {{ row.insName }}
                  </div>
                </div>
                <div v-else>-</div>
              </div>
            </template>
          </el-table-column>
          <!-- 线路类型 -->
          <el-table-column :label="t('flowPacket.lineType')" min-width="120">
            <template #default="{ row }">
              {{ lineTypeList.find(item => item.value === row.lineType)?.label }}
            </template>
          </el-table-column>
          <!-- 申请时间 -->
          <el-table-column :label="t('flowPacket.createTime')" min-width="220">
            <template #header>
              <div class="df ac">
                <span class="mr10">{{ t('flowPacket.createTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              {{ row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '-' }}
            </template>
          </el-table-column>
          <!-- 操作 -->
          <el-table-column :label="t('flowPacket.operate')" min-width="100">
            <template #default="{ row }">
              <span
                v-if="checkPermission(permMap.pkg.REMOVE_EIP)"
                class="text-primary cursor-pointer"
                @click="removeEipFn(row)"
                >{{ t('flowPacket.remove') }}</span
              >
            </template>
          </el-table-column>
        </el-table>

        <CatPagination
          v-model:pagination="paginationConfig.pagination"
          :total="paginationConfig.total"
          :custom-keys="['page', 'pageSize']"
          @change="paginationChange"
        />
      </el-card>
    </div>
    <AddEip ref="addEipRef" @success="getEipList" />
    <RemoveEip ref="removeEipRef" :pkg-id="state.id" @success="getEipList" />
  </div>
</template>
<script setup lang="ts">
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { nameRules } from '@/views/network/private-network/list/config'
import { IPagination } from '@/views/account-system/type'
import {
  setShareTrafficPackageName,
  getShareTrafficPackageDetail,
  shareTrafficPackageEipList,
} from '@/apis/network/flow-packet'
import { typeList, chargeTypeList, lineTypeList } from '@/views/network/public-ip/list/config'
import AddEip from '@/views/network/flow-packet/list/components/add-eip/index.vue'
import RemoveEip from '../remove-eip/index.vue'

import { permMap, moduleMap, useCvmAndNetworkPermission } from '@/hooks/permission/use-cvm-and-network-permission'
import { useCvmStore } from '@/store'
import { pushRoute } from '@/utils/router-jump'
const cvmStore = useCvmStore()

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.pkg,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const bodyStyle = { height: '100%' }

const route = useRoute()
const router = useRouter()

const infoLoading = ref<boolean>(false)
const eipLoading = ref<boolean>(false)

const filterList = [
  { fieldName: t('flowPacket.name'), fieldKey: 'eipName' },
  { fieldName: 'ID', fieldKey: 'eipUuid' },
]

const state = reactive<{
  id: number | string // 流量包id
  pkgName: string // 流量包名称
  pkgNameLoading: boolean // 修改流量包名称的loading
  detail: any // 流量包基本信息
  eipList: any[] // eip列表
  selectList: any[] // 选中的eip列表
}>({
  id: NaN,
  pkgName: '',
  pkgNameLoading: false,
  detail: {},
  eipList: [],
  selectList: [],
})

const paginationConfig = reactive<IPagination>({
  pagination: { pageSize: 10, page: 1 },
  total: 0,
})

const nameInputRef = ref<any>()

// 获取流量包详情
const getDetail = async () => {
  const params = { id: state.id }
  infoLoading.value = true
  try {
    const res = await getShareTrafficPackageDetail(params)
    if (res.success) {
      state.detail = res.data
      state.pkgName = res.data?.pkgName
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('err', err)
  } finally {
    infoLoading.value = false
  }
}

// 更新流量包名称
const updatePkgName = async () => {
  const params = {
    id: state.id,
    name: state.pkgName,
  }
  state.pkgNameLoading = true
  try {
    const res = await setShareTrafficPackageName(params)
    if (res.success) {
      nameInputRef.value.show = false
      getDetail()
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('err', err)
  } finally {
    state.pkgNameLoading = false
  }
}

// 取消修改流量包名称
const cancelPkgName = () => {
  state.pkgName = state.detail.pkgName
}

// 获取eip列表
const filterInputRef = ref<any>()
const getEipList = async (search = filterInputRef.value.searchParams) => {
  const params = {
    pageIndex: paginationConfig.pagination.page,
    pageSize: paginationConfig.pagination.pageSize,
    pkgId: state.id,
    ...search,
  }
  eipLoading.value = true
  try {
    const res = await shareTrafficPackageEipList(params)
    if (res.success) {
      state.eipList = res.data?.list || []
      paginationConfig.total = res.data?.recordCnt
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    eipLoading.value = false
  }
}

// 筛选eip列表
const searchFn = search => {
  paginationConfig.pagination.page = 1
  getEipList(search)
}

// 切换页码
const paginationChange = () => {
  getEipList()
}

// 切换选中的值
const handleRowSelectChange = selection => {
  state.selectList = selection
}

// 添加eip
const addEipRef = ref<any>()
const addEipFn = () => {
  addEipRef.value.detailData = state.detail
  addEipRef.value.show = true
}

// 批量移出eip
const removeEipRef = ref<any>()
const batchRemoveEipFn = () => {
  removeEipRef.value.list = state.selectList
  removeEipRef.value.show = true
}

// 移出eip
const removeEipFn = row => {
  removeEipRef.value.list = [row]
  removeEipRef.value.show = true
}

// 跳转实例详情
const goExample = (id, uuid, name) => {
  console.log(uuid)
  pushRoute({
    name: 'ins_detail',
    params: {
      id: uuid,
      uuid,
      name,
    },
  })
}
// 跳转弹性网卡详情
const goNetworkCard = (id, uuid) => {
  pushRoute({
    name: 'network_security_network_card_detail',
    query: {
      id,
      uuid,
    },
  })
}

onMounted(() => {
  if (route.query?.id) {
    state.id = Number(route.query.id)
    getDetail()
    getEipList()
  }
})
</script>
<style lang="scss" scoped>
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

  .item {
    .key-wrap {
      min-width: 125px;
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

    .h21 {
      height: 21px;
      line-height: 21px;
    }
  }

  .mt-negative-7 {
    margin-top: -7px;
  }

  .mb13 {
    margin-bottom: 13px;
  }

  .mb12 {
    margin-bottom: 12px;
  }

  .mb19 {
    margin-bottom: 19px;
  }

  .mb12 {
    margin-bottom: 12px;
  }

  .pr20 {
    padding-right: 20px;
  }

  .w-50 {
    width: 50%;
  }

  .min-w-596 {
    min-width: 596px;
  }

  .va-inherit {
    vertical-align: inherit;
  }

  .mb45 {
    margin-bottom: 45px;
  }

  .mb46 {
    margin-bottom: 46px;
  }
}

:deep(.el-form-item__error) {
  min-width: 330px;
}
</style>
