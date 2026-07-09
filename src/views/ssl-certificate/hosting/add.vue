<template>
  <TipsBar class="mb20" :tips="t('ssl-certificate.hoting.add.140323-0')" />
  <el-card shadow="never" class="tpl-card">
    <p class="title mb20">
      {{ t('ssl-certificate.hoting.add.140323-1') }}
    </p>
    <el-form
      ref="ruleFormRef"
      :rules="formRules"
      :model="formStore"
      label-position="left"
      label-width="auto"
      class="ssl-form"
    >
      <el-form-item label="" style="margin-bottom: 30px" prop="cert_ids">
        <div class="df jsb mb10 certificate-container">
          <div ref="leftTableRef" class="left mr20">
            <p class="mb20" style="color: #999">
              <span style="color: #000">{{ t('ssl-certificate.hoting.add.140323-2') }} </span>
              {{ t('ssl-certificate.hoting.add.140323-3') }}
            </p>
            <!-- <FilterInput
              ref="filterInputRef"
              :placeholder="'请输入证书ID'"
              :filter-list="filterList"
              field-type="input"
              style="width: 100%; min-width: auto !important"
              @search="filterSearchFn"
            /> -->
            <input
              v-model="certListStore.cert_id"
              class="input"
              clearable
              :placeholder="t('ssl-certificate.hoting.add.140323-4')"
            />
            <!-- @input="getCertList(false)" -->
            <!-- PERF 下拉加载更多
              v-el-table-infinite-scroll="getMoreCertList"
              :infinite-scroll-disabled="certListStore.noMore"
            -->
            <el-table
              v-loading="certListStore.loading"
              :data="filterAvailableCert"
              show-overflow-tooltip
              max-height="330px"
              table-layout="auto"
              class="mt10"
              style="height: 330px; border: 1px solid #ddd"
            >
              <el-table-column prop="check" width="55">
                <template #header>
                  <el-checkbox v-model="certListStore.allCheck" @change="allCheck" />
                </template>
                <template #default="{ row }">
                  <el-checkbox v-model="row.check" @change="rowCheck" />
                </template>
              </el-table-column>
              <el-table-column prop="cert_id" :label="t('ssl-certificate.hoting.add.140323-5')" />
              <el-table-column prop="domain" :label="t('ssl-certificate.hoting.add.140323-6')" />
              <el-table-column prop="expire_at" :label="t('ssl-certificate.hoting.add.140323-7')">
                <template #header>
                  <div class="df ac">
                    <span class="mr10">{{ t('ssl-certificate.hoting.add.140323-7') }}</span>
                    <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                      <SvgIcon name="cat-cdn-help" />
                    </el-tooltip>
                  </div>
                </template>
                <template #default="{ row }">
                  {{ getDateDayjs(row.expire_at > 0 ? row.expire_at * 1000 : row.expire_at, 'string', true) }}
                </template>
              </el-table-column>
            </el-table>
            <CatPagination
              v-model:pagination="certListStore.pagination"
              :total="certListStore.total"
              :pager-count="3"
              :show-page-size="false"
              :custom-keys="['page', 'page_size']"
              style="padding: 10px 0 0"
              @change="getCertList"
            />
          </div>
          <div class="right">
            <p class="mb20">
              {{ t('ssl-certificate.hoting.add.140323-8', { num: selectCertificateData?.length }) }}
            </p>
            <el-table
              :data="certListStore.data?.filter(v => v.check)"
              show-overflow-tooltip
              :max-height="rightTableHeight"
              table-layout="auto"
              :style="{ border: '1px solid #dddddd', height: `${rightTableHeight}px` }"
            >
              <el-table-column prop="cert_id" :label="t('ssl-certificate.hoting.add.140323-5')" />
              <el-table-column prop="domain" :label="t('ssl-certificate.hoting.add.140323-6')" />
              <el-table-column prop="expire_at" :label="t('ssl-certificate.hoting.add.140323-7')">
                <template #header>
                  <div class="df ac">
                    <span class="mr10">{{ t('ssl-certificate.hoting.add.140323-7') }}</span>
                    <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                      <SvgIcon name="cat-cdn-help" />
                    </el-tooltip>
                  </div>
                </template>
                <template #default="{ row }">
                  {{ getDateDayjs(row.expire_at > 0 ? row.expire_at * 1000 : row.expire_at, 'string', true) }}
                </template>
              </el-table-column>
              <el-table-column prop="date" label="" width="50">
                <template #default="{ row }">
                  <SvgIcon name="cat-cdn-delete" class="icon-hover" @click="deleteCertificateHandle(row.cert_id)" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-form-item>
      <el-form-item :label="t('ssl-certificate.hoting.add.140323-9')" prop="hosting_type_arr">
        <el-checkbox-group v-model="formStore.hosting_type_arr">
          <el-checkbox value="1" label="1" style="height: 32px !important; margin-right: 40px">
            {{ t('ssl-certificate.hoting.add.140323-10') }}
          </el-checkbox>
          <!-- <el-checkbox value="2" label="2" style="height: 32px !important">
            {{ t('ssl-certificate.hoting.add.140323-11') }}
          </el-checkbox> -->
        </el-checkbox-group>
        <p style="color: #999">
          {{ t('ssl-certificate.hoting.add.140323-12') }}
        </p>
      </el-form-item>
      <el-form-item :label="t('ssl-certificate.hoting.add.140323-13')" prop="hosting_date">
        <el-radio-group v-model="formStore.hosting_date">
          <el-radio :label="HostingDateEnum.Date1">
            {{ t('ssl-certificate.hoting.add.140323-15-0', [HostingDateEnum.Date1]) }}
          </el-radio>
          <el-radio :label="HostingDateEnum.Date2">
            {{ t('ssl-certificate.hoting.add.140323-15-0', [HostingDateEnum.Date2]) }}
          </el-radio>
        </el-radio-group>
        <p style="color: #999">
          {{ t('ssl-certificate.hoting.add.140323-17', { day: formStore.hosting_date }) }}
        </p>
      </el-form-item>
      <el-form-item :label="t('ssl-certificate.hoting.add.140323-19')" prop="hosting_time_arr">
        <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
          <SvgIcon class="mr10" name="cat-cdn-help" />
        </el-tooltip>
        <el-time-picker
          v-model="formStore.hosting_time_arr"
          class="time-piker"
          is-range
          range-separator="~"
          format="HH:mm"
          value-format="HH:mm"
          style="width: 240px"
        />
        <p style="color: #999">
          {{ t('ssl-certificate.hoting.add.140323-20') }}
        </p>
      </el-form-item>
      <el-divider style="border-color: #eee" />
      <el-form-item>
        <el-button type="primary" :loading="loading" style="min-width: 90px; margin-right: 10px" @click="onSubmit">
          {{ t('ssl-certificate.hoting.add.140323-21') }}
        </el-button>
        <el-button style="min-width: 90px" @click="backRoute()">
          {{ t('ssl-certificate.hoting.add.140323-22') }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
  <el-dialog
    v-model="expiredCertDialogStore.show"
    class="expired-cert-dialog"
    :title="t('ssl-certificate.hoting.add.862941-0')"
    width="800"
  >
    <p class="expired-title">
      {{ t('ssl-certificate.hoting.add.862941-1') }}
    </p>
    <p class="tips">
      {{ t('ssl-certificate.hoting.add.862941-2', [formStore.hosting_date]) }}
    </p>
    <el-table :data="expiredCertData" show-overflow-tooltip :max-height="330" table-layout="auto">
      <el-table-column prop="cert_id" :label="t('ssl-certificate.hoting.add.140323-5')" />
      <el-table-column prop="domain" :label="t('ssl-certificate.hoting.add.140323-6')" />
      <el-table-column prop="expire_at" :label="t('ssl-certificate.hoting.add.140323-7')">
        <template #header>
          <div class="df ac">
            <span class="mr10">{{ t('ssl-certificate.hoting.add.140323-7') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          {{ getDateDayjs(row.expire_at > 0 ? row.expire_at * 1000 : row.expire_at, 'string', true) }}
        </template>
      </el-table-column>
      <el-table-column prop="expire_at_day" :label="t('ssl-certificate.hoting.add.862941-3')" width="100">
        <template #default="{ row }">
          {{ t('ssl-certificate.hoting.add.862941-4', [row.expire_at_day]) }}
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="expiredCertDialogStore.show = false">
          {{ t('ssl-certificate.hoting.add.862941-5') }}
        </el-button>
        <el-button @click="expiredCertDialogStore.show = false">
          {{ t('ssl-certificate.hoting.add.862941-6') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import type { FormRules, FormInstance } from 'element-plus/es'
import type { CreateHostingReq, GetAssociateCertResp } from '@/apis/ssl-certificate/hosting/type'
import { _getAvailableCerts } from '@/apis/ssl-certificate/hosting'
import { message } from '@/utils/message'
import TipsBar from '@/views/ssl-certificate/management/components/tips-bar.vue'
import { _createHosting } from '@/apis/ssl-certificate/hosting'
import { getDateDayjs } from '@/utils/format-time'
import { HostingDateEnum } from './config'
import { backRoute } from '@/utils/router-jump'

const router = useRouter()
/// 表单数据
const ruleFormRef = ref<FormInstance>()
const formStore = reactive<
  CreateHostingReq & {
    hosting_type_arr: string[]
    hosting_time_arr: any
  }
>({
  cert_ids: [],
  hosting_date: HostingDateEnum.Date1,
  hosting_time: '',
  hosting_end_time: '',
  hosting_type: '',
  hosting_type_arr: [],
  hosting_time_arr: [],
})

watch(
  () => formStore.hosting_type_arr,
  () => {
    formStore.hosting_type = formStore.hosting_type_arr.join(',')
  },
)
watch(
  () => formStore.hosting_date,
  () => {
    ruleFormRef.value?.validateField(['cert_ids'])
  },
)
const formRules = reactive<FormRules<typeof formStore>>({
  cert_ids: [
    {
      validator(rule, value, callback) {
        if (!formStore.cert_ids.length) {
          callback(new Error(t('ssl-certificate.hoting.add.140323-23')))
        } else {
          // 所选证书剩余日期全部大于hosting_date
          const flag = selectCertificateData.value?.every(
            v => v.expire_at * 1000 - new Date().getTime() > formStore.hosting_date * 24 * 60 * 60 * 1000,
          )
          if (flag) {
            callback()
          } else {
            callback(new Error(t('ssl-certificate.hoting.add.140323-31', [formStore.hosting_date])))
          }
        }
      },
      trigger: 'change',
    },
  ],
  hosting_type_arr: [
    {
      required: true,
      validator(rule, value, callback) {
        if (formStore.hosting_type_arr.length === 0) {
          callback(new Error(t('ssl-certificate.hoting.add.140323-24')))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
  hosting_time_arr: [
    {
      required: true,
      validator(rule, value: string[], callback) {
        if (!value || value.length === 0) {
          callback(new Error(t('ssl-certificate.hoting.add.140323-25')))
          return
        }
        // 时间间隔要大于1小时
        const startTime = value[0]
          .split(':')
          .map((d, i) => (i === 0 ? Number(d) * 60 : Number(d)))
          .reduce((a, b) => a + b, 0)
        const endTime = value[1]
          .split(':')
          .map((d, i) => (i === 0 ? Number(d) * 60 : Number(d)))
          .reduce((a, b) => a + b, 0)

        if (endTime - startTime < 60) {
          callback(new Error(t(t('ssl-certificate.hoting.add.304631-0'))))
        }
        callback()
      },
      trigger: 'change',
    },
  ],
})

/// 实例表格
const leftTableRef = ref<HTMLElement>()
const rightTableHeight = ref(374)
const certListStore = reactive<{
  show: boolean
  cert_id: string
  domain: string
  loading: boolean
  allCheck: boolean
  pagination: {
    page: number
    page_size: number
  }
  total: number
  noMore: boolean
  data?: GetAssociateCertResp['items']
}>({
  show: false,
  cert_id: '',
  domain: '',
  loading: false,
  allCheck: false,
  pagination: {
    page: 1,
    page_size: 10,
  },
  noMore: false,
  total: 0,
  data: [],
})
// 搜索
const filterAvailableCert = computed(() => certListStore.data?.filter(v => v.cert_id.includes(certListStore.cert_id)))
// 已选择的证书数据
// @ts-ignore
const selectCertificateData = computed(() => certListStore.data?.filter(v => v.check))
watch(
  () => selectCertificateData.value,
  data => {
    if (!data) return
    formStore.cert_ids = data.map(v => v.cert_id)
  },
)
const allCheck = bool => {
  // @ts-ignore
  filterAvailableCert.value?.forEach(v => (v.check = bool))
}
const rowCheck = () => {
  // @ts-ignore
  certListStore.allCheck = certListStore.data?.every(v => v.check) || false
}
const deleteCertificateHandle = cert_id => {
  certListStore.data?.forEach(v => {
    // @ts-ignore
    if (v.cert_id === cert_id) v.check = false
  })
  certListStore.allCheck = false
}
const getCertList = async (isLoading?: boolean) => {
  try {
    if (isLoading === undefined || isLoading) certListStore.loading = true
    const { code, msg, data } = await _getAvailableCerts({
      certId: certListStore.cert_id,
      page: certListStore.pagination.page,
      limit: certListStore.pagination.page_size,
    })
    if (code === 200 && data) {
      certListStore.data = data.items
      certListStore.total = data.total
      certListStore.pagination.page = data.page
      certListStore.pagination.page_size = data.limit
      certListStore.allCheck = false
      allCheck(false)
    } else {
      message.error(msg || t('ssl-certificate.hoting.add.140323-26'))
    }
  } finally {
    certListStore.loading = false
  }
}
const getMoreCertList = async () => {
  // PERF 下拉加载更多
  if (certListStore.noMore) return
  const { code, msg, data } = await _getAvailableCerts({
    certId: certListStore.cert_id,
    page: certListStore.pagination.page,
    limit: certListStore.pagination.page_size,
  })
  if (code === 200 && data) {
    certListStore.data = certListStore.data?.concat(data.items)
    certListStore.total = data.total
    certListStore.pagination.page = data.page
    certListStore.pagination.page_size = data.limit
    certListStore.allCheck = false

    certListStore.pagination.page += 1

    // 没有更多数据
    if ((certListStore.data!.length || 0) >= data.total) certListStore.noMore = true
  } else {
    message.error(msg || t('ssl-certificate.hoting.add.140323-26'))
  }
}
// const filterSearchFn = data => {
//   getCertList()
// }
onMounted(() => {
  getCertList()
  const h = leftTableRef.value?.clientHeight
  if (h) rightTableHeight.value = h - 41
})

// 过期证书弹窗
const expiredCertDialogStore = reactive({
  show: false,
  data: [],
})
// 不符合条件的选择证书
const expiredCertData = computed(() => {
  return certListStore.data
    ?.filter(v => v.check && v.expire_at * 1000 - new Date().getTime() <= formStore.hosting_date * 24 * 60 * 60 * 1000)
    .map(v => ({
      ...v,
      expire_at_day: Math.floor((v.expire_at * 1000 - new Date().getTime()) / (24 * 60 * 60 * 1000)),
    }))
})
// 确定
const loading = ref(false)
const onSubmit = async () => {
  if (expiredCertData.value && expiredCertData.value.length > 0) {
    expiredCertDialogStore.show = true
    return
  }
  await ruleFormRef.value?.validate()

  try {
    loading.value = true
    const { code, msg, data } = await _createHosting({
      cert_ids: formStore.cert_ids,
      hosting_date: formStore.hosting_date,
      hosting_type: formStore.hosting_type,
      hosting_time: formStore.hosting_time_arr[0],
      hosting_end_time: formStore.hosting_time_arr[1],
    })
    if (code === 200 && data) {
      if (data.failed_cert_ids && data.failed_cert_ids.length > 0) {
        for (let i = 0; i < data.failed_cert_ids.length; i++) {
          const failed_cert = data.failed_cert_ids[i]
          message.error(t('ssl-certificate.hoting.add.140323-27', [failed_cert.domain, failed_cert.reason]))
        }
        if (data.success_cert_ids) {
          for (let i = 0; i < data.success_cert_ids?.length; i++) {
            const success_cert_id = data.success_cert_ids[i]
            message.success(t('ssl-certificate.hoting.add.140323-28', [success_cert_id]))
          }
        }
      } else {
        message.success(t('ssl-certificate.hoting.add.140323-29'))
        backRoute()
      }
    } else {
      message.error(msg || t('ssl-certificate.hoting.add.140323-30'))
    }
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.ssl-form {
  :deep(.el-form-item__content) {
    display: block !important;
  }
}

.title {
  font-size: 14px;
  font-weight: bold;
  color: #000;
}

.certificate-container {
  .left,
  .right {
    flex: 1 1 0;
    width: 0;
  }

  .left {
    .input {
      position: relative;
      box-sizing: border-box;
      display: inline-flex;
      flex-grow: 1;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 0;
      padding: 1px 11px;
      font-size: inherit;
      font-size: var(--el-font-size-base);
      line-height: var(--el-input-height);
      color: var(--el-input-text-color, var(--el-text-color-regular));
      vertical-align: middle;
      appearance: none;
      background: none;
      border: #000;
      border-radius: var(--el-input-border-radius, var(--el-border-radius-base));
      outline: none;
      box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;

      --el-input-height: var(--el-component-size);
    }
  }
}
</style>
<style lang="scss">
.el-time-spinner__list::after,
.el-time-spinner__list::before {
  height: 0 !important;
}

.el-time-panel__content::before {
  margin-top: -81px;
}

.el-time-spinner__wrapper {
  max-height: 162px;
}

.expired-cert-dialog {
  .expired-title {
    width: 100%;
    margin-bottom: 10px;
    font-size: 22px;
    color: #666;
    text-align: center;
  }

  .tips {
    margin-bottom: 10px;
    font-size: 14px;
    color: #999;
  }

  .dialog-footer {
    display: flex;
    justify-content: center;

    .el-button {
      min-width: 90px;
      margin: 0 10px;
    }
  }
}
</style>
<style>
.el-form-item.is-error .el-input__wrapper,
.el-form-item.is-error .el-input__wrapper.is-focus,
.el-form-item.is-error .el-select .el-input.is-focus .el-input__wrapper {
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset !important;
}
</style>
