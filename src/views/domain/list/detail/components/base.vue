<template>
  <div class="domain-list-detail">
    <div class="base pd20 bgcf">
      <div class="d-title">
        {{ t('domain.list.detail.050086-0') }}
      </div>
      <div class="base-info mt20 df">
        <el-form :model="form" label-position="left" label-width="auto" class="mr20">
          <el-form-item :label="t('domain.list.detail.050086-1')">
            <CatTooltip :content="form.domain">
              {{ form.domain }}
            </CatTooltip>
          </el-form-item>
          <el-form-item :label="t('domain.list.detail.050086-2')">
            {{ statusList[form.status].label }}
          </el-form-item>
          <el-form-item :label="t('domain.list.detail.050086-3')">
            {{ getDateDayjs(form.register_time, 'string', true) }}
          </el-form-item>
          <el-form-item :label="t('domain.list.detail.050086-4')">
            {{ getDateDayjs(form.expired_time, 'string', true) }}
          </el-form-item>
          <el-form-item :label="t('domain.list.detail.050086-5')">
            {{ form.registrar }}
          </el-form-item>
        </el-form>
        <el-form :model="form" label-position="left" label-width="auto">
          <el-form-item :label="t('domain.list.detail.050086-6')">
            <CatTooltip :content="form.remark">
              {{ form.remark || '--' }}
            </CatTooltip>
          </el-form-item>
          <el-form-item :label="t('domain.list.detail.050086-7')">
            <CatTooltip :content="form.register">
              {{ form.register || '--' }}
            </CatTooltip>
          </el-form-item>
          <el-form-item :label="t('domain.list.detail.050086-8')">
            {{ form.phone }}
          </el-form-item>
          <!-- <el-form-item :label="t('domain.list.detail.050086-9')">{{ form.email }}</el-form-item> -->
          <el-form-item :label="t('domain.list.detail.050086-10')">
            <CatTooltip :content="form.address">
              {{ form.address || '--' }}
            </CatTooltip>
          </el-form-item>
          <el-form-item :label="t('domain.list.detail.050086-11')">
            <el-link type="primary" @click="toDetail">
              {{ t('domain.list.detail.050086-12') }}
            </el-link>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="renew pd20 bgcf mt20">
      <div class="d-title">
        {{ t('domain.list.detail.050086-13') }}
      </div>
      <el-form :model="form" label-width="auto" label-position="left" class="mt20">
        <el-form-item :label="t('domain.list.detail.050086-3')">
          {{ getDateDayjs(form.register_time, 'string', true) }}
        </el-form-item>
        <el-form-item :label="t('domain.list.detail.050086-4')">
          <div class="df ac">
            <div>{{ getDateDayjs(form.expired_time, 'string', true) }}</div>
            <div v-show="exprired > 0" class="df ac ml20" style="color: var(--error-color)">
              <SvgIcon name="cat-cdn-warning" class="mr4 icon" />{{ t('domain.list.detail.050086-14') }}{{ exprired
              }}{{ t('domain.list.detail.050086-15') }}
            </div>
          </div>
        </el-form-item>
        <el-form-item :label="t('domain.list.detail.050086-16')">
          <div v-show="exprired < 0">{{ Math.abs(exprired) }}{{ t('domain.list.detail.050086-15') }}</div>
        </el-form-item>
      </el-form>
      <div class="mt20 df">
        <div class="type df fdc pd20 mr20">
          <div class="d-title2">
            {{ t('domain.list.detail.050086-17') }}
          </div>
          <el-switch
            v-model="form.auto_renew"
            :before-change="() => switchHandle('renew')"
            :loading="loadingType.renew"
            :active-value="1"
            :inactive-value="2"
            class="mt20"
          />
          <div class="mt20">
            <el-text type="info">
              {{ t('domain.list.detail.050086-18') }}
            </el-text>
          </div>
        </div>
        <div class="type df fdc pd20">
          <div class="d-title2">
            {{ t('domain.list.detail.050086-19') }}
          </div>
          <el-switch
            v-model="form.renew_notice"
            :before-change="() => switchHandle('notice')"
            :loading="loadingType.notice"
            :active-value="1"
            :inactive-value="2"
            class="mt20"
          />
          <div class="mt20">
            <el-text type="info">
              {{ t('domain.list.detail.050086-15', { day: 30 }) }}
            </el-text>
          </div>
        </div>
      </div>
      <el-button type="primary" class="mt20" @click="renewHandle">
        {{ t('domain.list.detail.050086-21') }}
      </el-button>
    </div>

    <div class="safe bgcf pd20 mt20">
      <div class="d-title">
        {{ t('domain.list.detail.050086-22') }}
      </div>
      <div class="mt20 df">
        <div class="type df fdc pd20 mr20">
          <div class="d-title2">
            {{ t('domain.list.detail.050086-23') }}
          </div>
          <el-switch
            v-model="form.lock"
            :before-change="() => switchHandle('lock')"
            :loading="loadingType.lock"
            :active-value="1"
            :inactive-value="2"
            class="mt20"
          />
          <div class="mt20">
            <el-text type="info">
              {{ t('domain.list.detail.050086-24') }}
            </el-text>
          </div>
        </div>
        <div class="type df fdc pd20">
          <div class="df ac">
            <div class="d-title2 mr4">
              {{ t('domain.list.detail.050086-25') }}
            </div>
            <el-tooltip placement="top" effect="light" popper-class="max-400">
              <template #content>
                {{ t('domain.list.detail.050086-27') }}
              </template>
              <SvgIcon name="cat-cdn-warning" />
            </el-tooltip>
          </div>
          <el-switch
            v-model="form.privacy"
            :before-change="() => switchPrivacy(form.privacy)"
            :loading="loadingType.privacy"
            :active-value="1"
            :inactive-value="2"
            class="mt20"
          />
          <div class="mt20">
            <el-text type="info">
              {{ t('domain.list.detail.050086-28') }}
            </el-text>
          </div>
        </div>
      </div>
    </div>

    <div class="dns bgcf pd20 mt20">
      <div class="d-title">
        {{ t('domain.list.detail.050086-29') }}
      </div>
      <div class="form-info mt20 df">
        <el-form :model="form" label-position="left" label-width="auto" class="mr20">
          <el-form-item :label="t('domain.list.detail.050086-30')">
            <el-form-item v-if="dns.status === 1">
              <el-form ref="dnsListRef" :model="dnsList" label-position="left" label-width="auto">
                <el-form-item
                  v-for="(dns1, dnsi1) in dnsList"
                  :key="'dns1' + dnsi1"
                  prop="value"
                  :label="'DNS' + (dnsi1 + 1)"
                  :rules="{
                    validator: () => checkOrdinaryDomain(dns1.value),
                    trigger: 'change',
                    message: dns1.value ? t('domain.list.detail.050086-31') : '',
                  }"
                  class="mb10"
                >
                  <el-input v-model="dns1.value" style="width: 400px" />
                  <el-link v-if="dnsi1 > 1" type="primary" class="ml10" @click="dnsList.splice(dnsi1, 1)">
                    {{ t('domain.list.detail.050086-32') }}
                  </el-link>
                </el-form-item>
                <el-form-item>
                  <el-button @click="addDNS">
                    {{ t('domain.list.detail.050086-33') }}
                  </el-button>
                  <el-button :loading="dnsLoading" type="primary" @click="saveHandle">
                    {{ t('domain.list.detail.050086-34') }}
                  </el-button>
                </el-form-item>
              </el-form>
            </el-form-item>
            <el-form-item v-else-if="dnsInfo.isDefaultMaoYunDns">
              <div class="df ac">
                <div class="mr20">
                  {{ t('domain.list.detail.050086-35') }}
                </div>
                <el-link type="primary" @click="dns.status = 1">
                  {{ t('domain.list.detail.050086-36') }}
                </el-link>
              </div>
            </el-form-item>
            <div v-else class="dns-list">
              <p v-if="form.dns1">
                {{ form.dns1 }}
              </p>
              <p v-if="form.dns2">
                {{ form.dns2 }}
              </p>
              <p v-if="form.dns3">
                {{ form.dns3 }}
              </p>
              <p v-if="form.dns4">
                {{ form.dns4 }}
              </p>
              <p v-if="form.dns5">
                {{ form.dns5 }}
              </p>
              <p v-if="form.dns6">
                {{ form.dns6 }}
              </p>
              <p v-if="form.dns7">
                {{ form.dns7 }}
              </p>
              <p v-if="form.dns8">
                {{ form.dns8 }}
              </p>
              <p v-if="form.dns9">
                {{ form.dns9 }}
              </p>
              <p v-if="form.dns10">
                {{ form.dns10 }}
              </p>
              <p v-if="form.dns11">
                {{ form.dns11 }}
              </p>
              <p v-if="form.dns12">
                {{ form.dns12 }}
              </p>
              <p v-if="form.dns13">
                {{ form.dns13 }}
              </p>
              <el-link type="primary" @click="dns.status = 1">
                {{ t('domain.list.detail.050086-36') }}
              </el-link>
            </div>
          </el-form-item>
          <el-form-item :label="t('domain.list.detail.050086-37')">
            <el-link v-if="dnsInfo.isDefaultMaoYunDns" type="primary" @click="toPage('record-mana')">
              {{ t('domain.list.detail.050086-38') }}
            </el-link>
            <div v-else class="df ac">
              <div class="mr20">
                {{ t('domain.list.detail.050086-39') }}
              </div>
              <el-link type="primary" @click="toPage('parse')">
                {{ t('domain.list.detail.050086-40') }}
              </el-link>
            </div>
          </el-form-item>
          <el-form-item :label="t('domain.list.detail.050086-41')">
            <el-link v-if="dnsInfo.isDefaultMaoYunDns" type="primary" @click="toPage('data-statistics')">
              {{ t('domain.list.detail.050086-38') }}
            </el-link>
            <div v-else class="df ac">
              <div class="mr20">
                {{ t('domain.list.detail.050086-39') }}
              </div>
              <el-link type="primary" @click="toPage('parse')">
                {{ t('domain.list.detail.050086-40') }}
              </el-link>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <LockVerifyDialog
      v-model:dialog="dialogLockVerify.show"
      :domain-list="dialogLockVerify.selectedData"
      :lock-state="dialogLockVerify.lock"
      :title="dialogLockVerify.title"
      @success="lockVerifySuccess"
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
    <CatDialog
      v-model:dialog="privateDialog"
      :title="t('domain.list.detail.493846-20')"
      :loading="loadingType.privacy"
      @confirm="switchHandle('privacy')"
    >
      <span> {{ t('domain.list.detail.050086-44') }} </span>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import { getDateDayjs } from '@/utils/format-time'
