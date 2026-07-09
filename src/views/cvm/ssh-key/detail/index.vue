<template>
  <div>
    <PageHeader :title="title" :back-title="t('sshKey.detail.backTitle')" back-name="ssh_key">
      <template #right>
        <div class="btn-wrap pd0-20">
          <!-- 绑定实例 -->
          <el-button @click="changeShow(bindInsRef)">
            {{ t('sshKey.detail.bindIns') }}
          </el-button>
        </div>
      </template>
    </PageHeader>

    <div class="df jsb ac tabs-wrap">
      <!-- tabs -->
      <div class="df">
        <CatTabs v-model="active" class="tabs" :tabs="tabs" @change="() => {}" />
      </div>
    </div>

    <div style="padding: 20px">
      <el-card v-loading="loadingDetail" shadow="never" class="page-box mb20" :body-style="bodyStyle">
        <div class="tit mb20">
          {{ t('sshKey.detail.sshKeyInfo') }}
        </div>

        <el-row class="detail-wrap w-full mb20">
          <el-col :span="18">
            <!-- 密钥名称 -->
            <div class="item mb20 df">
              <div class="key-wrap" :style="labelClass">
                <span>{{ t('sshKey.detail.name') }}</span>
              </div>
              <div class="value">
                <span class="mr4">{{ detail?.sshName || '-' }}</span
                ><SvgIcon
                  v-if="checkPermission(permMap.sshKey.SET_SSH_NAME)"
                  name="edit"
                  @click="changeShow(modifySshKeyRef)"
                />
              </div>
            </div>
            <!-- 密钥ID -->
            <div class="item mb20 df">
              <div class="key-wrap" :style="labelClass">
                <span>{{ t('sshKey.detail.id') }}</span>
              </div>
              <div class="value">
                {{ detail?.sshInsId || '-' }}
              </div>
            </div>
            <!-- 密钥描述-->
            <div class="item mb20 df">
              <div class="key-wrap" :style="labelClass">
                <span>{{ t('sshKey.detail.desc') }}</span>
              </div>
              <div class="value">
                <span class="mr4">{{ detail?.description || '-' }}</span>
                <SvgIcon
                  v-if="checkPermission(permMap.sshKey.SET_SSH_NAME)"
                  name="edit"
                  @click="changeShow(modifySshKeyRef)"
                />
              </div>
            </div>
            <!-- 公钥内容-->
            <div class="item mb20 df">
              <div class="key-wrap" :style="labelClass">
                <span>{{ t('sshKey.detail.publicKey') }}</span>
              </div>
              <div class="value">
                <ExpandableText
                  :text-style="{
                    fontSize: '14px',
                    color: 'var(--primary-text)',
                  }"
                  :text="detail.publicKey"
                  :max-length="50"
                />
              </div>
            </div>
            <!-- 创建时间-->
            <div class="item df">
              <div class="key-wrap df ac" :style="labelClass">
                <span>{{ t('sshKey.detail.createTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="ml10" />
                </el-tooltip>
              </div>
              <div class="value">
                {{ detail.createTime ? maoYunDayJs(detail.createTime).format(FORMAT_TIME) : '-' }}
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <el-card shadow="never" class="page-box" :body-style="bodyStyle">
        <div class="tit mb20">
          {{ t('sshKey.detail.bindedIns') }}
        </div>

        <div class="btn-wrap">
          <!-- 解绑实例 -->
          <el-button
            class="mr20"
            :type="'primary'"
            :disabled="!isUnBindInsBatch(selectList.map(el => el.state))"
            @click="batchUnBindIns"
          >
            {{ t('sshKey.detail.unBindIns') }}
          </el-button>
          <!-- 地域 -->
          <el-select v-model="area" class="select-opts mr20" :placeholder="t('sshKey.detail.areaPh')">
            <el-option v-for="item in areaOpts" :key="item.id" :label="item.regionName" :value="item.id">
              <div class="df ac opt-wrap w-full h-full">
                <div>{{ item.regionName }}</div>
              </div>
            </el-option>
          </el-select>
          <!-- 可用区 -->
          <el-select
            v-model="zoneId"
            class="select-opts mr20"
            :placeholder="t('sshKey.detail.zonePh')"
            @change="listInstanceFn"
          >
            <el-option v-for="item in zoneList" :key="item.id" :label="item.zoneName" :value="item.id">
              <div class="df ac opt-wrap w-full h-full">
                <div>{{ item.zoneName }}</div>
              </div>
            </el-option>
          </el-select>
        </div>

        <el-table v-loading="loading" :data="list" class="mt20 mb20 table" @selection-change="handleRowSelectChange">
          <el-table-column type="selection" width="40" :selectable="row => isUnBindIns(row.state)" />
          <!-- ID/名称 -->
          <el-table-column min-width="200" :label="t('sshKey.detail.idName')">
            <template #default="{ row }">
              <p class="text-primary">
                {{ row.insUuid }}
              </p>
              <p>{{ row.instanceName }}</p>
            </template>
          </el-table-column>
          <!-- 实例状态 -->
          <el-table-column min-width="200" :label="t('sshKey.detail.insState')">
            <template #default="{ row }">
              <p>{{ INS_STATE_MAP[row.state] }}</p>
            </template>
          </el-table-column>
          <!-- 所属网络 -->
          <el-table-column min-width="300" :label="t('sshKey.detail.belongNet')">
            <template #default="{ row }">
              <div class="df ac">
                <span>{{ handleRowVpc(row) }}</span>
              </div>
            </template>
          </el-table-column>
          <!-- 内网IP -->
          <el-table-column min-width="200" :label="t('sshKey.detail.privateIp')">
            <template #default="{ row }">
              <p>{{ handleRowIp(row).mainPrivateIp }}</p>
            </template>
          </el-table-column>
          <!-- 操作 -->
          <el-table-column min-width="200" :label="t('sshKey.detail.opts')">
            <template #default="{ row }">
              <DisableText
                v-if="checkPermission(permMap.sshKey.UN_BAND_SSH)"
                :disabled="!isUnBindIns(row.state)"
                :text="t('sshKey.detail.unBind')"
                @click="unBindIns(row)"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 修改私钥 -->
    <ModifySshKey
      :id="Number(id)"
      ref="modifySshKeyRef"
      :key-name="detail.sshName"
      :description="detail.description || ''"
      @success="getSSHInfo"
    />
    <!-- 绑定实例 -->
    <BindIns
      ref="bindInsRef"
      :ssh-key="detail"
      @success="
        () => {
          getSSHInfo()
          listInstanceFn()
        }
      "
    />
    <!-- 解绑实例 -->
    <UnBindIns
      ref="unBindInsRef"
      :outside="true"
      :outside-list="unBindInsConfig.list"
      :ssh-key="detail"
      @success="
        () => {
          getSSHInfo()
          listInstanceFn()
        }
      "
    />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useTempStore } from '@/store'
import ModifySshKey from './components/modify-ssh-key.vue'
import UnBindIns from '../list/components/un-bind-ins.vue'
import BindIns from '../list/components/bind-ins.vue'
import { _getSSHInfo } from '@/apis/cvm/ssh-key'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { useCvmStore } from '@/store'
import { INS_STATE_MAP } from '@/views/cvm/ins/config'
import { isUnBindIns, isUnBindInsBatch } from '@/views/cvm/ssh-key/config'
import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'
import { useIns } from '@/views/cvm/hooks/use-ins'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const labelMap = {
  [ja]: { width: '90px' },
  [en]: { width: '130px' },
  [zh]: { width: '90px' },
}

const labelClass = useI18nStyle(labelMap)

const bodyStyle = { height: '100%' }

const route = useRoute()
const cvmStore = useCvmStore()
const { listByRegionId } = useBaseConfig()
const { listInstance, loading } = useIns()

const id = ref<string>(route.params.id as string) // id
const active = ref(1)
const tabs = [
  { label: t('sshKey.detail.base'), value: 1 }, // 基本信息
]
const detail = ref<any>({}) // 详情
const loadingDetail = ref<boolean>(false)
const selectList = ref<any[]>([]) // 选中的
const area = ref<number | undefined>() // 地域
const zoneId = ref<number | undefined>() // 可用区
const list = ref<any[]>([]) // 服务器列表
const zoneList = ref<any[]>([]) // 可用区列表
// 解绑
const unBindInsConfig = reactive<{ list: any[] }>({
  list: [],
})

const modifySshKeyRef = ref<InstanceType<typeof ModifySshKey>>() // 修改实例
const unBindInsRef = ref<InstanceType<typeof UnBindIns>>() // 解绑实例
const bindInsRef = ref<InstanceType<typeof BindIns>>() // 绑定实例

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.ins,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const title = computed(() => {
  return `${detail.value.sshInsId || '-'}(${detail.value.sshName || '-'})`
})

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
    ipConfig.mainPrivateIp = res.mainPrivateIp ? `${res.mainPrivateIp}` : ''
    ipConfig.mainPublicIp = res.mainPublicIp ? `${res.mainPublicIp}` : ''
  }

  return ipConfig
}

