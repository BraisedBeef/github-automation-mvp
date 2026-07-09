<template>
  <div v-loading="verifyDomainStore.loading" class="tpl-container">
    <SvgIcon :name="messages.icon" class="mb10" style="font-size: 40px; color: #000" />
    <p class="title mb10">
      {{ messages?.title }}
    </p>
    <p class="desc mb10">
      {{ messages?.desc }}
    </p>
    <p v-if="messages?.tips" class="df tips-group mb10">
      <SvgIcon name="cat-cdn-tip" class="icon" />
      {{ messages?.tips }}
    </p>
    <div class="but-group mt10">
      <template v-if="['1', '2'].includes(verifyDomainStore.status)">
        <!-- lets厂商不支持切换验证方式 -->
        <el-button
          v-if="factory_id != CertificateBrandsIds.letsencrypt"
          type="primary"
          :disabled="['0'].includes(verifyDomainStore.status)"
          style="min-width: 130px; margin-right: 10px"
          @click="verifyStore.dialogVisible = true"
        >
          {{ t('ssl-certificate.management.apply.verify.635303-0') }}
        </el-button>
        <el-button type="default" style="min-width: 90px" @click="back">
          {{ t('ssl-certificate.management.apply.verify.635303-1') }}
        </el-button>
      </template>
      <template v-else>
        <el-button type="default" style="min-width: 90px" @click="back">
          {{ t('ssl-certificate.management.apply.verify.635303-2') }}
        </el-button>
      </template>
    </div>
  </div>
  <el-dialog v-model="verifyStore.dialogVisible" title="" width="550" class="verify-type-dialog" center>
    <template #header>
      <p class="title">
        {{ t('ssl-certificate.management.apply.verify.635303-3') }}
      </p>
    </template>
    <el-select v-model="verifyStore.verifyType" placeholder="" style="width: 100%">
      <el-option
        v-for="item in certificateVerifyRadios"
        :key="item.key"
        :disabled="item.disabled?.(verifyStore.cert_domain_type)"
        :label="item.label"
        :value="item.key"
      />
    </el-select>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" :loading="verifyStore.loading" @click="changVerifyType">
          {{ t('ssl-certificate.management.apply.verify.635303-4') }}
        </el-button>
        <el-button @click="verifyStore.dialogVisible = false">
          {{ t('ssl-certificate.management.apply.verify.635303-5') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { _autoVerifyDomain, _changeVerifyTypes } from '@/apis/ssl-certificate/management'
import { message } from '@/utils/message'
import { _s_getItem } from '@/utils/storage'
import {
  certificateVerifyRadios,
  SSL_CERTIFICATE_CERT_DOMAIN_TYPE,
  SSL_CERTIFICATE_FACTORY_ID,
} from '@/views/ssl-certificate/management/config'
import { filterArray } from '@/utils/filter'
import { CertificateBrandsIds } from '@/views/ssl-certificate/config'
import { replaceRoute } from '@/utils/router-jump'
const router = useRouter()
const route = useRoute()
const { cert_id } = route.query as { cert_id?: string; factory_id?: number }
const factory_id = _s_getItem(SSL_CERTIFICATE_FACTORY_ID)

const emits = defineEmits(['switchVerifyType'])

const props = defineProps<{
  verifyType: number
}>()

// 验证域名状态
const verifyDomainStore = reactive({
  status: '0',
  loading: false,
})
const messages = computed<{
  icon: string
  title: string
  desc: string
  tips?: string
}>(() => {
  const m = {
    tips: {
      icon: 'time-circle2',
      title: t('ssl-certificate.management.apply.verify.635303-6'),
      desc: t('ssl-certificate.management.apply.verify.635303-7'),
      tips: t('ssl-certificate.management.apply.verify.635303-8'),
    },
    failed: {
      icon: 'pay-fail',
      title: t('ssl-certificate.management.apply.verify.635303-9'),
      desc: t('ssl-certificate.management.apply.verify.635303-10'),
    },
  }
  switch (verifyDomainStore.status) {
    case '0':
      return m['tips']
    case '1':
    case '2':
      return m['failed']
    default:
      return m['tips']
  }
})
const verifyDomain = async () => {
  // 获取验证信息
  if (!cert_id) {
    message.error(t('ssl-certificate.management.apply.verify.635303-11'))
    return
  }

  try {
    verifyDomainStore.loading = true
    const { code, msg, data } = await _autoVerifyDomain({
      cert_id: cert_id,
    })
    if (code === 200 && data) {
      // 验证域名
      message.success(t('ssl-certificate.management.apply.verify.635303-12'))
    } else {
      verifyDomainStore.status = '2'
      message.error(msg || t('ssl-certificate.management.apply.verify.635303-13'))
    }
  } catch (e) {
    verifyDomainStore.status = '2'
  } finally {
    verifyDomainStore.loading = false
  }
}
onMounted(() => {
  verifyDomain()
})

// 切换验证方式
const verifyStore = reactive({
  dialogVisible: false,
  verifyType: 1,
  cert_domain_type: 1,
  loading: false,
})
onMounted(() => {
  verifyStore.cert_domain_type = _s_getItem(SSL_CERTIFICATE_CERT_DOMAIN_TYPE)
})

const changVerifyType = async () => {
  if (props.verifyType === verifyStore.verifyType) {
    verifyStore.dialogVisible = false
    return
  }
  if (!cert_id) {
    message.error(t('ssl-certificate.management.apply.verify.635303-11'))
    return
  }
  // 切换验证方式
  try {
    verifyStore.loading = true
    const { code, msg } = await _changeVerifyTypes({
      cert_id: cert_id,
      verify_types: filterArray(certificateVerifyRadios, 'key', verifyStore.verifyType)!.value,
    })
    if (code === 200) {
      // 验证域名
      emits('switchVerifyType', verifyStore.verifyType)
      verifyStore.dialogVisible = false
    } else {
      message.error(msg || t('ssl-certificate.management.apply.verify.635303-14'))
    }
  } finally {
    verifyStore.loading = false
  }
}
const back = () => {
  replaceRoute({
    name: 'ssl_certificate_management',
  })
}
</script>

<style lang="scss" scoped>
.tpl-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 400px;
  text-align: center;

  .title {
    font-size: 16px;
    font-weight: bold;
    line-height: 22px;
    color: #000;
  }

  .desc {
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: #999;
  }

  .tips-group {
    padding: 7px 13px;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: #0063ff;
    background: #e3edff;

    .icon {
      margin-top: 3px;
      margin-right: 5px;
    }

    &.error {
      color: #fe4d4f;
      background: #ffebeb;
    }
  }
}
</style>
