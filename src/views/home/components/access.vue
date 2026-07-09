<template>
  <!-- 最近访问 -->
  <div v-if="baseStore.accessHistory[userId()]" class="access-wrap">
    <p class="tit mb20">
      {{ t('home.access') }}
    </p>

    <div class="df ac gap">
      <div
        v-for="(item, index) in baseStore.accessHistory[userId()]"
        :key="index"
        class="item cursor-pointer"
        @click.stop="latelyClick(item)"
      >
        <span class="text-red">
          {{ getRouteModel(item.path)?.title }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useBaseStore } from '@/store'
import { userId } from '@/store/user'
import { getRouteModel } from '@/router/map'
import { pushRoute } from '@/utils/router-jump'

const baseStore = useBaseStore()
const router = useRouter()

const latelyClick = item => {
  const route = getRouteModel(item.path).routes[0]
  pushRoute({ path: route.path })
}
</script>

<style lang="scss" scoped>
.access-wrap {
  margin-bottom: 40px;

  /* padding: 0 10px; */

  .tit {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #555;
  }

  .gap {
    display: flex;
    flex-wrap: wrap;

    // display: gap;
    gap: 20px;
  }

  .item {
    min-width: 202px;
    height: 34px;
    padding-right: 12px;
    padding-left: 12px;
    line-height: 34px;
    background: #f9fafc;
    border-radius: 4px;

    &:hover {
      span {
        color: #0063ff;
      }
    }

    span {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 12px;
      font-weight: 400;
      color: #000;
    }
  }
}
</style>
