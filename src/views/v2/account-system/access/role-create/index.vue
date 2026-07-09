<template>
  <div class="access-role-create-v2">
    <PageBreadcrumbToolbar :items="breadcrumbItems" @doc="openHelpDoc" />

    <ProcessSteps :steps="steps" :active="stepActive" />

    <section class="access-role-create-v2__panel">
      <div class="access-role-create-v2__body">
        <template v-if="stepActive === 'a'">
          <div class="access-role-create-v2__transfer">
            <div class="access-role-create-v2__column">
              <div class="access-role-create-v2__column-head">
                <span>{{ t('role.selectStrategy') }}</span>
                <span>{{ t('role.selectStrategyNum', [strategyList.length]) }}</span>
              </div>

              <div class="access-role-create-v2__search-row">
                <span class="access-role-create-v2__search-label">{{ t('role.selectStrategy') }}</span>
                <el-input v-model.trim="condition" maxlength="30" :placeholder="t('role.createSearchPlaceholder')" />
              </div>

              <TableV2
                ref="leftTableRef"
                v-loading="loading"
                :data="strategyList"
                :empty-min-height="220"
                row-key="id"
                @selection-change="handleStrategySelectionChange"
              >
                <el-table-column type="selection" width="46" />
                <el-table-column prop="strategyName" :label="t('strategy.strategyName')" min-width="160" />
                <el-table-column prop="description" :label="t('strategy.description')" min-width="180" />
              </TableV2>
            </div>

            <div class="access-role-create-v2__middle">
              <SvgIcon name="form-left" />
              <SvgIcon name="form-right" />
            </div>

            <div class="access-role-create-v2__column">
              <div class="access-role-create-v2__column-head access-role-create-v2__column-head--between">
                <span>{{ t('role.alreadySelectStrategy', [selectedStrategyList.length]) }}</span>
                <el-button plain @click="clearSelectedStrategies">
                  {{ t('components.clearAll') }}
                </el-button>
              </div>

              <TableV2 :data="selectedStrategyList" :empty-min-height="220">
                <el-table-column prop="strategyName" :label="t('strategy.strategyName')" min-width="180" />
                <el-table-column prop="description" :label="t('strategy.description')" min-width="220" />
                <el-table-column width="72" align="center">
                  <template #default="{ row }">
                    <button
                      type="button"
                      class="access-role-create-v2__remove-btn"
                      @click="removeSelectedStrategy(row)"
                    >
                      <SvgIcon name="close" />
                    </button>
                  </template>
                </el-table-column>
              </TableV2>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="access-role-create-v2__review-form">
            <div class="access-role-create-v2__form-row">
              <label class="access-role-create-v2__label">
                {{ t('role.roleNames') }}
                <span class="access-role-create-v2__required">*</span>
              </label>
              <div class="access-role-create-v2__field">
                <el-input v-model.trim="createRoleForm.roleName" :placeholder="t('role.roleNameWarn1')" />
                <p v-if="formErrors.roleName" class="access-role-create-v2__error">
                  {{ formErrors.roleName }}
                </p>
              </div>
            </div>

            <div class="access-role-create-v2__form-row access-role-create-v2__form-row--top">
              <label class="access-role-create-v2__label">
                {{ t('role.description') }}
              </label>
              <div class="access-role-create-v2__field">
                <el-input
                  v-model.trim="createRoleForm.description"
                  maxlength="150"
                  type="textarea"
                  :rows="7"
                  :placeholder="t('role.description')"
                />
              </div>
            </div>
          </div>

          <div class="access-role-create-v2__review-table">
            <TableV2 :data="selectedStrategyList">
              <el-table-column prop="strategyName" :label="t('strategy.strategyNames')" min-width="220" />
              <el-table-column prop="description" :label="t('strategy.description')" min-width="260" />
            </TableV2>
          </div>
        </template>
      </div>

      <div class="access-role-create-v2__footer">
        <template v-if="stepActive === 'a'">
          <el-button @click="backRoute()">
            {{ t('common.back') }}
          </el-button>
          <el-button type="primary" @click="goStrategyStepNext">
            {{ t('common.next') }}
          </el-button>
        </template>
        <template v-else>
          <el-button :loading="submitting" type="primary" @click="submitRole">
            {{ t('role.finish') }}
          </el-button>
          <el-button @click="stepActive = 'a'">
            {{ t('common.back') }}
          </el-button>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { documentUrl } from '@/config/base-config'
import { _insertRole } from '@/apis/account-system/access/role'
import { _getStrategyList } from '@/apis/account-system/access/strategy'
import { ROLE_NAME_REG } from '@/views/account-system/config'
import { backRoute } from '@/utils/router-jump'
import { message } from '@/utils/message'
import t from '@/utils/i18n'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import ProcessSteps from '@/views/v2/account-system/components/process-steps.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

