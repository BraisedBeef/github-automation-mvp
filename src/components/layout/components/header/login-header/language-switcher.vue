<template>
  <div class="dns-language-switcher cat-flex" @click.stop>
    <SvgIcon id="language-icon" :name="props.icon" class="language-icon" @click.stop="() => (state.show = true)" />
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
const props = withDefaults(
  defineProps<{
    icon?: string
  }>(),
  {
    icon: 'language-switcher',
  },
)
const state = reactive<{
  icon: any
  arr: any[]
  active: number
  show: boolean
}>({
  icon: 0,
  arr: [
    { label: t('common.zh'), name: 'zh', value: 0 },
    { label: t('common.en'), name: 'en', value: 1 },
    { label: t('common.ja'), name: 'ja', value: 2, disabled: false },
  ],
  active: 0,
  show: false,
})

const { locale } = useI18n()
state.active = state.arr.find(v => v.name === locale.value)!.value || 0

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

  .language-icon {
    width: 24px;
    height: 24px;
  }

  :deep(.dns-language-panel) {
    position: absolute;
    top: calc(100% + 10px);
    left: 50%;
    z-index: 2001;
    display: flex;
    background-image: linear-gradient(to right bottom, #eee, #fff);
    border-radius: 4px;
    box-shadow: 0 0 4px #ccc;
    transform: translateX(-50%);

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
                padding: 0;
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
