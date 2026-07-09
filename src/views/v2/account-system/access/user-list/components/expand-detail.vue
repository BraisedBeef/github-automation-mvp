<template>
  <div class="access-user-expand-v2">
    <div class="access-user-expand-v2__col">
      <div class="access-user-expand-v2__item">
        <span class="access-user-expand-v2__label">{{ t('user.subscribe') }}</span>
        <div class="access-user-expand-v2__value">
          <template v-if="row.subscribe">
            <span v-for="(item, index) in subscribeList" :key="`${item}-${index}`">
              {{ SUBSCRIBE_MAP[item] || item }}<span v-if="index !== subscribeList.length - 1">,</span>
            </span>
          </template>
          <span v-else>-</span>
        </div>
      </div>

      <div class="access-user-expand-v2__item">
        <span class="access-user-expand-v2__label">{{ t('user.remark') }}</span>
        <span class="access-user-expand-v2__value">{{ row.remark || '-' }}</span>
      </div>
    </div>

    <div class="access-user-expand-v2__col access-user-expand-v2__col--with-divider">
      <div class="access-user-expand-v2__item">
        <span class="access-user-expand-v2__label">{{ t('overview.loginProtect') }}</span>
        <span class="access-user-expand-v2__value" :class="row.loginProtect == 1 ? 'is-success' : 'is-danger'">
          {{
            row.loginProtect == 1 ? t('securitySetting.openLoginProtection') : t('securitySetting.closeLoginProtection')
          }}
        </span>
      </div>

      <div class="access-user-expand-v2__item">
        <span class="access-user-expand-v2__label">{{ t('overview.operateProtect') }}</span>
        <span class="access-user-expand-v2__value" :class="row.operateProtect == 1 ? 'is-success' : 'is-danger'">
          {{
            row.operateProtect == 1
              ? t('securitySetting.openLoginProtection')
              : t('securitySetting.closeLoginProtection')
          }}
        </span>
      </div>
    </div>

    <div class="access-user-expand-v2__col access-user-expand-v2__col--with-divider">
      <div class="access-user-expand-v2__item">
        <span class="access-user-expand-v2__label">{{ t('user.access') }}</span>
        <span class="access-user-expand-v2__value" :class="row.accessMethod == 1 ? 'is-success' : 'is-danger'">
          {{ row.accessMethod == 1 ? t('common.start') : t('user.close') }}
        </span>
      </div>

      <div class="access-user-expand-v2__item access-user-expand-v2__item--link">
        <button type="button" class="access-user-expand-v2__link" @click="toDetail(row)">
          <span>{{ t('user.userDetail') }}</span>
          <SvgIcon name="share" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { SUBSCRIBE_MAP } from '@/views/account-system/config'
import { pushRoute } from '@/utils/router-jump'

const props = withDefaults(
  defineProps<{
    row: any
  }>(),
  {
    row: () => ({}),
  },
)

const subscribeList = computed(() => {
  return props.row.subscribe ? String(props.row.subscribe).split(',') : []
})

const toDetail = (row: any) => {
  const query = {
    title: 'user.userList',
    path: '/account-system/access/user/list',
  }

  const id = row.id
  if (row.accountType == 1) {
    pushRoute({
      name: 'access_user_detail_main',
      params: { id },
      query,
    })
    return
  }

  if (row.userType == 1) {
    pushRoute({
      name: 'access_user_detail_sub_all',
      params: { id },
      query,
    })
    return
  }

  if (row.userType == 2) {
    pushRoute({
      name: 'access_user_detail_sub_news',
      params: { id },
      query,
    })
  }
}
</script>

<style scoped lang="scss">
.access-user-expand-v2 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  padding: 30px 24px 30px 52px;
  background: #f9fafc;
}

.access-user-expand-v2__col {
  display: flex;
  flex-direction: column;
  gap: 30px;
  min-width: 0;
  padding: 0 28px;
}

.access-user-expand-v2__col--with-divider {
  border-left: 1px solid #e8ecf3;
}

.access-user-expand-v2__item {
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.access-user-expand-v2__item--link {
  display: flex;
  align-items: center;
}

.access-user-expand-v2__label {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.access-user-expand-v2__value {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  word-break: break-word;
}

.access-user-expand-v2__value.is-success {
  color: #12b76a;
}

.access-user-expand-v2__value.is-danger {
  color: #f04438;
}

.access-user-expand-v2__link {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.access-user-expand-v2__link :deep(svg) {
  width: 16px;
  height: 16px;
}

@media (width <= 1080px) {
  .access-user-expand-v2 {
    grid-template-columns: 1fr;
    padding: 20px;
  }

  .access-user-expand-v2__col {
    padding: 0;
  }

  .access-user-expand-v2__col--with-divider {
    padding-top: 20px;
    border-top: 1px solid #e8ecf3;
    border-left: 0;
  }
}
</style>
