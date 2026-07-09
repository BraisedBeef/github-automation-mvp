<template>
  <div class="dns-language-switcher" @click.stop>
    <button class="language-trigger" type="button" @click.stop="state.show = !state.show">
      <SvgIcon name="v2-header-language" class="language-icon" />
      <span>{{ currentLanguage }}</span>
      <span class="chevron" :class="{ 'chevron--open': state.show }" />
    </button>

    <div v-show="state.show" class="dns-language-panel" @click.stop @mouseleave="hide">
      <el-tabs v-model="state.active" tab-position="left" class="dns-language-panel-tabs" @tab-click="change">
        <el-tab-pane
          v-for="item in state.arr"
          :key="item.label"
          :name="item.value"
          :label="item.label"
          :disabled="item.disabled"
        />
      </el-tabs>
      <div class="icon cat-flex" :style="{ transform: 'translateY(' + state.active * 40 + 'px)' }">
        <SvgIcon :name="logoName" class="logo-icon" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useBaseStore } from '@/store'
import t from '@/utils/i18n'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { logoName } from '@/config/base-config'

const baseStore = useBaseStore()
const state = reactive<{
  arr: any[]
  active: number
  show: boolean
}>({
  arr: [
    { label: '简体中文', name: 'zh', value: 0 },
    { label: 'English', name: 'en', value: 1 },
    { label: '日本語', name: 'ja', value: 2, disabled: false },
  ],
  active: 0,
  show: false,
})

const { locale } = useI18n()
state.active = state.arr.find(v => v.name === locale.value)!.value || 0
const currentLanguage = computed(() => state.arr.find(v => v.value === state.active)?.label || t('common.zh'))

const change = ({ index }: any) => {
  hide()
  const key: LangType = state.arr[index].name
  const lang = LANGUAGE_MAP[key].i18nParam
  baseStore.switchLanguage(lang)
}

const hide = () => {
  state.show = false
}
</script>

<style scoped lang="scss">
.dns-language-switcher {
  position: relative;
  height: 56px;

  .language-trigger {
    display: flex;
    gap: 8px;
    align-items: center;
    height: 56px;
    padding: 0;
    font-family: 'Noto Sans CJK SC', 'PingFang SC', sans-serif;
    font-size: 14px;
    line-height: 22px;
    color: #191c23;
    cursor: pointer;
    background: transparent;
    border: 0;
  }

  .language-icon {
    width: 20px;
    height: 20px;
  }

  .chevron {
    width: 7px;
    height: 7px;
    margin: -4px 2px 0 0;
    border-right: 1px solid currentcolor;
    border-bottom: 1px solid currentcolor;
    transition: transform 0.2s;
    transform: rotate(45deg);

    &--open {
      margin-top: 4px;
      transform: rotate(225deg);
    }
  }

  :deep(.dns-language-panel) {
    position: absolute;
    top: calc(100% - 4px);
    right: 0;
    z-index: 2001;
    display: flex;
    overflow: hidden;
    background: #fff;
    border: 1px solid #ebeef5;
    box-shadow: 0 4px 10px rgb(0 0 0 / 10%);

    .dns-language-panel-tabs {
      user-select: none;

      .el-tabs__header {
        margin-right: 1px;

        .el-tabs__nav-wrap {
          .el-tabs__nav-scroll {
            .el-tabs__nav {
              .el-tabs__active-bar {
                background: #6493fc;
              }

              .el-tabs__item {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 40px;
                padding: 0 14px;
                color: #333;

                &.is-active {
                  color: var(--primary-color);
                }

                &.is-disabled {
                  color: #ccc;
                }
              }
            }
          }
        }
      }

      .el-tabs__content {
        display: none;
      }
    }

    .icon {
      width: 40px;
      height: 40px;
      transition: transform 0.35s;

      .logo-icon {
        width: 28px;
        height: 28px;
      }
    }
  }
}
</style>
