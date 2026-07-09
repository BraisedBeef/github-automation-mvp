<template>
  <div class="disk-item">
    <!-- top -->
    <div class="top df ac jsb mb20">
      <div class="lt df ac mr4 cursor-pointer" @click="isShow = !isShow">
        <span>{{ disk.diskId }} ｜ {{ disk.diskName }}_{{ DISK_TYPE_MAP[disk.type] }}</span
        ><el-icon :class="isShow ? 'is-reverse' : ''" style="transition: 0.3s">
          <CaretRight />
        </el-icon>
      </div>
      <div class="rt df ac">
        <span class="text-primary mr20 cursor-pointer" @click="toMonitor(disk.id)">{{ t('ins.disk.seeMonitor') }}</span>
        <!-- 创建快照 -->
        <DisableText
          v-if="checkPermission(permMap.ins.CREATE_DISK_SNAPSHOT)"
          class="mr20"
          :disabled="!isCreateSnapshot(disk.type, disk.state)"
          :text="t('ins.disk.createSnapshot')"
          @click="changeShow(createSnapshotRef)"
        />
        <!-- 扩容 -->
        <DisableText
          v-if="checkPermission(permMap.ins.EXPAND_DISK_SIZE)"
          class="mr20"
          :disabled="!isExpans(disk.state)"
          :text="t('ins.disk.expans')"
          @click="changeShow(expansRef)"
        />
        <!-- 卸载 -->
        <DisableText
          v-if="checkPermission(permMap.ins.DETACH_DISK_FROM_VM)"
          class="mr20"
          :disabled="!isUninstall(disk.type, disk.state)"
          :text="t('ins.disk.uninstall')"
          @click="changeShow(uninstallRef)"
        />
        <!-- 销毁/退还 -->
        <DisableText
          v-if="checkPermission(permMap.ins.DESTROY_OR_REFUND_DISK)"
          class="mr20"
          :disabled="!isDestruction(disk.type, disk.state)"
          :text="t('ins.disk.destruction')"
          @click="changeShow(destructionRef)"
        />
      </div>
    </div>
    <el-collapse-transition>
      <!-- bottom -->
      <div v-show="isShow" class="bottom">
        <el-row class="detail-wrap mb20 w-full">
          <el-col :span="12">
            <!-- 名称 -->
            <div class="item df ac" :class="editInputRef?.show ? 'mb13 mt-negative-6' : 'mb20'">
              <div class="key-wrap">
                {{ t('ins.disk.name') }}
              </div>
              <div class="value">
                <EditInput
                  ref="editInputRef"
                  :show-edit-icon="checkPermission(permMap.ins.DISK_RENAME) as boolean"
                  :rules="nameRules"
                  :model-value="diskName"
                  :cancel-fn="cancelDiskName"
                  input-style="max-width: 380px;width: 380px"
                  :max-length="60"
                  @confirm="changeDiskName"
                />
              </div>
            </div>
            <!-- 容量(GiB) -->
            <div class="item mb20 df">
              <div class="key-wrap">
                <span>{{ t('ins.disk.size') }}</span>
              </div>
              <div class="value">
                {{ disk.size || 0 }}
              </div>
            </div>
            <!-- 启动盘-->
            <div class="item mb20 df">
              <div class="key-wrap">
                <span>{{ t('ins.disk.startDisk') }}</span>
              </div>
              <div class="value">
                {{ disk.type === 1 ? t('ins.disk.yes') : t('ins.disk.no') }}
              </div>
            </div>
            <!-- 地域-->
            <div class="item mb20 df">
              <div class="key-wrap">
                <span>{{ t('ins.disk.region') }}</span>
              </div>
              <div class="value">
                {{ disk.regionName || '-' }}
              </div>
            </div>
            <!-- 计费模式-->
            <div class="item mb20 df">
              <div class="key-wrap">
                <span>{{ t('ins.disk.costType') }}</span>
              </div>
              <div class="value">
                {{ COST_TYPE_MAP[disk.costType] || '-' }}
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <!-- 资源ID -->
            <div class="item mb20 df">
              <div class="key-wrap">
                <span>{{ t('ins.disk.resourceID') }}</span>
              </div>
              <div class="value">
                {{ disk.diskId || '-' }}
              </div>
            </div>
            <!-- 类型 -->
            <div class="item mb20 df">
              <div class="key-wrap">
                <span>{{ t('ins.disk.type') }}</span>
              </div>
              <div class="value">
                {{ disk.diskTypeName || '-' }}
              </div>
            </div>
            <!-- 可用区  -->
            <div class="item mb20 df">
              <div class="key-wrap">
                <span>{{ t('ins.disk.zone') }}</span>
              </div>
              <div class="value">
                <span>{{ disk.zoneName || '-' }}</span>
              </div>
            </div>
            <!-- 创建时间-->
            <div class="item df">
              <div class="key-wrap df ac">
                <span>{{ t('ins.disk.createTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="ml10" />
                </el-tooltip>
              </div>
              <div class="value">
                {{ disk.createTime ? maoYunDayJs(disk.createTime).format(FORMAT_TIME) : '-' }}
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-collapse-transition>

    <!-- 创建快照 -->
    <CreateSnapshot ref="createSnapshotRef" :disk="{ ...disk, diskType: disk.diskTypeName }" @success="getDetail" />
    <!-- 云硬盘扩容 -->
    <Expans ref="expansRef" :disk="disk" @success="getDetail" />
    <!-- 卸载 -->
    <Uninstall ref="uninstallRef" :disk-list="[disk]" @success="getDetail" />
    <!-- 销毁/退还 -->
    <Destruction ref="destructionRef" :disk-list="[disk]" @success="getDetail" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { CaretRight } from '@element-plus/icons-vue'
import { DISK_TYPE_MAP } from '@/views/cvm/disk/config'
import Expans from '@/views/cvm/disk/list/components/expans.vue'
import CreateSnapshot from '@/views/cvm/disk/list/components/create-snapshot.vue'
import Uninstall from '@/views/cvm/disk/list/components/uninstall.vue'
import Destruction from '@/views/cvm/disk/list/components/destruction.vue'
import { _updateDisk } from '@/apis/cvm/disk'
import { message } from '@/utils/message'
import { COST_TYPE_MAP } from '@/views/cvm/ins/config'
import { isExpans, isUninstall, isDestruction, isCreateSnapshot } from '@/views/cvm/disk/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'

import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { useCvmStore } from '@/store'
import { nameRules } from '@/views/network/private-network/list/config'
import { pushRoute } from '@/utils/router-jump'

interface PropType {
  disk: any
}

const props = withDefaults(defineProps<PropType>(), {
  disk: () => ({}),
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const diskName = ref<string>('') // 硬盘名称
const editInputRef = ref<any>(null)
const isShow = ref<boolean>(true) // 是否显示

const expansRef = ref<InstanceType<typeof Expans>>() // 云硬盘扩容
const createSnapshotRef = ref<InstanceType<typeof CreateSnapshot>>() // 创建快照
const uninstallRef = ref<InstanceType<typeof Uninstall>>() // 卸载
const destructionRef = ref<InstanceType<typeof Destruction>>() // 销毁

const cvmStore = useCvmStore()
// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.ins,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const getDetail = () => {
  emits('success')
}

const toMonitor = (id: number) => {
  pushRoute({
    name: 'disk_detail',
    params: {
      id,
    },
    query: {
      active: 5,
    },
  })
}

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return

  ins.show = true
}

// 取消修改名称
const cancelDiskName = () => {
  diskName.value = props.disk.diskName
}

// 输入硬盘名称
const changeDiskName = (value: string) => {
  const params = {
    diskName: value,
    id: props.disk.id as number,
  }
  updateDisk(params)
}

// 修改硬盘名称
const updateDisk = async (params: any) => {
  try {
    const res = await _updateDisk(params)

    console.log(`_updateDisk===>`, res)

    if (res.success) {
      message.success(res.msg)
      if (editInputRef.value) {
        editInputRef.value.show = false
      }
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  }
}

watch(
  () => props.disk,
  () => {
    diskName.value = props.disk.diskName
  },
)

onMounted(() => {
  diskName.value = props.disk.diskName
})
</script>

<style lang="scss" scoped>
.disk-item {
  margin-bottom: 40px;

  .top {
    height: 50px;
    padding: 0 15px;
    background: #f9fafc;
    border-radius: 4px;

    .lt {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 14px;
      color: #000;
    }

    .rt {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #999;
    }
  }

  .bottom {
    .detail-wrap {
      /* margin-top: 40px; */

      /* margin-bottom: 40px; */

      .item {
        .key-wrap {
          width: 125px;
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          color: #999;
        }

        .value {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          color: var(--primary-text);
        }
      }
    }
  }

  .mt-negative-6 {
    margin-top: -6.5px;
  }

  .mb13 {
    margin-bottom: 13px;
  }
}

.is-reverse {
  transform: rotateZ(90deg);
}
</style>
