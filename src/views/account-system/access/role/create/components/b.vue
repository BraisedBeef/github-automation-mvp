<template>
  <div class="b-wrap">
    <!-- label-width="100px" -->
    <el-form
      ref="createRoleFormRef"
      label-position="left"
      label-width="auto"
      :model="createRoleForm"
      :rules="rules"
      style="width: 450px"
      require-asterisk-position="right"
      @submit.prevent
    >
      <!-- 角色名称 -->
      <el-form-item :label="t('role.roleNames')" prop="roleName">
        <el-input v-model.trim="createRoleForm.roleName" :placeholder="t('role.roleNameWarn1')" />
      </el-form-item>
      <!-- 角色描述 -->
      <el-form-item :label="t('role.description')" prop="description">
        <el-input v-model.trim="createRoleForm.description" maxlength="150" type="textarea" rows="5" />
      </el-form-item>
    </el-form>
    <!-- 策略list -->
    <el-table :data="strategyList" show-overflow-tooltip>
      <el-table-column prop="strategyName" :label="t('strategy.strategyNames')" />
      <el-table-column prop="description" :label="t('strategy.description')" />
    </el-table>

    <el-row :gutter="20" class="btn-wrap">
      <el-button @click="emits('changeStep', 'a')">
        {{ t('common.back') }}
      </el-button>
      <el-button :loading="loading" type="primary" @click="submit(createRoleFormRef)">
        {{ t('role.finish') }}
      </el-button>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { FormInstance, FormRules } from 'element-plus/es'
import t from '@/utils/i18n'
import { ROLE_NAME_REG } from '@/views/account-system/config'

interface PropType {
  strategyList: any[]
  loading: boolean
}

interface CreateRoleForm {
  roleName: string
  description?: string
}

const props = withDefaults(defineProps<PropType>(), {
  strategyList() {
    return []
  },
  loading: false,
})

const emits = defineEmits<{
  (event: 'changeStep', stepStatus: string): void
  (event: 'create', form: any): void
}>()

const { strategyList } = toRefs(props)
const createRoleFormRef = ref<FormInstance>()
const createRoleForm = reactive<CreateRoleForm>({
  roleName: '',
  description: '',
})

// 校验角色名
const checkRoleName = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback('')
  } else if (!ROLE_NAME_REG.test(value)) {
    return callback(new Error(t('role.roleNameWarn2')))
  } else {
    callback()
  }
}

const rules = reactive<FormRules<CreateRoleForm>>({
  roleName: [{ required: true, validator: checkRoleName, trigger: 'blur' }],
})

// submit
const submit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')

      const params = {
        roleSource: 3,
        strategyIds: strategyList.value.map(el => el.id),
        ...createRoleForm,
      }

      emits('create', params)
    } else {
      console.log('error submit!', fields)
    }
  })
}
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
        line-height: 34px;
      }
    }
  }
}

:deep(.el-form-item__error) {
  left: 0 !important;
}

.b-wrap {
  .btn-wrap {
    margin-top: 40px;
  }
}
</style>
