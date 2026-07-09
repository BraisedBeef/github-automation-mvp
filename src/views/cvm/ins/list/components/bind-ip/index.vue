<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('publicIp.bindPublicIp')"
    :width="dialogClass"
    :loading="state.comfirmLoading"
    :disabled="!state.checked"
    @confirm="confirmHandle"
    @open="open"
    @close="closeFn"
  >
    <div>
      <div class="info-wrap df">
        <div class="info-wrap-left">
          <div class="item mb20">
            <div class="key">
              {{ t('publicIp.ins') }}
            </div>
          </div>
          <div class="item mb20">
            <div class="key h34">
              {{ t('publicIp.selectNetworkCard') }}
            </div>
          </div>
          <div class="item">
            <div class="key">
              {{ t('publicIp.selectPublicIp') }}
            </div>
          </div>
        </div>
        <div class="info-wrap-right">
          <!-- 实例 -->
          <div class="item mb20">
            <div class="value">
              {{ insDetail?.instanceName || '' }}
            </div>
          </div>
          <!-- 选择网卡 -->
          <div class="item mb20">
            <div class="value">
              <el-select
                v-model="state.networkCard"
                :style="selectClass"
                class="select-opts mr20"
                :placeholder="t('publicIp.placeSelect')"
                @change="getQueryInsBindEipList"
              >
                <el-option v-for="item in state.options" :key="item.eniId" :label="item.label" :value="item.eniId">
                  <div class="df ac opt-wrap w-full h-full">
                    <div>{{ item.label }}</div>
                  </div>
                </el-option>
              </el-select>
              <span class="text-primary cursor-pointer" @click="goNetworkCard">{{
                t('publicIp.createNewNetworkCard')
              }}</span>
            </div>
          </div>
          <!-- 选择弹性公网IP -->
          <div class="item">
            <span class="value text-primary cursor-pointer" @click="goPublicIp">{{ t('publicIp.viewPublicIp') }}</span>
          </div>
        </div>
      </div>

      <div class="search-wrap mt20">
        <el-input v-model="state.condition" :placeholder="t('publicIp.searchPublicIp')" @keyup.enter="screenToEip">
          <template #suffix>
            <SvgIcon name="dns-search" class="cursor-pointer" @click="screenToEip" />
          </template>
        </el-input>
      </div>
      <el-radio-group v-model="state.checked" class="table-radio">
        <el-table v-loading="state.loading" :data="state.list" class="mt20 table">
          <!-- 弹性公网IP -->
          <el-table-column min-width="100" :label="t('publicIp.publicIp')">
            <template #default="{ row }">
              <el-radio :label="row.eipId">
                <Copy :text="row.eip" />
              </el-radio>
            </template>
          </el-table-column>
          <!-- 类型 -->
          <el-table-column min-width="100" :label="t('publicIp.type')">
            <template #default="{ row }">
              <div>{{ lineTypeList.find(item => item.value === row.lineType)?.label }}</div>
            </template>
          </el-table-column>
          <!-- 状态 -->
          <el-table-column min-width="100" :label="t('publicIp.state')">
            <template #default="{ row }">
              <div>{{ typeList.find(item => item.value === row.state)?.label }}</div>
            </template>
          </el-table-column>
          <!-- 带宽名称 -->
          <el-table-column min-width="100" :label="t('publicIp.bandwidthName')">
            <template #default="{ row }">
              <span>{{ row.name }}</span>
            </template>
          </el-table-column>
          <!-- 带宽类型   后端没有这个字段 -->
          <!-- <el-table-column min-width="200" :label="t('带宽类型')">
            <template #default="{ row }">
              <div></div>
            </template>
          </el-table-column> -->
          <!-- 带宽大小 -->
          <el-table-column min-width="100" :label="t('publicIp.bandwidthSize')">
            <template #default="{ row }">
              <div>{{ row.size }}Mbit/s</div>
            </template>
          </el-table-column>
        </el-table>
      </el-radio-group>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { lineTypeList, typeList } from '@/views/network/public-ip/list/config'
