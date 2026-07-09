<template>
  <div class="ssl-details-base-v2">
    <div class="ssl-details-base-v2__title">
      {{ t('ssl-certificate.management.details.204484-0') }}
    </div>

    <div v-if="infoStore.infos || infoStore.loading" v-loading="infoStore.loading" class="ssl-details-base-v2__grid">
      <div class="ssl-details-base-v2__column">
        <div class="ssl-details-base-v2__row">
          <div class="ssl-details-base-v2__label">ID</div>
          <div class="ssl-details-base-v2__value">
            {{ infoStore.infos?.cert_id || '-' }}
          </div>
        </div>

        <div class="ssl-details-base-v2__row">
          <div class="ssl-details-base-v2__label">
            {{ t('ssl-certificate.management.details.204484-2') }}
          </div>
          <div class="ssl-details-base-v2__value" :class="`is-${getStatusTone(infoStore.infos?.status)}`">
            {{ filterArray(STATUS_TYPE_MAP, 'value', infoStore.infos?.status)?.label || '-' }}
          </div>
        </div>

        <div class="ssl-details-base-v2__row">
          <div class="ssl-details-base-v2__label">
            {{ t('ssl-certificate.management.details.204484-4') }}
          </div>
          <div class="ssl-details-base-v2__value">
            <EllipsisTooltip :text="infoStore.infos?.domain || '-'" max-width="300px" />
          </div>
        </div>

        <div class="ssl-details-base-v2__row">
          <div class="ssl-details-base-v2__label">
            {{ t('ssl-certificate.management.details.204484-7') }}
          </div>
          <div class="ssl-details-base-v2__value">
            {{ filterArray(CERTIFICATE_TYPES_MAP, 'id', infoStore.infos?.cert_type)?.fullName || '-' }}
            {{ filterArray(CERT_DOMAIN_TYPES_MAP, 'id', infoStore.cert_domain_type)?.name || '' }}
          </div>
        </div>

        <div class="ssl-details-base-v2__row">
          <div class="ssl-details-base-v2__label">
            {{ t('ssl-certificate.management.details.204484-10') }}
          </div>
          <div class="ssl-details-base-v2__value">
            {{ infoStore.infos?.signature_algorithm || '-' }}
          </div>
        </div>

        <div class="ssl-details-base-v2__row">
          <div class="ssl-details-base-v2__label">
            {{ t('ssl-certificate.management.details.204484-13') }}
          </div>
          <div class="ssl-details-base-v2__value">
            {{ filterArray(ENCRYPTION_MAP, 'value', infoStore.infos?.encryption)?.label || '-' }}
          </div>
        </div>

        <div class="ssl-details-base-v2__row">
          <div class="ssl-details-base-v2__label">
            {{ t('ssl-certificate.management.details.204484-15') }}
          </div>
          <div class="ssl-details-base-v2__value">
            {{ filterArray(KEY_LENGTH_MAP, 'value', infoStore.infos?.key_length)?.label || '-' }}
          </div>
        </div>
      </div>

      <div class="ssl-details-base-v2__column">
        <div class="ssl-details-base-v2__row">
          <div class="ssl-details-base-v2__label">
            {{ t('ssl-certificate.management.details.204484-1') }}
          </div>
          <div class="ssl-details-base-v2__value ssl-details-base-v2__value--wrap">
            <EllipsisTooltip :text="infoStore.infos?.fingerprint || '-'" max-width="420px" />
          </div>
        </div>

        <div class="ssl-details-base-v2__row">
          <div class="ssl-details-base-v2__label">
            {{
              infoStore.infos?.source == 2
                ? t('ssl-certificate.management.details.204484-3-0')
                : t('ssl-certificate.management.details.204484-3')
            }}
          </div>
          <div class="ssl-details-base-v2__value">
            {{ formatTime(infoStore.infos?.create_time) }}
          </div>
        </div>

        <div class="ssl-details-base-v2__row">
          <div class="ssl-details-base-v2__label">
            {{ t('ssl-certificate.management.details.204484-5') }}
          </div>
          <div class="ssl-details-base-v2__value">
            <template v-if="!filterArray(STATUS_TYPE_MAP, 'value', infoStore.infos?.status)?.issueStatus">
              {{ t('ssl-certificate.management.details.204484-6') }}
            </template>
            <template v-else>
              {{ formatTime(infoStore.infos?.start_at) }}
            </template>
          </div>
        </div>

        <div class="ssl-details-base-v2__row">
          <div class="ssl-details-base-v2__label">
            {{ t('ssl-certificate.management.details.204484-9') }}
          </div>
          <div class="ssl-details-base-v2__value">
            <template v-if="!filterArray(STATUS_TYPE_MAP, 'value', infoStore.infos?.status)?.issueStatus">
              {{ t('ssl-certificate.management.details.204484-6') }}
            </template>
            <template v-else>
              <span>{{ formatTime(infoStore.infos?.expire_at) }}</span>
              <button class="ssl-details-base-v2__link" type="button" @click="handleRenew">续期</button>
            </template>
          </div>
        </div>

        <div class="ssl-details-base-v2__row">
          <div class="ssl-details-base-v2__label">
            {{ t('ssl-certificate.management.details.204484-11') }}
          </div>
          <div class="ssl-details-base-v2__value">
            {{ infoStore.infos?.cert_validity || '-' }} {{ t('ssl-certificate.management.details.204484-12') }}
          </div>
        </div>

        <div class="ssl-details-base-v2__row">
          <div class="ssl-details-base-v2__label">
            {{ t('ssl-certificate.management.details.204484-14') }}
          </div>
          <div class="ssl-details-base-v2__value">
            {{ filterArray(CERTIFICATE_SOURCE_MAP, 'value', infoStore.infos?.source)?.label || '-' }}
          </div>
        </div>

        <div class="ssl-details-base-v2__row">
          <div class="ssl-details-base-v2__label">
            {{ t('ssl-certificate.management.details.204484-16') }}
          </div>
          <div class="ssl-details-base-v2__value">
            <span class="ssl-details-base-v2__remark">{{ infoStore.infos?.remark || 'undefined' }}</span>
            <SvgIcon name="cat-cdn-edit" class="ssl-details-base-v2__edit" @click="handleEditRemark(infoStore.infos)" />
          </div>
        </div>
      </div>
    </div>

    <el-empty v-else :image-size="200" />
  </div>
