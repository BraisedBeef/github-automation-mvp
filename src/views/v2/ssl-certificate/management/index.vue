<template>
  <section class="ssl-management-v2">
    <header class="ssl-management-v2__hero">
      <div class="ssl-management-v2__hero-top">
        <h2 class="ssl-management-v2__title">
          {{ t('ssl-certificate.router.931344-0') }}
        </h2>

        <button class="ssl-management-v2__doc-btn" type="button" @click="openHelpDoc">
          <SvgIcon name="help-document" />
          <span>{{ t('common.docHelper') }}</span>
        </button>
      </div>

      <div class="ssl-management-v2__tabs">
        <button
          v-for="item in tabItems"
          :key="item.value"
          class="ssl-management-v2__tab"
          :class="{ 'is-active': item.value === activeTab }"
          type="button"
          @click="handleTabChange(item.value)"
        >
          {{ item.label }}
        </button>
      </div>
    </header>

    <section v-if="isAllTab" class="ssl-management-v2__stats">
      <article class="ssl-management-v2__stat-card">
        <div class="ssl-management-v2__stat-label">
          {{ t('ssl-certificate.management.index.639259-0') }}
        </div>
        <div class="ssl-management-v2__stat-value">
          {{ statusStore.data?.uncommitted_cert_cnt ?? '-' }}
        </div>
        <div class="ssl-management-v2__stat-sub">
          {{ t('ssl-certificate.management.index.639259-1') }}{{ statusStore.data?.unverified_cert_cnt ?? '-' }}
        </div>
      </article>

      <article class="ssl-management-v2__stat-card">
        <div class="ssl-management-v2__stat-label">
          {{ t('ssl-certificate.management.index.639259-2') }}
        </div>
        <div class="ssl-management-v2__stat-value">
          {{ statusStore.data?.expiring_cert_cnt ?? '-' }}
        </div>
        <button
          class="ssl-management-v2__stat-link"
          type="button"
          @click="handleStatusShortcut(StatusTypeEnum.EXPIRING)"
        >
          {{ t('ssl-certificate.management.index.639259-4') }}
        </button>
      </article>

      <article class="ssl-management-v2__stat-card">
        <div class="ssl-management-v2__stat-label">
          {{ t('ssl-certificate.management.index.639259-3') }}
        </div>
        <div class="ssl-management-v2__stat-value">
          {{ statusStore.data?.expired_cert_cnt ?? '-' }}
        </div>
        <button
          class="ssl-management-v2__stat-link"
          type="button"
          @click="handleStatusShortcut(StatusTypeEnum.EXPIRED)"
        >
          {{ t('ssl-certificate.management.index.639259-4') }}
        </button>
      </article>

      <article class="ssl-management-v2__stat-card">
        <div class="ssl-management-v2__stat-label">
          {{ t('ssl-certificate.management.index.639259-5') }}
        </div>
        <div class="ssl-management-v2__stat-value">
          {{ statusStore.data?.issued_cert_cnt ?? '-' }}
        </div>
        <button class="ssl-management-v2__stat-link" type="button" @click="handleCertificateHosting">
          {{ t('ssl-certificate.management.index.639259-6') }}
        </button>
      </article>
    </section>

    <section class="ssl-management-v2__panel">
      <div class="ssl-management-v2__toolbar">
        <div class="ssl-management-v2__toolbar-left">
          <el-button v-if="isAllTab || isFreeTab || isUploadTab" type="primary" @click="handleApplyCertificate">
            {{ t('ssl-certificate.management.index.639259-7') }}
          </el-button>
          <el-button v-if="isAllTab || isUploadTab" class="ssl-v2__buy-btn" @click="handleUploadCertificate">
            {{ t('ssl-certificate.management.index.639259-8') }}
          </el-button>
          <el-button v-if="isCsrTab" type="primary" @click="handleCreateCsr">
            {{ t('ssl-certificate.management.index.639259-9') }}
          </el-button>
        </div>

        <div class="ssl-management-v2__toolbar-right">
          <FilterInput
            ref="filterInputRef"
            :placeholder="t(filterPlaceholder)"
            class="ssl-management-v2__search"
            :filter-list="filterList"
            @search="filterSearchFn"
          />

          <button class="ssl-management-v2__icon-btn" type="button" @click="reset">
            <SvgIcon name="cat-cdn-refresh" :loading="tableData.loading || relatedLoading" />
          </button>
        </div>
      </div>

      <TableV2
        v-if="!isCsrTab"
        ref="tableRef"
        v-loading="tableData.loading"
        :data="tableData.listData"
        :total="tableData.total"
        :pagination="pagination"
        show-pagination
        empty-text="暂无相关数据"
        @selection-change="handleSelectionChange"
        @update:pagination="handlePaginationChange"
      >
        <el-table-column type="selection" width="56" />

        <el-table-column :label="t('ssl-certificate.management.index.922533-0')" min-width="220">
          <template #default="{ row }">
            <div class="ssl-management-v2__primary">
              <Copy class="ssl-management-v2__link" :text="row.cert_id">
                ID：<span @click="certDetails(row)">{{ row.cert_id }}</span>
              </Copy>

              <div class="ssl-management-v2__sub-text ssl-management-v2__remark">
                <span>{{ t('ssl-certificate.management.index.922533-1') }}{{ row.remark || '-' }}</span>
                <SvgIcon name="cat-cdn-edit" class="ssl-management-v2__edit-icon" @click="updateCertRemark(row)" />
              </div>

              <div class="ssl-management-v2__sub-text">
                {{ t('ssl-certificate.management.index.922533-2', { day: row.cert_validity }) }}
              </div>

              <div class="ssl-management-v2__sub-text">
                {{ t('ssl-certificate.management.index.922533-4')
                }}{{ filterArray(CERTIFICATE_SOURCE_MAP, 'value', row.source)?.label || '-' }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('ssl-certificate.management.index.922533-7')" min-width="220">
          <template #default="{ row }">
            <Copy v-if="row.domain" :text="row.domain" break>
              <span class="ssl-management-v2__domain-text">{{ row.domain }}</span>
            </Copy>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column :label="t('ssl-certificate.management.index.922533-8')" min-width="200">
          <template #default="{ row }">
            <span v-if="!filterArray(STATUS_TYPE_MAP, 'value', row.status)?.issueStatus">
              {{ t('ssl-certificate.management.index.922533-9') }}
            </span>
            <span v-else-if="Date.now() >= row.expire_at * 1000">
              {{ t('ssl-certificate.management.index.922533-10') }}
            </span>
            <span v-else>
              {{ getDateDayjs(row.expire_at * 1000, 'string', true) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column :label="t('ssl-certificate.management.index.922533-11')" min-width="140">
          <template #default="{ row }">
            <div class="ssl-management-v2__deploy">
              <SvgIcon v-if="relatedLoading" name="dialog-loading" class="ssl-management-v2__loading-icon" />
              <span>{{ filterArray(deploy_type_map, 'value', row.deploy_type)?.label || '-' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('ssl-certificate.management.index.922533-13')" min-width="110">
          <template #default="{ row }">
            {{ hosting_type_map[row.is_hosting] || '-' }}
          </template>
        </el-table-column>

        <el-table-column :label="t('ssl-certificate.management.index.922533-14')" min-width="110">
          <template #default="{ row }">
            {{
              ['-', t('ssl-certificate.management.index.922533-16'), t('ssl-certificate.management.index.922533-17')][
                row.is_notify
              ] || '-'
            }}
          </template>
        </el-table-column>

        <el-table-column min-width="110">
          <template #header>
            <TableHeadFilter
              ref="statusFilterRef"
              v-model="state"
              :label="t('ssl-certificate.management.index.922533-18')"
              show-all
              field-type="select"
              field-key=""
              :list="filterArray(STATUS_TYPE_MAP, 'filter', [true])"
              @change="getTableList"
            />
          </template>
          <template #default="{ row }">
            <span class="ssl-management-v2__status" :class="`is-${getStatusTone(row.status)}`">
              {{ filterArray(STATUS_TYPE_MAP, 'value', row.status)?.label || '-' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column fixed="right" :label="t('ssl-certificate.management.index.922533-19')" min-width="220">
          <template #default="{ row }">
            <div class="ssl-management-v2__actions">
              <el-link
                v-for="operate in getOperateMap(row).slice(0, 2)"
                :key="`${row.id}-${operate.key}-${operate.label(row)}`"
                :disabled="operate.disabled"
                type="primary"
                @click="() => operate.event(row)"
              >
                {{ operate.label(row) }}
              </el-link>

              <el-dropdown v-if="getOperateMap(row).slice(2).length" trigger="click">
                <button class="ssl-management-v2__more-btn" type="button">
                  <span>{{ t('ssl-certificate.management.index.922533-20') }}</span>
                  <SvgIcon name="cat-cdn-select-more" />
                </button>

                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-for="operate in getOperateMap(row).slice(2)"
                      :key="`${row.id}-${operate.key}-${operate.label(row)}-dropdown`"
                      :disabled="operate.disabled"
                      @click="() => operate.event(row)"
                    >
                      {{ operate.label(row) }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </TableV2>

      <TableV2
        v-else
        v-loading="csrTable.loading"
        :data="csrTable.listData"
        :total="csrTable.total"
        :pagination="csrPagination"
        show-pagination
        empty-text="暂无相关数据"
        @update:pagination="handleCsrPaginationChange"
      >
        <el-table-column :label="t('ssl-certificate.management.index.611178-0')" min-width="220">
          <template #default="{ row }">
            <div class="ssl-management-v2__primary">
              <Copy class="ssl-management-v2__link" :text="row.csr_id">
                <span @click="handleCsrOperate('detail', row)">{{ row.csr_id }}</span>
              </Copy>
              <div class="ssl-management-v2__sub-text ssl-management-v2__remark">
                <span>{{ row.remark || 'undefined' }}</span>
                <SvgIcon name="cat-cdn-edit" class="ssl-management-v2__edit-icon" @click="updateCsrRemark(row)" />
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('ssl-certificate.management.index.611178-1')" min-width="220">
          <template #default="{ row }">
            <Copy v-if="row.common_name" :text="row.common_name" break>
              <span class="ssl-management-v2__domain-text">{{ row.common_name }}</span>
            </Copy>
          </template>
        </el-table-column>

        <el-table-column :label="t('ssl-certificate.management.index.611178-2')" min-width="120">
          <template #default="{ row }">
            {{ filterArray(ENCRYPTION_MAP, 'value', row.encryption)?.label || '-' }}
          </template>
        </el-table-column>

        <el-table-column :label="t('ssl-certificate.management.index.611178-3')" min-width="220">
          <template #default="{ row }">
            {{ _formateTimeDayjs(row.created_at * 1000, FORMAT_TIME) }}
          </template>
        </el-table-column>

        <el-table-column fixed="right" :label="t('ssl-certificate.management.index.611178-4')" min-width="180">
          <template #default="{ row }">
            <div class="ssl-management-v2__actions">
              <el-tooltip
                effect="light"
                :disabled="row.is_delete !== 2"
                :content="t('ssl-certificate.management.index.611178-5')"
                placement="top"
              >
                <el-link :disabled="row.is_delete == 2" type="primary" @click="handleCsrOperate('delete', row)">
                  {{ t('ssl-certificate.management.index.611178-6') }}
                </el-link>
              </el-tooltip>
              <el-link type="primary" @click="handleCsrOperate('detail', row)">
                {{ t('ssl-certificate.management.index.611178-7') }}
              </el-link>
            </div>
          </template>
        </el-table-column>
      </TableV2>
    </section>

    <el-dialog v-model="revokeDialogVisible" :title="t('ssl-certificate.management.index.922533-21')" width="550">
      <span>{{ t('ssl-certificate.management.index.922533-22') }}</span>

      <template #footer>
        <div class="ssl-management-v2__dialog-footer">
          <el-button type="primary" @click="revokeCertificate">
            {{ t('ssl-certificate.management.index.922533-23') }}
          </el-button>
          <el-button @click="revokeDialogVisible = false">
            {{ t('ssl-certificate.management.index.922533-24') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="reIssueDialogVisible" :title="t('ssl-certificate.management.index.922533-21')" width="550">
      <span class="ssl-management-v2__dialog-text">
        {{ t('ssl-certificate.management.index.922533-25') }}({{ t('ssl-certificate.management.index.922533-26') }}){{
          t('ssl-certificate.management.index.922533-27')
        }}({{ t('ssl-certificate.management.index.922533-28') }}){{ t('ssl-certificate.management.index.922533-29') }}
      </span>

      <template #footer>
        <div class="ssl-management-v2__dialog-footer">
          <el-button type="primary" @click="reIssueRevokeCertificate">
            {{ t('ssl-certificate.management.index.922533-23') }}
          </el-button>
          <el-button @click="reIssueDialogVisible = false">
            {{ t('ssl-certificate.management.index.922533-24') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="downloadStore.dialogVisible"
      :title="t('ssl-certificate.management.index.922533-30')"
      width="760"
    >
      <p class="ssl-management-v2__download-desc">
        {{ t('ssl-certificate.management.index.922533-31') }}
      </p>

      <el-table show-overflow-tooltip :data="downloadStore.types">
        <el-table-column prop="tips" :label="t('ssl-certificate.management.index.922533-32')" />
        <el-table-column :label="t('ssl-certificate.management.index.922533-19')" width="210">
          <template #default="{ row }">
            <el-link v-if="!downloadStore.loading" type="primary" @click="handleCertificateDownload(row)">
              {{ t('ssl-certificate.management.index.922533-33') }}
            </el-link>
            <SvgIcon v-else name="loading" />
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <div class="ssl-management-v2__dialog-footer">
          <el-button :loading="downloadStore.loading" @click="downloadStore.dialogVisible = false">
            {{ t('ssl-certificate.management.index.922533-24') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="csrDeleteDialog.visible" :title="t('ssl-certificate.management.index.611178-8')" width="500">
      <span class="ssl-management-v2__dialog-text">
        {{ t('ssl-certificate.management.index.611178-9') }}
      </span>
      <div class="ssl-management-v2__warning-card">
        <SvgIcon class="ssl-management-v2__warning-icon" name="cat-cdn-tip" />
        <p class="ssl-management-v2__warning-text">
          {{ t('ssl-certificate.management.index.611178-10') }}
        </p>
      </div>

      <template #footer>
        <div class="ssl-management-v2__dialog-footer">
          <el-button type="danger" :loading="csrDeleteDialog.loading" @click="handleCsrDelete">
            {{ t('ssl-certificate.management.index.611178-11') }}
          </el-button>
          <el-button :disabled="csrDeleteDialog.loading" @click="csrDeleteDialog.visible = false">
            {{ t('ssl-certificate.management.index.611178-12') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-drawer
      v-model="csrDrawer.show"
      :title="t('ssl-certificate.management.index.611178-13')"
      size="800px"
      class="ssl-management-v2__drawer"
    >
      <template #header="{ titleId, titleClass }">
        <p :id="titleId" :class="titleClass" class="ssl-management-v2__drawer-title">
          {{ t('ssl-certificate.management.index.611178-13') }}
        </p>
      </template>

      <div v-loading="csrDrawer.loading">
        <section class="ssl-management-v2__csr-meta">
          <div class="ssl-management-v2__csr-meta-col">
            <div class="ssl-management-v2__csr-meta-item">
              <div class="ssl-management-v2__csr-meta-label">CSR名称</div>
              <div class="ssl-management-v2__csr-meta-value ssl-management-v2__csr-meta-value--inline">
                <span>{{ csrDrawer.data?.remark || 'undefined' }}</span>
                <SvgIcon
                  name="cat-cdn-edit"
                  class="ssl-management-v2__edit-icon"
                  @click="csrDrawer.data && updateCsrRemark(csrDrawer.data)"
                />
              </div>
            </div>

            <div class="ssl-management-v2__csr-meta-item">
              <div class="ssl-management-v2__csr-meta-label">域名</div>
              <div class="ssl-management-v2__csr-meta-value">
                <EllipsisTooltip :text="csrDrawer.data?.common_name || '-'" max-width="220px" />
              </div>
            </div>

            <div class="ssl-management-v2__csr-meta-item">
              <div class="ssl-management-v2__csr-meta-label">其他域名</div>
              <div class="ssl-management-v2__csr-meta-value">
                <template v-if="csrDrawer.data?.subject_alt_names?.length">
                  <MoreInfoDialog title="其他域名" :text="csrDrawer.data.subject_alt_names.join(', ')">
                    <p v-for="item in csrDrawer.data.subject_alt_names" :key="item">
                      {{ item }}
                    </p>
                  </MoreInfoDialog>
                </template>
                <template v-else> - </template>
              </div>
            </div>

            <div class="ssl-management-v2__csr-meta-item">
              <div class="ssl-management-v2__csr-meta-label">密钥算法</div>
              <div class="ssl-management-v2__csr-meta-value">
                {{ filterArray(ENCRYPTION_MAP, 'value', csrDrawer.data?.encryption)?.label || '-' }}
              </div>
            </div>

            <div class="ssl-management-v2__csr-meta-item">
              <div class="ssl-management-v2__csr-meta-label">密钥强度</div>
              <div class="ssl-management-v2__csr-meta-value">
                {{
                  filterArray(KEY_LENGTH_MAP, 'value', csrDrawer.data?.key_size)?.label ||
                  csrDrawer.data?.key_size ||
                  '-'
                }}
              </div>
            </div>
          </div>

          <div class="ssl-management-v2__csr-meta-col">
            <div class="ssl-management-v2__csr-meta-item">
              <div class="ssl-management-v2__csr-meta-label">
                {{ t('ssl-certificate.management.index.611178-3') }}
              </div>
              <div class="ssl-management-v2__csr-meta-value">
                {{
                  csrDrawer.data?.created_at ? _formateTimeDayjs(csrDrawer.data.created_at * 1000, FORMAT_TIME) : '-'
                }}
              </div>
            </div>

            <div class="ssl-management-v2__csr-meta-item">
              <div class="ssl-management-v2__csr-meta-label">
                {{ t('ssl-certificate.management.index.611178-18') }}
              </div>
              <div class="ssl-management-v2__csr-meta-value">
                {{ csrDrawer.data?.department || '-' }}
              </div>
            </div>

            <div class="ssl-management-v2__csr-meta-item">
              <div class="ssl-management-v2__csr-meta-label">
                {{ t('ssl-certificate.management.index.611178-15') }}
              </div>
              <div class="ssl-management-v2__csr-meta-value">
                {{ csrDrawer.data?.email || '-' }}
              </div>
            </div>

            <div class="ssl-management-v2__csr-meta-item">
              <div class="ssl-management-v2__csr-meta-label">详细地址</div>
              <div class="ssl-management-v2__csr-meta-value">
                {{ detailAddress }}
              </div>
            </div>

            <div class="ssl-management-v2__csr-meta-item">
              <div class="ssl-management-v2__csr-meta-label">
                {{ t('ssl-certificate.management.index.611178-17') }}
              </div>
              <div class="ssl-management-v2__csr-meta-value">
                {{ csrDrawer.data?.company || '-' }}
              </div>
            </div>
          </div>
        </section>

        <div class="ssl-management-v2__detail-group">
          <span class="ssl-management-v2__detail-type">{{ t('ssl-certificate.management.index.611178-21') }}</span>
          <el-card
            class="ssl-management-v2__detail-card"
            body-class="ssl-management-v2__detail-card-body"
            shadow="never"
          >
            <div class="ssl-management-v2__detail-text">
              {{ csrDrawer.data?.csr }}
            </div>
            <SvgIcon
              class="ssl-management-v2__copy-vertical"
              name="dns-copy"
              @click="handleCopy(csrDrawer.data?.csr)"
            />
          </el-card>
        </div>

        <div class="ssl-management-v2__detail-group ssl-management-v2__detail-group--spaced">
          <span class="ssl-management-v2__detail-type">{{ t('ssl-certificate.management.index.611178-22') }}</span>
          <el-card
            class="ssl-management-v2__detail-card"
            body-class="ssl-management-v2__detail-card-body"
            shadow="never"
          >
            <div class="ssl-management-v2__detail-text">
              {{ csrDrawer.data?.private_key }}
            </div>
            <SvgIcon
              class="ssl-management-v2__copy-vertical"
              name="dns-copy"
              @click="handleCopy(csrDrawer.data?.private_key)"
            />
          </el-card>
        </div>
      </div>
    </el-drawer>
  </section>
</template>

<script setup lang="ts">
import JSZip from 'jszip'
import { ElMessage, ElMessageBox } from 'element-plus'
import MoreInfoDialog from '@/views/ssl-certificate/management/components/more-info-dialog.vue'
import EllipsisTooltip from '@/components/common/ellipsis-tooltip/index.vue'
import FilterInput, { type FilterListType } from '@/components/cvm/query-filter/filter-input.vue'
import TableHeadFilter from '@/components/cvm/query-filter/table-head-filter.vue'
import {
  _cancelCert,
  _deleteCsr,
  _deleteCert,
  _downloadCert,
  _getAnalysisGroupByStatusCount,
  _getCertList,
  _getCertRelatedResources,
  _getCsrDetail,
  _getCsrList,
  _updateCertRemark,
  _updateCsrBase,
  _updateNotifyStatus,
} from '@/apis/ssl-certificate/management'
import type {
  CSRDetailResp,
  ListCSRResp,
  ListCertReq,
  ListCertResp,
  StatisticCertResp,
} from '@/apis/ssl-certificate/management/type'
import {
  DeployTypeEnum,
  STATUS_TYPE_MAP,
  SSL_CERTIFICATE_APPLY_TAB,
  SSL_CERTIFICATE_CERT_DOMAIN_TYPE,
  SSL_CERTIFICATE_DETAILS_TAB,
  SSL_CERTIFICATE_FACTORY_ID,
  SSL_CERTIFICATE_MANAGEMENT_TAB,
  SSL_CERTIFICATE_VERIFY_TYPE,
  StatusTypeEnum,
  deploy_type_map,
  hosting_type_map,
} from '@/views/ssl-certificate/management/config'
import {
  CERTIFICATE_SOURCE_MAP,
  CertificateSource,
  ENCRYPTION_MAP,
  KEY_LENGTH_MAP,
  SSLCertDownloadEnum,
  SSLCertTypes,
} from '@/views/ssl-certificate/config'
import Copy from '@/views/ssl-certificate/management/components/copy.vue'
import TipsBar from '@/views/ssl-certificate/management/components/tips-bar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import { download } from '@/utils/download'
import { filterArray } from '@/utils/filter'
import { _formateTimeDayjs, getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { pushRoute, replaceRoute } from '@/utils/router-jump'
import { _s_getItem, _s_setItem } from '@/utils/storage'
import { createRandomStr } from '@/utils/string-utils'
import { documentUrl } from '@/config/base-config'
import { FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { handleCopyValue } from '@/utils/dom-utils'

type CertItem = ListCertResp['items'][number]
type CsrItem = ListCSRResp['items'][number]

const emit = defineEmits<{
  (event: 'change-tab', tab: string): void
}>()

const zip = new JSZip()
const tableRef = ref<InstanceType<typeof TableV2>>()
const filterInputRef = ref<InstanceType<typeof FilterInput>>()
const statusFilterRef = ref<InstanceType<typeof TableHeadFilter>>()
const activeTab = ref(String(_s_getItem(SSL_CERTIFICATE_MANAGEMENT_TAB) || '0'))
const state = ref<number | undefined>()
const isAllTab = computed(() => activeTab.value === '0')
const isFreeTab = computed(() => activeTab.value === '1')
const isUploadTab = computed(() => activeTab.value === '2')
const isCsrTab = computed(() => activeTab.value === '3')

const filterPlaceholder = computed(() =>
  isCsrTab.value ? 'ssl-certificate.management.index.639259-13' : 'ssl-certificate.management.index.639259-10',
)

const filterList = computed<FilterListType[]>(() =>
  isCsrTab.value
    ? [
        {
          fieldName: t('ssl-certificate.management.index.639259-14'),
          fieldKey: 'csr_name',
        },
        {
          fieldName: t('ssl-certificate.management.index.639259-12'),
          fieldKey: 'domain',
        },
      ]
    : [
        {
          fieldName: t('ssl-certificate.management.index.639259-11'),
          fieldKey: 'cert_id',
        },
        {
          fieldName: t('ssl-certificate.management.index.639259-12'),
          fieldKey: 'domain',
        },
      ],
)

const tabItems = computed(() => [
  {
    label: t('ssl-certificate.management.config.844970-3'),
    value: '0',
  },
  {
    label: t('ssl-certificate.management.config.844970-4'),
    value: '1',
  },
  {
    label: t('ssl-certificate.management.config.844970-5'),
    value: '2',
  },
  {
    label: t('ssl-certificate.management.config.844970-6'),
    value: '3',
  },
])

const statusStore = reactive<{
  data?: StatisticCertResp
  loading: boolean
}>({
  loading: false,
})

const tableForm = reactive<{
  cert_id?: string
  domain?: string
  csr_name?: string
  source: number
}>({
  cert_id: '',
  domain: '',
  csr_name: '',
  source: CertificateSource.ALL,
})

const tableData = reactive<{
  listData: CertItem[]
  selectListData: CertItem[]
  operateData?: CertItem
  loading: boolean
  pagination: {
    page: number
    page_size: number
  }
  total: number
}>({
  listData: [],
  selectListData: [],
  operateData: void 0,
  loading: false,
  pagination: {
    page: 1,
    page_size: 10,
  },
  total: 0,
})

const pagination = computed(() => ({
  page: tableData.pagination.page,
  pageSize: tableData.pagination.page_size,
}))

const csrTable = reactive<{
  listData: CsrItem[]
  selectRow?: CsrItem
  loading: boolean
  pagination: {
    page: number
    page_size: number
  }
  total: number
}>({
  listData: [],
  selectRow: void 0,
  loading: false,
  pagination: {
    page: 1,
    page_size: 10,
  },
  total: 0,
})

const csrPagination = computed(() => ({
  page: csrTable.pagination.page,
  pageSize: csrTable.pagination.page_size,
}))

const relatedLoading = ref(false)

const getAnalysisGroupByStatusCount = async () => {
  try {
    statusStore.loading = true
    const { code, msg, data } = await _getAnalysisGroupByStatusCount()
    if (code === 200 && data) {
      statusStore.data = data
    } else {
      message.error(msg)
    }
  } finally {
    statusStore.loading = false
  }
}

const getCertRelatedResources = async () => {
  if (!tableData.listData.length) return
  try {
    relatedLoading.value = true
    const { code, data, msg } = await _getCertRelatedResources({
      cids: tableData.listData.map(item => item.id),
    })
    if (code === 200 && data) {
      tableData.listData.forEach(item => {
        item.deploy_type = data.cdn_resources.includes(item.id) ? DeployTypeEnum.CDN : DeployTypeEnum.NotAssociated
      })
    } else {
      ElMessage.error(msg || t('ssl-certificate.management.index.922533-65'))
    }
  } finally {
    relatedLoading.value = false
  }
}

const getTableList = async () => {
  try {
    tableData.loading = true
    const { code, data, msg } = await _getCertList({
      domain: tableForm.domain,
      cert_id: tableForm.cert_id,
      status: state.value,
      source: tableForm.source,
      page: tableData.pagination.page,
      limit: tableData.pagination.page_size,
    } as ListCertReq)

    if (code === 200 && data) {
      tableData.listData = data.items || []
      tableData.total = data.total || 0
      tableData.selectListData = []
      tableRef.value?.clearSelection()
      getCertRelatedResources()
    } else {
      ElMessage.error(msg || t('ssl-certificate.management.index.922533-34'))
    }
  } finally {
    tableData.loading = false
  }
}

const getStatusTone = (status: number) => {
  if ([StatusTypeEnum.ISSUED_SUCCESS].includes(status)) return 'success'
  if ([StatusTypeEnum.ISSUED_FAIL, StatusTypeEnum.EXPIRED].includes(status)) return 'danger'
  if ([StatusTypeEnum.SUBMIT, StatusTypeEnum.VERIFY, StatusTypeEnum.ISSUED, StatusTypeEnum.EXPIRING].includes(status)) {
    return 'warning'
  }
  return 'default'
}

const handleSelectionChange = (rows: CertItem[]) => {
  tableData.selectListData = rows
}

const handlePaginationChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
  tableData.pagination.page = page
  tableData.pagination.page_size = pageSize
  getTableList()
}

const filterSearchFn = (data: { cert_id?: string; domain?: string }) => {
  tableForm.cert_id = data.cert_id
  tableForm.domain = data.domain
  tableForm.csr_name = (data as { csr_name?: string }).csr_name
  if (isCsrTab.value) {
    csrTable.pagination.page = 1
    getCsrTableList()
    return
  }
  tableData.pagination.page = 1
  getTableList()
}

const reset = () => {
  tableForm.cert_id = ''
  tableForm.domain = ''
  tableForm.csr_name = ''
  state.value = void 0
  tableData.pagination.page = 1
  csrTable.pagination.page = 1
  if (filterInputRef.value) {
    filterInputRef.value.searchList = []
  }
  statusFilterRef.value?.updateCheck?.(void 0)
  if (isCsrTab.value) {
    getCsrTableList()
    return
  }
  getTableList()
}

const handleTabChange = (tab: string) => {
  if (tab === activeTab.value) return
  activeTab.value = tab
  _s_setItem(SSL_CERTIFICATE_MANAGEMENT_TAB, tab)
  emit('change-tab', tab)
}

const handleStatusShortcut = (status: number) => {
  state.value = status
  statusFilterRef.value?.updateCheck?.(status)
  tableData.pagination.page = 1
  getTableList()
}

const handleCertificateHosting = () => {
  pushRoute({ name: 'ssl_certificate_hosting' })
}

const handleApplyCertificate = () => {
  pushRoute({ name: 'ssl_certificate_purchase' })
}

const handleUploadCertificate = () => {
  pushRoute({ name: 'ssl_certificate_upload' })
}

const handleCreateCsr = () => {
  pushRoute({ name: 'ssl_certificate_create_csr' })
}

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const updateCertRemark = async (row: CertItem) => {
  ElMessageBox.prompt(
    t('ssl-certificate.management.index.922533-35'),
    t('ssl-certificate.management.index.922533-21'),
    {
      confirmButtonText: t('ssl-certificate.management.index.922533-23'),
      inputPattern: /^.+$/,
      inputErrorMessage: t('ssl-certificate.management.index.922533-36'),
    },
  ).then(async ({ value }) => {
    const { code, msg } = await _updateCertRemark({
      cert_id: row.cert_id,
      remark: value,
    })
    if (code === 200) {
      message.success(t('ssl-certificate.management.index.922533-37'))
      row.remark = value
    } else {
      ElMessage.error(msg || t('ssl-certificate.management.index.922533-38'))
    }
  })
}

const certDetails = (row: CertItem) => {
  _s_setItem(SSL_CERTIFICATE_DETAILS_TAB, '0')
  _s_setItem(SSL_CERTIFICATE_CERT_DOMAIN_TYPE, row.cert_domain_type)
  _s_setItem(SSL_CERTIFICATE_FACTORY_ID, row.factory_id)
  pushRoute({
    name: 'ssl_certificate_details',
    params: {
      id: row.cert_id,
    },
    query: {
      cert_id: row.cert_id,
      id: row.id,
      factory_id: row.factory_id,
      cert_type: row.cert_type,
    },
  })
}

const updateNotify = async (row: CertItem) => {
  ElMessageBox({
    title: t('ssl-certificate.management.index.922533-21'),
    message: h(
      'div',
      row.is_notify == 1
        ? t('ssl-certificate.management.index.922533-50')
        : t('ssl-certificate.management.index.922533-51'),
    ),
    showCancelButton: true,
    customClass: 'delete-message-box',
    confirmButtonText: t('ssl-certificate.management.index.922533-23'),
    confirmButtonClass: 'mb-confirm',
    cancelButtonText: t('ssl-certificate.management.index.922533-24'),
    cancelButtonClass: 'mb-cancel',
  }).then(async () => {
    const status = row.is_notify === 1 ? 2 : 1
    const { code, msg } = await _updateNotifyStatus({
      cert_id: row.cert_id,
      status,
    })
    if (code === 200) {
      ElMessage.success(t('ssl-certificate.management.index.922533-52'))
      row.is_notify = status
    } else {
      ElMessage.error(msg || t('ssl-certificate.management.index.922533-38'))
    }
  })
}

const deleteCert = async (row: CertItem) => {
  if (row.deploy_type === DeployTypeEnum.NotAssociated) {
    ElMessageBox({
      title: t('ssl-certificate.management.index.922533-21'),
      message: h('div', t('ssl-certificate.management.index.922533-53')),
      showCancelButton: true,
      customClass: 'delete-message-box',
      confirmButtonText: t('ssl-certificate.management.index.922533-23'),
      confirmButtonClass: 'mb-confirm',
      cancelButtonText: t('ssl-certificate.management.index.922533-24'),
      cancelButtonClass: 'mb-cancel',
    }).then(async () => {
      const { code, msg } = await _deleteCert({
        cert_id: row.cert_id,
      })
      if (code === 200) {
        getTableList()
        getAnalysisGroupByStatusCount()
        message.success(t('ssl-certificate.management.index.922533-56-0'))
      } else {
        ElMessage.error(msg || t('ssl-certificate.management.index.922533-56'))
      }
    })
    return
  }

  ElMessageBox({
    title: t('ssl-certificate.management.index.922533-21'),
    message: h('div', [h(TipsBar, t('ssl-certificate.management.index.922533-54'))]),
    confirmButtonText: t('ssl-certificate.management.index.922533-23'),
  })
}

const revokeDialogVisible = ref(false)
const revokeCertificate = async () => {
  revokeDialogVisible.value = false
  if (!tableData.operateData) {
    ElMessage.error(t('ssl-certificate.management.index.922533-57'))
    return
  }
  pushRoute({
    name: 'ssl_certificate_revoke',
    params: {
      id: tableData.operateData.id,
    },
  })
}

const reIssueDialogVisible = ref(false)
const reIssueRevokeCertificate = () => {
  reIssueDialogVisible.value = false
}

const downloadStore = reactive({
  dialogVisible: false,
  loading: false,
  types: SSLCertTypes,
})

const handleCertificateDownload = async (row: (typeof SSLCertTypes)[number]) => {
  if (!tableData.operateData) {
    ElMessage.error(t('ssl-certificate.management.index.922533-61'))
    return
  }
  try {
    downloadStore.loading = true
    const { code, msg, data } = await _downloadCert({
      cert_id: tableData.operateData.cert_id,
      type: row.value,
    })
    if (code === 200 && data) {
      zip.remove(`${tableData.operateData.cert_id}.crt`)
      zip.remove(`${tableData.operateData.cert_id}.key`)
      zip.remove(`${tableData.operateData.cert_id}.pem`)

      switch (row.value) {
        case SSLCertDownloadEnum.Apache:
          if (data.content) zip.file(`${tableData.operateData.cert_id}.crt`, data.content)
          if (data.private_key) zip.file(`${tableData.operateData.cert_id}.key`, data.private_key)
          break
        case SSLCertDownloadEnum.Nginx:
        case SSLCertDownloadEnum.IIS:
          if (data.content) zip.file(`${tableData.operateData.cert_id}.pem`, data.content)
          if (data.content) zip.file(`${tableData.operateData.cert_id}.crt`, data.content)
          if (data.private_key) zip.file(`${tableData.operateData.cert_id}.key`, data.private_key)
          break
        default:
          break
      }

      zip.generateAsync({ type: 'blob' }).then(content => {
        download(content, `${tableData.operateData?.domain}_${row.content}_${createRandomStr(5)}.zip`)
      })
    } else {
      ElMessage.error(msg || t('ssl-certificate.management.index.922533-62'))
    }
  } finally {
    downloadStore.loading = false
  }
}

const cancelCert = (row: CertItem) => {
  ElMessageBox({
    title: t('ssl-certificate.management.index.922533-21'),
    message: h('div', t('ssl-certificate.management.index.922533-63')),
    showCancelButton: true,
    customClass: 'delete-message-box',
    confirmButtonText: t('ssl-certificate.management.index.922533-23'),
    confirmButtonClass: 'mb-confirm',
    cancelButtonText: t('ssl-certificate.management.index.922533-24'),
    cancelButtonClass: 'mb-cancel',
  }).then(async () => {
    const { code, msg } = await _cancelCert({
      cert_id: row.cert_id,
    })
    if (code === 200) {
      message.success(t('ssl-certificate.management.index.922533-64'))
      getTableList()
      getAnalysisGroupByStatusCount()
    } else {
      message.error(msg || t('ssl-certificate.management.index.922533-38'))
    }
  })
}

const operateMap: {
  key: string
  label: (row: CertItem) => string
  disabled?: boolean
  show: (status: CertItem['status']) => boolean
  event: (row: CertItem) => void
}[] = [
  {
    key: 'submitApply',
    label: () => t('ssl-certificate.management.index.922533-39'),
    show: status => [1].includes(status),
    event: row => {
      _s_setItem(SSL_CERTIFICATE_CERT_DOMAIN_TYPE, row.cert_domain_type)
      _s_setItem(SSL_CERTIFICATE_FACTORY_ID, row.factory_id)
      pushRoute({
        name: 'ssl_certificate_apply',
        query: { cert_id: row.cert_id, factory_id: row.factory_id, cert_type: row.cert_type },
      })
    },
  },
  {
    key: 'verifyDomain',
    label: () => t('ssl-certificate.management.index.922533-40'),
    show: status => [2, 3].includes(status),
    event: row => {
      _s_setItem(SSL_CERTIFICATE_APPLY_TAB, 1)
      _s_setItem(SSL_CERTIFICATE_VERIFY_TYPE, row.validate_type)
      _s_setItem(SSL_CERTIFICATE_FACTORY_ID, row.factory_id)
      pushRoute({ name: 'ssl_certificate_apply', query: { cert_id: row.cert_id, factory_id: row.factory_id } })
    },
  },
  {
    key: 'cancelApply',
    label: () => t('ssl-certificate.management.index.922533-41'),
    show: status => [2, 3, 4, 10].includes(status),
    event: row => {
      cancelCert(row)
    },
  },
  {
    key: 'viewVerifyInfo',
    label: () => t('ssl-certificate.management.index.922533-42'),
    show: status => [4, 10].includes(status),
    event: row => {
      _s_setItem(SSL_CERTIFICATE_DETAILS_TAB, '0')
      _s_setItem(SSL_CERTIFICATE_FACTORY_ID, row.factory_id)
      pushRoute({
        name: 'ssl_certificate_verify_info',
        params: {
          id: row.cert_id,
        },
        query: {
          cert_id: row.cert_id,
          factory_id: row.factory_id,
          validate_type: row.validate_type,
        },
      })
    },
  },
  {
    key: 'deploy',
    label: () => t('ssl-certificate.management.index.922533-43'),
    show: status => [5, 7].includes(status),
    event: row => {
      _s_setItem(SSL_CERTIFICATE_CERT_DOMAIN_TYPE, row.cert_domain_type)
      pushRoute({
        name: 'ssl_certificate_deploy',
        params: {
          id: row.cert_id,
        },
        query: {
          cert_id: row.cert_id,
          id: row.id,
          domain: row.domain,
          cert_type: row.cert_type,
        },
      })
    },
  },
  {
    key: 'download',
    label: () => t('ssl-certificate.management.index.922533-33'),
    show: status => [5, 7].includes(status),
    event: row => {
      tableData.operateData = row
      downloadStore.dialogVisible = true
    },
  },
  {
    key: 'update',
    label: () => t('ssl-certificate.management.index.922533-44'),
    show: status => [5, 7].includes(status),
    event: row => {
      pushRoute({
        name: 'ssl_certificate_update',
        params: {
          id: row.cert_id,
        },
        query: {
          cert_id: row.cert_id,
          id: row.id,
          domain: row.domain,
          cert_type: row.cert_type,
        },
      })
    },
  },
  {
    key: 'deploymentRecords',
    label: () => t('ssl-certificate.management.index.922533-45'),
    show: status => [5, 7].includes(status),
    event: row => {
      _s_setItem(SSL_CERTIFICATE_DETAILS_TAB, '1')
      replaceRoute({
        name: 'ssl_certificate_details',
        params: {
          id: row.cert_id,
        },
        query: {
          cert_id: row.cert_id,
          id: row.id,
          domain: row.domain,
        },
      })
    },
  },
  {
    key: 'notify',
    label: row =>
      row.is_notify == 1
        ? t('ssl-certificate.management.index.922533-46')
        : t('ssl-certificate.management.index.922533-47'),
    show: status => [5, 7].includes(status),
    event: row => {
      updateNotify(row)
    },
  },
  {
    key: 'delete',
    label: () => t('ssl-certificate.management.index.922533-48'),
    show: status => [1, 5, 6, 7, 8, 11].includes(status),
    event: row => {
      deleteCert(row)
    },
  },
  {
    key: 'document',
    label: () => t('ssl-certificate.management.index.922533-49'),
    show: status => [5, 7].includes(status),
    event: () => {
      window.open(documentUrl + 'document/detail?type=ssl&docs=2671230721613')
    },
  },
]

const getOperateMap = (row: CertItem) => operateMap.filter(item => item.show(row.status))

const getCsrTableList = async () => {
  csrTable.loading = true
  try {
    const { code, msg, data } = await _getCsrList({
      domain: tableForm.domain,
      csr_name: tableForm.csr_name,
      page: csrTable.pagination.page,
      page_size: csrTable.pagination.page_size,
    })
    if (code === 200 && data) {
      csrTable.listData = data.items
      csrTable.total = data.total
    } else {
      message.error(msg)
    }
  } finally {
    csrTable.loading = false
  }
}

const handleCsrPaginationChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
  csrTable.pagination.page = page
  csrTable.pagination.page_size = pageSize
  getCsrTableList()
}

const csrDeleteDialog = reactive({
  visible: false,
  loading: false,
})

const handleCsrDelete = async () => {
  if (!csrTable.selectRow) {
    message.error(t('ssl-certificate.management.index.611178-23'))
    return
  }
  csrDeleteDialog.loading = true
  try {
    const { code, msg } = await _deleteCsr({
      csr_id: csrTable.selectRow.csr_id,
    })
    if (code === 200) {
      message.success(t('ssl-certificate.management.index.611178-24'))
      csrDeleteDialog.visible = false
      getCsrTableList()
    } else {
      message.error(msg)
    }
  } finally {
    csrDeleteDialog.loading = false
  }
}

const csrDrawer = reactive<{
  show: boolean
  loading: boolean
  data?: CSRDetailResp
}>({
  show: false,
  loading: false,
  data: void 0,
})

const detailAddress = computed(() => {
  if (!csrDrawer.data) return '-'
  const parts = [csrDrawer.data.province, csrDrawer.data.city].filter(Boolean)
  return parts.length ? parts.join('/') : '-'
})

const handleCopy = async (v?: string) => {
  if (!v) return
  await handleCopyValue(v)
  message.success(t('ssl-certificate.management.index.611178-25'))
}

const updateCsrRemark = async (row: CsrItem | CSRDetailResp) => {
  ElMessageBox.prompt(t('ssl-certificate.management.index.611178-26'), t('ssl-certificate.management.index.611178-8'), {
    confirmButtonText: t('ssl-certificate.management.index.611178-27'),
    inputPattern: /^.+$/,
    inputErrorMessage: t('ssl-certificate.management.index.611178-28'),
  }).then(async ({ value }) => {
    const { code, msg } = await _updateCsrBase({
      csr_id: row.csr_id,
      remark: value,
    })
    if (code === 200) {
      message.success(t('ssl-certificate.management.index.611178-29'))
      row.remark = value
    } else {
      ElMessage.error(msg || t('ssl-certificate.management.index.611178-30'))
    }
  })
}

const handleCsrOperate = async (operate: 'delete' | 'detail', row: CsrItem) => {
  csrTable.selectRow = row
  if (operate === 'delete') {
    csrDeleteDialog.visible = true
    return
  }

  try {
    csrDrawer.data = void 0
    csrDrawer.show = true
    csrDrawer.loading = true
    const { code, msg, data } = await _getCsrDetail({ csr_id: row.csr_id })
    if (code === 200 && data) {
      csrDrawer.data = data
    } else {
      message.error(msg || t('ssl-certificate.management.index.611178-31'))
    }
  } finally {
    csrDrawer.loading = false
  }
}

const syncTabState = (tab: string) => {
  if (tab === '0') {
    tableForm.source = CertificateSource.ALL
  } else if (tab === '1') {
    tableForm.source = CertificateSource.FREE
  } else if (tab === '2') {
    tableForm.source = CertificateSource.SELF
  } else if (tab === '3') {
    tableForm.source = CertificateSource.ALL
  }
}

watch(
  () => activeTab.value,
  tab => {
    if (!['0', '1', '2', '3'].includes(tab)) return
    syncTabState(tab)
    state.value = void 0
    tableForm.cert_id = ''
    tableForm.domain = ''
    tableForm.csr_name = ''
    tableData.pagination.page = 1
    csrTable.pagination.page = 1
    filterInputRef.value && (filterInputRef.value.searchList = [])
    statusFilterRef.value?.updateCheck?.(void 0)
    if (tab === '3') {
      getCsrTableList()
      return
    }
    getTableList()
    if (tab === '0') {
      getAnalysisGroupByStatusCount()
    }
  },
)

onMounted(() => {
  syncTabState(activeTab.value)
  if (isAllTab.value) {
    getAnalysisGroupByStatusCount()
  }
  if (isCsrTab.value) {
    getCsrTableList()
  } else {
    getTableList()
  }
})
</script>

<style scoped lang="scss">
.ssl-management-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ssl-management-v2__hero,
.ssl-management-v2__stats,
.ssl-management-v2__panel {
  background: #fff;
}

.ssl-management-v2__hero {
  padding: 20px 20px 0;
}

.ssl-management-v2__hero-top {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.ssl-management-v2__title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.ssl-management-v2__tabs,
.ssl-management-v2__toolbar,
.ssl-management-v2__toolbar-left,
.ssl-management-v2__toolbar-right,
.ssl-management-v2__stats,
.ssl-management-v2__primary,
.ssl-management-v2__deploy,
.ssl-management-v2__actions {
  display: flex;
}

.ssl-management-v2__doc-btn {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.ssl-management-v2__doc-btn:hover {
  color: #06f;
}

.ssl-management-v2__tabs {
  gap: 32px;
  margin-top: 18px;
}

.ssl-management-v2__tab {
  position: relative;
  padding: 0 0 14px;
  font: inherit;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.ssl-management-v2__tab.is-active {
  font-weight: 500;
  color: #06f;
}

.ssl-management-v2__tab.is-active::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  content: '';
  background: #06f;
}

.ssl-management-v2__stats {
  gap: 24px;
  padding: 20px 40px;
}

.ssl-management-v2__stat-card {
  flex: 1;
  min-width: 0;
}

.ssl-management-v2__stat-label {
  font-size: 12px;
  line-height: 20px;
  color: #191c23;
}

.ssl-management-v2__stat-value {
  margin-top: 12px;
  font-size: 24px;
  font-weight: 600;

  // line-height: 52px;
  color: #191c23;
}

.ssl-management-v2__stat-sub {
  margin-top: 12px;
  font-size: 12px;
  line-height: 20px;
  color: #828b9c;
}

.ssl-management-v2__stat-link {
  padding: 0;
  margin-top: 12px;
  font-size: 14px;
  line-height: 20px;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.ssl-management-v2__panel {
  padding: 20px;
}

.ssl-management-v2__toolbar {
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.ssl-management-v2__toolbar-left,
.ssl-management-v2__toolbar-right,
.ssl-management-v2__actions {
  gap: 12px;
  align-items: center;
}

.ssl-management-v2__toolbar-right {
  justify-content: flex-end;
}

.ssl-management-v2__search {
  width: 390px;
  max-width: 100%;
}

.ssl-management-v2__icon-btn,
.ssl-management-v2__more-btn {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: 0;
}

.ssl-management-v2__icon-btn {
  width: 34px;
  height: 34px;
  color: #6b7280;
  cursor: pointer;
  border: 1px solid #d7deea;
}

.ssl-management-v2__icon-btn:hover {
  color: #06f;
  border-color: #b7d0ff;
}

.ssl-management-v2__primary {
  flex-direction: column;
  gap: 4px;
  padding: 4px 0;
}

.ssl-management-v2__sub-text {
  font-size: 12px;
  line-height: 20px;
  color: #828b9c;
}

.ssl-management-v2__remark {
  display: flex;
  gap: 6px;
  align-items: center;
}

.ssl-management-v2__link {
  color: #06f;
  cursor: pointer;
}

.ssl-management-v2__edit-icon,
.ssl-management-v2__loading-icon {
  color: #8a94a6;
}

.ssl-management-v2__edit-icon {
  cursor: pointer;
}

.ssl-management-v2__loading-icon {
  animation: rotating 1s linear infinite;
}

.ssl-management-v2__domain-text {
  display: inline-block;
  line-height: 22px;
  word-break: break-all;
}

.ssl-management-v2__deploy {
  gap: 6px;
  align-items: center;
}

.ssl-management-v2__status {
  font-size: 14px;
  line-height: 22px;
}

.ssl-management-v2__status.is-success {
  color: #12a150;
}

.ssl-management-v2__status.is-danger {
  color: #f04438;
}

.ssl-management-v2__status.is-warning {
  color: #ff7d00;
}

.ssl-management-v2__status.is-default {
  color: #191c23;
}

.ssl-management-v2__more-btn {
  color: #06f;
  cursor: pointer;
}

.ssl-management-v2__dialog-footer {
  text-align: right;
}

.ssl-management-v2__dialog-text,
.ssl-management-v2__download-desc {
  color: #191c23;
}

.ssl-management-v2__warning-card {
  display: flex;
  padding: 7px 12px;
  margin-top: 16px;
  background: #e3edff;
}

.ssl-management-v2__warning-icon {
  margin-top: 2px;
  margin-right: 8px;
  color: #06f;
}

.ssl-management-v2__warning-text {
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  color: #06f;
}

.ssl-management-v2__download-desc {
  margin-bottom: 10px;
}

.ssl-management-v2__drawer-title {
  font-weight: 700;
  color: #000;
}

.ssl-management-v2__csr-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.ssl-management-v2__csr-meta-col {
  display: flex;
  flex-direction: column;
  gap: 29px;
}

.ssl-management-v2__csr-meta-item {
  display: flex;
  align-items: flex-start;
  min-height: 20px;
}

.ssl-management-v2__csr-meta-label {
  flex: 0 0 76px;
  font-size: 14px;
  line-height: 20px;
  color: #828b9c;
}

.ssl-management-v2__csr-meta-value {
  min-width: 0;
  font-size: 14px;
  line-height: 20px;
  color: #191c23;
  word-break: break-word;
}

.ssl-management-v2__csr-meta-value--inline {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.ssl-management-v2__detail-group--spaced {
  margin-top: 60px;
}

.ssl-management-v2__detail-type {
  font-size: 14px;
  line-height: 20px;
  color: #000;
}

.ssl-management-v2__detail-card {
  margin-top: 20px;
  background-color: #f9fafc;
}

.ssl-management-v2__detail-text {
  width: 100%;
  word-break: break-all;
  white-space: pre-wrap;
}

.ssl-management-v2__detail-card :deep(.ssl-management-v2__detail-card-body) {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  justify-content: space-between;
}

.ssl-management-v2__copy-vertical {
  flex: 0 0 auto;
  color: #999;
  cursor: pointer;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (width <= 1280px) {
  .ssl-management-v2__stats,
  .ssl-management-v2__toolbar,
  .ssl-management-v2__toolbar-left,
  .ssl-management-v2__toolbar-right {
    flex-wrap: wrap;
  }

  .ssl-management-v2__search {
    width: 100%;
  }

  .ssl-management-v2__csr-meta {
    grid-template-columns: 1fr;
  }
}

:deep(.account-table-v2__table .el-table__body-wrapper td.el-table__cell) {
  height: 90px;

  // padding: 0 16px;
  vertical-align: top;
}

:deep(.account-table-v2__table td.el-table__cell .cell) {
  display: flex;
  align-items: center;
  min-height: 90px;
}

.ssl-v2__buy-btn {
  margin-left: 0 !important;
  color: #06f;
}
</style>

<style lang="scss">
.delete-message-box {
  padding-bottom: 24px !important;

  .el-message-box__btns {
    display: flex;
    flex-direction: row-reverse;
    justify-content: right;
    margin-top: 20px;

    .mb-confirm {
      margin-right: 10px;
    }
  }
}
</style>
