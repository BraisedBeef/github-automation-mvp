<template>
  <div class="title">
    {{ t('ssl-certificate.management.details.204484-0') }}
  </div>
  <CatKVList
    v-if="infoStore.infos || infoStore.loading"
    v-loading="infoStore.loading"
    class="infos"
    width="50%"
    :gutter="20"
  >
    <CatKVItem label="ID" class="info-item">
      {{ infoStore.infos?.cert_id }}
    </CatKVItem>
    <CatKVItem :label="t('ssl-certificate.management.details.204484-1')" class="info-item">
      <EllipsisTooltip :text="infoStore.infos?.fingerprint || '-'" max-width="300px" />
    </CatKVItem>
    <CatKVItem :label="t('ssl-certificate.management.details.204484-2')" class="info-item">
      <p
        :style="{
          color: filterArray(STATUS_TYPE_MAP, 'value', infoStore.infos?.status)?.color || '#222222',
        }"
      >
        {{ filterArray(STATUS_TYPE_MAP, 'value', infoStore.infos?.status)?.label || '-' }}
      </p>
    </CatKVItem>
    <CatKVItem :label="t('ssl-certificate.management.details.204484-3')" class="info-item">
      <template #label>
        <template v-if="infoStore.infos?.source == 2">
          {{ t('ssl-certificate.management.details.204484-3-0') }}
        </template>
        <template v-else>
          {{ t('ssl-certificate.management.details.204484-3') }}
        </template>
      </template>
      {{
        infoStore.infos?.create_time
          ? getDateDayjs(
              infoStore.infos.create_time > 0 ? infoStore.infos.create_time * 1000 : infoStore.infos.create_time,
              'string',
              true,
            )
          : '-'
      }}
    </CatKVItem>
    <CatKVItem :label="t('ssl-certificate.management.details.204484-4')" class="info-item">
      <EllipsisTooltip :text="infoStore.infos?.domain || '-'" max-width="300px" />
    </CatKVItem>
    <CatKVItem :label="t('ssl-certificate.management.details.204484-5')" class="info-item">
      <p v-if="!filterArray(STATUS_TYPE_MAP, 'value', infoStore.infos?.status)?.issueStatus" class="mr5">
        {{ t('ssl-certificate.management.details.204484-6') }}
      </p>
      <p v-else>
        {{
          infoStore.infos?.start_at
            ? getDateDayjs(
                infoStore.infos.start_at > 0 ? infoStore.infos.start_at * 1000 : infoStore.infos.start_at,
                'string',
                true,
              )
            : '-'
        }}
      </p>
    </CatKVItem>
    <CatKVItem :label="t('ssl-certificate.management.details.204484-24')" class="info-item">
      <MoreInfoDialog
        :title="t('ssl-certificate.management.details.204484-25')"
        :text="infoStore.infos?.sub_domains?.length || 0"
        :disabled="!!infoStore.infos?.sub_domains?.length"
      >
        <p v-for="sub_domain in infoStore.infos?.sub_domains" :key="sub_domain">
          {{ sub_domain }}
        </p>
      </MoreInfoDialog>
    </CatKVItem>
    <CatKVItem :label="t('ssl-certificate.management.details.204484-7')" class="info-item">
      {{ filterArray(CERTIFICATE_TYPES_MAP, 'id', infoStore.infos?.cert_type)?.fullName }}
      {{ filterArray(CERT_DOMAIN_TYPES_MAP, 'id', infoStore.cert_domain_type)?.name }}
    </CatKVItem>
    <CatKVItem :label="t('ssl-certificate.management.details.204484-9')" class="info-item">
      <div class="df ac">
        <p v-if="!filterArray(STATUS_TYPE_MAP, 'value', infoStore.infos?.status)?.issueStatus" class="mr5">
          {{ t('ssl-certificate.management.details.204484-6') }}
        </p>
        <template v-else>
          <p class="mr5">
            {{
              infoStore.infos?.expire_at
                ? getDateDayjs(
                    infoStore.infos.expire_at > 0 ? infoStore.infos.expire_at * 1000 : infoStore.infos.expire_at,
                    'string',
                    true,
                  )
                : '-'
            }}
          </p>
          <!-- <el-link type="primary" @click="handleRenew">续期</el-link> -->
        </template>
      </div>
    </CatKVItem>
    <CatKVItem :label="t('ssl-certificate.management.details.204484-10')" class="info-item">
      {{ infoStore.infos?.signature_algorithm || '-' }}
    </CatKVItem>
    <CatKVItem :label="t('ssl-certificate.management.details.204484-11')" class="info-item">
      {{ infoStore.infos?.cert_validity }} {{ t('ssl-certificate.management.details.204484-12') }}
    </CatKVItem>
    <CatKVItem :label="t('ssl-certificate.management.details.204484-13')" class="info-item">
      {{ filterArray(ENCRYPTION_MAP, 'value', infoStore.infos?.encryption)?.label || '-' }}
    </CatKVItem>
    <CatKVItem :label="t('ssl-certificate.management.details.204484-14')" class="info-item">
      {{ filterArray(CERTIFICATE_SOURCE_MAP, 'value', infoStore.infos?.source)?.label || '-' }}
    </CatKVItem>
    <CatKVItem :label="t('ssl-certificate.management.details.204484-15')" class="info-item">
      {{ filterArray(KEY_LENGTH_MAP, 'value', infoStore.infos?.key_length)?.label || '-' }}
    </CatKVItem>
    <CatKVItem :label="t('ssl-certificate.management.details.204484-16')" class="info-item">
      <div class="df">
        <p class="mr5 line-break">
          {{ infoStore.infos?.remark || 'undefined' }}
        </p>
        <SvgIcon name="edit" style="margin-top: 5px; cursor: pointer" @click="handleEditRemark(infoStore.infos)" />
      </div>
    </CatKVItem>
  </CatKVList>
  <el-empty v-else :image-size="200" />
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { ElLink, ElMessageBox } from 'element-plus'
import SvgIcon from '@/components/common/svg-icon/index.vue'
import { CatKVList, CatKVItem } from '@/components/common/cat-kv-list'
import EllipsisTooltip from '@/components/common/ellipsis-tooltip/index.vue'
import MoreInfoDialog from '@/views/ssl-certificate/management/components/more-info-dialog.vue'
import { message } from '@/utils/message'
import { _getCertDetail, _updateCertRemark } from '@/apis/ssl-certificate/management'
import { CertDetailResp } from '@/apis/ssl-certificate/management/type'
import { getDateDayjs } from '@/utils/format-time'
import { filterArray } from '@/utils/filter'
import { SSL_CERTIFICATE_CERT_DOMAIN_TYPE, STATUS_TYPE_MAP } from '../../config'
import {
  CERTIFICATE_TYPES_MAP,
  ENCRYPTION_MAP,
  CERTIFICATE_SOURCE_MAP,
  KEY_LENGTH_MAP,
  CERT_DOMAIN_TYPES_MAP,
  CertDomainTypes,
} from '@/views/ssl-certificate/config'
import { _s_getItem } from '@/utils/storage'
import { replaceRoute } from '@/utils/router-jump'

