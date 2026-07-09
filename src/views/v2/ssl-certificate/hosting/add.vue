<template>
  <div class="ssl-hosting-add-v2">
    <PageBreadcrumbToolbar :items="[t('ssl-certificate.router.065749-0')]" :show-doc="false" />

    <InfoNotice class="ssl-hosting-add-v2__notice">
      <span>{{ t('ssl-certificate.hoting.add.140323-0') }}</span>
    </InfoNotice>

    <section class="ssl-hosting-add-v2__panel">
      <div class="ssl-hosting-add-v2__section-title">
        {{ t('ssl-certificate.hoting.add.140323-1') }}
      </div>

      <el-form
        ref="ruleFormRef"
        :rules="formRules"
        :model="formStore"
        label-position="left"
        class="ssl-hosting-add-v2__form"
      >
        <el-form-item prop="cert_ids" class="ssl-hosting-add-v2__item ssl-hosting-add-v2__item--top">
          <div class="ssl-hosting-add-v2__certificate-block">
            <div ref="leftTableRef" class="ssl-hosting-add-v2__table-pane ssl-hosting-add-v2__table-pane--left">
              <p class="ssl-hosting-add-v2__table-tip">
                <span class="ssl-hosting-add-v2__table-tip-main">{{ t('ssl-certificate.hoting.add.140323-2') }}</span>
                {{ t('ssl-certificate.hoting.add.140323-3') }}
              </p>

              <el-input
                v-model="certListStore.cert_id"
                :placeholder="t('ssl-certificate.hoting.add.140323-4')"
                class="ssl-hosting-add-v2__search"
              />

              <TableV2
                v-loading="certListStore.loading"
                :data="filterAvailableCert"
                :total="certListStore.total"
                :pagination="leftPagination"
                :empty-min-height="276"
                :row-class-name="getAvailableRowClassName"
                class="ssl-hosting-add-v2__table"
                show-pagination
                table-layout="fixed"
                @update:pagination="handlePaginationChange"
              >
                <el-table-column width="56">
                  <template #header>
                    <el-checkbox v-model="certListStore.allCheck" @change="allCheck" />
                  </template>

                  <template #default="{ row }">
                    <el-checkbox v-model="row.check" @change="rowCheck" />
                  </template>
                </el-table-column>

                <el-table-column :label="t('ssl-certificate.hoting.add.140323-5')" min-width="220">
                  <template #default="{ row }">
                    <div class="ssl-hosting-add-v2__cert-cell">
                      <div class="ssl-hosting-add-v2__cert-id">ID：{{ row.cert_id }}</div>
                      <div class="ssl-hosting-add-v2__cert-remark">
                        {{ row.remark || '未备注' }}
                      </div>
                    </div>
                  </template>
                </el-table-column>

                <el-table-column :label="t('ssl-certificate.hoting.add.140323-6')" min-width="220">
                  <template #default="{ row }">
                    <span>{{ row.domain || '-' }}</span>
                  </template>
                </el-table-column>

                <el-table-column :label="t('ssl-certificate.hoting.add.140323-7')" min-width="220">
                  <template #header>
                    <div class="ssl-hosting-add-v2__th-with-icon">
                      <span>{{ t('ssl-certificate.hoting.add.140323-7') }}</span>
                      <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                        <SvgIcon name="cat-cdn-help" />
                      </el-tooltip>
                    </div>
                  </template>

                  <template #default="{ row }">
                    {{ getDateDayjs(row.expire_at > 0 ? row.expire_at * 1000 : row.expire_at, 'string', true) }}
                  </template>
                </el-table-column>
              </TableV2>
            </div>

            <div class="ssl-hosting-add-v2__table-pane ssl-hosting-add-v2__table-pane--right">
              <p class="ssl-hosting-add-v2__selected-title">
                {{ t('ssl-certificate.hoting.add.140323-8', { num: selectCertificateData?.length }) }}
              </p>

              <TableV2
                :data="selectCertificateData"
                :empty-min-height="332"
                class="ssl-hosting-add-v2__table"
                table-layout="fixed"
              >
                <el-table-column :label="t('ssl-certificate.hoting.add.140323-5')" min-width="180">
                  <template #default="{ row }">
                    <div class="ssl-hosting-add-v2__cert-cell">
                      <div class="ssl-hosting-add-v2__cert-id">ID：{{ row.cert_id }}</div>
                      <div class="ssl-hosting-add-v2__cert-remark">
                        {{ row.remark || '未备注' }}
                      </div>
                    </div>
                  </template>
                </el-table-column>

                <el-table-column :label="t('ssl-certificate.hoting.add.140323-6')" min-width="180">
                  <template #default="{ row }">
                    <span>{{ row.domain || '-' }}</span>
                  </template>
                </el-table-column>

                <el-table-column :label="t('ssl-certificate.hoting.add.140323-7')" min-width="190">
                  <template #default="{ row }">
                    {{ getDateDayjs(row.expire_at > 0 ? row.expire_at * 1000 : row.expire_at, 'string', true) }}
                  </template>
                </el-table-column>

                <el-table-column label="距离到期" min-width="120">
                  <template #default="{ row }">
                    {{ getRemainDaysText(row.expire_at) }}
                  </template>
                </el-table-column>

                <el-table-column width="52" fixed="right">
                  <template #default="{ row }">
                    <button
                      class="ssl-hosting-add-v2__remove-btn"
                      type="button"
                      @click="deleteCertificateHandle(row.cert_id)"
                    >
                      <SvgIcon name="table-close" />
                    </button>
                  </template>
                </el-table-column>
              </TableV2>
            </div>
          </div>
        </el-form-item>

        <el-form-item
          :label="t('ssl-certificate.hoting.add.140323-9')"
          prop="hosting_type_arr"
          class="ssl-hosting-add-v2__item"
        >
          <div class="ssl-hosting-add-v2__field-block">
            <el-checkbox-group v-model="formStore.hosting_type_arr" class="ssl-hosting-add-v2__checkbox-group">
              <el-checkbox value="1" label="1">
                {{ t('ssl-certificate.hoting.add.140323-10') }}
              </el-checkbox>
            </el-checkbox-group>
            <p class="ssl-hosting-add-v2__field-tip">
              {{ t('ssl-certificate.hoting.add.140323-12') }}
            </p>
          </div>
        </el-form-item>

        <el-form-item
          :label="t('ssl-certificate.hoting.add.140323-13')"
          prop="hosting_date"
          class="ssl-hosting-add-v2__item"
        >
          <div class="ssl-hosting-add-v2__field-block">
            <el-radio-group v-model="formStore.hosting_date" class="ssl-hosting-add-v2__radio-group">
              <el-radio :label="HostingDateEnum.Date1">
                {{ t('ssl-certificate.hoting.add.140323-15-0', [HostingDateEnum.Date1]) }}
              </el-radio>
              <el-radio :label="HostingDateEnum.Date2">
                {{ t('ssl-certificate.hoting.add.140323-15-0', [HostingDateEnum.Date2]) }}
              </el-radio>
            </el-radio-group>
            <p class="ssl-hosting-add-v2__field-tip">
              {{ t('ssl-certificate.hoting.add.140323-17', { day: formStore.hosting_date }) }}
            </p>
          </div>
        </el-form-item>

        <el-form-item
          :label="t('ssl-certificate.hoting.add.140323-19')"
          prop="hosting_time_arr"
          class="ssl-hosting-add-v2__item"
        >
          <div class="ssl-hosting-add-v2__field-block">
            <div class="ssl-hosting-add-v2__time-row">
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon class="ssl-hosting-add-v2__time-help" name="cat-cdn-help" />
              </el-tooltip>
              <el-time-picker
                v-model="formStore.hosting_time_arr"
                is-range
                range-separator="~"
                format="HH:mm"
                value-format="HH:mm"
                class="ssl-hosting-add-v2__time-picker"
              />
            </div>
            <p class="ssl-hosting-add-v2__field-tip">
              {{ t('ssl-certificate.hoting.add.140323-20') }}
            </p>
          </div>
        </el-form-item>

        <div class="ssl-hosting-add-v2__footer">
          <el-button type="primary" :loading="loading" @click="onSubmit">
            {{ t('ssl-certificate.hoting.add.140323-21') }}
          </el-button>
          <el-button @click="backRoute()">
            {{ t('ssl-certificate.hoting.add.140323-22') }}
          </el-button>
        </div>
      </el-form>
    </section>

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
            <div class="ssl-hosting-add-v2__th-with-icon">
              <span>{{ t('ssl-certificate.hoting.add.140323-7') }}</span>
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
        <div class="expired-cert-dialog__footer">
          <el-button type="primary" @click="expiredCertDialogStore.show = false">
            {{ t('ssl-certificate.hoting.add.862941-5') }}
          </el-button>
          <el-button @click="expiredCertDialogStore.show = false">
            {{ t('ssl-certificate.hoting.add.862941-6') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { FormRules, FormInstance } from 'element-plus/es'
import type { CreateHostingReq, GetAssociateCertResp } from '@/apis/ssl-certificate/hosting/type'
import { _getAvailableCerts, _createHosting } from '@/apis/ssl-certificate/hosting'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import { message } from '@/utils/message'
import { getDateDayjs } from '@/utils/format-time'
import { HostingDateEnum } from '@/views/ssl-certificate/hosting/config'
import { backRoute } from '@/utils/router-jump'
import t from '@/utils/i18n'

const ruleFormRef = ref<FormInstance>()
const leftTableRef = ref<HTMLElement>()
const rightTableHeight = ref(374)

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

const leftPagination = computed(() => ({
  page: certListStore.pagination.page,
  pageSize: certListStore.pagination.page_size,
}))

const filterAvailableCert = computed(() => certListStore.data?.filter(v => v.cert_id.includes(certListStore.cert_id)))
const selectCertificateData = computed(() => certListStore.data?.filter(v => v.check))

watch(
  () => selectCertificateData.value,
  data => {
    if (!data) return
    formStore.cert_ids = data.map(v => v.cert_id)
  },
)

const handlePaginationChange = (pagination: { page: number; pageSize: number }) => {
  certListStore.pagination.page = pagination.page
  certListStore.pagination.page_size = pagination.pageSize
  getCertList()
}

const getAvailableRowClassName = ({ row }) => {
  return row.check ? 'ssl-hosting-add-v2__selected-row' : ''
}

const allCheck = bool => {
  filterAvailableCert.value?.forEach(v => (v.check = bool))
}

const rowCheck = () => {
  certListStore.allCheck = certListStore.data?.every(v => v.check) || false
}

const deleteCertificateHandle = cert_id => {
  certListStore.data?.forEach(v => {
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

onMounted(() => {
  getCertList()
  const h = leftTableRef.value?.clientHeight
  if (h) rightTableHeight.value = h - 41
})

const expiredCertDialogStore = reactive({
  show: false,
  data: [],
})

const expiredCertData = computed(() => {
  return certListStore.data
    ?.filter(v => v.check && v.expire_at * 1000 - new Date().getTime() <= formStore.hosting_date * 24 * 60 * 60 * 1000)
    .map(v => ({
      ...v,
      expire_at_day: Math.floor((v.expire_at * 1000 - new Date().getTime()) / (24 * 60 * 60 * 1000)),
    }))
})

const getRemainDaysText = (expireAt: number) => {
  if (!expireAt || expireAt < 0) return '-'
  const remain = Math.floor((expireAt * 1000 - new Date().getTime()) / (24 * 60 * 60 * 1000))
  return `${Math.max(remain, 0)}天`
}

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

<style scoped lang="scss">
.ssl-hosting-add-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ssl-hosting-add-v2__notice {
  padding: 16px 20px;
}

.ssl-hosting-add-v2__panel {
  padding: 24px;
  background: #fff;
}

.ssl-hosting-add-v2__section-title {
  margin-bottom: 24px;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.ssl-hosting-add-v2__form {
  :deep(.el-form-item__content) {
    display: block;
    min-width: 0;
  }
}

.ssl-hosting-add-v2__item {
  margin-bottom: 24px !important;

  :deep(.el-form-item__label) {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    width: 120px;
    min-height: 22px;
    padding-right: 16px;
    font-size: 14px;
    line-height: 22px;
    color: #828b9c;
  }
}

.ssl-hosting-add-v2__item--top {
  :deep(.el-form-item__content) {
    align-items: flex-start;
  }
}

.ssl-hosting-add-v2__certificate-block {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
}

.ssl-hosting-add-v2__item:not(.ssl-hosting-add-v2__item--top) {
  :deep(.el-form-item__content) {
    max-width: 760px;
  }
}

.ssl-hosting-add-v2__table-pane {
  min-width: 0;
}

.ssl-hosting-add-v2__table-pane--right .ssl-hosting-add-v2__table {
  :deep(.account-table-v2__table .el-table__empty-block) {
    min-height: v-bind('`${rightTableHeight}px`');
  }
}

.ssl-hosting-add-v2__table-tip,
.ssl-hosting-add-v2__selected-title {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 22px;
  color: #a1a9b8;
}

.ssl-hosting-add-v2__table-tip-main {
  margin-right: 8px;
  color: #191c23;
}

.ssl-hosting-add-v2__search {
  width: 100%;
  margin-bottom: 16px;
}

.ssl-hosting-add-v2__search :deep(.el-input__wrapper),
.ssl-hosting-add-v2__time-picker :deep(.el-input__wrapper) {
  border-radius: 0;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.ssl-hosting-add-v2__field-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  width: 100%;
}

.ssl-hosting-add-v2__table {
  width: 100%;
}

.ssl-hosting-add-v2__table :deep(.el-table__row.ssl-hosting-add-v2__selected-row > td.el-table__cell) {
  background: #edf4ff;
}

.ssl-hosting-add-v2__table :deep(.el-checkbox__input.is-disabled.is-checked .el-checkbox__inner) {
  background: #b7c0cd;
  border-color: #b7c0cd;
}

.ssl-hosting-add-v2__table :deep(.el-checkbox__input.is-disabled + .el-checkbox__label) {
  color: #b7c0cd;
}

.ssl-hosting-add-v2__cert-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
}

.ssl-hosting-add-v2__cert-id,
.ssl-hosting-add-v2__cert-remark {
  line-height: 22px;
}

.ssl-hosting-add-v2__cert-remark {
  color: #191c23;
}

.ssl-hosting-add-v2__th-with-icon {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.ssl-hosting-add-v2__remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  color: #828b9c;
  cursor: pointer;
  background: transparent;
  border: 0;

  &:hover {
    color: #06f;
  }
}

.ssl-hosting-add-v2__checkbox-group,
.ssl-hosting-add-v2__radio-group {
  display: flex;
  gap: 40px;
  align-items: center;
  min-height: 32px;
  margin: 0;
}

.ssl-hosting-add-v2__field-tip {
  margin: 0;
  font-size: 12px;
  line-height: 22px;
  color: #828b9c;
}

.ssl-hosting-add-v2__time-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.ssl-hosting-add-v2__time-help {
  color: #828b9c;
}

.ssl-hosting-add-v2__time-picker {
  width: 240px;
}

.ssl-hosting-add-v2__footer {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-top: 24px;
  margin-top: 24px;
  border-top: 1px solid #e8ecf3;
}

.expired-cert-dialog__footer {
  display: flex;
  justify-content: center;

  .el-button {
    min-width: 90px;
    margin: 0 10px;
  }
}

@media (width <= 1024px) {
  .ssl-hosting-add-v2__certificate-block {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (width <= 768px) {
  .ssl-hosting-add-v2__panel {
    padding: 16px;
  }

  .ssl-hosting-add-v2__footer {
    flex-wrap: wrap;
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
}
</style>

<style>
.el-form-item.is-error .el-input__wrapper,
.el-form-item.is-error .el-input__wrapper.is-focus,
.el-form-item.is-error .el-select .el-input.is-focus .el-input__wrapper {
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset !important;
}
</style>
