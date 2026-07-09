<template>
  <div class="a-wrap">
    <el-form require-asterisk-position="right" label-position="left" label-width="100px">
      <!-- 选择类型 -->
      <el-form-item :label="t('user.createStep1')" required>
        <el-row
          class="w-full item border-1 pd20 mb20 cursor-pointer"
          :class="activeIndex === 1 && 'item-active'"
          @click="changeActiveIndex(1)"
        >
          <el-col :span="24" class="main">
            {{ t('user.accessAndMsg') }}
          </el-col>
          <el-col :span="24" class="sub">
            {{ t('user.accessAndMsgDesc') }}
          </el-col>
        </el-row>

        <el-row
          class="w-full item border-1 pd20 cursor-pointer"
          :class="activeIndex === 2 && 'item-active'"
          @click="changeActiveIndex(2)"
        >
          <el-col :span="24" class="main">
            {{ t('user.msg') }}
          </el-col>
          <el-col :span="24" class="sub">
            {{ t('user.msgDesc') }}
          </el-col>
        </el-row>

        <div class="btn-wrap">
          <el-button type="primary" @click="next">
            {{ t('common.next') }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { useSubUserCreateStore } from '@/store'
import t from '@/utils/i18n'

const emits = defineEmits<{
  (event: 'changeStep', stepStatus: string): void
  (event: 'selectStepType', type: number): void
}>()
const accessUserStore = useSubUserCreateStore()
const activeIndex = ref<number>(1)

// 选择类型
const changeActiveIndex = index => {
  activeIndex.value = index
  emits('selectStepType', index)
}

// 下一步
const next = () => {
  console.log(`activeIndex.value===>`, activeIndex.value)

  accessUserStore.setCreateUserType(activeIndex.value)
  emits('changeStep', 'b')
}
</script>

<style lang="scss" scoped>
.a-wrap {
  .item {
    &.border-1 {
      border: 1px solid var(--border-c);
      border-radius: 4px;
    }

    .main {
      margin-bottom: 8px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 16px;
      line-height: 22px;

      // font-weight: 500;
      color: var(--primary-text);
    }

    .sub {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--common-text);
    }
  }

  .item-active {
    background: var(--selected-bgc);

    &.border-1 {
      border: 1px solid var(--primary-color);
    }

    .main {
      color: var(--primary-color);
    }
  }
}

.btn-wrap {
  margin-top: 40px;
}
</style>
