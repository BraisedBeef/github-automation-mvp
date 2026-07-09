<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('sensity.authTit')"
    width="600px"
    destroy-on-close
    :confirm-text="t('sensity.authConfirmText')"
    :no-cancel="true"
    @confirm="confirmHandle"
    @update:dialog="v => !v && closeHandle()"
  >
    <p class="title mb20">
      {{ t('sensity.authTip') }}
    </p>
    <div class="df jsb">
      <div v-for="(item, index) in list" :key="index" class="item">
        <div class="df jc ac mb20">
          <el-image style="width: 70px; height: 70px" :src="item.url" :fit="'cover'" />
        </div>
        <div class="desc">
          {{ item.desc }}
        </div>
      </div>
    </div>
  </CatDialog>
</template>

<script lang="ts" setup>
import Authentication1 from '@/assets/images/account-system/access/authentication1.png'
import Authentication2 from '@/assets/images/account-system/access/authentication2.png'
import Authentication3 from '@/assets/images/account-system/access/authentication3.png'
import t from '@/utils/i18n'

type Item = {
  url: string
  desc: string
}
type ListType = Item[]

const props = withDefaults(
  defineProps<{
    onHandleClose: any
    onHandleConfirm: any
  }>(),
  {
    onHandleClose: () => {},
    onHandleConfirm: () => {},
  },
)
const isConfirmToClose = ref<boolean>(false) // 是否为点击确认后触发关闭
const show = ref<boolean>(true) // 弹窗显示
const list = ref<ListType>([
  {
    url: Authentication1,
    desc: t('sensity.authDesc1'),
  },
  {
    url: Authentication2,
    desc: t('sensity.authDesc2'),
  },
  {
    url: Authentication3,
    desc: t('sensity.authDesc3'),
  },
])

const confirmHandle = () => {
  // console.log(`组件confirmHandle触发===>`)

  props.onHandleConfirm({
    success: true,
  })
  show.value = false
  isConfirmToClose.value = true
}

const closeHandle = () => {
  // console.log(`组件closeHandle触发===>`)

  !isConfirmToClose.value &&
    props.onHandleClose({
      success: false,
    })
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.title {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  line-height: 20px;

  // font-weight: 500;
  color: var(--primary-text);
}

.item {
  width: 165px;

  .desc {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 12px;
    font-weight: 400;
    line-height: 17px;
    color: var(--common-text);
  }
}
</style>