const router = useRouter()

// 证书id
const props = defineProps({
  id: String,
})
const infoStore = reactive<{
  infos?: CertDetailResp
  cert_domain_type: number
  loading: boolean
}>({
  cert_domain_type: CertDomainTypes.SINGLE,
  loading: false,
})
onMounted(() => {
  infoStore.cert_domain_type = _s_getItem(SSL_CERTIFICATE_CERT_DOMAIN_TYPE)
})

const getCertificateInfo = async () => {
  try {
    infoStore.loading = true
    const { code, msg, data } = await _getCertDetail({ cert_id: props.id })
    if (code === 200 && data) {
      infoStore.infos = data
    } else {
      message.error(msg || t('ssl-certificate.management.details.204484-17'))
    }
  } finally {
    infoStore.loading = false
  }
}

const handleRenew = () => {
  // 续期
  replaceRoute({
    name: 'ssl_certificate_purchase',
  })
}
const handleEditRemark = async (info?: CertDetailResp) => {
  // 修改备注
  if (!info) return

  // 修改备注
  ElMessageBox.prompt(
    t('ssl-certificate.management.details.204484-18'),
    t('ssl-certificate.management.details.204484-19'),
    {
      confirmButtonText: t('ssl-certificate.management.details.204484-20'),
      inputPattern: /^.+$/,
      inputErrorMessage: t('ssl-certificate.management.details.204484-21'),
      // inputValue: info?.remark,
    },
  ).then(async ({ value }) => {
    const { code, msg } = await _updateCertRemark({
      cert_id: info?.cert_id,
      remark: value,
    })
    if (code === 200) {
      message.success(t('ssl-certificate.management.details.204484-22'))
      info.remark = value
    } else {
      message.error(msg || t('ssl-certificate.management.details.204484-23'))
    }
  })
}

onMounted(() => {
  getCertificateInfo()
})
</script>

<style lang="scss" scoped>
.title {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: bold;
  line-height: 20px;
  color: #000;
}

.details {
  color: #0063ff;
}
</style>
