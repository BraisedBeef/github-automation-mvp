<template>
  <el-card shadow="never" class="page-box">
    <CatStep v-model="step.active" :steps="step.steps" :v-change="false" class="mt20" />
    <el-divider class="mt20 mb20" />
    <!-- 第一步 -->
    <A v-show="step.active === 'a'" @change-step="changeStep" @change-strategy="changeStrategy" />
    <!-- 第二步 -->
    <B
      v-show="step.active === 'b'"
      :loading="loading"
      :strategy-list="strategyList"
      @change-step="changeStep"
      @create="create"
    />
  </el-card>
</template>

<script setup lang="ts">
import A from './components/a.vue'
import B from './components/b.vue'
import { _insertRole } from '@/apis/account-system/access/role'
import { message } from '@/utils/message'

import t from '@/utils/i18n'
import { useBaseStore } from '@/store'
import { backRoute } from '@/utils/router-jump'

const baseStore = useBaseStore()

const step = ref({
  active: 'a',
  steps: [
    { label: t('role.createStep1'), value: 'a' },
    { label: t('role.createStep2'), value: 'b' },
  ],
})
const strategyList = ref<any[]>([]) // 第一步选中策略
const loading = ref<boolean>(false) // create status
// 更新step
const changeStep = stepStatus => {
  console.log(`changeStep===>`, stepStatus)
  step.value.active = stepStatus
}

// 更新strategyIds
const changeStrategy = (ids, list) => {
  // console.log(`changeStrategyIds===>`, ids, list)
  strategyList.value = list
}

// 创建
const create = async (form: any) => {
  try {
    loading.value = true
    console.log(`create===>`, form)

    const res = await _insertRole(form)
    console.log(`_insertRole res===>`, res)

    if (res.success) {
      message.success(t('role.createSuccess'))
      backRoute()
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

onBeforeMount(() => {
  // baseStore.routeModel = '/user'
  // baseStore.selectedKeys = 'access_role_create'
})
</script>

<style lang="scss" scoped>
:deep(.el-table) {
  .header-row {
    background-color: #fff;

    .el-table__cell {
      /* border-width: 0px; */
      background-color: #fff !important;
    }
  }

  // 选中row
  .select-row {
    td {
      .cell {
        color: var(--primary-color);

        /* background: var(--el-table-current-row-bg-color); */
        background: #f1f2fc;
      }
    }
  }

  .row {
    height: 38px;

    td {
      height: 34px;
      border-width: 0;

      .cell {
        height: 34px;

        /* display: flex; */

        /* justify-content: flex-end; */

        /* align-items: center; */
        line-height: 34px;
      }
    }
  }
}

.a-wrap {
  .title {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--primary-text);
  }

  .left-list-wrap,
  .right-list-wrap {
    box-sizing: border-box;

    /* width: 360px; */
    height: 372px;
    padding: 11px;
    border: 1px solid var(--border-c);
    border-radius: 4px;
  }

  .switch-wrap {
    /* margin-left: ; */
  }
}

.mt15 {
  margin-top: 15px;
}

.btn-wrap {
  margin-top: 40px;
}

.w50p {
  min-width: 50%;
}
</style>
