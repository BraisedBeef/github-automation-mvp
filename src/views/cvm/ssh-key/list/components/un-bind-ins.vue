<template>
  <CatDialog
    v-model:dialog="show"
    :title="title"
    :width="dialogClass"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="() => {}"
    @open="open"
  >
    <el-table v-loading="loading" :data="list" class="mt20">
      <!-- ID/名称 -->
      <el-table-column min-width="200" :label="t('sshKey.unBindIns.idName')">
        <template #default="{ row }">
          <div class="text-primary">
            {{ row.insUuid }}
          </div>
          <div>{{ row.instanceName }}</div>
        </template>
      </el-table-column>
      <!-- 状态 -->
      <el-table-column min-width="200" :label="t('sshKey.unBindIns.state')">
        <template #default="{ row }">
          <div>{{ INS_STATE_MAP[row.state] }}</div>
        </template>
      </el-table-column>
      <!-- 主IP地址 -->
      <el-table-column min-width="200" :label="t('sshKey.unBindIns.mainPublicIp')">
        <template #default="{ row }">
          <div>{{ handleRowIp(row).mainPublicIp }}</div>
          <div>{{ handleRowIp(row).mainPrivateIp }}</div>
        </template>
      </el-table-column>
    </el-table>
  </CatDialog>
</template>

<script lang="ts" setup>
import { message } from '@/utils/message'
import t from '@/utils/i18n'
import { INS_STATE_MAP } from '@/views/cvm/ins/config'
import { isUnBindIns } from '@/views/cvm/ssh-key/config'
import { _unBindKeypair } from '@/apis/cvm/ssh-key'
import { useCvmStore } from '@/store'
import { useIns } from '@/views/cvm/hooks/use-ins'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const dialogMap = {
  [ja]: '840px',
  [en]: '900px',
  [zh]: '740px',
}

const dialogClass = useI18nStyle(dialogMap)

interface PropType {
  sshKey: any
  outside?: boolean // 是否为外界传入ins
  outsideList?: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  sshKey: () => ({}),
  outside: false,
  outsideList: () => [],
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const cvmStore = useCvmStore()
const { listInstance, loading } = useIns()

const insideList = ref<any[]>([]) // 列表
const comfirmLoading = ref<boolean>(false)
const show = ref<boolean>(false) // 弹窗显示

const list = computed(() => {
  return props.outside ? props.outsideList : insideList.value
})

const title = computed(() => {
  return t('sshKey.unBindIns.title', [props.sshKey.sshInsId])
})

// 主内ip地址
const handleRowIp = (row: any) => {
  console.log(`handleRowIp===>`, row)

  const networkInfos = row.networkInfos || []
  const res = networkInfos.find(el => el.primaryType === 1) // 主网卡
  const ipConfig: any = {}

  if (res) {
    ipConfig.mainPrivateIp = res.mainPrivateIp ? `${res.mainPrivateIp}${t('sshKey.unBindIns.inside')}` : ''
    ipConfig.mainPublicIp = res.mainPublicIp ? `${res.mainPublicIp}${t('sshKey.unBindIns.outside')}` : ''
  }

  return ipConfig
}

const confirmHandle = () => {
  bindKeypair()
}

// 弹窗打开
const open = () => {
  !props.outside && listInstanceFn()
}

// 分页查询服务器列表
const listInstanceFn = async () => {
  const params = {
    regionId: cvmStore.areaSelect.id,
    sshId: props.sshKey.id,
  }

  const cb = (res: any) => {
    if (res.success) {
      insideList.value = res.data?.list?.filter(el => isUnBindIns(el.state)) || []
    }
  }

  listInstance(params, cb)
}

// 解绑秘钥
const bindKeypair = async () => {
  comfirmLoading.value = true
  const serverIds = list.value.map(el => el.id)

  const params = {
    regionId: cvmStore.areaSelect.id, // 地域ID
    sshId: props.sshKey.id, // 秘钥ID
    serverIds, // 服务器ID
  }

  try {
    const res = await _unBindKeypair(params)

    console.log(`_bindKeypair===>`, res)

    if (res.success) {
      message.success(res.msg)
      show.value = false
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    comfirmLoading.value = false
  }
}

watch(
  () => cvmStore.areaSelect,
  () => {
    !props.outside && listInstanceFn()
  },
  {
    immediate: true,
  },
)

defineExpose({
  show,
})
</script>

<style lang="scss" scoped></style>