// 所属网络
const handleRowVpc = (row: any) => {
  const networkInfos = row.networkInfos || []
  const res = networkInfos.find(el => el.primaryType === 1) // 主网卡
  console.log(`handleRowVpc===>`, res)

  if (res) {
    return `${res.vpcInsId}(${res.vpcName}|${res.cidrBlock})`
  } else {
    return ''
  }
}

// 解绑实例
const unBindIns = (row: any) => {
  unBindInsConfig.list = [row]
  changeShow(unBindInsRef.value)
}

// 批量解绑实例
const batchUnBindIns = () => {
  unBindInsConfig.list = selectList.value
  changeShow(unBindInsRef.value)
}

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return

  ins.show = true
}

// 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  console.log(`handleRowSelectChange===>`, selection)
  selectList.value = selection
}

// 获取SSH秘钥详情
const getSSHInfo = async () => {
  try {
    loadingDetail.value = true

    const res = await _getSSHInfo({
      id: Number(id.value),
    })

    console.log(`_getSSHInfo===>`, res)

    if (res.success) {
      detail.value = res.data || {}
    }
  } catch (error) {
    console.log(error)
  } finally {
    loadingDetail.value = false
  }
}

// 分页查询服务器列表
const listInstanceFn = async () => {
  const params = {
    regionId: cvmStore.areaSelect.id,
    zoneId: zoneId.value,
    sshId: Number(id.value),
  }

  const cb = (res: any) => {
    if (res.success) {
      list.value = res.data?.list || []
    }
  }

  listInstance(params, cb)
}

onMounted(async () => {
  useTempStore().setPageHeader(false)
  area.value = cvmStore.areaSelect.id
  await getSSHInfo()
  await listByRegionIdFn()
  listInstanceFn()
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

  .item {
    .key-wrap {
      flex-shrink: 0;

      // width: 125px;
      margin-right: 20px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #999;
    }

    .value {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--primary-text);
    }
  }
}

.opt-wrap {
  padding: 0 8px;

  &:hover {
    color: #0063ff;
    background: #f1f7ff;
  }
}
</style>
