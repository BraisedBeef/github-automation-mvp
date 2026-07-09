<template>
  <CatDialog
    v-model:dialog="show"
    :loading="loadingBtn"
    :title="t('user.subscribeMsg')"
    width="960px"
    destroy-on-close
    @confirm="confirmHandle"
    @update:dialog="closeHandle"
    @open="open"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToOne" />

    <el-row class="mb20">
      <el-col :span="24" class="df mb20">
        <div :class="labelWidthClass">
          <span class="common-text">{{ t('user.messageRecipient') }}</span>
        </div>
        <div>
          <span class="primary-text">{{ recipient }}</span>
        </div>
      </el-col>

      <el-col :span="24" class="df mb20">
        <!-- 安全邮箱 -->
        <div class="w-full df ac">
          <div class="df ac" style="margin-right: 40px">
            <div :class="labelWidthClass">
              <span class="common-text">{{ t('securitySetting.secureEmail') }}</span>
            </div>
            <div>
              <span class="primary-text">{{ contactEmail || '-' }}</span>
            </div>
          </div>
          <!-- tg绑定 -->
          <div class="df ac">
            <span class="mr4 common-text">Telegram</span>
            <div v-if="tgBing">
              <span class="mr20 common-text">{{ t('user.bind') }}</span>
              <span class="text-primary cursor-pointer" @click="showUnbind = true">{{ t('user.deleteBind') }}</span>
            </div>
            <div v-else>
              <span class="mr20 common-text">{{ t('user.noBind') }}</span>
              <span class="text-primary cursor-pointer" @click="showBind = true">{{ t('user.goBind') }}</span>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="24" class="df mb20">
        <div :class="labelWidthClass">
          <span class="common-text">{{ t('user.subscribeMsgType') }}</span>
        </div>

        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="list"
          show-overflow-tooltip
          row-key="id"
          :reserve-selection="false"
          max-height="600px"
          @selection-change="handleRowSelectChange"
          @expand-change="handleTableExpandChange"
        >
          <!-- max-height="" -->
          <el-table-column type="selection" width="40" />
          <!-- 消息类型 -->
          <el-table-column :label="t('user.msgTypes')">
            <template #default="{ row }">
              <span>{{ row.messageTypeDesc }}</span>
            </template>
          </el-table-column>
          <!-- 邮件 -->
          <el-table-column :label="t('user.mail')">
            <template #default="{ row }">
              <SvgIcon v-if="row.channels.includes('MAIL')" style="width: 14px; height: 14px" name="success" />
            </template>
          </el-table-column>
          <!-- tg -->
          <el-table-column label="Telegram">
            <template #default="{ row }">
              <SvgIcon v-if="row.channels.includes('TG')" style="width: 14px; height: 14px" name="success" />
            </template>
          </el-table-column>
          <el-table-column :label="t('common.operation')">
            <template #default="{ row }">
              <span v-if="row.children" class="text-primary cursor-pointer" @click="handleExpandChange(row)">
                {{ expandList[row.id] ? t('user.closeKeep') : t('user.expand') }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </CatDialog>

  <!-- 绑定tg -->
  <CatDialog
    v-model:dialog="showBind"
    :title="t('user.bindTg')"
    width="600px"
    destroy-on-close
    class="access-dialog"
    :confirm-text="t('subscribe.bind')"
    @confirm="bingTgConfirm"
  >
    <div class="common-text mr20 mb10">
      {{ t('user.bindTgDesc1') }}
    </div>
    <div class="common-text mr20 df ac">
      <span>{{ t('user.bindTgDesc2') }}{{ tgBotName }}</span>
      <SvgIcon name="copy" @click="handleCopy(tgBotName)" />
    </div>
  </CatDialog>

  <!-- 解绑tg -->
  <CatDialog
    v-model:dialog="showUnbind"
    :title="t('role.hint')"
    width="600px"
    destroy-on-close
    class="access-dialog"
    :loading="loadingUnBind"
    @confirm="unBingTgConfirm"
  >
    <div class="common-text mr20 mb10">
      {{ t('user.unbindTgDesc1') }}
    </div>
    <div class="common-text mr20">
      {{ t('user.unbindTgDesc2') }}
    </div>
  </CatDialog>
</template>

<script lang="ts" setup>
import { message } from '@/utils/message'
import { _getUserSubscribeList, _updateUserSubscribe } from '@/apis/account-system/access/user'
import { _telegramUnbind } from '@/apis/account-system/news'
import t from '@/utils/i18n'
import { handleCopyValue } from '@/utils/dom-utils'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { tgBotUrl, tgBotName } from '@/config/base-config'

const props = withDefaults(
  defineProps<{
    recipient: string
    contactEmail: string
    tgBing: boolean
  }>(),
  {
    recipient: '',
    contactEmail: '',
    tgBing: false,
  },
)

const emits = defineEmits<{
  (event: 'updateDetail'): void
}>()

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const labelWidthClassMap = {
  [ja]: 'w160px',
  [en]: 'w180px',
  [zh]: 'w120px',
}

const labelWidthClass = useI18nStyle(labelWidthClassMap)

const route = useRoute()

const loading = ref<boolean>(false)
const loadingBtn = ref<boolean>(false)
const loadingUnBind = ref<boolean>(false)
const show = ref<boolean>(false) // 订阅消息弹窗显示
const showBind = ref<boolean>(false) // 绑定tg弹窗显示
const showUnbind = ref<boolean>(false) // 解绑tg弹窗显示
const tableRef = ref<any>(null) // 父类table
const list = ref<any[]>([]) // 列表
const subscribes = ref<any[]>([]) // 订阅的消息
const expandList = ref<any>({}) // 展开情况
const isCustomExpand = ref<boolean>(false) // 是否是自定义展开表格

const tips = computed(() => [
  {
    main: t('user.subscribeMsgTip'),
  },
])

// tg解绑确认
const unBingTgConfirm = () => {
  telegramUnbind()
}

// tg绑定确认
const bingTgConfirm = () => {
  window.open(tgBotUrl)
  showBind.value = false
}

// 复制
const handleCopy = async (v: string) => {
  await handleCopyValue(v)
  message.success(t('domainSet2.copySuccess'))
}

const confirmHandle = () => {
  updateUserSubscribe()
}

const closeHandle = () => {
  expandList.value = {}
}

// 表格展开/收起事件
const handleTableExpandChange = (row: any) => {
  // console.log(`handleTableExpandChange===>`, row, row.id)

  // 只有子消息时才能展开
  const key = row.id
  if (!isCustomExpand.value) {
    expandList.value[key] = !expandList.value[key]
  }
}

// 点击展开/收起
const handleExpandChange = (row: any) => {
  // console.log(`handleExpandChange===>`, row, row.id)
  // 只有子消息时才能展开
  const key = row.id
  isCustomExpand.value = true
  tableRef.value?.toggleRowExpansion(row)
  expandList.value[key] = !expandList.value[key]
  isCustomExpand.value = false
}

// 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  // console.log(`handleRowSelectChange===>`, selection)

  // 有订阅
  if (selection.length) {
    // 订阅的所有子消息
    const childrenList = selection.filter(el => el.id.includes('-'))
    console.log(`childrenList==>`, childrenList)
    // 订阅的子消息所属类型 => parentMessageType
    const messageTypeList = childrenList.map(item => item.parentMessageType)
    console.log(`messageTypeList==>`, messageTypeList)
    // 订阅消息数据处理
    subscribes.value = list.value
      .filter(item => messageTypeList.includes(item.messageType) && item.children.length)
      .map(item => {
        item = _deepCopyObject(item)
        const children = item.children.filter(el => {
          if (childrenList.find(child => child.id === el.id)) {
            el.subscribe = true
            return el
          }
        })
        console.log(`children===>`, children)
        item.subscribe = true
        item.children = children
        return item
      })
  } else {
    // 无订阅
    subscribes.value = []
  }

  console.log(`subscribes===>`, subscribes.value)
}

