<template>
  <div class="step-box">
    <div class="page-alert">
      <el-icon size="16">
        <Warning />
      </el-icon>
      <span class="ml5">{{ t('securitySetting.accountResourceDetectionTips') }}</span>
    </div>
    <div class="mt20">
      <el-table v-loading="loading" :data="list" class="mt20">
        <el-table-column prop="productName" label="产品名称" />
        <el-table-column prop="resourceName" label="资源名称" />
        <el-table-column prop="giveUp" label="是否可放弃" />
        <el-table-column prop="status" label="操作">
          <template #default="{ row }">
            <span class="text-primary cursor-pointer" @click.stop="handleFn(row)">{{
              t('securitySetting.goHandle')
            }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="footer-box mt40">
      <el-space>
        <el-button>{{ t('securitySetting.return') }}</el-button>
        <el-button type="primary">
          {{ t('securitySetting.nextStep') }}
        </el-button>
      </el-space>
    </div>
  </div>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { Warning } from '@element-plus/icons-vue'
const loading = ref<boolean>(false)
const list = ref<any[]>([])

const handleFn = row => {
  console.log('前去处理', row)
}
</script>
<style scoped lang="scss">
.step-box {
  padding: 0 20px 24px;

  .page-alert {
    display: flex;
    align-items: center;
    padding-left: 14px;
    line-height: 34px;
    color: #394aff;
    background: rgb(57 74 255 / 10%);
  }
}

.ml5 {
  margin-left: 5px;
}

.mt20 {
  margin-top: 20px;
}

.mt40 {
  margin-top: 40px;
}
</style>
