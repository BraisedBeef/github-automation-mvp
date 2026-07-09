<template>
  <el-card shadow="never" class="page-box">
    <div>
      <CatStep v-model="step.active" class="df jc mt20" :steps="step.steps" :v-change="false" />
    </div>

    <el-divider class="mt20 mb20" />
    <!-- 第一步 选择类型 -->
    <A v-show="step.active === 'a'" @change-step="changeStep" @select-step-type="selectStepType" />
    <!-- 第二步 填写用户信息 -->
    <B v-show="step.active === 'b'" :type="step.type" :loading="loading" @change-step="changeStep" @create="create" />
    <!-- 第三步 设置用户权限 -->
    <C v-show="step.active === 'c'" :type="step.type" @change-step="changeStep" />
    <!-- 第四步 审阅信息和权限 -->
    <D v-show="step.active === 'd'" :type="step.type" :loading="loading" @change-step="changeStep" @create="create" />
    <!-- 创建可访问资源并接收消息类型成功时展示弹窗 -->
    <CatDialog
      v-model:dialog="dialog.show"
      class="dialog"
      :title="t('user.createSuccessTit')"
      width="850px"
      destroy-on-close
      :no-cancel="true"
      @confirm="back"
    >
      <p class="desc">
        {{ t('user.createSuccessDesc') }}
      </p>

      <!-- tip -->
      <Tip :text="tips" type="OneToOne" theme="danger" />

      <el-table :data="[{}]" class="mt20">
        <el-table-column :label="t('user.userNames')" min-width="200">
          <template #default>
            <span>{{ dialog.detail.userName || '-' }}</span>
          </template>
        </el-table-column>
        <!-- 密码 -->
        <el-table-column :label="t('user.password')" min-width="300">
          <template #default>
            <div class="df ac">
              <span>{{ dialog.showPassword ? dialog.detail.password : '****' }}</span
              ><span class="text-primary cursor-pointer ml4" @click="dialog.showPassword = !dialog.showPassword">
                {{ dialog.showPassword ? t('user.hide') : t('user.show') }}</span
              >
            </div>
          </template>
        </el-table-column>
        <!-- 密钥 -->
        <el-table-column :label="t('user.key')" min-width="500">
          <template #default>
            <div v-if="dialog.detail.secretId && dialog.detail.secretKey">
              <p class="mt10 text-over" style="width: 500px">Secretld：{{ dialog.detail.secretId }}</p>
              <div class="mb10 df ac">
                <p v-if="dialog.showSecretKey" class="text-over" style="width: 500px">
                  <span>SecretKey：</span><span>{{ dialog.detail.secretKey }}</span>
                </p>
                <p v-else><span>SecretKey：</span>****<span class="text-primary cursor-pointer ml4" /></p>
                <span class="text-primary cursor-pointer" @click="dialog.showSecretKey = !dialog.showSecretKey">{{
                  dialog.showSecretKey ? t('user.hide') : t('user.show')
                }}</span>
              </div>
            </div>
            <p v-else>-</p>
          </template>
        </el-table-column>
        <!-- 复制 -->
        <el-table-column :label="t('common.operation')" min-width="100" fixed="right">
          <template #default>
            <span class="text-primary cursor-pointer" @click="handleCopy(dialog.detail)">{{ t('user.copy') }}</span>
          </template>
        </el-table-column>
      </el-table>
    </CatDialog>
  </el-card>
</template>

<script setup lang="ts">
import A from './components/a.vue'
import B from './components/b.vue'
import C from './components/c.vue'
import D from './components/d.vue'
import { _insertVcUser } from '@/apis/account-system/access/user'
import { useSubUserCreateStore, useBaseStore } from '@/store'
import { message } from '@/utils/message'
import { handleCopyValue } from '@/utils/dom-utils'
import t from '@/utils/i18n'
import { backRoute } from '@/utils/router-jump'

const accessUserStore = useSubUserCreateStore()
const baseStore = useBaseStore()

const step = ref({
  active: 'a',
  steps: [
    { label: t('user.createStep1'), value: 'a' },
    { label: t('user.createStep2'), value: 'b' },
    { label: t('user.createStep3'), value: 'c' },
    { label: t('user.createStep4'), value: 'd' },
  ],
  type: accessUserStore.createUserType, // 类型
})

const loading = ref<boolean>(false) // create status

const dialog = reactive<{
  show: boolean
  detail: any
  showPassword: boolean
  showSecretKey: boolean
}>({
  show: false,
  detail: {},
  showPassword: false,
  showSecretKey: false,
})

const tips = computed(() => [
  {
    main: t('user.createSuccessTip'),
  },
])

// 返回
const back = () => {
  dialog.show = false
  backRoute()
}

// 更新Step
const changeStep = stepStatus => {
  console.log(`changeStep===>`, stepStatus)

  step.value.active = stepStatus
  accessUserStore.setStepActive(stepStatus)
}

// 选择Step类型
const selectStepType = type => {
  console.log(`selectStepType===>`, type)
  step.value.type = type

  // 可访问资源并接收消息
  if (type === 1) {
    step.value.steps = [
      { label: t('user.createStep1'), value: 'a' },
      { label: t('user.createStep2'), value: 'b' },
      { label: t('user.createStep3'), value: 'c' },
      { label: t('user.createStep4'), value: 'd' },
    ]
  } else {
    // 仅用于接收消息
    step.value.steps = [
      { label: t('user.createStep1'), value: 'a' },
      { label: t('user.createStep2'), value: 'b' },
    ]
  }
}

// 复制代码
const handleCopy = (detail: any) => {
  handleCopyValue(t('user.createSuccessCopy', [detail.userName, detail.password, detail.secretId, detail.secretKey]))
  message.success(t('domainSet2.copySuccess'))
}

// 创建
const create = async form => {
  console.log(`create===>`, form)
  try {
    loading.value = true
    const res = await _insertVcUser(form)

    if (res.success) {
      // 创建可访问资源并接收消息类型成功时展示弹窗
      if (step.value.type === 1) {
        dialog.show = true

        dialog.detail = {
          userName: res.data?.userName,
          password: form.password,
          secretId: res.data?.secretList.length ? res.data?.secretList[0].secretId : '',
          secretKey: res.data?.secretList.length ? res.data?.secretList[0].secretKey : '',
        }
      } else {
        // 仅用于接收消息
        message.success(t('role.createSuccess'))
        backRoute()
      }

      // 重置
      accessUserStore.clearAll()
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

onBeforeMount(() => {
  // baseStore.routeModel = '/user'
  // baseStore.selectedKeys = 'access_user_create'
})

onUnmounted(() => {
  // 重置
  accessUserStore.clearAll()
})
</script>

<style lang="scss" scoped>
.mt15 {
  margin-top: 15px;
}

.w50p {
  min-width: 50%;
}

.dialog {
  .desc {
    margin-bottom: 10px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #555;
  }
}
</style>