import { statusList } from '@/views/domain/config'
import { _getDomainDetail, _updateExpireNotice, _updatePrivacy, _updateDns } from '@/apis/domain'
import { checkOrdinaryDomain } from '@/views/cdn/domain/index-domain'
import { ElMessage } from 'element-plus'
import LockVerifyDialog from '@/views/domain/components/lock-verify-dialog.vue'
import RenewDialog from '@/views/domain/components/renew-dialog.vue'
import AutoRenewDialog from '@/views/domain/components/auto-renew-dialog.vue'
import t from '@/utils/i18n'
import { _getItem } from '@/utils/storage'
import { DOMAIN_DICT } from '@/config/constant-config'
import { owUrl } from '@/config/base-config'
import { pushRoute } from '@/utils/router-jump'

const route: any = useRoute()
const router = useRouter()

interface Form {
  id: number
  address: string
  auto_renew: number
  auto_renew_notice: boolean
  domain: string
  email: string
  expired_time: string
  lock: number
  nsid: number
  phone: string
  privacy: number
  register: string
  register_contact_id: number
  register_time: string
  status: number
  [x: string]: any
}
const form = ref<Form>({
  id: 0,
  address: '',
  auto_renew: 0,
  auto_renew_notice: false,
  domain: '',
  email: '',
  expired_time: '',
  lock: 0,
  nsid: 0,
  phone: '',
  privacy: 0,
  register: '',
  register_contact_id: 0,
  register_time: '',
  status: 0,
})
const exprired = computed(() =>
  Math.floor((new Date().getTime() - new Date(form.value.expired_time).getTime()) / 1000 / 60 / 60 / 24),
)
const getData = () => {
  _getDomainDetail({ id: route.query.id }).then(res => {
    form.value = res.data
    sessionStorage.domain_detail_info = JSON.stringify(res.data || {})
  })
}
getData()