// TG解绑
const telegramUnbind = async () => {
  try {
    loadingUnBind.value = true
    const res = await _telegramUnbind({
      targetUid: route.params.id as string,
    })

    if (res.success) {
      show.value = false
      showUnbind.value = false
      message.success(t('user.bindSuccess'))
      emits('updateDetail')
    } else {
      message.warning(t('user.bindFail'))
    }
  } catch (error) {
    console.log(error)
  } finally {
    loadingUnBind.value = false
  }
}

// 更新消息订阅
const updateUserSubscribe = async () => {
  try {
    loadingBtn.value = true
    const res = await _updateUserSubscribe({
      targetUserId: route.params.id as string,
      subscribes: subscribes.value,
    })

    if (res.success) {
      show.value = false
      message.success(t('user.subscribeSuccess'))
      getUserSubscribeList()
    } else {
      message.warning(t('user.subscribeFail'))
    }
  } catch (error) {
    console.log(error)
  } finally {
    loadingBtn.value = false
  }
}

// 深拷贝数组
const _deepCopyArray = (arr: any[]) => {
  if (!Array.isArray(arr)) {
    return arr
  }

  let copiedArray: any[] = []

  for (let item of arr) {
    if (typeof item === 'object' && item !== null) {
      if (Array.isArray(item)) {
        copiedArray.push(_deepCopyArray(item)) // 如果是数组，进行递归深拷贝
      } else {
        copiedArray.push(_deepCopyObject(item)) // 如果是对象，调用深拷贝对象函数
      }
    } else {
      copiedArray.push(item)
    }
  }

  return copiedArray
}

