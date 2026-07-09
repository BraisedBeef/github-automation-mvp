<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('publicIp.unbindPublicIp')"
    width="760px"
    :loading="state.comfirmLoading"
    :disabled="!state.checked"
    @confirm="confirmHandle"
    @update:dialog="() => {}"
    @open="open"
    @close="closeFn"
    @cancel="cancelFn"
  >
    <!-- <p class="df ac jsb mb20">
      <span class="comfirm-text">确认解绑<span class="text-primary">{{ insDetail.id }}</span>{{ insDetail.instanceName }}的弹性公网IP？</span>
    </p> -->
    <div v-if="state.key === 1">
      <div class="comfirm-text mb20">
        {{ t('publicIp.placeSelectUnbindPublicIp') }}
      </div>
      <el-radio-group v-model="state.checked" class="table-radio">
        <el-table :data="state.list" class="mb20">
          <!-- 弹性公网IP -->
          <el-table-column min-width="200" :label="t('publicIp.publicIp')">
            <template #default="{ row }">
              <el-radio :label="row.eipId" @change="changeRadio">
                <Copy :text="row.publicIp" />
              </el-radio>
            </template>
          </el-table-column>
          <!-- 带宽大小 -->
          <el-table-column min-width="150" :label="t('publicIp.bandwidthSize')">
            <template #default="{ row }">
              <div>{{ row.bandwidth }}Mbit/s</div>
            </template>
          </el-table-column>
          <!-- 已绑定网卡 -->
          <el-table-column min-width="330" :label="t('publicIp.alreadyBIndNetworkCard')">
            <template #default="{ row }">
              <div class="primary-text">
                {{ row.eniUuid }}
              </div>
              <div>{{ row.eniName }}</div>
            </template>
          </el-table-column>
        </el-table>
      </el-radio-group>
    </div>
    <div v-else class="desc-wrap">
      <div class="item df ac mb20">
        <div class="key">
          {{ t('publicIp.publicIp') }}
        </div>
        <div class="value">
          <Copy :text="state.selectItem?.publicIp" />
        </div>
      </div>
      <div class="item df ac mb20">
        <div class="key">
          {{ t('publicIp.insId') }}
        </div>
        <div class="value">
          <Copy :text="insDetail.insUuid" />
        </div>
      </div>
    </div>
    <!-- tip -->
    <Tip :text="tips" type="OneToOne" hide-margin-bottom />
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { disassociateEip } from '@/apis/network/public-ip'

// ----------------------- 9月12号跟产品确认 需要选择要解绑的弹性公网ip 如果只有一个（主网卡上的）就直接默认选中 --------------------------

interface PropType {
  insDetail: any
}

const props = withDefaults(defineProps<PropType>(), {})

const emits = defineEmits<{
  (event: 'success'): void
}>()

const tips = computed(() => [
  {
    main: t('publicIp.unbindPublicIpMsg'),
  },
])

const show = ref<boolean>(false) // 弹窗显示

const state = reactive<{
  comfirmLoading: boolean
  list: any[]
  checked: number
  selectItem: any
  key: number
}>({
  comfirmLoading: false,
  list: [],
  checked: NaN,
  selectItem: {},
  key: 1,
})

const changeRadio = val => {
  state.selectItem = state.list.find(item => item.eipId === val)
}

const confirmHandle = async () => {
  if (!state.checked) return message.warning(t('publicIp.placeSelectUnbindPublicIp'))
  if (state.key === 1) {
    state.key = 2
  } else {
    const params = { eipId: state.checked }
    state.comfirmLoading = true
    try {
      const res = await disassociateEip(params)
      if (res.success) {
        message.success(t('publicIp.unbindPublicIpSuccess'))
        // 因上游同步数据有延迟，延迟刷新
        setTimeout(() => {
          initFn()
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
}
// 弹窗打开
const open = () => {
  console.log(props.insDetail, 'props.insDetail')
  ;(props.insDetail?.networkInfos || []).forEach(item => {
    const list = (item?.eips || []).map(val => ({
      ...val,
      eniId: item.eniId,
      eniName: item.eniName,
      eniUuid: item.eniUuid,
      mainPrivateIp: item.mainPrivateIp,
    }))
    state.list = state.list.concat(list)?.filter(i => i.eipId)
  })
  if (state.list.length === 1) {
    state.checked = state.list[0].eipId
    state.selectItem = state.list[0]
  }
}

const initFn = () => {
  state.key = 1
  state.comfirmLoading = false
  state.list = []
  state.checked = NaN
  state.selectItem = {}
  show.value = false
}

const cancelFn = () => {
  closeFn(true)
}

const closeFn = key => {
  if (state.key === 1 || key) {
    initFn()
  } else {
    state.key = 1
    show.value = true
  }
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.comfirm-text {
  font-family: PingFangSC, 'PingFang SC';

  // font-weight: 500;
  font-size: 14px;
  color: #000;
}

.desc-wrap {
  .key {
    width: 105px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }

  .value {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #000;
  }
}

.table-radio {
  width: 100%;
}

.primary-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--active-text);
}
</style>
