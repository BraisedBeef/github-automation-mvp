<template>
  <div class="domain-list-table">
    <el-form :model="form" inline class="bgcf pd20">
      <el-form-item :label="t('domain.list.table.367705-0')" prop="register_time">
        <DateTimePicker v-model:start_time="form.register_time" :loading="false" :compare="false" />
      </el-form-item>
      <el-form-item :label="t('domain.list.table.367705-1')" prop="expire_time">
        <DateTimePicker v-model:start_time="form.expire_time" :loading="false" :compare="false" />
      </el-form-item>
      <el-form-item :label="t('domain.list.table.367705-2')" prop="status">
        <CatSelect v-model="form.status" :list="statusList" />
      </el-form-item>
      <el-form-item :label="t('domain.list.table.367705-3')" prop="auto_renew">
        <CatSelect v-model="form.auto_renew" :list="autoPayList" />
      </el-form-item>
      <el-form-item :label="t('domain.list.table.367705-4')" prop="keyword">
        <el-input v-model="form.keyword" maxlength="128" style="width: 300px" />
      </el-form-item>
      <el-form-item style="margin-bottom: 20px !important">
        <el-button type="primary" @click="getData">
          {{ t('domain.list.table.367705-5') }}
        </el-button>
        <el-button @click="resetData">
          {{ t('domain.list.table.367705-6') }}
        </el-button>
      </el-form-item>
    </el-form>

    <div class="bgcf pd20 mt20">
      <div class="table-config df">
        <el-button type="primary" class="mr20" @click="registerHandle">
          {{ t('domain.list.table.367705-7') }}
        </el-button>
        <CatSelect
          :list="moreBatchList"
          :model-value="t('domain.list.table.367705-8')"
          :disabled="data.selectedData.length === 0"
          class="mr20"
          @change="moreBatchHandle"
        />
        <CatSelect :list="batchList" :model-value="t('domain.list.table.367705-9')" @change="batchHandle" />
        <CdnIconButton style="margin-left: auto" @click="exportHandle">
          <SvgIcon name="cat-cdn-download" />
        </CdnIconButton>
      </div>

      <CatCdnTable v-loading="data.loading" :data="data.tableData" @selection-change="tableSelect">
        <el-table-column type="selection" fixed="left" />
        <el-table-column prop="domain" :label="t('domain.list.table.367705-10')">
          <template #default="{ row }">
            <CatTooltip :content="row.domain" effect="dark" width="150">
              <el-link type="primary" @click="toDetail(row)">
                {{ row.domain }}
              </el-link>
            </CatTooltip>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="remark" :label="t('domain.list.table.367705-11')" width="200">
          <template #default="{ row }">
            <el-tooltip placement="top" effect="light">
              <template #content>
                <div style="max-width: 200px">
                  {{ row.remark || '--' }}
                </div>
              </template>
              <div class="df remark" @mouseover="row.edit = true" @mouseout="row.edit = false">
                <div class="ellipsis">
                  {{ row.remark || '--' }}
                </div>
                <SvgIcon name="cat-cdn-edit" class="icon-hover" @click="tableHandle('remark', row)" />
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="t('domain.list.table.367705-12')">
          <template #default="{ row }">
            <div class="df ac">
              <div :style="{ backgroundColor: statusList[row.status].color }" class="icon mr4" />
              <div>{{ getValueMap(statusList, row.status) }}</div>
            </div>
          </template>
        </el-table-column>
        <!-- 注册时间 -->
        <el-table-column prop="register_time" :label="t('domain.list.table.367705-0')">
          <template #header>
            <div class="df ac">
              {{ t('domain.list.table.367705-0') }}
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon style="margin: 0 5px 0 10px" name="cat-cdn-help" />
              </el-tooltip>
              <SvgIcon :name="sortIconList[sort.register_time_sort]" @click="sortHandle('register_time_sort')" />
            </div>
          </template>
          <template #default="{ row }">
            {{ row.register_time ? maoYunDayJs(row.register_time).format(FORMAT_TIME) : '-' }}
          </template>
        </el-table-column>
        <!-- 到期时间 -->
        <el-table-column prop="expired" :label="t('domain.list.table.367705-1')">
          <template #header>
            <div class="df ac">
              {{ t('domain.list.table.367705-1') }}
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon style="margin: 0 5px 0 10px" name="cat-cdn-help" />
              </el-tooltip>
              <SvgIcon :name="sortIconList[sort.exprire_time_sort]" @click="sortHandle('exprire_time_sort')" />
            </div>
          </template>
          <template #default="{ row }">
            {{ row.expired ? maoYunDayJs(row.expired).format(FORMAT_TIME) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="auto_renew" :label="t('domain.list.table.367705-3')">
          <template #header>
            <el-tooltip
              :content="t('domain.list.table.367705-13')"
              placement="top"
              effect="light"
              popper-class="max-400"
            >
              <div class="df ac">
                <div class="mr4">
                  {{ t('domain.list.table.367705-3') }}
                </div>
                <SvgIcon name="cat-cdn-tip" />
              </div>
            </el-tooltip>
          </template>
          <template #default="{ row }">
            <el-switch
              v-model="row.auto_renew"
              :before-change="() => switchHandle('renew', row)"
              :loading="row.renew_loading"
              :active-value="1"
              :inactive-value="2"
            />
          </template>
        </el-table-column>
        <el-table-column prop="lock" :label="t('domain.list.table.367705-14')">
          <template #header>
            <el-tooltip
              :content="t('domain.list.table.367705-15')"
              placement="top"
              effect="light"
              popper-class="max-400"
            >
              <div class="df ac">
                <div class="mr4">
                  {{ t('domain.list.table.367705-14') }}
                </div>
                <SvgIcon name="cat-cdn-tip" />
              </div>
            </el-tooltip>
          </template>
          <template #default="{ row }">
            <el-switch
              v-model="row.lock"
              :before-change="() => switchHandle('lock', row)"
              :loading="row.lock_loading"
              :active-value="1"
              :inactive-value="2"
            />
          </template>
        </el-table-column>
        <el-table-column prop="auto_renew_notice" :label="t('domain.list.table.367705-16')">
          <template #header>
            <el-tooltip
              :content="t('domain.list.table.367705-17')"
              placement="top"
              effect="light"
              popper-class="max-400"
            >
              <div class="df ac">
                <div class="mr4">
                  {{ t('domain.list.table.367705-16') }}
                </div>
                <SvgIcon name="cat-cdn-tip" />
              </div>
            </el-tooltip>
          </template>
          <template #default="{ row }">
            <el-switch
              v-model="row.auto_renew_notice"
              :before-change="() => switchHandle('notice', row)"
              :loading="row.notice_loading"
              :active-value="1"
              :inactive-value="2"
            />
          </template>
        </el-table-column>
        <el-table-column prop="" :label="t('domain.list.table.367705-18')" fixed="right">
          <template #default="{ row }">
            <el-link type="primary" class="mr20" @click="toRenew(row)">
              {{ t('domain.list.table.367705-19') }}
            </el-link>
            <el-link type="primary" class="mr20" @click="pushRoute('/dns/my-domains')">
              {{ t('domain.list.table.367705-20') }}
            </el-link>
            <el-link type="primary" class="mr20" @click="toDetail(row)">
              {{ t('domain.list.table.367705-21') }}
            </el-link>
          </template>
        </el-table-column>
      </CatCdnTable>
      <CatPagination
        v-model:pagination="data.pagination"
        :total="data.pagination.total"
        :custom-keys="['page', 'limit']"
        @change="getData"
      />
    </div>

    <CatDialog
      v-model:dialog="remark.show"
      title="remark"
      width="480px"
      :loading="remark.loading"
      :disabled="!remark.form.remark || remark.form.remark.length > 200"
      destroy-on-close
      @confirm="updateStatus('remark')"
    >
      <el-form :model="remark.form">
        <el-form-item prop="remark">
          <el-input
            v-model="remark.form.remark"
            show-word-limit
            type="textarea"
            :placeholder="t('domain.list.table.367705-22')"
            maxlength="200"
          />
        </el-form-item>
      </el-form>
    </CatDialog>
    <LockVerifyDialog
      v-model:dialog="dialogLockVerify.show"
      :domain-list="dialogLockVerify.selectedData"
      :lock-state="dialogLockVerify.lock"
      :title="dialogLockVerify.title"
      @success="getData"
      @cancel="dialogLockVerifyCancel"
    />
    <RenewDialog
      v-model:dialog="dialogRenew.show"
      :domain-list="dialogRenew.selectedData"
      :auto_renew="dialogRenew.auto_renew"
    />
    <AutoRenewDialog
      v-model:dialog="dialogAutoRenew.show"
      :domain-list="dialogAutoRenew.selectedData"
      :auto_renew="dialogAutoRenew.auto_renew"
      @success="getData"
    />
  </div>
</template>

<script setup lang="ts">
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { statusList, autoPayList, batchList, moreBatchList, sortIconList, download } from '@/views/domain/config'
import { getValueMap } from '@/utils/collection-utils'
import {
  _getDomainList,
  _updateDomainRemark,
  _exportDomainList,
  _updateAutoRenew,
  _updateExpireNotice,
  _updateLock,
} from '@/apis/domain'
import type { PageParams } from '@/views/domain/common'
import LockVerifyDialog from '@/views/domain/components/lock-verify-dialog.vue'
import RenewDialog from '@/views/domain/components/renew-dialog.vue'
import AutoRenewDialog from '@/views/domain/components/auto-renew-dialog.vue'
import CatDialog from '@/components/common/cat-dialog/index.vue'
import t from '@/utils/i18n'
import { owUrl } from '@/config/base-config'
import { pushRoute } from '@/utils/router-jump'

const router = useRouter()

const registerHandle = () => {
  window.open(owUrl + 'product/domain/home', '_blank')
}

const form = reactive<{
  register_time: any
  expire_time: any
  status: number
  auto_renew: number
  keyword: string
}>({
  register_time: '',
  expire_time: '',
  status: 0,
  auto_renew: 0,
  keyword: '',
})

const sort = reactive<{
  register_time_sort: number
  exprire_time_sort: number
}>({
  register_time_sort: 0,
  exprire_time_sort: 0,
})
const sortHandle = key => {
  for (let k in sort) {
    if (k === key) {
      sort[k] = ++sort[k] > 2 ? 0 : sort[k]++
    } else {
      sort[k] = 0
    }
  }
  getData()
}

const initParams = () => {
  const p = {
    ...form,
    register_start: form.register_time ? maoYunDayJs(form.register_time[0]).valueOf() / 1000 : '',
    register_end: form.register_time ? maoYunDayJs(form.register_time[1]).valueOf() / 1000 : '',
    expire_start: form.expire_time ? maoYunDayJs(form.expire_time[0]).valueOf() / 1000 : '',
    expire_end: form.expire_time ? maoYunDayJs(form.expire_time[1]).valueOf() / 1000 : '',
    ...sort,
    ...data.pagination,
  }
  delete p.register_time
  delete p.expire_time
  return p
}
interface TableItem {
  auto_renew: number
  domain: string
  expired: string
  id: number
  lock: boolean
  register_time: string
  remark: string
  renew_price: string
  auto_renew_notice: number
  status: number
}
const data = reactive<{
  loading: boolean
  tableData: TableItem[]
  selectedData: TableItem[]
  pagination: PageParams
}>({
  loading: false,
  tableData: [],
  selectedData: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
})

const dialogLockVerify = reactive<{ title?: string; selectedData: string[]; show: boolean; lock: 1 | 2 }>({
  title: t('domain.components.498323-0'),
  selectedData: [],
  show: false,
  lock: 1,
})
const dialogLockVerifyCancel = () => {
  for (const ele of data.tableData) {
    if (dialogLockVerify.selectedData.includes(ele.domain)) ele['lock_loading'] = false
  }
}

const moreBatchHandle = v => {
  const params: any = {
    ids: data.selectedData.map(v => v.id),
  }
  let fn: any
  switch (v) {
    case 0:
      dialogRenew.selectedData = data.selectedData.map(v => v.domain)
      dialogRenew.show = true
      dialogRenew.auto_renew = 1
      return
    case 1:
    case 2:
      fn = _updateExpireNotice
      params.notice = v === 1 ? 1 : 2
      break
    case 3:
    case 4:
      dialogAutoRenew.selectedData = data.selectedData.map(v => v.domain)
      dialogAutoRenew.show = true
      dialogAutoRenew.auto_renew = v === 3 ? 1 : 2
      return
    case 5:
    case 6:
      dialogLockVerify.selectedData = data.selectedData.map(v => v.domain)
      dialogLockVerify.lock = v === 5 ? 1 : 2
      dialogLockVerify.show = true
      dialogLockVerify.title = t('domain.components.498323-0')
      return
    default:
      break
  }
  fn(params).then(() => {
    getData()
  })
}
const batchHandle = v => {
  sessionStorage.batch_tab = v
  pushRoute('/domain/batch-opertate')
}

const tableSelect = v => {
  data.selectedData = v
}
const getData = () => {
  const params = initParams()
  data.loading = true
  _getDomainList(params)
    .then(res => {
      data.tableData = res.data.list
      data.pagination.total = res.data.total
    })
    .finally(() => {
      data.selectedData = []
      data.loading = false
    })
}
const resetData = () => {
  form.register_time = ''
  form.expire_time = ''
  form.status = 0
  form.auto_renew = 0
  form.keyword = ''
  sort.register_time_sort = 0
  sort.exprire_time_sort = 0
  getData()
}
getData()
const exportHandle = () => {
  const params = { ...initParams(), limit: data.pagination.total }
  _exportDomainList(params).then(res => {
    download(res.data.url)
  })
}

type LoadingType = 'renew' | 'notice' | 'lock'
const switchHandle = async (type: LoadingType, row) => {
  let fn: any = null
  let params: any = null
  switch (type) {
    case 'renew':
      dialogAutoRenew.selectedData = [row.domain]
      dialogAutoRenew.show = true
      dialogAutoRenew.auto_renew = row.auto_renew === 1 ? 2 : 1
      return
    case 'notice':
      fn = _updateExpireNotice
      params = { ids: [row.id], notice: row.renew_notice === 1 ? 2 : 1 }
      break
    case 'lock':
      dialogLockVerify.selectedData = [row.domain]
      dialogLockVerify.show = true
      dialogLockVerify.lock = row.lock === 2 ? 1 : 2
      dialogLockVerify.title = t('domain.components.498323-21')
      row[type + '_loading'] = true
      return
  }
  row[type + '_loading'] = true
  return await fn(params)
    .then(() => {
      return true
    })
    .catch(() => {
      return false
    })
    .finally(() => {
      let t = setTimeout(() => {
        row[type + '_loading'] = false
        clearTimeout(t)
      }, 1000)
    })
}

// 自动续费弹窗
const dialogAutoRenew = reactive<{ selectedData: string[]; show: boolean; auto_renew: 1 | 2 }>({
  selectedData: [],
  show: false,
  auto_renew: 1,
})

// 续费弹窗
const dialogRenew = reactive<{ selectedData: string[]; show: boolean; auto_renew: number }>({
  selectedData: [],
  show: false,
  auto_renew: 1,
})
const toRenew = row => {
  dialogRenew.selectedData = [row.domain]
  dialogRenew.show = true
  dialogRenew.auto_renew = row.auto_renew
}
// 管理详情
const toDetail = row => {
  pushRoute(`/domain/list/detail?id=${row.id}&domain=${row.domain}`)
}

const remark = reactive<{
  show: boolean
  loading: boolean
  form: any
}>({
  show: false,
  loading: false,
  form: { id: '', remark: '' },
})
const tableHandle = (type: 'remark' | string, row) => {
  switch (type) {
    case 'remark':
      remark.form = { ...row }
      remark.show = true
      break
    default:
      break
  }
}
const updateStatus = (type: 'delete' | 'remark') => {
  switch (type) {
    case 'remark':
      remark.loading = true
      _updateDomainRemark({ id: remark.form.id, remark: remark.form.remark })
        .then(() => {
          getData()
        })
        .finally(() => {
          remark.loading = false
          remark.show = false
        })
      break
    default:
      break
  }
}
</script>

<style lang="scss" scoped>
.remark {
  text-align: center;

  .icon-hover {
    display: none;
    margin: auto;
  }

  &:hover {
    .ellipsis {
      display: none;
    }

    .icon-hover {
      display: block;
    }
  }
}

.icon {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
</style>
