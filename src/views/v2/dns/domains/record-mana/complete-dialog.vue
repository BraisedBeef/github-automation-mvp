<template>
  <CatDialog :dialog="dialog" title="" class="complete-dialog" width="550px" @update:dialog="close">
    <div class="complete-content">
      <div class="success-text">
        <SvgIcon name="dialog-complete" />
        {{ t('recordMana.complete') }}
      </div>
      <div class="replain f">
        {{ t('recordMana.completeTip') }}
        <!-- 暂时不显示 -->
        <span v-if="false" @click="getMore">了解更多</span>
      </div>
      <div class="replain s">
        <span>{{ t('recordMana.completeTip2') }}</span
        >{{ maoYunDayJs(updateTime).subtract(-1, 'hour').format(FORMAT_TIME) }}
      </div>
      <div class="img-w">
        <img :src="CompleteImg" alt="" class="complete-img" />
      </div>
    </div>
    <template #footer>
      <div class="cat-dialog-footer">
        <el-button type="primary" @click.stop="close">
          {{ t('common.confirm') }}
        </el-button>
        <el-button plain @click="cancel">
          {{ t('recordMana.noRemind') }}
        </el-button>
      </div>
    </template>
  </CatDialog>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { _formateTime } from '@/utils/format-time'
import CompleteImg from '@/assets/images/dns/complete-dialog-img.png'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
const props = withDefaults(
  defineProps<{
    dialog: boolean
  }>(),
  {
    dialog: false,
  },
)

const updateTime = ref<any>()

const emit = defineEmits<{
  (event: 'close', dialog: boolean): void
  (event: 'hide'): void
}>()
const close = () => {
  console.log('sss')

  emit('close', false)
}

const cancel = () => {
  emit('hide')
}

const getMore = () => {
  message.success('more')
}

defineExpose({
  updateTime,
})
</script>

<style scoped lang="scss">
.complete-content {
  .success-text {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    font-size: 24px;

    svg {
      width: 40px;
      height: 40px;
      margin-right: 12px;
    }
  }

  .replain {
    line-height: 24px;
    text-align: left;

    &.f {
      /* text-indent: 28px; */
    }

    &.s {
      margin-bottom: 14px;
      color: var(--primary-color);
    }
  }

  .img-w {
    width: 100%;
    height: 260px;
    text-align: center;
  }

  .complete-img {
    height: 260px;
  }
}
</style>
