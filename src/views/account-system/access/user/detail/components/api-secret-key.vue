<template>
  <div class="wrap mt20">
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <div>
      <el-button class="btn mb20" type="primary" @click="generateSecretKey">
        {{ t('account.createKey') }}
      </el-button>
    </div>

    <el-table v-loading="loading" :data="list" show-overflow-tooltip>
      <el-table-column min-width="300" :label="t('user.key')">
        <template #default="{ row }">
          <div class="table-td_tooltip">
            <p class="mt10 text-over">Secretld：{{ row.secretId }}</p>
            <p class="">SecretKey：****</p>
          </div>
        </template>
      </el-table-column>
      <!-- 创建时间 -->
      <el-table-column min-width="200" :label="t('user.createDate')">
        <template #header>
          <div class="df ac">
            <span>{{ t('user.createDate') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" class="ml10" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          <span>{{ row.createDate ? maoYunDayJs(row.createDate).format(FORMAT_TIME) : '-' }}</span>
        </template>
      </el-table-column>
      <!-- 最近访问时间 -->
      <el-table-column min-width="200" :label="t('user.accessDate')">
        <template #header>
          <div class="df ac">
            <span>{{ t('user.accessDate') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" class="ml10" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          <span>{{ row.accessDate ? maoYunDayJs(row.accessDate).format(FORMAT_TIME) : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="200" prop="status" :label="t('user.status')">
        <template #default="{ row }">
          <span v-if="row.state == 1" class="text-success"> {{ t('user.startUp') }} </span>
          <span v-else class="text-error"> {{ t('user.disabled') }} </span>
        </template>
      </el-table-column>
      <el-table-column :label="t('common.operation')" min-width="140">
        <template #default="{ row }">
          <span class="text-primary cursor-pointer mr20" @click="handleOperatechange('disable', row)">
            {{ t('user.disable') }} </span
          ><span class="text-primary cursor-pointer" @click="handleOperatechange('delete', row)">
            {{ t('common.delete') }}
          </span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 删除 -->
    <CatDialog
      v-model:dialog="operate.showDelete"
      class="dialog"
      :title="t('role.hint')"
      width="600px"
      destroy-on-close
      :confirm-text="t('common.delete')"
      :loading="setLoading"
      @confirm="confirmHandleDelete"
    >
      <el-row class="text">
        {{ t('user.deleteKeyDesc') }}
      </el-row>
    </CatDialog>

    <!-- 禁用 -->
    <CatDialog
      v-model:dialog="operate.showDisable"
      class="dialog"
      :title="t('role.hint')"
      width="600px"
      destroy-on-close
      :confirm-text="t('user.disable')"
      :loading="setLoading"
      @confirm="confirmHandleDisable"
    >
      <el-row class="text mb20">
        {{ t('user.disableKeyDesc') }}
      </el-row>

      <el-row class="text-error">
        {{ t('user.disableKeyaAccessDate')
        }}{{ operate.row.accessDate ? maoYunDayJs(operate.row.accessDate).format(FORMAT_TIME) : '-' }}
      </el-row>
    </CatDialog>

    <!-- 新建密钥 -->
    <CatDialog
      v-model:dialog="create.show"
      class="dialog"
      :title="t('account.createKey')"
      width="640px"
      destroy-on-close
      :confirm-text="t('common.confirm')"
      :close-on-click-modal="false"
      :no-cancel="true"
      :disabled="!create.check"
      :show-close="false"
      @confirm="confirmHandleCreate"
      @update:dialog="closeHandleCreate"
    >
      <!-- tip -->
      <Tip :text="dialogTips" type="OneToMany" />

      <el-checkbox v-model="create.check" :label="t('user.createKeyCheck')" name="type" />
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import { message } from '@/utils/message'
import { _generateSecretKey, _setSecretKeyStatus } from '@/apis/account-system/access/user'
import t from '@/utils/i18n'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'

const props = withDefaults(
  defineProps<{
    list: any[]
    loading: boolean
  }>(),
  {
    list: () => [],
    loading: false,
  },
)

const emits = defineEmits<{
  (event: 'success'): void
}>()

const route = useRoute()
// 创建密钥弹窗
const create = reactive<{
  check: boolean
  show: boolean
  detail: any
}>({
  check: false,
  show: false,
  detail: {},
})
// 删除禁用弹窗
const operate = reactive<{
  showDelete: boolean
  showDisable: boolean
  row: any
}>({
  showDelete: false,
  showDisable: false,
  row: {},
})

const setLoading = ref<boolean>(false)

const tips = computed(() => [
  {
    main: t('user.keyTip1'),
    sub: [t('user.keyTip2')],
  },
])

const dialogTips = computed(() => [
  {
    main: t('user.createKeyTip'),
    sub: [`Secretld：${create.detail.secretId}`, `SecretKey： ${create.detail.secretKey}`],
  },
])

// 创建弹窗关闭
const closeHandleCreate = () => {
  create.detail = {}
  create.check = false
}

// 创建确认
const confirmHandleCreate = () => {
  if (!create.check) {
    // message.warning(t('user.createKeyWarn'))
  } else {
    create.show = false
  }
}

// 禁用确认
const confirmHandleDisable = () => {
  setSecretKeyStatus(operate.row.id, 3)
}

// 删除确认
const confirmHandleDelete = () => {
  setSecretKeyStatus(operate.row.id, 2)
}

// 操作
const handleOperatechange = (type: 'delete' | 'disable', row: any) => {
  console.log(`handleOperatechange==>`, type, row)

  operate.row = row

  if (type === 'delete') {
    //删除
    operate.showDelete = true
  } else {
    // 禁用
    operate.showDisable = true
  }
}

// 生成用户密钥
const generateSecretKey = async () => {
  const res = await _generateSecretKey({
    id: Number(route.params.id) as number,
  })
  console.log(`_generateSecretKey===>`, res)
  if (res.success) {
    create.detail = res.data
    create.show = true
    emits('success')
  } else {
    message.warning(t('user.createFail'))
  }
}

// 设置密钥状态
const setSecretKeyStatus = async (id: number, state: number) => {
  try {
    setLoading.value = true
    const res = await _setSecretKeyStatus({
      id,
      state, // 1正常 2删除 3禁用
    })
    console.log(`_setSecretKeyStatus===>`, res)
    if (res.success) {
      state === 2 ? message.success(t('common.deleteSuccess')) : message.success(t('common.disableSuccess'))
      state === 2 ? (operate.showDelete = false) : (operate.showDisable = false)
      emits('success')
    } else {
      state === 2 ? message.warning(t('role.deleteFail')) : message.warning(t('user.disableFail'))
    }
  } catch (error) {
    console.log(error)
  } finally {
    setLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.dialog {
  .text {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    line-height: 20px;

    // font-weight: 500;
    color: var(--common-text);
  }
}
</style>
