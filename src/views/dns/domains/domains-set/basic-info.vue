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
      <div class="basic-item" :style="{ marginBottom: props.info?.dnsStatus === 1 ? '0px' : '20px' }">
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
            <div class="server-box-title">
              {{ info?.dnsStatus === 1 ? '' : t('domainSet2.DnsServerTip') }}
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
  .basic-title {
    margin-bottom: 20px;
    font-family: 'PingFang SC-Regular', 'PingFang SC';

    // font-weight: 500;
    font-size: 16px;
    color: #000;
  }

  .basic-content {
    .basic-item {
      display: flex;
      margin-bottom: 20px;
      font-family: 'PingFang SC-Regular', 'PingFang SC';
      font-size: 14px;
      font-weight: 400;

      .basic-label {
        width: 112px;
        color: #999;
      }

      .basic-value {
        max-width: 800px;
        overflow: hidden;
        color: var(--primary-text);
        text-overflow: ellipsis;
        overflow-wrap: break-word;
        white-space: nowrap;
      }

      &.server {
        .basic-value {
          .server-box {
            min-width: 560px;
            max-width: 800px;

            /* border: 1px solid var(--border-c); */

            .server-box-title {
              /* padding: 12px 0; */
              padding-bottom: 8px;
              font-family: 'PingFang SC-Regular', 'PingFang SC';
              font-size: 14px;
              font-weight: 400;
              color: #000;
              border-bottom: 1px solid var(--border-c);
            }

            .server-box-cont {
              display: flex;
              padding: 12px 0;

              & > div {
                width: 50%;

                .box-cont-title {
                  margin-bottom: 12px;
                  font-family: 'PingFang SC-Regular', 'PingFang SC';
                  font-size: 14px;
                  font-weight: 400;
                  line-height: 20px;
                  color: #000;
                }

                .box-cont-server {
                  padding: 12px;
                  font-family: 'PingFang SC-Regular', 'PingFang SC';
                  font-size: 14px;
                  font-weight: 400;
                  background-color: var(--table-head-bgc);

                  div {
                    margin-bottom: 4px;
                    overflow-wrap: break-word;

                    svg {
                      width: 12px;
                      height: 12px;
                      margin-left: 4px;
                      color: #999;
                      vertical-align: middle;
                    }
                  }
                }
              }

              .current {
                margin-right: 16px;

                .box-cont-server {
                  color: var(--error-color);
                  color: #000;

                  /* min-height: 120px; */
                }
              }

              .ours {
                .box-cont-server {
                  /* min-height: 120px; */
                  color: var(--success-color);
                }
              }
            }
          }
        }
      }

      &.remark {
        padding-bottom: 20px;
        margin-bottom: 0;

        .basic-value {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          max-width: 800px;
          word-break: break-all;

          div {
            max-width: 700px;

            /* text-overflow: ellipsis;
            overflow: hidden; */
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

.remark-cont {
  :deep(.el-textarea) {
    .el-textarea__inner {
      min-height: 120px !important;
    }
  }
}
</style>
