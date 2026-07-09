<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('recovery.ins.renew.title')"
    width="950px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="close"
    @open="open"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <Collapse v-model="isCollapse" :text="t('ins.renew.selectIns', [insList.length])">
      <Item
        v-for="(item, index) in insList"
        :key="index"
        :ins="item"
        :time="time"
        :renew="renew(item.id)"
        :open="show"
        :ins-all-num="insList.length"
      />
    </Collapse>

    <div class="form-wrap mt20">
      <el-form ref="formRef" require-asterisk-position="right" label-width="auto" label-position="left">
        <!-- 购买时长 -->
        <el-form-item :label="t('ins.renew.renewTime')" prop="duration">
          <el-select
            v-model="time"
            class="select-opts"
            :placeholder="t('ins.renew.selectPh')"
            @change="instanceRenewInquiry"
          >
            <el-option v-for="item in INS_DURATION_MAP" :key="item.value" :label="item.label" :value="item.value">
              <div class="df ac opt-wrap w-full h-full">
                <div>{{ item.label }}</div>
                <div v-if="item.more" class="more-wrap text-warning ml20">
                  {{ item.more }}
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <!-- 优惠价 -->
        <!-- <el-form-item :label="t('recovery.common.preferentialPrice')">
          <span class="text-warning">${{ 0 }} USD</span>
        </el-form-item> -->
      </el-form>
    </div>

    <p v-if="isShowChecked" class="mt20 mb20 df ac">
      <el-checkbox v-model="checked" :label="t('ins.renew.checkedText')" size="large" @change="changeChecked" />
    </p>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import Item from './item.vue'
import { INS_DURATION_MAP } from '@/views/cvm/ins/config'
import { _instanceRenewInquiry } from '@/apis/cvm/ins'
import { useIns } from '@/views/cvm/hooks/use-ins'
import { getEipIdByInstanceId } from '@/apis/network/public-ip'
/**
 * @desc 实例续费数量为1
 */

interface PropType {
  insList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  insList: () => [],
})

const { instanceRenew, loading: comfirmLoading } = useIns()

const show = ref<boolean>(false) // 弹窗显示
const isCollapse = ref<boolean>(false) // 是否收起
const time = ref<number>(1)
const instanceRenewList = ref<any[]>([]) // 实例续费价格配置集合
const checked = ref<boolean>(false)
const isShowChecked = ref<boolean>(false) // 是否有包年包月eip
const eipIds = ref<number[]>([]) // 包年包月eip

const tips = computed(() => [
  {
    main: t('recovery.ins.renew.tipsMain'),
    sub: [t('recovery.ins.renew.tipsSub1'), t('recovery.ins.renew.tipsSub2')],
  },
])

const renew = (id: number) => {
  const res = instanceRenewList.value.find(el => el.instanceId === id) || {}

  return res
}

const changeChecked = () => {
  instanceRenewInquiry()
}

const confirmHandle = () => {
  const params = {
    renewMonth: time.value,
    serverIds: props.insList.map(el => el.id), // 服务器ID
    eipIds: checked.value ? eipIds.value : [], // 包年包月的eipId
    renewEip: checked.value,
  }
  instanceRenew(params)
}

// 弹窗打开
const open = () => {
  instanceRenewInquiry()
}

// 弹窗关闭
const close = () => {
  time.value = 1
  isCollapse.value = false
  checked.value = false
  isShowChecked.value = false
}

// 服务器续费-询价
const instanceRenewInquiry = async () => {
  try {
    const serverIds = props.insList.map(el => el.id)
    await getEipIdByInstanceIdFn()

    const params: any = {
      renewMonth: time.value,
      serverIds, // 服务器ID
      renewEip: checked.value,
    }

    if (checked.value) {
      params.eipIds = eipIds.value
    }

    const res = await _instanceRenewInquiry(params)

    console.log(`_instanceRenewInquiry===>`, res)

    if (res.success) {
      instanceRenewList.value = res.data || []
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  }
}

// 实例回收站查询 待回收状态隐式绑定的EIP
const getEipIdByInstanceIdFn = async () => {
  try {
    const instanceIds = props.insList.map(el => el.id)

    const res = await getEipIdByInstanceId(instanceIds)

    console.log(`getEipIdByInstanceId===>`, res)

    if (res.success) {
      eipIds.value = res.data || []
      // 是否有包年包月的eip
      if (res.data?.length) {
        isShowChecked.value = true
      }
    } else {
      eipIds.value = []
      isShowChecked.value = false
    }
  } catch (error) {
    console.log(error)
  }
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.time {
  margin-right: 44px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #999;
}

.opt-wrap {
  padding: 0 8px;

  &:hover {
    color: #0063ff;
    background: #f1f7ff;
  }

  .more-wrap {
    width: 46px;
    height: 22px;
    line-height: 22px;
    text-align: center;
    border: 1px solid #fc8c00;
    border-radius: 11px;
  }
}
</style>
