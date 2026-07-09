<template>
  <div class="wrap mt20">
    <div class="df ac mb20 pointer" @click="isShow = !isShow">
      <span class="mr4 title">{{ t('overview.associateRole') }}</span>
      <el-icon :class="isShow ? 'is-reverse' : ''" style="transition: 0.3s">
        <CaretRight />
      </el-icon>
    </div>
    <el-divider />
    <el-collapse-transition>
      <div v-show="isShow">
        <!-- tip -->
        <Tip :text="tips" type="OneToOne" />
        <div>
          <el-button class="btn mb20" type="primary" @click="openEmpowerDialog(AssociaeRoleDialogRef)">
            {{ t('user.authRole') }}
          </el-button>
          <el-button
            class="btn mb20"
            :type="selectList.length ? 'primary' : ''"
            @click="
              openRemoveDialog(
                'batch',
                selectList.map(el => el.id),
              )
            "
          >
            {{ t('user.deleteRole') }}
          </el-button>
        </div>

        <el-table v-loading="loading" :data="list" @selection-change="handleRowSelectChange">
          <el-table-column type="selection" width="40" />
          <el-table-column prop="roleName" :label="t('role.roleName')">
            <template #default="{ row }">
              <span class="text-primary">{{ row.roleName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="description" :label="t('strategy.description')" />
          <el-table-column prop="strategyNum" :label="t('role.strategyNum')" />
          <!-- 关联时间 -->
          <el-table-column prop="createDate" :label="t('user.roleStrategyCreateDate')">
            <template #header>
              <div class="df ac">
                <span class="mr10">{{ t('user.roleStrategyCreateDate') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <span>{{ row.createDate ? maoYunDayJs(row.createDate).format(FORMAT_TIME) : '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" :label="t('common.operation')">
            <template #default="{ row }">
              <span class="text-primary cursor-pointer" @click="openRemoveDialog('single', [row.id])">
                {{ t('role.lift') }}
              </span>
            </template>
          </el-table-column>
        </el-table>

        <CatPagination
          v-model:pagination="paginationConfig.pagination"
          :total="paginationConfig.total"
          @change="getSelectUserStrategyList"
        />
      </div>
    </el-collapse-transition>
    <!-- 解除 -->
    <CatDialog
      v-model:dialog="remove.show"
      class="dialog"
      :title="t('user.deleteRole')"
      width="460px"
      destroy-on-close
      :loading="removeLoading"
      @confirm="userRoleDelete"
    >
      <el-row class="text">
        {{ t('user.deleteRoleStrategyDesc') }}
      </el-row>
    </CatDialog>
    <!-- 授权 -->
    <AssociaeRoleDialog :id="id" ref="AssociaeRoleDialogRef" @success="getSelectUserStrategyList" />
  </div>
</template>

<script setup lang="ts">
import { CaretRight } from '@element-plus/icons-vue'
import { message } from '@/utils/message'
import AssociaeRoleDialog from '../../list/components/associae-role-dialog.vue'
import { _getSelectUserRoleList, _userRoleDelete } from '@/apis/account-system/access/user'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'

const route = useRoute()
const id = ref<number>(Number(route.params.id) as number) // id
// 解除弹窗
const remove = reactive<{
  show: boolean
  type: string
  roleIds: number[]
}>({
  show: false,
  type: '',
  roleIds: [],
})
const loading = ref<boolean>(false)
const removeLoading = ref<boolean>(false)
const list = ref<any[]>([]) // 角色策略列表
const selectList = ref<any[]>([]) // 选中的角色策略列表
const condition = ref<string>('') // 查询条件
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})
const isShow = ref<boolean>(true) // 是否显示详情

const AssociaeRoleDialogRef = ref<InstanceType<typeof AssociaeRoleDialog> | null>(null)

const tips = computed(() => [
  {
    main: t('user.roleStrategyTip'),
  },
])

// 选中当前行/所有行
const handleRowSelectChange = selection => {
  console.log(`handleRowSelectChange===>`, selection)
  selectList.value = selection
}

// 显示删除弹窗
const openRemoveDialog = (type: string, roleIds: number[]) => {
  console.log(`showDelete===>`, type)
  // 为批量
  if (type === 'batch' && !roleIds.length) {
    return message.warning(t('user.associateRoleWarn'))
  }
  remove.show = true
  remove.type = type
  remove.roleIds = roleIds
}

// 点击授权
const openEmpowerDialog = (ins: any) => {
  console.log(`openEmpowerDialog===>`)

  if (!ins) return
  ins.show = true
}

// 解除角色
const userRoleDelete = async () => {
  try {
    removeLoading.value = true
    const res = await _userRoleDelete({
      id: Number(route.params.id) as number,
      roleIds: remove.roleIds,
    })

    console.log(`_setStatus===>`, res)

    if (res.success) {
      message.success(t('user.deleteRoleStrategySuccess'))
      getSelectUserStrategyList()

      remove.show = false
      remove.type = ''
      remove.roleIds = []
    } else {
      message.warning(t('user.deleteRoleStrategyFail'))
    }
  } catch (error) {
    console.log(error)
  } finally {
    removeLoading.value = false
  }
}

// 用户详情-角色策略列表
const getSelectUserStrategyList = async () => {
  try {
    const res = await _getSelectUserRoleList({
      id: Number(route.params.id) as number,
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      condition: condition.value,
    })

    console.log(`_getStrategyList===>`, res)

    if (res.success) {
      list.value = res.data?.list || []

      paginationConfig.total = res.data.recordCnt
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 条件
watch(condition, () => {
  getSelectUserStrategyList()
})

// 路由
watch(
  () => route.params.id,
  () => {
    id.value = Number(route.params.id) as number
    getSelectUserStrategyList()
  },
)
onMounted(() => {
  getSelectUserStrategyList()
})
</script>

<style lang="scss" scoped>
.wrap {
  .title {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--table-text);
  }
}

.dialog {
  .text {
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