</template>

<script setup lang="ts">
import { _getCertDetail, _updateCertRemark } from '@/apis/ssl-certificate/management'
import type { CertDetailResp } from '@/apis/ssl-certificate/management/type'
import EllipsisTooltip from '@/components/common/ellipsis-tooltip/index.vue'
import SvgIcon from '@/components/common/svg-icon/index.vue'
import {
  CERT_DOMAIN_TYPES_MAP,
  CERTIFICATE_SOURCE_MAP,
  CERTIFICATE_TYPES_MAP,
  ENCRYPTION_MAP,
  KEY_LENGTH_MAP,
} from '@/views/ssl-certificate/config'
import { SSL_CERTIFICATE_CERT_DOMAIN_TYPE, STATUS_TYPE_MAP } from '@/views/ssl-certificate/management/config'
import { filterArray } from '@/utils/filter'
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { replaceRoute } from '@/utils/router-jump'
import { _s_getItem } from '@/utils/storage'
import { ElMessageBox } from 'element-plus'

const props = defineProps<{
  id: string
}>()

const infoStore = reactive<{
  infos?: CertDetailResp
  cert_domain_type: number
  loading: boolean
}>({
  cert_domain_type: 1,
  loading: false,
})

const getStatusTone = (status?: number) => {
  if (status === 5) return 'success'
  if (status === 6 || status === 8 || status === 9) return 'danger'
  if (status === 7 || status === 2 || status === 3) return 'warning'
  return 'default'
}

const formatTime = (time?: number) => {
  if (!time) return '-'
  return getDateDayjs(time > 0 ? time * 1000 : time, 'string', true)
}

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
  replaceRoute({
    name: 'ssl_certificate_purchase',
  })
}

const handleEditRemark = async (info?: CertDetailResp) => {
  if (!info) return

  ElMessageBox.prompt(
    t('ssl-certificate.management.details.204484-18'),
    t('ssl-certificate.management.details.204484-19'),
    {
      confirmButtonText: t('ssl-certificate.management.details.204484-20'),
      inputPattern: /^.+$/,
      inputErrorMessage: t('ssl-certificate.management.details.204484-21'),
    },
  ).then(async ({ value }) => {
    const { code, msg } = await _updateCertRemark({
      cert_id: info.cert_id,
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
  infoStore.cert_domain_type = _s_getItem(SSL_CERTIFICATE_CERT_DOMAIN_TYPE) || 1
  getCertificateInfo()
})
</script>

<style scoped lang="scss">
.ssl-details-base-v2__title {
  margin-bottom: 24px;
  font-size: 20px;
  font-weight: 500;
  line-height: 30px;
  color: #191c23;
}

.ssl-details-base-v2__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 96px;
}

.ssl-details-base-v2__column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ssl-details-base-v2__row {
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  gap: 32px;
  align-items: start;

  // min-height: 40px;
}

.ssl-details-base-v2__label {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.ssl-details-base-v2__value {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;

  &.is-success {
    color: #01a66f;
  }

  &.is-danger {
    color: #e54839;
  }

  &.is-warning {
    color: #ff7d00;
  }
}

.ssl-details-base-v2__value--wrap {
  align-items: flex-start;
}

.ssl-details-base-v2__link {
  padding: 0;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.ssl-details-base-v2__remark {
  word-break: break-word;
}

.ssl-details-base-v2__edit {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  margin-top: 3px;
  color: #828b9c;
  cursor: pointer;
}
</style>
