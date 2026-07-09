<template>
  <div class="domains-set-basic-info">
    <div class="basic-title">
      {{ t('domainSet2.basicInfo') }}
    </div>
    <div class="basic-content">
      <div v-for="item in computedInfo" :key="item.label" class="basic-item">
        <div class="basic-label">
          {{ item.label }}
        </div>
        <div class="basic-value">
          {{ item.value || '-' }}
        </div>
      </div>
      <!-- Dns服务器 -->
      <div class="basic-item">
        <div class="basic-label">
          {{ t('domainSet2.DnsServer') }}
        </div>
        <!-- 1是正常 其它都是异常 -->
        <div class="basic-value" :class="info?.dnsStatus === 1 ? 'text-success' : 'text-error'">
          {{ info?.dnsStatus === 1 ? t('domainSet2.normal') : info?.dnsStatusReason }}
        </div>
      </div>
      <!-- Dns服务器box -->
      <div class="basic-item server">
        <div class="basic-label" />
        <div class="basic-value">
          <div class="server-box">
            <div v-if="info?.dnsStatus !== 1" class="server-box-title">
              {{ t('domainSet2.DnsServerTip') }}
            </div>
            <div class="server-box-cont">
              <div class="current">
                <div class="box-cont-title">
                  {{ t('domainSet2.DnsServerTip2') }}
                </div>
                <div class="box-cont-server">
                  <div v-for="item in props.info?.domainDnsServer" :key="item">
                    {{ item }}
                  </div>
                </div>
              </div>
              <div class="ours">
                <div class="box-cont-title">
                  {{ t('domainSet2.DnsServerTip3') }}
                </div>
                <div class="box-cont-server">
                  <div v-for="item in props.info?.cloudDnsServer" :key="item">
                    {{ item }}
                    <SvgIcon name="dns-copy" pointer @click="handleCopy(item)" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 备注 -->
      <div class="basic-item remark">
        <div class="basic-label">
          {{ t('domainSet2.remark') }}
        </div>
        <div class="basic-value">
          <div>{{ info?.remark }}</div>
          <SvgIcon name="handle-edit" pointer @click="editRemark" />
        </div>
      </div>
    </div>
    <CatDialog
      v-model:dialog="remarkDialog"
      :title="t('domainSet2.remarkTitle')"
      :loading="remarkLoading"
      :disabled="!remark"
      @confirm="remarkConfirm"
    >
      <div class="remark-cont">
        <el-input
          v-model="remark"
          maxlength="200"
          :placeholder="t('domainSet2.remarkPlaceholder')"
          resize="none"
          type="textarea"
        />
      </div>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { BasicInfoData } from './config'
import { _changeDomainInfo } from '@/apis/dns/domain'
import { handleCopyValue } from '@/utils/dom-utils'
import { message } from '@/utils/message'

const props = withDefaults(
  defineProps<{
    info: BasicInfoData | undefined
    loading?: boolean
  }>(),
  {},
)

// console.log(props.info);

const emit = defineEmits<{
  (event: 'refresh'): void
}>()

const handleCopy = async (v: string) => {
  await handleCopyValue(v)
  message.success(t('domainSet2.copySuccess'))
}

let remark = ref()
let remarkLoading = ref(false)
let remarkDialog = ref(false)

const editRemark = () => {
  if (props.loading || remarkLoading.value) return
  remark.value = props.info?.remark
  remarkDialog.value = true
}

const remarkConfirm = async () => {
  if (props.info) {
    try {
      remarkLoading.value = true
      const { code } = await _changeDomainInfo({
        domainId: Number(props.info.id),
        ttl: props.info.ttl,
        status: props.info.status,
        remark: remark.value,
      })
      remarkLoading.value = false
      if (code === 200) {
        message.success(t('common.changeSuccess'))
        remarkDialog.value = false
        emit('refresh')
      }
    } catch (error) {
      remarkLoading.value = false
    }
  }
}

