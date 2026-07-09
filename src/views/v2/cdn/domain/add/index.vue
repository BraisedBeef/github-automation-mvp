<template>
  <div class="cdn-domain-add-v2" :class="`is-step-${stepActive}`">
    <PageBreadcrumbToolbar :items="breadcrumbItems" @doc="openHelpDoc" />

    <section class="cdn-domain-add-v2__hero">
      <ProcessSteps :steps="stepList" :active="stepActive" />
    </section>

    <div class="cdn-domain-add-v2__content">
      <component :is="activeComponent" @switch-tab="switchTab" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { documentUrl } from '@/config/base-config'
import AddStep from '@/views/v2/cdn/domain/add/components/add.vue'
import CnameStep from '@/views/v2/cdn/domain/add/components/cname.vue'
import ConfigStep from '@/views/v2/cdn/domain/add/components/config.vue'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import ProcessSteps from '@/views/v2/account-system/components/process-steps.vue'
import t from '@/utils/i18n'
import { removeLocalItem } from '@/utils/storage'

const step = ref(0)

const stepList = [
  { label: t('addDomain'), value: 'add' },
  { label: t('recommendConfig'), value: 'config' },
  { label: t('configCNAME'), value: 'cname' },
]

const tabList = [
  { name: 0, value: 'add', component: markRaw(AddStep) },
  { name: 1, value: 'config', component: markRaw(ConfigStep) },
  { name: 2, value: 'cname', component: markRaw(CnameStep) },
]

const stepActive = computed(() => tabList[step.value]?.value || 'add')
const activeComponent = computed(() => tabList[step.value]?.component || AddStep)
const breadcrumbItems = computed(() => [t('domainManage'), t('addDomain')])

const switchTab = (next: boolean) => {
  if (next && step.value < tabList.length - 1) {
    step.value += 1
    return
  }

  if (!next && step.value > 0) {
    step.value -= 1
  }
}

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

onBeforeUnmount(() => {
  removeLocalItem('CDN_DOMAIN')
  removeLocalItem('CDN_DOMAIN_ID')
  removeLocalItem('CDN_SERVICE_ID')
})
</script>

<style scoped lang="scss">
.cdn-domain-add-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cdn-domain-add-v2__hero {
  // padding: 20px 24px 24px;
  // background: #fff;
}

.cdn-domain-add-v2__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

:deep(.page-box) {
  margin-top: 0 !important;
  background: #fff;
  border: 1px solid #e8ecf3;
  box-shadow: none;
}

:deep(.page-box + .page-box) {
  margin-top: 16px !important;
}

:deep(.page-box .head) {
  font-size: 24px;
  font-weight: 400;
  line-height: 32px;
  color: #191c23;
}

:deep(.page-box .tip) {
  color: #828b9c;
}

:deep(.page-box .el-form-item__label) {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

:deep(.page-box .el-form-item__content),
:deep(.page-box .el-radio),
:deep(.page-box .el-checkbox),
:deep(.page-box .el-table),
:deep(.page-box .el-table th),
:deep(.page-box .el-table td) {
  font-size: 14px;
}

:deep(.page-box .el-table th) {
  font-weight: 500;
}

:deep(.page-box .el-link) {
  font-size: 14px;
}

:deep(.page-box .base-btn),
:deep(.page-box .df.jc.mt20) {
  justify-content: flex-start;
}

:deep(.page-box .base-btn) {
  padding-top: 20px;
  border-top: 1px solid #e8ecf3;
}

:deep(.page-box .base-btn .el-button + .el-button),
:deep(.page-box .df.jc.mt20 .el-button + .el-button) {
  margin-left: 12px;
}

.is-step-add {
  :deep(.page-box:first-child) {
    overflow: hidden;
  }

  :deep(.page-box:first-child .pd20) {
    padding: 24px;
  }

  :deep(.page-box:first-child .el-form) {
    margin-top: 24px;
  }

  :deep(.page-box:last-child) {
    padding: 24px;
  }

  :deep(.page-box:last-child > .head + .el-form) {
    margin-top: 24px;
  }

  :deep(.page-box:last-child .el-table) {
    margin-top: 16px;
  }

  :deep(.page-box:last-child .el-table__append-wrapper) {
    background: #fff;
  }

  :deep(.page-box:last-child .el-table__append-wrapper .cell) {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 16px 20px;
  }
}

.is-step-config {
  :deep(.page-box) {
    padding: 24px;
  }

  :deep(.page-box > .head + div),
  :deep(.page-box > .head + .mt20) {
    margin-top: 16px !important;
  }

  :deep(.page-box .df.ac.mt20),
  :deep(.page-box .df.jc.mt20) {
    margin-top: 16px !important;
  }
}

.is-step-cname {
  :deep(.cdn-domain-add-cname-v2) {
    border: 1px solid #e8ecf3;
  }
}
</style>