// 深拷贝对象
const _deepCopyObject = (obj: any) => {
  let copiedObject = {}

  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        copiedObject[key] = _deepCopyArray(obj[key]) // 对象属性递归深拷贝
      } else {
        copiedObject[key] = obj[key]
      }
    }
  }

  return copiedObject
}

// 订阅消息列表
const getUserSubscribeList = async () => {
  try {
    loading.value = true
    const res = await _getUserSubscribeList({
      targetUserId: Number(route.params.id) as number,
    })
    console.log(`_getUserSubscribeList===>`, res)
    if (res.success) {
      const data = res.data || []
      const expands: any = {}

      // 组装数据 增加id属性 => row-key
      for (let i = 0; i < data.length; i++) {
        if (data[i].children?.length) {
          data[i].id = `${i}`
          for (let y = 0; y < data[i].children?.length; y++) {
            // console.log(`data[i].children[y]===>`, data[i].children[y])

            data[i].children[y].id = `${i}-${y}`
            expands[`${i}-${y}`] = false
            data[i].children[y].parentMessageType = data[i].messageType
          }
        } else {
          console.log(`data[i].id===>`, data[i])
          data[i].id = `${i}`
          expands[`${i}`] = false
        }
      }
      list.value = data
      expandList.value = expands
      console.log(`data===>`, data, _deepCopyArray(data))

      // subscribes.value = _deepCopyArray(data)

      nextTick(() => {
        //table勾选
        list.value.forEach(row => {
          if (row.subscribe) {
            tableRef.value?.toggleRowSelection(row)
          }
        })
      })
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const open = () => {
  getUserSubscribeList()
}

onMounted(() => {
  getUserSubscribeList()
})

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.primary-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--primary-text);
}

.common-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--common-text);
}

.w120px {
  flex-shrink: 0;
  width: 120px;
}

.w160px {
  flex-shrink: 0;
  width: 160px;
}

.w180px {
  flex-shrink: 0;
  width: 180px;
}
</style>