const statusOption = [
  { label: t('domainSet2.normal'), value: 1 },
  { label: t('domainSet2.pause'), value: 2 },
  { label: t('domainSet2.abnormal'), value: 3 },
]
// 前四个
const computedInfo = computed(() => {
  if (!props.info) return []
  else {
    let keys = [
      { label: t('domainSet2.domain'), name: 'domainName' },
      { label: 'Domain ID', name: 'id' },
      { label: t('domainSet2.register'), name: 'domainRegistrar' },
      { label: t('domainSet2.status'), name: 'status' },
    ]
    return keys.map(item => {
      if (item.name !== 'status') {
        return {
          label: item.label,
          value: props.info?.[item.name],
        }
      } else {
        return {
          label: item.label,
          value: statusOption.find(s => s.value === props.info?.status)?.label,
        }
      }
    })
  }
})
</script>

<style scoped lang="scss">
.domains-set-basic-info {
  padding: 20px;
  background: #fff;

  .basic-content {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .basic-item {
      display: flex;
      align-items: flex-start;
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;

      .basic-label {
        flex: 0 0 160px;
        color: #828b9c;
      }

      .basic-value {
        max-width: 880px;
        overflow: hidden;
        color: #191c23;
        text-overflow: ellipsis;
        overflow-wrap: break-word;
        white-space: nowrap;
      }

      &.server {
        .basic-value {
          min-width: 0;
          max-width: none;
          white-space: normal;

          .server-box {
            width: min(680px, calc(100vw - 420px));
            min-width: 560px;

            .server-box-title {
              margin-bottom: 18px;
              font-size: 14px;
              line-height: 22px;
              color: #828b9c;
            }

            .server-box-cont {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              border: 1px solid #dfe3eb;

              & > div {
                min-width: 0;

                .box-cont-title {
                  padding: 18px 28px;
                  font-size: 14px;
                  font-weight: 500;
                  line-height: 20px;
                  color: #191c23;
                  background: #f7f9fc;
                  border-bottom: 1px solid #dfe3eb;
                }

                .box-cont-server {
                  display: flex;
                  flex-direction: column;
                  gap: 0;
                  min-height: 96px;
                  padding: 0;
                  font-size: 14px;
                  font-weight: 400;
                  line-height: 22px;
                  background: #fff;

                  div {
                    display: flex;
                    align-items: center;
                    min-height: 48px;
                    padding: 13px 28px;
                    overflow-wrap: anywhere;

                    & + div {
                      border-top: 1px solid #dfe3eb;
                    }

                    svg {
                      flex: 0 0 auto;
                      width: 16px;
                      height: 16px;
                      margin-left: 12px;
                      color: #828b9c;
                      vertical-align: middle;
                    }
                  }
                }
              }

              .current {
                border-right: 1px solid #dfe3eb;

                .box-cont-server {
                  color: #000;
                }
              }

              .ours {
                .box-cont-server {
                  color: var(--success-color);
                }
              }
            }
          }
        }
      }

      &.remark {
        margin-bottom: 0;

        .basic-value {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          max-width: 880px;
          word-break: break-all;

          div {
            max-width: 760px;
            white-space: pre-wrap;
          }

          svg {
            flex-shrink: 0;
            align-self: baseline;
            margin: 3px;
            margin-left: 4px;
            color: #999;

            &:hover {
              color: var(--primary-color);
            }
          }
        }
      }
    }
  }
}

.basic-title {
  display: none;
}

@media (width <= 1200px) {
  .domains-set-basic-info {
    padding: 32px;

    .basic-content {
      .basic-item {
        .basic-label {
          flex-basis: 132px;
        }

        &.server .basic-value .server-box {
          width: 100%;
          min-width: 0;
        }
      }
    }
  }
}

@media (width <= 768px) {
  .domains-set-basic-info {
    padding: 24px;

    .basic-content {
      .basic-item {
        flex-direction: column;
        gap: 8px;

        .basic-label {
          flex: none;
          width: auto;
        }

        .basic-value {
          max-width: 100%;
          white-space: normal;
        }

        &.server .basic-value .server-box .server-box-cont {
          grid-template-columns: 1fr;

          .current {
            border-right: 0;
            border-bottom: 1px solid #dfe3eb;
          }
        }
      }
    }
  }
}

.remark-cont {
  :deep(.el-textarea) {
    .el-textarea__inner {
      min-height: 120px !important;
    }
  }
}
</style>
