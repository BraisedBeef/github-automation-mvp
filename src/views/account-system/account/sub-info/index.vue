<template>
  <div class="">
    <el-row :gutter="20">
      <el-col class="mb20" :span="12">
        <!-- 基本信息 -->
        <el-card shadow="never" class="page-box w160" :body-style="bodyStyle">
          <div class="title mb20">
            {{ t('account.basicInfo') }}
          </div>
          <div class="df">
            <div>
              <div class="key-wrap mb20">
                <span class="key">{{ t('account.accountID') }}</span>
              </div>
              <div class="key-wrap mb-20">
                <span class="key">APP ID</span>
              </div>
            </div>
            <div class="ml20">
              <div class="value mb20">
                {{ user.id || '-' }}
              </div>
              <div class="value mb20">
                {{ user.appId || '-' }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col class="mb20" :span="12">
        <!-- 账号权限 -->
        <el-card shadow="never" class="page-box w160" :body-style="bodyStyle">
          <div class="title mb20">
            {{ t('account.accountPerm') }}
          </div>
          <div class="df">
            <div>
              <div class="key-wrap mb20">
                <span class="key">{{ t('account.accountIdentity') }}</span>
              </div>
              <div class="key-wrap mb20">
                <span class="key">{{ t('account.mainAccountBelongs') }}</span>
              </div>
            </div>
            <div class="ml20">
              <div class="value mb20">
                {{ t('account.subuser') }}
              </div>
              <div class="value mb20">
                {{ user.parentId }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col class="mb20" :span="12">
        <!-- 主账号信息 -->
        <el-card shadow="never" class="page-box w160" :body-style="bodyStyle">
          <div class="title mb20">
            {{ t('account.mainAccount') }}
          </div>
          <div class="df mb20">
            <div class="key-wrap">
              <span class="key">{{ t('account.name') }}</span>
            </div>
            <span class="value ml20">{{ user.mainAccountName || '-' }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import t from '@/utils/i18n'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const bodyStyle = { height: '100%' }

onMounted(() => {
  userStore.getUser()
})
</script>

<style lang="scss" scoped>
.w160 {
  height: 160px;
}

.title {
  font-family: PingFangSC, 'PingFang SC';

  // font-weight: 500;
  font-size: 18px;
  color: var(--table-text);
}

.key-wrap {
  // width: 95px;

  .key {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--common-text);
  }
}

.value {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: var(--primary-text);
}

.ml20 {
  margin-left: 20px;
}
</style>
