<template>
  <div class="renew bgcf pd20">
    <div class="d-title">
      {{ t('domain.batch-operate.886313-0') }}
    </div>
    <DomainChoose ref="domainRef" v-model="domain" />

    <CatTip>{{ t('domain.batch-operate.886313-1') }}</CatTip>
    <div class="d-title mt20">
      {{ t('domain.batch-operate.886313-2') }}
    </div>
    <el-form :model="form" label-position="left" label-width="auto" class="mt20 mr20">
      <el-form-item :label="t('domain.batch-operate.886313-3')">
        <CatSelect v-model="form.year" :list="renewList" />
      </el-form-item>
    </el-form>

    <div class="d-title mt20">
      {{ t('domain.batch-operate.886313-4') }}
    </div>
    <div class="mt20">
      <el-checkbox v-model="form.auto_renew" :true-label="1" :false-label="2">
        {{ t('domain.batch-operate.886313-5') }}
      </el-checkbox>
    </div>
    <div class="border-btn">
      <el-button type="primary" @click="next">
        {{ t('domain.batch-operate.886313-6') }}
      </el-button>
    </div>

    <RenewDialog
      v-model:dialog="dialogRenew.show"
      :domain-list="dialogRenew.selectedData"
      :auto_renew="dialogRenew.auto_renew"
    />
  </div>
</template>

<script setup lang="ts">
import DomainChoose from './domain-choose.vue'
import RenewDialog from '@/views/domain/components/renew-dialog.vue'
import t from '@/utils/i18n'

const domain = ref('')
const domainRef = ref()
const form = reactive({
  year: 1,
  auto_renew: 1,
})
const renewList = [{ label: t('domain.batch-operate.886313-7'), value: 1 }]

// 续费弹窗
const dialogRenew = reactive<{ selectedData: string[]; show: boolean; auto_renew: number }>({
  selectedData: [],
  show: false,
  auto_renew: 1,
})
const next = async () => {
  if (!(await domainRef.value.domainRef.validate(b => b))) return
  dialogRenew.show = true
  dialogRenew.selectedData = domain.value.trim().split('\n')
  dialogRenew.auto_renew = form.auto_renew
}
</script>

<style lang="scss" scoped>
@import '@/views/domain/config';

.renew {
  .icon {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
}
</style>
