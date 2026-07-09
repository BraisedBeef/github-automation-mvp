<template>
  <div class="c-wrap">
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />
    <Tip :text="dangerTips" type="OneToOne" theme="danger" />

    <div class="list-wrap">
      <p>
        <span class="mian">{{ t('user.roleList') }}</span
        ><span class="sub">{{ t('user.selectRoleList', [list.length, selectList.length]) }}</span>
      </p>
      <!-- 不做分页，滚动展示 -->
      <el-table v-loading="loading" :data="list" class="mt20" @selection-change="handleRowSelectChange">
        <el-table-column type="selection" width="40" />
        <el-table-column prop="roleName" :label="t('role.roleName')" />
        <el-table-column prop="id" :label="t('role.roleID')" />
        <!-- <el-table-column prop="createDate" label="角色载体"> </el-table-column> -->
        <el-table-column prop="strategyNum" :label="t('role.strategyNum')" />
      </el-table>

      <div class="mt20">
        <el-checkbox v-model="isSelf" :label="t('user.isSelfKey')" name="type" />
      </div>
    </div>
    <div v-if="type === 1" class="btn-wrap">
      <el-button @click="emits('changeStep', 'b')">
        {{ t('user.prev') }}
      </el-button>
      <el-button type="primary" @click="next">
        {{ t('common.next') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSubUserCreateStore } from '@/store'
import { message } from '@/utils/message'
import { _getUserRoleList } from '@/apis/account-system/access/user'
import { useUserStore } from '@/store'
import t from '@/utils/i18n'

interface PropType {
  type: number
}

const props = withDefaults(defineProps<PropType>(), {
  type: 1,
})

const { type } = toRefs(props)

const emits = defineEmits<{
  (event: 'changeStep', stepStatus: string): void
}>()
const list = ref<any[]>([]) // 角色列表
const loading = ref<boolean>(false)
const isSelf = ref<boolean>(false) // 自助管理角色列表
const selectList = ref<any[]>([]) // 选中list
const accessUserStore = useSubUserCreateStore()
const userStore = useUserStore()

const tips = computed(() => [
  {
    main: t('user.createStep3MainTip'),
    sub: [t('user.createStep3SubTip1'), t('user.createStep3SubTip2')],
  },
])

const dangerTips = computed(() => [
  {
    main: t('user.createStep3DangerDesc'),
  },
])

// table left 选中当前行/所有行
const handleRowSelectChange = selection => {
  console.log(`handleRowSelectChange===>`, selection)
  selectList.value = selection
}

// 下一步
const next = () => {
  if (!selectList.value.length) {
    return message.warning(t('user.associateRoleWarn'))
  }

  accessUserStore.setIsSelf(isSelf.value)
  accessUserStore.setSelectRoleList(selectList.value)
  emits('changeStep', 'd')
}

// 获取角色列表
const getUserRoleList = async () => {
  try {
    loading.value = true
    const res = await _getUserRoleList({ id: userStore.user.id, pageIndex: 1, pageSize: 9999 })
    if (res.success) {
      list.value = res.data.list
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getUserRoleList()
})
</script>

<style lang="scss" scoped>
.c-wrap {
  .list-wrap {
    .mian {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 16px;
      font-weight: 400;
      line-height: 22px;
      color: var(--primary-text);
    }

    .sub {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 16px;
      font-weight: 400;
      line-height: 22px;
      color: var(--sub-text);
    }
  }
}

.btn-wrap {
  margin-top: 40px;
}
</style>
