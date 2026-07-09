<template>
  <div class="language">
    <el-dropdown trigger="hover" popper-class="site-dropdown" placement="bottom-start" :teleported="false">
      <div class="drop-sites">
        <div class="avatar">
          <SvgIcon name="header-site-bg" />
        </div>
        <span class="site">{{ baseStore.projectType === '1' ? t('common.site_china') : t('common.site_world') }}</span>
        <SvgIcon name="down-arrow" class="arrow" />
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <!-- 语言 -->
          <el-dropdown-item
            v-for="(item, index) in langArr"
            :key="item.value"
            class="site-lang"
            :class="item.value"
            @click="changeLang(item.value)"
            @mouseenter="hoverLang(index)"
            @mouseleave="() => (hoverActive = void 0)"
          >
            <SvgIcon :name="item.icon" />
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { useBaseStore } from '@/store'
import t from '@/utils/i18n'
import { LANG, LANGUAGE_MAP } from '@/config/constant-config'
import { _getItem } from '@/utils/storage'

export interface HeaderItem {
  icon: string
  label: string
  value: LangType
}
const baseStore = useBaseStore()

const hoverActive = ref<undefined | number>(void 0)
const langArr: HeaderItem[] = [
  { icon: 'lang-zh', label: t('common.zh'), value: 'zh' },
  { icon: 'lang-en', label: t('common.en'), value: 'en' },
  { icon: 'lang-jp', label: t('common.ja'), value: 'ja' },
]

const changeLang = (key: LangType) => {
  const lang = LANGUAGE_MAP[key]?.i18nParam
  baseStore.switchLanguage(lang)
}

const hoverLang = (i: number) => {
  hoverActive.value = i
}

onMounted(() => {
  const l = _getItem(LANG, true)
  changeLang(l)
})
</script>

<style scoped lang="scss">
.language {
  width: 100%;
  height: 100%;

  :deep(.el-dropdown) {
    height: 100%;

    .site-dropdown {
      top: calc(var(--header-h) - 1px) !important;
      left: -20px !important;
      width: calc(100% + 40px) !important;

      .el-dropdown-menu {
        padding: 8px !important;
      }

      .el-dropdown-menu__item {
        min-width: 104px;
      }
    }
  }

  .drop-sites {
    display: flex;
    align-items: center;
    font-family: 'PingFang SC-Regular', 'PingFang SC';
    font-size: 16px;
    font-weight: 400;
    color: var(--primary-text);
    cursor: pointer;
    user-select: none;

    .site {
      line-height: 20px;
      white-space: nowrap;
    }

    &:hover {
      .arrow {
        transform: rotateZ(-180deg);
      }
    }

    .avatar {
      margin-right: 5px;
      line-height: 20px;
      vertical-align: middle;

      svg,
      img {
        width: 20px;
        height: 20px;
        margin-left: 0;
        border-radius: 50%;
      }
    }

    svg {
      margin-left: 8px;
      transition: transform 0.3s;
    }
  }
}
</style>

<style lang="scss">
.site-lang {
  justify-content: flex-start;
  height: var(--input-height);
  padding: 0;
  margin-bottom: 4px;
  font-family: 'PingFang SC-Regular', 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: var(--primary-text);

  svg {
    flex-shrink: 0;
    width: 16px !important;
    height: 16px !important;
    margin-right: 8px;
  }

  &:hover {
    color: var(--primary-color);
    border-radius: 4px;

    svg {
      color: var(--primary-color);
    }
  }
}
</style>
