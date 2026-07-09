<template>
  <el-card shadow="never" class="page-box" :body-style="bodyStyle">
    <!-- tip -->
    <Tip :text="tips" type="OneToOne" />

    <div class="df ac jsb">
      <el-button class="mb20" :type="selectList.length ? 'primary' : ''" @click="handleBatchEdit">
        {{ t('subscribe.batchEdit') }}
      </el-button>
      <!-- 暂时隐藏 -->
      <!-- <div class="search-wrap">
        <el-input v-model="condition" :placeholder="t('subscribe.searchPlaceholder')" :suffix-icon="Search" />
      </div> -->
    </div>
    <!-- 暂时隐藏 -->
    <!-- <div class="df ac">
      <span class="mr20">{{ t('subscribe.productServices') }}</span>
      <el-checkbox v-model="isSendMsg" :label="t('subscribe.isSendMsg')" size="large" />
    </div> -->

    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="list"
      show-overflow-tooltip
      row-key="id"
      :default-expand-all="true"
      @selection-change="handleRowSelectChange"
      @row-click="handleRowClick"
    >
      <el-table-column type="selection" width="40" />
      <!-- 消息类型 -->
      <el-table-column prop="productId" :label="t('subscribe.productId')">
        <template #default="{ row }">
          <!-- <span>{{ row.productId }}</span> -->
          <span>{{ row.messageTypeDesc }}</span>
        </template>
      </el-table-column>
      <!-- 接收渠道 -->
      <el-table-column prop="channels" :label="t('subscribe.receivingChannels')">
        <template #default="{ row }">
          <span v-if="!row.children">{{ row.channels ? row.channels.join('/') : '' }}</span>
        </template>
      </el-table-column>
      <!-- 消息接收人 -->
      <el-table-column prop="userNames" :label="t('subscribe.userName')">
        <template #default="{ row }">
          <!-- <span>{{ row.user?.email || row.user?.userName }}</span> -->
          <span v-if="!row.children">{{ row.userNames ? row.userNames.join(',') : '' }}</span>
        </template>
      </el-table-column>
      <!-- 暂时隐藏 -->
      <!-- 消息数量 -->
      <!-- <el-table-column :label="t('subscribe.messageCount')">
        <template #default="{ row }">
          <span v-if="typeof row.messageCount === 'number'" class="text-error">{{ row.messageCount }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column> -->
      <!-- 消息免打扰 -->
      <el-table-column :label="t('subscribe.notDisturb')">
        <template #default="{ row }">
          <span v-if="!row.children">
            {{ row.notDisturb == 1 ? t('common.start') : t('user.close') }}
          </span>
          <!-- <el-switch
            v-if="!row.children"
            :model-value="row.notDisturb == 1 ? true : false"
            @click="handleChangeSwitch(row)"
            class="ml-2"
            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
          /> -->
        </template>
      </el-table-column>
      <el-table-column :label="t('common.operation')">
        <template #default="{ row }">
          <span v-if="!row.children" class="text-primary cursor-pointer" @click="handleSingleEdit(row)">{{
            t('common.edit')
          }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- tg确认订阅 -->
    <CatDialog
      v-model:dialog="tgBindDialog.showConfirmBind"
      class="dialog"
      :title="t('subscribe.tgSet')"
      width="600px"
      destroy-on-close
      :loading="tgBindDialog.loading"
      @confirm="tgBindConfirmHandle"
    >
      <el-row class="text mb20">
        {{ t('subscribe.tgSetDesc') }}
      </el-row>
      <el-input v-model="tgBindDialog.targetUid" />
    </CatDialog>

    <!-- tg邮箱验证绑定成功 -->
    <CatDialog
      v-model:dialog="tgBindDialog.showEmailVerify"
      class="dialog"
      :title="t('role.hint')"
      width="600px"
      destroy-on-close
      :confirm-text="t('subscribe.know')"
      :no-cancel="true"
      @confirm="tgBindDialog.showEmailVerify = false"
    >
      <el-row class="text">
        {{ t('subscribe.tgBindSuccessDesc') }}
      </el-row>
    </CatDialog>

    <!-- 编辑 -->
    <ModifySubDialog
      ref="modifySubDialogRef"
      :type="editDialog.type"
      :not-disturb="editDialog.notDisturb"
      :list="editDialog.list"
      :channels="editDialog.channels"
      @success="getSubscribeManaList()"
    />
  </el-card>
</template>

<script setup lang="ts">
import { _getSubscribeManaList, _updateDisturb, _telegramBind } from '@/apis/account-system/news'
import { TelegramBindReq } from '@/apis/account-system/news/type'
import { message } from '@/utils/message'
import t from '@/utils/i18n'
import { useBaseStore, useUserStore } from '@/store'
import ModifySubDialog from './components/modify-sub-dialog.vue'

const baseStore = useBaseStore()
const userStore = useUserStore()
const route = useRoute()
const bodyStyle = { height: '100%' }
const condition = ref<string>('') // 查询条件
const isSendMsg = ref<boolean>(false) // 30天内发送过消息的产品
const list = ref<any[]>([]) // 消息列表
const loading = ref<boolean>(false)
const selectList = ref<any>([]) // 选中的消息
const editDialog = reactive<{
  type: string
  notDisturb: boolean
  list: any[]
  channels: string[]
}>({
  type: '', // 编辑方式 单个还是批量
  notDisturb: true, // 免打扰
  list: [], // 列表
  channels: [],
}) // 编辑弹窗

const tgBindDialog = reactive<{
  loading: boolean
  showConfirmBind: boolean
  showEmailVerify: boolean
  telegramId: string
  chatId: string
  targetUid: string
}>({
  loading: false,
  showConfirmBind: false, // 确认订阅
  showEmailVerify: false, // 邮箱验证绑定成功
  telegramId: '',
  chatId: '',
  targetUid: '', // 用户id
}) // tg绑定验证弹窗

const timeId = ref<any>(null) // 定时器

const tableRef = ref<any>(null)
const modifySubDialogRef = ref<InstanceType<typeof ModifySubDialog>>()

const tips = computed(() => [
  {
    main: t('subscribe.subscribeTip'),
  },
])

// 展开
const handleRowClick = row => {
  tableRef.value?.toggleRowExpansion(row)
}

// 显示产品订阅弹窗
const showDialog = (ins: any) => {
  if (!ins) return
  ins.show = true
}

// tg订阅确认
const tgBindConfirmHandle = () => {
  if (!tgBindDialog.targetUid) {
    return message.warning(t('subscribe.tgSetDesc'))
  }

  telegramBind({
    telegramId: tgBindDialog.telegramId,
    chatId: tgBindDialog.chatId,
    targetUid: tgBindDialog.targetUid,
  })
}

// 切换消息免打扰
const handleChangeSwitch = (row: any) => {
  console.log(`handleChangeSwitch===>`, row)

  const cb = () => {
    row.notDisturb = row.notDisturb == 1 ? 0 : 1
    row.notDisturb == 1
      ? message.success(t('subscribe.notDisturbOpen'))
      : message.success(t('subscribe.notDisturbClose'))
  }

  const uids = row.users?.map(el => el.uid) || []

  updateDisturb(
    {
      productId: row.productId,
      notDisturb: row.notDisturb == 1 ? 0 : 1,
      uids,
    },
    cb,
  )
}

// 点击编辑
const handleSingleEdit = (row: any) => {
  console.log(`row==>`, row)
  showDialog(modifySubDialogRef.value)
  editDialog.list = [row]
  editDialog.type = 'single'
  // 单个编辑需要联动列表状态
  editDialog.notDisturb = row.notDisturb == 1 ? true : false
  editDialog.channels = row.channels || []
}

// 点击批量编辑
const handleBatchEdit = () => {
  if (!selectList.value.length) {
    return message.warning(t('subscribe.productIdWarn'))
  }
  showDialog(modifySubDialogRef.value)
  editDialog.list = selectList.value.filter(el => !el.children)
  editDialog.type = 'batch'
  // 批量编辑 免打扰默认为关闭
  editDialog.notDisturb = false
  // 批量编辑 接收渠道默认为全部勾选
  editDialog.channels = ['TG', 'MAIL']
}

// 选中当前行/所有行
const handleRowSelectChange = (selection: any[]) => {
  console.log(`handleRowSelectChange===>`, selection)
  selectList.value = selection
}

// 消息免打扰设置
const updateDisturb = async (params: any, cb: () => void) => {
  try {
    const res = await _updateDisturb(params)
    console.log(`_updateDisturb===>`, res)
    if (res.success) {
      cb()
    }
  } catch (error) {
    console.log(error)
  }
}

// 获取列表
const getSubscribeManaList = async () => {
  try {
    loading.value = true
    const res = await _getSubscribeManaList({
      productId: condition.value,
      isSendMsg: isSendMsg.value,
    })
    console.log(`_getSubscribeManaList===>`, res)
    if (res.success) {
      // list.value = res.data || []
      const data = res.data || []

      // 组装数据 增加id属性 => row-key
      for (let i = 0; i < data.length; i++) {
        if (data[i].items?.length) {
          data[i].id = `${i}`
          for (let y = 0; y < data[i].items?.length; y++) {
            // console.log(`data[i].items[y]===>`, data[i].items[y])

            data[i].items[y].id = `${i}-${y}`
          }
        } else {
          console.log(`data[i].id===>`, data[i])
          data[i].id = `${i}`
        }
      }

      list.value = data
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 账户绑定Tg
const telegramBind = async (telegramBind: TelegramBindReq) => {
  try {
    tgBindDialog.loading = true
    const res = await _telegramBind(telegramBind)
    console.log(`_updateProductSubscribe===>`, res)
    if (res.success) {
      tgBindDialog.showConfirmBind = false
      tgBindDialog.showEmailVerify = true
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    tgBindDialog.loading = false
  }
}

// 30天内发送过消息的产品
watch(isSendMsg, () => {
  getSubscribeManaList()
})

// 条件
watch(condition, () => {
  getSubscribeManaList()
})

// userinfo
watch(
  () => userStore.user,
  value => {
    if (value?.tgAccount) {
      // tgBindDialog.showConfirmBind = false
      // tgBindDialog.showEmailVerify = false
    }
  },
)

onBeforeMount(() => {
  // baseStore.routeModel = '/user'
  // baseStore.selectedKeys = 'news_subscribe'
})

onMounted(() => {
  getSubscribeManaList()

  // tg弹窗
  // tgBindDialog.targetUid = userStore.user.id
  const telegramId = route.query.telegramId as string
  const chatId = route.query.chatId as string

  console.log(`telegramId chatId===>`, telegramId, chatId)

  if (telegramId && chatId) {
    // 判断当前登录用户的tgAccount,tgChatId是否和外链tgAccount,tgChatId相等
    if (telegramId !== userStore.user.tgChatId && chatId !== userStore.user.tgAccount) {
      tgBindDialog.telegramId = telegramId
      tgBindDialog.chatId = chatId
      tgBindDialog.showConfirmBind = true

      // 轮询
      // timeId.value = setInterval(() => {
      //   userStore.getUser()
      // }, 3 * 1000)
    } else {
      //
    }
  }
})

onBeforeUnmount(() => {
  clearInterval(timeId.value)
})
</script>

<style lang="scss" scoped>
.search-wrap {
  width: 360px;
}
</style>