import { queryInsBindEipList, associateEip } from '@/apis/network/public-ip'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const dialogMap = {
  [ja]: '1180px',
  [en]: '1080px',
  [zh]: '950px',
}
const selectMap = {
  [ja]: { width: '510px' },
  [en]: { width: '580px' },
  [zh]: { width: '580px' },
}

const dialogClass = useI18nStyle(dialogMap)
const selectClass = useI18nStyle(selectMap)

interface PropType {
  insDetail: any
}

const props = withDefaults(defineProps<PropType>(), {})

const emits = defineEmits<{
  (event: 'success'): void
}>()

const router = useRouter()

const show = ref<boolean>(false) // 弹窗显示

const state = reactive<{
  comfirmLoading: boolean
  options: any[] // 弹性网卡列表
  networkCard: number | string // 已选择的弹性网卡
  loading: boolean // 弹性公网ip列表loading
  list: any[] // 弹性公网ip列表
  checked: number // 已选择的弹性公网ip
  condition: string // 弹性公网ip查询条件
}>({
  comfirmLoading: false,
  options: [],
  networkCard: '',
  loading: false,
  list: [],
  checked: NaN,
  condition: '',
})

// 搜索弹性公网ip
const screenToEip = () => {
  getQueryInsBindEipList()
}

// 获取弹性公网ip列表
const getQueryInsBindEipList = async () => {
  const params = { eniId: state.networkCard, pageIndex: 1, pageSize: 999, ip: state.condition || '' }
  state.loading = true
  try {
    const res = await queryInsBindEipList(params)
    if (res.success) {
      state.list = res.data?.list || []
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    state.loading = false
  }
}

// 跳转弹性网卡
const goNetworkCard = () => {
  const url = router.resolve({
    name: 'network_security_network_card_list',
  })
  window.open(url.href, '_blank')
}

// 跳转弹性公网ip
const goPublicIp = () => {
  const url = router.resolve({
    name: 'network_security_public_ip_list',
  })
  window.open(url.href, '_blank')
}

const confirmHandle = async () => {
  const params = {
    eipId: state.checked,
    eniId: state.networkCard,
    instanceType: 2,
  }
  state.comfirmLoading = true
  try {
    const res = await associateEip(params)
    if (res.success) {
      message.success(t('publicIp.bindPublicIpSuccess'))
      // 因上游同步数据有延迟，延迟刷新
      setTimeout(() => {
        closeFn()
        emits('success')
      }, 1500)
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    setTimeout(() => {
      state.comfirmLoading = false
    }, 1500)
  }
}
// 弹窗打开
const open = () => {
  console.log(props, 'props')
  // state.options = (props.insDetail?.networkInfos || [])
  //   .filter(item => item.primaryType === 2)
  //   .map(item => ({
  //     ...item,
  //     label: `${item.eniId}(${item.eniName})(${t('publicIp.expandNetworkCard')})`,
  //   }))
  // if (state.options.length) {
  //   state.networkCard = state.options[0].eniId
  //   getQueryInsBindEipList()
  // }

  state.options = (props.insDetail?.networkInfos || []).map(item => ({
    ...item,
    label: `${item.eniUuid}(${item.eniName})(${item.primaryType === 1 ? t('networkCard.mainNetworkCard') : t('publicIp.expandNetworkCard')})`,
  }))
  if (state.options.length) {
    state.networkCard = state.options[0].eniId
    getQueryInsBindEipList()
  }
}

const closeFn = () => {
  state.comfirmLoading = false
  state.options = []
  state.networkCard = ''
  state.loading = false
  state.list = []
  state.checked = NaN
  state.condition = ''
  show.value = false
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.info-wrap {
  .info-wrap-left {
    margin-right: 20px;
  }
}

.opt-wrap {
  padding: 0 8px;

  &:hover {
    color: #0063ff;
    background: #f1f7ff;
  }
}

.table-radio {
  width: 100%;
}

.h34 {
  height: 34px;
}
</style>
