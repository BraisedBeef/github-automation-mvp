<template>
  <div class="cdn-content-v2">
    <PageBreadcrumbToolbar :items="[t('content')]" @doc="openHelpDoc" />

    <section class="cdn-content-v2__panel">
      <div class="cdn-content-v2__filters">
        <div class="cdn-content-v2__filter-item cdn-content-v2__filter-item--range">
          <span class="cdn-content-v2__label">{{ t('time') }}</span>
          <DateTimePicker
            v-model:start_time="form.start_time"
            :loading="state.loading"
            :compare="false"
            @change="getData"
          />
        </div>

        <div class="cdn-content-v2__filter-item">
          <span class="cdn-content-v2__label">{{ t('sendStatus') }}</span>
          <el-select v-model="form.status" class="cdn-content-v2__select" @change="getData">
            <el-option v-for="item in filtetOptions.status" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>

        <div class="cdn-content-v2__filter-item">
          <span class="cdn-content-v2__label">{{ t('queryType') }}</span>
          <el-select v-model="form.type" class="cdn-content-v2__select" @change="getData">
            <el-option v-for="item in filtetOptions.type" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
      </div>
    </section>

    <section class="cdn-content-v2__panel">
      <div class="cdn-content-v2__toolbar">
        <div class="cdn-content-v2__actions">
          <el-button type="primary" :disabled="state.loading" @click="handleDialog(true)">
            <div class="cdn-content-v2__refresh-btn">
              <SvgIcon name="cat-cdn-refresh" :loading="state.loading" />
              <span>{{ t('refresh') }}</span>
            </div>
          </el-button>
          <el-button plain :disabled="state.loading" @click="handleDialog(false)">
            {{ t('prefetch') }}
          </el-button>
        </div>

        <div class="cdn-content-v2__search-wrap">
          <el-input
            v-model.trim="searchValue"
            :disabled="state.loading"
            :placeholder="t('myDomains.searchPlaceholder')"
            maxlength="256"
            class="cdn-content-v2__search"
            @keydown.enter="getData"
          >
            <template #prefix>
              <SvgIcon name="dns-search" />
            </template>
          </el-input>
          <button class="cdn-content-v2__icon-btn" type="button" @click="getData">
            <SvgIcon name="cat-cdn-refresh" :loading="state.loading" />
          </button>
        </div>
      </div>

      <TableV2
        v-loading="state.loading"
        :data="state.tableData"
        :total="state.total"
        :pagination="pagination"
        show-pagination
        @update:pagination="handlePaginationChange"
      >
        <el-table-column :label="t('sendStatus')" prop="status" min-width="180">
          <template #default="{ row }">
            <div class="cdn-content-v2__status" :class="`is-${statusMap[row.status]?.tone || 'muted'}`">
              <span class="cdn-content-v2__status-dot" />
              <span>{{ statusMap[row.status]?.label || '-' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('content1')" prop="content" min-width="420" show-overflow-tooltip />

        <el-table-column :label="t('taskSendTime')" prop="create_time" min-width="240">
          <template #default="{ row }">
            {{ getDateDayjs(row.create_time * 1000, 'string', true) }}
          </template>
        </el-table-column>
      </TableV2>
    </section>

    <RefreshDialog
      :dialog="state.refreshDialog"
      :is-refresh="state.isRefresh"
      @close="() => (state.refreshDialog = false)"
      @success="getData"
    />
  </div>
</template>

<script setup lang="ts">
import { documentUrl } from '@/config/base-config'
import { filtetOptions } from '@/views/cdn/content/config'
import RefreshDialog from '@/views/cdn/content/refresh-dialog.vue'
import type { RequestFilterInterface } from '@/views/cdn/content/type'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import { getDateDayjs, setDateTimeRangeDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'

enum StatusEnum {
  Fail = 0,
  Success = 1,
  Processing = 2,
}

const statusMap = {
  [StatusEnum.Fail]: { label: t('fail'), tone: 'danger' },
  [StatusEnum.Success]: { label: t('complete'), tone: 'success' },
  [StatusEnum.Processing]: { label: t('processing'), tone: 'muted' },
}

const form = ref<RequestFilterInterface>({
  start_time: setDateTimeRangeDayjs('today').current,
  end_time: 0,
  type: 0,
  status: 0,
})

const state = reactive({
  loading: false,
  tableData: [] as any[],
  total: 0,
  refreshDialog: false,
  isRefresh: false,
  pagination: {
    page: 1,
    page_size: 10,
  },
})

const searchValue = ref('')

const pagination = computed(() => ({
  page: state.pagination.page,
  pageSize: state.pagination.page_size,
}))

const handleDialog = (isRefresh: boolean) => {
  state.isRefresh = isRefresh
  state.refreshDialog = true
}

const handlePaginationChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
  state.pagination.page = page
  state.pagination.page_size = pageSize
  getData()
}

const getData = () => {
  const params = {
    key: searchValue.value.trim(),
    status: form.value.status,
    start_time: maoYunDayJs(form.value.start_time[0]).valueOf() / 1000,
    end_time: maoYunDayJs(form.value.start_time[1]).valueOf() / 1000,
    ...state.pagination,
  }

  state.loading = true
  const fn = filtetOptions.type.find(item => item.value === form.value.type)?.fn
  fn?.(params)
    .then(res => {
      state.tableData = res.data.data || []
      state.total = res.data.total || 0
    })
    .finally(() => {
      state.loading = false
    })
}

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

onMounted(() => {
  getData()
})
</script>

<style scoped lang="scss">
.cdn-content-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cdn-content-v2__panel {
  padding: 20px;
  background: #fff;
}

.cdn-content-v2__filters,
.cdn-content-v2__toolbar,
.cdn-content-v2__actions,
.cdn-content-v2__search-wrap,
.cdn-content-v2__status {
  display: flex;
  align-items: center;
}

.cdn-content-v2__filters {
  flex-wrap: wrap;
  gap: 32px;
}

.cdn-content-v2__filter-item {
  display: grid;
  grid-template-columns: auto 220px;
  gap: 12px;
  align-items: center;
}

.cdn-content-v2__filter-item--range {
  grid-template-columns: auto minmax(360px, 1fr);
  min-width: 520px;
}

.cdn-content-v2__label {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.cdn-content-v2__select,
.cdn-content-v2__search {
  width: 100%;
}

.cdn-content-v2__toolbar {
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 20px;
}

.cdn-content-v2__search-wrap {
  gap: 12px;
}

.cdn-content-v2__refresh-btn {
  display: flex;
  gap: 8px;
  align-items: center;
}

.cdn-content-v2__refresh-btn :deep(.svg-icon) {
  color: #fff;
}

.cdn-content-v2__search-wrap {
  margin-left: auto;
}

.cdn-content-v2__search {
  width: 320px;
}

.cdn-content-v2__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #191c23;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
}

.cdn-content-v2__status {
  gap: 8px;
}

.cdn-content-v2__status-dot {
  width: 8px;
  height: 8px;
  border: 2px solid currentcolor;
  border-radius: 999px;
}

.cdn-content-v2__status.is-success {
  color: #01a66f;
}

.cdn-content-v2__status.is-danger {
  color: #e54839;
}

.cdn-content-v2__status.is-muted {
  color: #828b9c;
}

@media (width <= 1024px) {
  .cdn-content-v2__panel {
    padding: 16px;
  }

  .cdn-content-v2__filter-item,
  .cdn-content-v2__filter-item--range {
    grid-template-columns: 1fr;
    width: 100%;
    min-width: 0;
  }

  .cdn-content-v2__toolbar {
    align-items: stretch;
  }

  .cdn-content-v2__toolbar,
  .cdn-content-v2__search-wrap {
    flex-direction: column;
  }

  .cdn-content-v2__search {
    width: 100%;
  }
}
</style>