const dialogLockVerify = reactive<{ title?: string; selectedData: string[]; show: boolean; lock: 1 | 2 }>({
  title: t('domain.components.498323-21'),
  selectedData: [],
  show: false,
  lock: 1,
})
const lockVerifySuccess = status => {
  form.value.lock = status
}
const dialogLockVerifyCancel = () => {
  loadingType['lock'] = false
}

type LoadingType = 'renew' | 'notice' | 'lock' | 'privacy'
const loadingType = reactive({
  renew: false,
  notice: false,
  lock: false,
  privacy: false,
})
const switchPrivacy = (value: number) => {
  if (value === 1) {
    privateDialog.value = true
  } else {
    return switchHandle('privacy')
  }
}
const switchHandle = async (type: LoadingType) => {
  let fn: Function | null = null
  let params: Object | null = null
  switch (type) {
    case 'renew':
      dialogAutoRenew.selectedData = [form.value.domain]
      dialogAutoRenew.show = true
      dialogAutoRenew.auto_renew = form.value.auto_renew === 1 ? 2 : 1
      return
    case 'notice':
      fn = _updateExpireNotice
      params = { ids: [form.value.id], notice: form.value.renew_notice === 1 ? 2 : 1 }
      break
    case 'lock':
      dialogLockVerify.selectedData = [form.value.domain]
      dialogLockVerify.show = true
      dialogLockVerify.lock = form.value.lock === 1 ? 2 : 1
      dialogLockVerify.title = t('domain.components.498323-21')
      loadingType[type] = true
      return
    case 'privacy':
      fn = _updatePrivacy
      params = { ids: [form.value.id], open: form.value.privacy === 1 ? 2 : 1 }
      break
  }
  loadingType[type] = true
  return await fn(params)
    .then(({ code }) => {
      if (code == 20000) {
        if (form.value.privacy === 1 && type === 'privacy') form.value.privacy = 2
        return true
      } else {
        ElMessage.error(t('common.error_cd'))
        return false
      }
    })
    .catch(() => {
      return false
    })
    .finally(() => {
      let t = setTimeout(() => {
        loadingType[type] = false
        privateDialog.value = false
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
const renewHandle = () => {
  dialogRenew.selectedData = [form.value.domain]
  dialogRenew.show = true
  dialogRenew.auto_renew = form.value.auto_renew
}

// 隐私保护弹窗
const privateDialog = ref(false)

// DNS解析
const dns = reactive({
  status: 0,
  reslove: false,
  count: false,
})
const name_servers = ref<string[]>([])
const dnsInfo = computed(() => {
  return {
    isDefaultMaoYunDns: form.value.dns1 === name_servers.value[0] && form.value.dns2 === name_servers.value[1],
  }
})
// 跳转页面
const toPage = (type: 'record-mana' | 'data-statistics' | 'parse') => {
  switch (type) {
    case 'data-statistics':
      pushRoute(`/dns/domain-layout/data-statistics?name=${form.value.domain}&id=${form.value.dns_domain_id}&active=2`)
      break
    case 'record-mana':
      pushRoute(`/dns/domain-layout/record-mana?name=${form.value.domain}&id=${form.value.dns_domain_id}&active=0`)
      break
    case 'parse':
      pushRoute(`/dns/domain-layout/record-mana?name=${form.value.domain}&id=${form.value.dns_domain_id}&active=0`)
      break
  }
}
onMounted(() => {
  name_servers.value = _getItem(DOMAIN_DICT)?.name_servers || []
})

const dnsList = ref<{ value: string }[]>([{ value: '' }, { value: '' }])
const dnsListRef = ref<any>(null)
const addDNS = () => {
  if (dnsList.value.length === 13) {
    ElMessage.error(t('domain.list.detail.050086-42'))
    return
  }
  dnsList.value.push({ value: '' })
}
const dnsLoading = ref(false)
const saveHandle = async () => {
  if (!(await dnsListRef.value.validate(b => b))) return
  const params = {
    ids: [+route.query.id],
  }
  dnsList.value.forEach((v, i) => {
    params['ns' + (i + 1)] = v.value
  })
  dnsLoading.value = true
  _updateDns(params)
    .then(({ code }) => {
      if (code == 20000) {
        ElMessage.success(t('domain.list.detail.050086-43'))
        dnsList.value.forEach((v, i) => {
          form.value['dns' + (i + 1)] = v.value
        })
      } else {
        ElMessage.error(t('common.error_cd'))
      }
    })
    .finally(() => {
      dnsLoading.value = false
      dnsList.value = [{ value: '' }, { value: '' }]
      dns.status = 0
    })
}

const toDetail = () => {
  window.open(owUrl + `product/domain/whois?domain=${form.value.domain}`, '_blank')
}
</script>

<style lang="scss" scoped>
@import '@/views/domain/config';

.base-info {
  .el-form {
    flex: 1;
    width: 0;
  }
}

.type {
  flex: 1 1 0;
  background-color: #f9fafc;
  border-radius: 4px;

  .d-title2 {
    font-weight: 700;
    color: var(--primary-text);
  }
}

.dns-list {
  margin-top: 3px;

  p {
    line-height: 28px;
  }
}
</style>
