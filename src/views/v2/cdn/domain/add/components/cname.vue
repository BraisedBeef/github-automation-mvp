<template>
  <section class="cdn-domain-add-cname-v2">
    <div class="cdn-domain-add-cname-v2__notice">
      <SvgIcon name="cat-cdn-success" size="16" class="cdn-domain-add-cname-v2__notice-icon" />
      <span>{{ t('addFinishTip') }}</span>
    </div>

    <div class="cdn-domain-add-cname-v2__toolbar">
      <el-button type="primary" @click="getDomainBaseConfig(true)">
        {{ t('refreshCname') }}
      </el-button>
    </div>

    <TableV2 :data="tableData" class="cdn-domain-add-cname-v2__table" table-layout="auto" :empty-min-height="180">
      <el-table-column prop="domain" :label="t('domain')" min-width="260" />
      <el-table-column prop="cname" label="参数" min-width="420">
        <template #default="{ row }">
          {{ row.cname || '--' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="t('cnameStatus')" min-width="140">
        <template #default="{ row }">
          {{ row.status ? t('parsed') : t('unresolved') }}
        </template>
      </el-table-column>
    </TableV2>

    <div class="cdn-domain-add-cname-v2__footer">
      <el-button type="primary" @click="pushRoute('/cdn/domain')">
        {{ t('skip') }}
      </el-button>
      <el-button @click="pushRoute('/cdn/domain')">
        {{ t('completeConfig') }}
      </el-button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { _getBaseConfig } from '@/apis/cdn/domain'
import SvgIcon from '@/components/common/svg-icon/index.vue'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { pushRoute } from '@/utils/router-jump'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

interface TableData {
  domain: string
  cname: string
  status: boolean
}

const tableData = reactive<TableData[]>([
  {
    domain: localStorage.CDN_DOMAIN,
    cname: 'example.cn.96f6394a.cdnhwcggk22.com',
    status: true,
  },
])

const getDomainBaseConfig = (isTip?: boolean) => {
  _getBaseConfig(localStorage.CDN_DOMAIN_ID).then(res => {
    tableData[0].domain = res.data.base_info.domain
    tableData[0].cname = res.data.base_info.cname
    tableData[0].status = res.data.base_info.cname_status

    if (isTip) {
      message.success(t('prem.refreshSuccess'))
    }
  })
}

getDomainBaseConfig()
</script>

<style scoped lang="scss">
.cdn-domain-add-cname-v2 {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background: #fff;
}

.cdn-domain-add-cname-v2__notice {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 48px;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 22px;
  color: #14a46f;
  background: #edf9f2;
  border: 1px solid #b7ebcd;
}

.cdn-domain-add-cname-v2__notice-icon {
  flex: none;
  color: #14a46f;
}

.cdn-domain-add-cname-v2__toolbar {
  display: flex;
  align-items: center;
}

.cdn-domain-add-cname-v2__table {
  border: 0;
}

.cdn-domain-add-cname-v2__footer {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
