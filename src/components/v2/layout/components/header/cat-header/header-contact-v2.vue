<template>
  <div class="header-contact">
    <el-dropdown trigger="hover" popper-class="contact-dropdown" placement="bottom-end" :teleported="true">
      <div class="drop" :class="{ 'drop--dark': dark }">
        <SvgIcon name="v2-header-service" class="header-icon" />
        <span class="contact">{{ serviceLabel }}</span>
      </div>
      <template #dropdown>
        <div class="header-contact-info">
          <div class="title">
            <p class="contact-title">
              {{ t('common.contact') }}
            </p>
            <p class="contact-desc">
              {{ t('common.contact_desc') }}
            </p>
          </div>
          <div class="line" />
          <div class="qr_code">
            <ul class="desc-list">
              <li v-for="item in desList" :key="item">
                <SvgIcon name="cat-header-correct" class="header-correct" />
                <span>{{ item }}</span>
              </li>
            </ul>
            <div class="qr_code_container">
              <div v-for="item in telegramList" :key="item.name" class="qr_code_box">
                <img :src="item.qrCodeUrl" class="qr_code_img" />
                <p class="telegram" @click="toWebsite(item.url)">
                  <span>{{ item.name }}</span>
                  <SvgIcon name="telegram" class="header-correct" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-dropdown>
  </div>
</template>

<script lang="ts" setup>
import { useBaseStore } from '@/store'
import t from '@/utils/i18n'
import { imageContactQrCode1, imageContactQrCode2 } from '@/config/base-config'

defineProps<{
  dark?: boolean
}>()

const baseStore = useBaseStore()
const serviceLabel = computed(() => {
  const lang = baseStore.lang
  if (lang === 'en') return 'Support'
  if (lang === 'ja') return 'アフターサービス'
  return '售后服务'
})

const desList = [
  t('common.contact_desc1'),
  t('common.contact_desc2'),
  t('common.contact_desc3'),
  t('common.contact_desc4'),
]
const telegramList = [
  { name: '@ahoneco', url: 'https://t.me/ahoneco', qrCodeUrl: imageContactQrCode1 },
  { name: '@zhouran99', url: 'https://t.me/zhouran99', qrCodeUrl: imageContactQrCode2 },
]

const toWebsite = (telegramUrl: string) => {
  window.open(telegramUrl)
}
</script>

<style lang="scss">
.el-popper.is-light.contact-dropdown {
  top: calc(var(--header-h) - 1px) !important;
  right: 70px !important;
  width: 490px !important;
  max-width: 490px !important;

  .header-contact-info {
    .title {
      padding: 20px;
    }

    .contact-title {
      margin-bottom: 12px;
      font-size: 16px;
      font-weight: 500;
      line-height: 22px;
      color: #000;
    }

    .contact-desc {
      font-size: 14px;
      line-height: 20px;
      color: #999;
    }

    .line {
      width: 100%;
      height: 1px;
      background: #eee;
    }

    .qr_code {
      display: flex;
      gap: 40px;
      justify-content: space-between;
      padding: 20px;
    }

    .desc-list {
      display: flex;
      flex-direction: column;
      gap: 10px;

      li {
        display: flex;
        gap: 8px;
        font-size: 14px;
        line-height: 20px;
        color: #555;
      }

      .header-correct {
        width: 16px;
        height: 16px;
        margin-top: 2px;
      }
    }

    .qr_code_container {
      display: flex;
      gap: 20px;
    }

    .qr_code_img {
      width: 88px;
      height: 88px;
    }

    .telegram {
      display: flex;
      gap: 5px;
      align-items: center;
      justify-content: center;
      margin-top: 5px;
      font-size: 14px;
      line-height: 20px;
      color: #555;

      &:hover {
        color: var(--primary-color);
        cursor: pointer;
      }
    }
  }
}
</style>

<style scoped lang="scss">
.header-contact {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  cursor: pointer;

  .drop {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    height: 56px;
  }

  .drop--dark {
    color: rgb(255 255 255 / 90%);
  }

  .contact {
    font-size: 14px;
    line-height: 22px;
    color: inherit;
    white-space: nowrap;
  }

  .header-icon {
    width: 20px;
    height: 20px;
    color: inherit;
  }
}
</style>
