<template>
  <div class="border-wrap mb20">
    <p class="df ac jsb top mb20">
      <span class="title">{{ t('ins.custom.otherSet') }}</span>
      <span class="text-primary cursor-pointer" @click="store.setStep('b')">{{ t('ins.custom.edit') }}</span>
    </p>

    <el-row :gutter="20" class="bottom">
      <el-col :span="8">
        <table class="list-table">
          <tbody>
            <tr>
              <td class="pr20">
                <div class="item mb20">
                  <div class="key">
                    {{ t('ins.custom.insName') }}
                  </div>
                </div>
              </td>
              <td class="pr20">
                <div class="item mb20">
                  <span class="value">{{ instanceName }}</span>
                </div>
              </td>
            </tr>
            <!-- <tr>
            <td class="pr20">
               <div class="item mb20">
                <div class="key">{{ t('ins.custom.project') }}</div>
              </div>
            </td>
            <td class="pr20">
               <div class="item mb20">
                <span class="value">{{ projectName }}</span>
              </div>
            </td>
          </tr> -->
          </tbody>
        </table>
      </el-col>
      <el-col :span="8">
        <table class="list-table">
          <tbody>
            <tr>
              <td class="pr20">
                <div class="item mb20">
                  <div class="key">
                    {{ t('ins.custom.loginType') }}
                  </div>
                </div>
              </td>
              <td>
                <div class="item mb20">
                  <span class="value">{{ loginType }}</span>
                </div>
              </td>
            </tr>
            <!-- <tr>
            <td class="pr20">
              <div class="item mb20">
                <div class="key">{{ t('ins.custom.monitor') }}</div>
              </div>
            </td>
            <td>
              <div class="item mb20">
                <span class="value">{{ monitor }}</span>
              </div>
            </td>
          </tr> -->
          </tbody>
        </table>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useIns } from '@/views/cvm/hooks/use-ins'
import { LOGIN_CONFIG_LIST } from '@/views/cvm/ins/config'

const { cvmInsCreateStore: store } = useIns()

// 实例名称
const instanceName = computed(() => {
  return store.instanceName || t('ins.custom.noSet')
})

// 登录方式
const loginType = computed(() => {
  const res = LOGIN_CONFIG_LIST?.find(el => el.value === store.loginConfig?.cur)
  return res?.label
})

// 所属项目
const projectName = computed(() => {
  const projectList: any[] = store.projectConfig?.list
  const projectCur: any = store.projectConfig?.cur
  const res = projectList?.find(el => el.id === projectCur)
  return res?.projectName || '-'
})

// 云监控
const monitor = computed(() => {
  return store.monitorConfig?.checked ? t('ins.custom.freeOpen') : t('ins.custom.close')
})
</script>

<style lang="scss" scoped>
.list-left {
  margin-right: 20px;
}

.border-wrap {
  padding: 20px;
  background: #f9fafc;

  .top {
    span {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 14px;
      color: #000;
    }

    .title {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 14px;
      color: #000;
    }
  }

  .bottom {
    .item {
      min-height: 21px;
    }

    .key {
      min-width: 28px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #999;
      white-space: nowrap;
    }

    .value {
      display: inline-block;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #000;
      overflow-wrap: break-word; /* 在必要时单词内部断行 */
      overflow-wrap: anywhere;
      white-space: normal; /* 允许换行 */
    }
  }
}

.pr20 {
  padding-right: 20px;
}

.list-table {
  td {
    vertical-align: top;
  }
}
</style>
