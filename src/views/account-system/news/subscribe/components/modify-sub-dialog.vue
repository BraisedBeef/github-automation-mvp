<template>
  <!-- 订阅编辑 -->
  <CatDialog
    v-model:dialog="show"
    class="dialog"
    :title="t('subscribe.subscribeEdit')"
    width="940px"
    destroy-on-close
    :confirm-text="t('common.submit')"
    :loading="editDialog.loading"
    @confirm="confirmHandle"
    @update:dialog="closeHandle"
    @open="open"
  >
    <div class="info">
      <!-- 产品名称 -->
      <div class="item mb20 df">
        <div class="key-wrap" :class="labelWidthClass">
          {{ t('subscribe.productId') }}
        </div>
        <div class="value-wrap">
          <!-- <span
              v-for="(item, index) in productIds"
              :key="index"
              class="value mr20"
              style="color: var(--primary-text)"
              >{{ item }}</span
            > -->
          {{ productIds.join('，') }}
        </div>
      </div>
      <!-- 接收模式 -->
      <div class="item mb20 df">
        <div class="key-wrap" :class="labelWidthClass">
          {{ t('subscribe.receivingMode') }}
        </div>
        <div class="value-wrap">
          <div class="mb20">
            <el-switch
              v-model="editDialog.notDisturb"
              class="ml-2"
              style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
            />
            <span style="margin-left: 10px">{{ t('subscribe.notDisturbCheck') }}</span>
          </div>
          <p style="width: 485px">
            {{ t('subscribe.notDisturbDesc') }}
          </p>
        </div>
      </div>
      <!-- 接收渠道 -->
      <div class="item df ac" :class="editDialog.channels.includes('TG') ? 'mb10' : 'mb20'">
        <div class="key-wrap" :class="labelWidthClass">
          {{ t('subscribe.receivingChannels') }}
        </div>
        <div class="value">
          <el-checkbox-group v-model="editDialog.channels">
            <el-checkbox :label="'MAIL'" style="margin-right: 40px">
              {{ RECEIVING_CHANNELS_MAP['MAIL'] }}
            </el-checkbox>
            <el-checkbox :label="'TG'">
              {{ RECEIVING_CHANNELS_MAP['TG'] }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div v-if="editDialog.channels.includes('TG')" class="item df mb20 ac">
        <div class="key-wrap" :class="labelWidthClass" />
        <div class="value">
          <span class="text-primary cursor-pointer df ac" @click="pushRoute({ name: 'access_user_list' })"
            >{{ t('subscribe.modifyUser') }}
            <SvgIcon style="margin-left: 4px" name="share" />
          </span>
        </div>
      </div>
      <!-- 消息接收人 -->
      <div class="item mb20 df ac jsb">
        <div class="key-wrap" :class="labelWidthClass">
          {{ t('user.messageRecipient') }}
        </div>
        <span class="value">{{ t('subscribe.selectUser', [editDialog.selectUserList.length]) }}</span>
      </div>
    </div>
    <el-table
      ref="tableRef"
      max-height="400"
      :data="users"
      class="mt20 table"
      show-overflow-tooltip
      @selection-change="v => (editDialog.selectUserList = v)"
    >
      <el-table-column type="selection" width="40" />
      <!-- 用户名 -->
      <el-table-column prop="userName" :label="t('user.userName')">
        <template #default="{ row }">
          {{ row.userName || '-' }}
        </template>
      </el-table-column>
      <!-- 用户类型 -->
      <el-table-column prop="accountType" :label="t('user.accountType')">
        <template #default="{ row }">
          <span v-if="row.accountType == 1">{{ t('overview.mainUser') }}</span>
          <span v-if="row.userType == 1">{{ t('overview.subUser') }}</span>
          <span v-if="row.userType == 2">{{ t('user.messageRecipient') }}</span>
        </template>
      </el-table-column>
      <!-- 手机号码 -->
      <el-table-column prop="mobile" :label="t('subscribe.phone')">
        <template #default="{ row }">
          <span v-if="row.mobil">{{ row.mobil }}</span
          ><span v-else class="text-error">{{ t('subscribe.noSet') }}</span>
        </template>
      </el-table-column>
      <!-- 邮箱 -->
      <el-table-column prop="email" :label="t('user.email')">
        <template #default="{ row }">
          <span v-if="row.contactEmail">{{ row.contactEmail }}</span
          ><span v-else class="text-error">{{ t('subscribe.noSet') }}</span>
        </template>
      </el-table-column>
    </el-table>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { RECEIVING_CHANNELS_MAP } from '@/views/account-system/config'
import { _updateProductSubscribe, _updateBatchProductSubscribe } from '@/apis/account-system/news'
import { _getUserList } from '@/apis/account-system/access/user'

import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { pushRoute } from '@/utils/router-jump'

const props = withDefaults(
  defineProps<{
    type: string // 单个编辑和批量编辑
    notDisturb: boolean
    list: any[] // 用户列表=>区分的单个编辑和批量编辑
    channels: string[] //
  }>(),
  { type: 'single', notDisturb: false, list: () => [], channels: () => [] },
)

const emits = defineEmits<{
  (event: 'success'): void
}>()

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const labelWidthClassMap = {
  [ja]: 'key-wrap-w160px',
  [en]: 'key-wrap-w160px',
  [zh]: 'key-wrap-w110px',
}

const labelWidthClass = useI18nStyle(labelWidthClassMap)

const show = ref<boolean>(false) // 弹窗显示
const allUserList = ref<any[]>([]) // 所有的用户列表
const editDialog = reactive<{
  type: string
  loading: boolean
  notDisturb: boolean
  list: any[]
  selectUserList: any[]
  channels: any[]
}>({
  type: '', // 编辑方式 单个还是批量
  loading: false,
  notDisturb: false, // 免打扰
  list: [], // 列表
  selectUserList: [], // 选择的用户列表
  channels: [],
}) // 编辑弹窗

const tableRef = ref<any>(null) // table

const open = () => {
  editDialog.notDisturb = props.notDisturb
  editDialog.channels = props.channels

  nextTick(() => {
    // 单个编辑时默认勾选已订阅的用户
    if (props.type === 'single') {
      //table勾选
      users.value.forEach(row => {
        if (row.subscribe) {
          tableRef.value?.toggleRowSelection(row)
        }
      })
    }
  })
}

// 编辑弹窗的产品名称
const productIds = computed(() => {
  const all = props.list.map(el => el.messageTypeDesc)
  // 去重
  return all.filter((item, index) => all.indexOf(item) === index)
})

// 编辑弹窗的消息接收人
const users = computed(() => {
  if (props.type === 'single') {
    // 数据类型:[{users: [{}]}， {users: [{}]}] => [[],[]]
    const list: any[] = props.list.filter(el => el.users.length).map(el => el.users) // 为二维数组
    console.log(`list===>`, list)
    const all: any[] = []
    for (let i = 0; i < list.length; i++) {
      console.log(`list[i]===>`, list[i])
      for (let x = 0; x < list[i].length; x++) {
        console.log(`list[i][x]===>`, list[i][x])

        all.push(list[i][x])
      }
    }

    console.log(`all===>`, all)

    // 去重
    const uniqueArray = all.reduce((acc, currentValue) => {
      // 检查当前元素的 "uid" 是否已经存在于 acc 中
      const isIdExists = acc.some(item => item.uid === currentValue.uid)
      if (!isIdExists) {
        acc.push(currentValue)
      }
      return acc
    }, [])

    return uniqueArray
  } else {
    return allUserList.value
  }
})

const confirmHandle = () => {
  if (!editDialog.selectUserList.length) {
    return message.warning(t('subscribe.userNameWarn'))
  }
  props.type === 'single' ? updateProductSubscribe() : updateBatchProductSubscribe()
}

const closeHandle = () => {}

// 单个编辑订阅设置
const updateProductSubscribe = async () => {
  const notDisturb = editDialog.notDisturb ? 1 : 0
  const receivingChannels = editDialog.channels.toString()
  const uids = editDialog.selectUserList.map(el => el.uid)
  const subMessageType = props.list[0].messageType

  console.log(`updateProductSubscribe===>`, {
    notDisturb,
    receivingChannels,
    uids,
    subMessageType,
  })

  try {
    editDialog.loading = true
    const res = await _updateProductSubscribe({
      notDisturb,
      receivingChannels,
      uids,
      subMessageType,
    })
    console.log(`_updateProductSubscribe===>`, res)
    if (res.success) {
      show.value = false
      message.success(t('user.subscribeSuccess'))
      emits('success')
    } else {
      message.warning(t('user.subscribeFail'))
    }
  } catch (error) {
    console.log(error)
  } finally {
    editDialog.loading = false
  }
}

// 批量编辑订阅设置
const updateBatchProductSubscribe = async () => {
  const notDisturb = editDialog.notDisturb ? 1 : 0
  const receivingChannels = editDialog.channels.toString()
  const uids = editDialog.selectUserList.map(el => el.id)
  const subMessageTypes = props.list.map(el => el.messageType)

  console.log(`updateBatchProductSubscribe===>`, {
    notDisturb,
    receivingChannels,
    uids,
    subMessageTypes,
  })

  try {
    editDialog.loading = true
    const res = await _updateBatchProductSubscribe({
      notDisturb,
      receivingChannels,
      uids,
      subMessageTypes,
    })
    console.log(`_updateBatchProductSubscribe===>`, res)
    if (res.success) {
      show.value = false
      message.success(t('user.subscribeSuccess'))
      emits('success')
    } else {
      message.warning(t('user.subscribeFail'))
    }
  } catch (error) {
    console.log(error)
  } finally {
    editDialog.loading = false
  }
}

// 获取用户列表
const getUserList = async () => {
  try {
    const res = await _getUserList({
      pageIndex: 1,
      pageSize: 999,
      condition: '',
    })

    console.log(`_getStrategyList===>`, res)

    if (res.success) {
      allUserList.value = res.data?.list || []
    }
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  getUserList()
})

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.dialog {
  .info {
    .key-wrap {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: var(--common-text);
    }

    .key-wrap-w110px {
      flex-shrink: 0;
      width: 110px;
    }

    .key-wrap-w160px {
      flex-shrink: 0;
      width: 160px;
    }

    .value {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: var(--common-text);
    }
  }
}
</style>
