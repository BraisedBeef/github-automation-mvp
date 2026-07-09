<template>
  <el-form
    ref="formRef"
    :model="formStore"
    :rules="formRules"
    label-position="left"
    label-width="auto"
    class="demo-form-inline"
  >
    <el-form-item :label="t('ssl-certificate.management.update.124800-0')" prop="is_notify">
      <el-radio-group v-model="formStore.is_notify">
        <el-radio :label="1">
          {{ t('ssl-certificate.management.update.124800-1') }}
        </el-radio>
        <el-radio :label="2">
          {{ t('ssl-certificate.management.update.124800-2') }}
        </el-radio>
      </el-radio-group>
      <p class="mt5" style="line-height: 1; color: #999">
        {{ t('ssl-certificate.management.update.124800-3') }}{{ query.cert_id
        }}{{ t('ssl-certificate.management.update.124800-4') }}
      </p>
    </el-form-item>
    <el-form-item :label="t('ssl-certificate.management.update.124800-5')" prop="source">
      <el-radio-group v-model="source" @change="handelSourceTypeChange">
        <el-radio :label="1">
          {{ t('ssl-certificate.management.update.124800-6') }}
        </el-radio>
        <el-radio :label="2">
          {{ t('ssl-certificate.management.update.124800-7') }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="t('ssl-certificate.management.update.124800-8')" prop="new_cert_id">
      <el-select v-model="formStore.new_cert_id" filterable @change="handleUpdateCertChange">
        <el-option
          v-for="cert in updateCertStore.data"
          :key="cert.cert_id"
          :label="`${cert.cert_id} | ${cert.domain}`"
          :value="cert.cert_id"
        />
        <!-- :disabled="cert.cert_id === query.cert_id" -->
      </el-select>
    </el-form-item>
    <el-form-item :label="t('ssl-certificate.management.update.124800-9')">
      <p class="mb10">
        {{ t('ssl-certificate.management.update.124800-10') }}
        <!-- <span class="link" @click="handelDeploy">{{ t('ssl-certificate.management.update.124800-11') }}</span> -->
        {{ t('ssl-certificate.management.update.124800-11') }}
      </p>
      <el-select v-model="formStore.update_type" class="mb20">
        <el-option :label="t('ssl-certificate.management.update.124800-12')" :value="1" />
      </el-select>
      <div v-loading="oldDomainStore.loading" class="df jsb domain-container">
        <div class="left mr20">
          <el-input v-model="oldDomainStore.query" :placeholder="t('ssl-certificate.management.update.124800-13')" />
          <el-table
            :data="filterAvailableDomain"
            show-overflow-tooltip
            max-height="330px"
            table-layout="auto"
            class="mt10"
            style="height: 330px; border: 1px solid #ddd"
          >
            <el-table-column prop="domain" :label="t('ssl-certificate.management.update.124800-14')" width="240">
              <template #header>
                <div class="df ac">
                  <el-checkbox v-model="oldDomainStore.allCheck" style="margin-right: 10px" @change="allCheck" />
                  {{ t('ssl-certificate.management.update.124800-14') }}
                </div>
              </template>
              <template #default="{ row }">
                <div class="df ac">
                  <el-checkbox
                    v-model="row.check"
                    style="margin-right: 10px"
                    :disabled="row.status == 2 || row.disableUpdate == DisableUpdateDomain.DISABLED"
                    @change="rowCheck"
                  />
                  {{ row.domain }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="status" :label="t('ssl-certificate.management.update.124800-15')">
              <template #default="{ row }">
                {{ ServerStatusMap[row.status] }}
              </template>
            </el-table-column>
            <el-table-column prop="disableUpdate" :label="t('ssl-certificate.management.update.124800-25')">
              <template #default="{ row }">
                {{ UpdateDomainMap[row.disableUpdate] || '-' }}
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="right">
          <!-- @ts-ignore -->
          <el-table
            :data="oldDomainStore.data.filter(v => v.check)"
            show-overflow-tooltip
            max-height="374"
            table-layout="auto"
            style="height: 374px; border: 1px solid #ddd"
          >
            <el-table-column prop="domain" :label="t('ssl-certificate.management.update.124800-14')" width="240" />
            <el-table-column prop="status" :label="t('ssl-certificate.management.update.124800-15')">
              <template #default="{ row }">
                {{ ServerStatusMap[row.status] }}
              </template>
            </el-table-column>
            <el-table-column prop="disableUpdate" :label="t('ssl-certificate.management.update.124800-25')">
              <template #default="{ row }">
                {{ UpdateDomainMap[row.disableUpdate] || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="" label="" width="50">
              <template #default="{ row }">
                <SvgIcon name="cat-cdn-delete" class="icon-hover" @click="deleteDomainHandle(row.domain)" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <TipsBar
        v-if="filterAvailableDomain.some(v => v.disableUpdate == DisableUpdateDomain.DISABLED)"
        class="mt20"
        :tips="t('ssl-certificate.management.update.124800-24')"
        color="#f7b500"
        background="#fff3d3"
      />
    </el-form-item>
    <el-divider style="border-color: #eee" />
    <el-form-item>
      <el-button
        type="primary"
        style="min-width: 110px"
        :disabled="oldDomainStore.data.filter(v => v.check).length <= 0"
        :loading="submitStore.loading"
        @click="onSubmit"
      >
        {{ t('ssl-certificate.management.update.124800-18') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import type { FormInstance, FormRules } from 'element-plus/es'
import { _getUpdateCert, _getUpdateDomain, _updateCert } from '@/apis/ssl-certificate/management'
import { SubmitUpdateReq, UpdateCertResp, UpdateDomainResp } from '@/apis/ssl-certificate/management/type'
import { message } from '@/utils/message'
import { _s_setItem } from '@/utils/storage'
import TipsBar from '@/views/ssl-certificate/management/components/tips-bar.vue'
import { SSL_CERTIFICATE_DETAILS_TAB } from '../../config'
import { pushRoute, replaceRoute } from '@/utils/router-jump'

// ---- config
// 服务状态
const ServerStatusMap = [
  '-',
  t('ssl-certificate.management.update.124800-16'),
  t('ssl-certificate.management.update.124800-17'),
]

// 资源状态;判断是否可更新
enum DisableUpdateDomain {
  // 已启用
  ENABLED = 1,
  // 不可更新
  DISABLED = 2,
}
const UpdateDomainMap = [
  '-',
  t('ssl-certificate.management.update.124800-26'),
  t('ssl-certificate.management.update.124800-27'),
]

// ----

const router = useRouter()
const route = useRoute()
const query = route.query as unknown as { cert_id?: string; id?: string; domain?: string }

/// props
const props = defineProps({
  id: String,
})

// 获取关联的新证书
const updateCertStore = reactive<{
  loading: boolean
  data: UpdateCertResp['items']
}>({
  loading: false,
  data: [],
})
const getUpdateCert = async () => {
  formStore.new_cert_id = ''
  if (!query.cert_id) {
    message.error(t('ssl-certificate.management.update.124800-19'))
    return
  }
  // 获取新证书 无数据
  // if (oldDomainStore.data.length <= 0) return

  try {
    updateCertStore.loading = true
    const { code, msg, data } = await _getUpdateCert({
      old_cert_id: query.cert_id,
      cert_source: source.value,
      deployed_domains: oldDomainStore.data.map(item => item.domain),
    })
    if (code === 200 && data) {
      updateCertStore.data = data.items
      // 清空选项
      allCheck(false)
    } else {
      message.error(msg || t('ssl-certificate.management.update.124800-20'))
    }
  } finally {
    updateCertStore.loading = false
  }
}
const handleUpdateCertChange = (cert_id: UpdateCertResp['items'][0]['cert_id']) => {
  const item = updateCertStore.data.find(item => item.cert_id === cert_id)
  if (!item) {
    message.error(t('ssl-certificate.management.update.124800-19'))
    return
  }
  formStore.new_cert_id = item!.cert_id
  formStore.new_cid = item!.cid
  allCheck(false)
}
const handelSourceTypeChange = () => {
  formStore.new_cert_id = ''
  oldDomainStore.data.map(v => (v.disableUpdate = undefined))
  getUpdateCert()
}

// 获取旧证书对应的域名
const oldDomainStore = reactive<{
  loading: boolean
  query: string
  allCheck: boolean
  data: UpdateDomainResp['items']
}>({
  query: '',
  loading: false,
  allCheck: false,
  data: [],
})
// 搜索过滤,域名匹配过滤
const filterAvailableDomain = computed(() => {
  const list = oldDomainStore.data.filter(v => v.domain.includes(oldDomainStore.query))
  const newCert = updateCertStore.data.find(item => item.cert_id === formStore.new_cert_id)

  list.forEach(v => {
    const { domain } = v

    if (!newCert) {
      v.disableUpdate = DisableUpdateDomain.ENABLED
      return
    }
    if (!newCert?.dns_domains || newCert.dns_domains.length <= 0) {
      v.disableUpdate = DisableUpdateDomain.DISABLED
      return
    }

    const is = newCert?.dns_domains?.some(dns_domain => {
      // 普通域名
      const rq = dns_domain === domain
      // 同级泛域名
      // 将泛域名模式转换为正则表达式
      const regexPattern = dns_domain
        .replace(/\./g, '\\.') // 转义点号
        .replace(/\*/g, '[^.]+') // 将 * 替换为匹配非点号字符的表达式
      const regex = new RegExp(`^${regexPattern}$`)

      return rq || regex.test(domain)
    })

    v.disableUpdate = is ? DisableUpdateDomain.ENABLED : DisableUpdateDomain.DISABLED
  })

  return list
})
const allCheck = bool => {
  if (bool === false) oldDomainStore.allCheck = false
  filterAvailableDomain.value.forEach(v =>
    v.status == 1 && v.disableUpdate != DisableUpdateDomain.DISABLED ? (v.check = bool) : '',
  )
}
const rowCheck = () => {
  oldDomainStore.allCheck = oldDomainStore.data.every(v => v.check)
}
const deleteDomainHandle = domain => {
  oldDomainStore.data.forEach(v => {
    if (v.domain === domain) {
      v.check = false
    }
  })
  oldDomainStore.allCheck = false
}
const getUpdateDomain = async () => {
  if (!query.cert_id) {
    return
  }
  try {
    oldDomainStore.loading = true
    const { code, msg, data } = await _getUpdateDomain({
      old_cert_id: query.cert_id,
    })
    if (code === 200 && data) {
      oldDomainStore.data = data.items

      getUpdateCert()
    } else {
      message.error(msg || t('ssl-certificate.management.update.124800-21'))
    }
  } finally {
    oldDomainStore.loading = false
  }
}
const handelDeploy = () => {
  pushRoute({
    name: 'ssl_certificate_deploy',
    params: {
      id: props.id,
    },
    query: query,
  })
}
onMounted(() => {
  getUpdateDomain()
})

/// form data
const formRef = ref<FormInstance>()
const formRules: FormRules<typeof formStore> = {
  new_cert_id: [{ required: true, message: t('ssl-certificate.management.update.124800-28'), trigger: 'change' }],
}

const source = ref(1)
const formStore = reactive<SubmitUpdateReq>({
  is_notify: 1,
  update_type: 1,
  old_cert_id: query.cert_id!,
  old_cid: Number(query.id),
  new_cert_id: '',
  new_cid: '',
  domains: [],
})
const submitStore = reactive({
  loading: false,
})
const onSubmit = async () => {
  await formRef.value?.validate()
  try {
    submitStore.loading = true
    const { code, msg } = await _updateCert({
      ...formStore,
      domains: oldDomainStore.data.filter(v => v.check).map(v => ({ domain: v.domain, domain_id: v.domain_id })),
    })
    if (code === 200) {
      message.success(t('ssl-certificate.management.update.124800-22'))
      _s_setItem(SSL_CERTIFICATE_DETAILS_TAB, '2')
      replaceRoute({
        name: 'ssl_certificate_details',
        params: {
          id: props.id,
        },
        query: query,
      })
    } else {
      message.error(msg || t('ssl-certificate.management.update.124800-23'))
    }
  } finally {
    submitStore.loading = false
  }
}
</script>

<style lang="scss" scoped>
.link {
  color: #0063ff;
  cursor: pointer;
}

.domain-container {
  .left,
  .right {
    flex: 1 1 0;
    width: 0;
  }
}

// .demo-form-inline {
//   :deep(.el-form-item) {
//     margin-bottom: 13px;
//   }
// }
</style>