const breadcrumbItems = computed(() => [t('accountSystemRoutes.overview'), t('accountSystemRoutes.createRole')])
const steps = computed(() => [
  { label: t('role.createStep1'), value: 'a' },
  { label: t('role.createStep2'), value: 'b' },
])

const stepActive = ref('a')
const loading = ref(false)
const submitting = ref(false)
const condition = ref('')
const strategyList = ref<any[]>([])
const selectedStrategyList = ref<any[]>([])
const leftTableRef = ref()

const createRoleForm = reactive({
  roleName: '',
  description: '',
})

const formErrors = reactive({
  roleName: '',
})

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const handleStrategySelectionChange = (selection: any[]) => {
  selectedStrategyList.value = selection
}

const clearSelectedStrategies = () => {
  selectedStrategyList.value = []
  leftTableRef.value?.clearSelection()
}

const removeSelectedStrategy = (row: any) => {
  selectedStrategyList.value = selectedStrategyList.value.filter(item => item.id !== row.id)
  const matched = strategyList.value.find(item => item.id === row.id)
  if (matched) {
    leftTableRef.value?.toggleRowSelection(matched, false)
  }
}

const getStrategyList = async () => {
  try {
    loading.value = true
    const res = await _getStrategyList({
      pageIndex: 1,
      pageSize: 9999,
      condition: condition.value,
    })

    strategyList.value = res.success ? res.data?.list || [] : []

    nextTick(() => {
      selectedStrategyList.value.forEach(row => {
        const matched = strategyList.value.find(item => item.id === row.id)
        if (matched) {
          leftTableRef.value?.toggleRowSelection(matched, true)
        }
      })
    })
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const goStrategyStepNext = () => {
  if (!selectedStrategyList.value.length) {
    return message.warning(t('role.deleteStrategyWarn'))
  }
  stepActive.value = 'b'
}

const validateRoleForm = () => {
  formErrors.roleName = ''

  if (!createRoleForm.roleName) {
    formErrors.roleName = t('role.roleNameWarn1')
    return false
  }

  if (!ROLE_NAME_REG.test(createRoleForm.roleName)) {
    formErrors.roleName = t('role.roleNameWarn2')
    return false
  }

  return true
}

const submitRole = async () => {
  if (!validateRoleForm()) return

  try {
    submitting.value = true
    const res = await _insertRole({
      roleSource: 3,
      strategyIds: selectedStrategyList.value.map(item => item.id),
      ...createRoleForm,
    })

    if (res.success) {
      message.success(t('role.createSuccess'))
      backRoute()
    }
  } catch (error) {
    console.log(error)
  } finally {
    submitting.value = false
  }
}

watch(condition, () => {
  getStrategyList()
})

onMounted(() => {
  getStrategyList()
})
</script>

<style scoped lang="scss">
.access-role-create-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.access-role-create-v2__panel {
  background: #fff;
}

.access-role-create-v2__body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px 28px;
}

.access-role-create-v2__transfer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 24px minmax(0, 1fr);
  gap: 14px;
  align-items: stretch;
}

.access-role-create-v2__column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.access-role-create-v2__column-head {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.access-role-create-v2__column-head--between {
  justify-content: space-between;
}

.access-role-create-v2__search-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
}

.access-role-create-v2__search-label {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.access-role-create-v2__middle {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  color: #191c23;

  :deep(svg) {
    width: 24px;
    height: 24px;
  }
}

.access-role-create-v2__remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  color: #828b9c;
  cursor: pointer;
  background: transparent;
  border: 0;

  :deep(svg) {
    width: 16px;
    height: 16px;
  }
}

.access-role-create-v2__review-form {
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 640px;
  padding: 6px 0 2px;
}

.access-role-create-v2__form-row {
  display: flex;
  gap: 24px;
  align-items: center;
}

.access-role-create-v2__form-row--top {
  align-items: flex-start;
}

.access-role-create-v2__label {
  flex: 0 0 88px;
  padding-top: 10px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.access-role-create-v2__required {
  margin-left: 2px;
  color: #e54839;
}

.access-role-create-v2__field {
  width: 508px;
  max-width: 100%;
}

.access-role-create-v2__error {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 20px;
  color: #e54839;
}

.access-role-create-v2__review-table {
  margin-top: 8px;
}

.access-role-create-v2__review-form :deep(.el-textarea__inner) {
  min-height: 200px !important;
}

.access-role-create-v2__footer {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 20px 28px 28px;
  border-top: 1px solid #e8ecf3;
}

@media (width <= 1024px) {
  .access-role-create-v2__transfer {
    grid-template-columns: 1fr;
  }

  .access-role-create-v2__middle {
    flex-direction: row;
  }

  .access-role-create-v2__search-row,
  .access-role-create-v2__form-row {
    flex-direction: column;
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .access-role-create-v2__label,
  .access-role-create-v2__field {
    flex-basis: auto;
    width: 100%;
  }
}
</style>
