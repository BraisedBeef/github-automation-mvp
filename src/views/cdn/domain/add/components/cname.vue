<template>
  <div class="page-box mt20">
    <div class="df ac">
      <SvgIcon name="cat-cdn-success" style="color: var(--success-color)" class="mr4" />{{ t('addFinishTip') }}
    </div>
    <div class="mt20">
      <el-button type="primary" @click="getDomainBaseConfig(true)">
        {{ t('refreshCname') }}
      </el-button>
    </div>
    <el-table :data="tableData" class="mt20" table-layout="auto" show-overflow-tooltip>
      <el-table-column prop="domain" :label="t('domain')" />
      <el-table-column prop="cname" :label="t('CNAME')" />
      <el-table-column prop="status" :label="t('cnameStatus')">
        <template #default="{ row }">
          {{ row.status ? t('parsed') : t('unresolved') }}
          <!-- <el-text :type="row.status ? 'primary' : 'danger'">{{ row.status ? t('parsed') : t('unresolved') }}</el-text> -->
        </template>
      </el-table-column>
    </el-table>
    <div class="df jc mt20">
      <el-button plain @click="pushRoute('/cdn/domain')">
        {{ t('completeConfig') }}
      </el-button>
      <el-button type="primary" @click="pushRoute('/cdn/domain')">
        {{ t('skip') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { _getBaseConfig } from '@/apis/cdn/domain'
import { message } from '@/utils/message'
import SvgIcon from '@/components/common/svg-icon/index.vue'
import { pushRoute } from '@/utils/router-jump'

const router = useRouter()

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

//获取域名基本配置
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

<style lang="scss" scoped>
@import '../../index-domain';
</style>
