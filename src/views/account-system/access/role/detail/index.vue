<template>
  <div>
    <el-card shadow="never" class="page-box h290 info mb20" :body-style="bodyStyle">
      <el-row class="mb20">
        <span class="title">{{ t('role.roleInfo') }}</span>
      </el-row>
      <!-- 角色名称 -->
      <el-row class="mb20">
        <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="2">
          <span class="key">{{ t('role.roleNames') }}</span>
        </el-col>

        <el-col :xs="21" :sm="21" :md="21" :lg="21" :xl="22">
          <span class="value">{{ detail.roleName }}</span>
        </el-col>
      </el-row>

      <!-- 角色ID -->
      <el-row class="mb20">
        <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="2">
          <span class="key">{{ t('role.roleID') }}</span>
        </el-col>

        <el-col :xs="21" :sm="21" :md="21" :lg="21" :xl="22">
          <span class="value">{{ detail.id }}</span>
        </el-col>
      </el-row>

      <!-- 角色描述 -->
      <el-row class="mb20">
        <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="2">
          <span class="key">{{ t('role.description') }}</span>
        </el-col>

        <el-col :xs="21" :sm="21" :md="21" :lg="21" :xl="22">
          <span class="value auto-wrap">{{ detail.description || '-' }}</span>
        </el-col>
      </el-row>

      <!-- 创建时间 -->
      <el-row class="mb20">
        <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="2">
          <div class="key df ac">
            <span>{{ t('role.createDate') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" class="ml10" />
            </el-tooltip>
          </div>
        </el-col>

        <el-col :xs="21" :sm="21" :md="21" :lg="21" :xl="22">
          <span class="value">{{ detail.createDate ? maoYunDayJs(detail.createDate).format(FORMAT_TIME) : '-' }}</span>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="never" class="page-box info mb20" :body-style="{ ...bodyStyle, paddingTop: 0 }">
      <CatTabs v-model="active" :tabs="tabs" @change="handleClick">
        <!-- 策略 -->
        <CatTabPane :value="1">
          <div class="strategy-wrap mt20">
            <div class="df ac mb20 pointer" @click="isShow = !isShow">
              <el-icon :class="isShow ? 'is-reverse' : ''" style="transition: 0.3s">
                <CaretRight />
              </el-icon>
              <span class="ml4 title">{{ t('role.permStrategy') }}</span>
            </div>
            <el-divider />
            <el-collapse-transition>
              <div v-show="isShow">
                <!-- tip -->
                <Tip :text="tips" type="OneToOne" />

                <el-button class="btn mb20" type="primary" @click="showStrategy(strategyDialogRef)">
                  {{ t('role.associate') }}
                </el-button>
                <el-button
                  class="btn mb20"
                  :type="selectStrategyList.length ? 'primary' : ''"
                  @click="openDelete('batch', selectStrategyList)"
                >
                  {{ t('role.lift') }}
                </el-button>
                <!-- 策略列表 -->
                <el-table v-loading="loading" :data="roleStrategyList" @selection-change="handleRowSelectChange">
                  <el-table-column type="selection" width="40" />
                  <el-table-column prop="strategyName" :label="t('strategy.strategyName')" />
                  <el-table-column prop="description" :label="t('strategy.description')" />
                  <!-- <el-table-column prop="number" label="策略类型"> </el-table-column> -->
                  <!-- 关联时间 -->
                  <el-table-column prop="associationDate" :label="t('strategy.usageCreateDate')">
                    <template #header>
                      <div class="df ac">
                        <span class="mr10">{{ t('strategy.usageCreateDate') }}</span>
                        <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                          <SvgIcon name="cat-cdn-help" />
                        </el-tooltip>
                      </div>
                    </template>
                    <template #default="{ row }">
                      <span>{{
                        row.associationDate ? maoYunDayJs(row.associationDate).format(FORMAT_TIME) : '-'
                      }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" :label="t('common.operation')">
                    <template #default="{ row }">
                      <span class="text-primary cursor-pointer" @click="openDelete('single', row)">
                        {{ t('role.lift') }}
                      </span>
                    </template>
                  </el-table-column>
                </el-table>

                <CatPagination
                  v-model:pagination="paginationConfig.pagination"
                  :total="paginationConfig.total"
                  :custom-keys="['page', 'page_size']"
                  @change="getRoleStrategyList"
                />
              </div>
            </el-collapse-transition>
          </div>
        </CatTabPane>
      </CatTabs>
    </el-card>

    <!-- 解除 -->
    <CatDialog
      v-model:dialog="show"
      class="dialog"
      :title="t('role.hint')"
      width="600px"
      destroy-on-close
      :loading="removeLoading"
      @confirm="roleStrategyDelete"
    >
      <el-row class="main-text">
        {{ t('role.deleteStrategyDesc1') }}
      </el-row>
      <el-row class="sub-text">
        {{ t('role.deleteStrategyDesc2') }}
      </el-row>
    </CatDialog>
    <!-- 关联策略 -->
    <BindStrategyDialog
      ref="strategyDialogRef"
      :role-id="id"
      :strategy-ids="strategyIds"
      @success="getRoleStrategyList"
    />
  </div>
</template>

<script setup lang="ts">
import { CaretRight } from '@element-plus/icons-vue'
import { _getRoleInfo, _getRoleStrategyList, _roleStrategyDelete } from '@/apis/account-system/access/role'
import { message } from '@/utils/message'
import BindStrategyDialog from './components/bind-strategy-dialog.vue'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'

const route = useRoute()
const bodyStyle = { height: '100%' }

const strategyDialogRef = ref<InstanceType<typeof BindStrategyDialog> | null>(null)

const show = ref<boolean>(false)
const loading = ref<boolean>(false)
const removeLoading = ref<boolean>(false)
const roleStrategyList = ref<any[]>([]) // 角色绑定的所有策略
const selectStrategyList = ref<any[]>([]) // 选中策略list
const id = ref<string>(route.params.id as string) // 角色id
const active = ref(1)
const tabs = [{ label: t('strategy.strategy'), value: 1 }]
const detail = ref<any>({}) // 角色详情
const removeStrategyIds = ref<string[]>([]) // 解除策略id
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})
const isShow = ref<boolean>(true) // 是否显示详情

const tips = computed(() => [
  {
    main: t('role.strategyDesc'),
  },
])

// 角色绑定的所有策略id
const strategyIds = computed(() => {
  return roleStrategyList.value.map(el => el.id)
})

// 显示策略弹出
const showStrategy = (ins: any) => {
  if (ins) {
    ins.show = true
  }
}

// 获取角色详情
const getRoleInfo = async () => {
  const res = await _getRoleInfo({ id: id.value })

  console.log(`_getRoleInfo===>`, res)

  if (res.success) {
    detail.value = res.data || {}
  }
}

// 角色策略列表
const getRoleStrategyList = async () => {
  try {
    loading.value = true

    const res = await _getRoleStrategyList({
      id: id.value,
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
    })

    console.log(`_getStrategySummary===>`, res)
    if (res.success) {
      roleStrategyList.value = res.data?.list || []
      paginationConfig.total = res.data.recordCnt
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 显示删除弹窗
const openDelete = (type: string, data: any) => {
  console.log(`openDelete===>`, type, data)
  // 批量
  if (type === 'batch') {
    if (data.length) {
      show.value = true

      removeStrategyIds.value = data.map(el => el.id)
    } else {
      message.warning(t('role.deleteStrategyWarn'))
    }
  } else {
    //单个
    show.value = true

    removeStrategyIds.value = [data.id]
  }
}

// 解除策略
const roleStrategyDelete = async () => {
  try {
    removeLoading.value = true
    const res = await _roleStrategyDelete({ id: id.value, strategyIds: removeStrategyIds.value })

    console.log(`_roleStrategyDelete===>`, res)

    if (res.success) {
      message.success(t('common.deleteSuccess'))
      getRoleStrategyList()
      show.value = false
    } else {
      message.warning(t('role.deleteFail'))
    }
  } catch (error) {
    console.log(error)
  } finally {
    removeLoading.value = false
  }
}

const handleClick = (item: any) => {
  console.log(`handleClick===>`, item)
}

// 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  console.log(`handleRowSelectChange===>`, selection)
  selectStrategyList.value = selection
}

// 路由
watch(
  () => route.params.id,
  () => {
    id.value = route.params.id as string
    getRoleInfo()
  },
)

onMounted(() => {
  id.value = route.params.id as string
  getRoleInfo()
  getRoleStrategyList()
})
</script>

<style lang="scss" scoped>
.info {
  .title {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 18px;
    line-height: 25px;

    // font-weight: 500;
    color: var(--table-text);

    .key {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--common-text);
    }

    .value {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--primary-text);
    }
  }
}

.service-wrap {
  .search-wrap {
    width: 360px;
    height: 34px;
    border-radius: 4px;
  }
}

.strategy-wrap {
  .title {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--table-text);
  }
}

:deep(.el-tabs__item) {
  /* height: 48px; */
  display: flex;
  align-items: start;
  font-size: 16px;
}

.h290 {
  max-height: 290px;
}

.dialog {
  .main-text {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    line-height: 20px;

    // font-weight: 500;
    color: var(--primary-text);
  }

  .sub-text {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    line-height: 20px;

    // font-weight: 500;
    color: var(--common-text);
  }
}

.is-reverse {
  transform: rotateZ(90deg);
}
</style>
