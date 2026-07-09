<template>
  <div class="add-on-pack-v2">
    <section class="add-on-pack-v2__section">
      <h2 class="add-on-pack-v2__section-title">
        {{ t('oss.buyPage.notice') }}
      </h2>
      <div class="add-on-pack-v2__notice-list">
        <div class="add-on-pack-v2__notice-row">
          <div :style="`width: ${useTipWidth}px; flex-shrink: 0;`">
            <el-tag>{{ t('oss.buyPage.instructions') }}</el-tag>
          </div>
          <div class="add-on-pack-v2__notice-content">
            {{ t('oss.buyPage.noticeDesc2') }}
          </div>
        </div>
        <div class="add-on-pack-v2__notice-row">
          <div :style="`width: ${useTipWidth}px; flex-shrink: 0;`">
            <el-tag>{{ t('oss.buyPage.billingRules') }}</el-tag>
          </div>
          <div class="add-on-pack-v2__notice-content">
            {{ t('oss.buyPage.billingRulesDesc2') }}
          </div>
        </div>
        <div class="add-on-pack-v2__notice-row">
          <div :style="`width: ${useTipWidth}px; flex-shrink: 0;`">
            <el-tag>{{ t('oss.buyPage.otherInstructions') }}</el-tag>
          </div>
          <div class="add-on-pack-v2__notice-content">
            {{ t('oss.buyPage.otherInstructionsDesc1') }}
          </div>
        </div>
      </div>
    </section>

    <section class="add-on-pack-v2__section">
      <h2 class="add-on-pack-v2__section-title">
        {{ t('oss.buyPage.selectResourcePack') }}
      </h2>
      <div class="add-on-pack-v2__config">
        <div class="add-on-pack-v2__field">
          <div class="add-on-pack-v2__field-label" :style="`width: ${resourcePackWidth}`">
            {{ t('oss.buyPage.usageNotes') }}
          </div>
          <div class="add-on-pack-v2__field-content add-on-pack-v2__field-content--inline">
            <div class="add-on-pack-v2__hint-item">
              <SvgIcon class="add-on-pack-v2__hint-icon" name="dialog-warning" />
              <span>{{ t('oss.buyPage.usageNotesDesc1') }}</span>
            </div>
            <div class="add-on-pack-v2__hint-item">
              <SvgIcon class="add-on-pack-v2__hint-icon" name="dialog-warning" />
              <span>{{ t('oss.buyPage.usageNotesDesc2') }}</span>
            </div>
            <div class="add-on-pack-v2__hint-item">
              <SvgIcon class="add-on-pack-v2__hint-icon" name="dialog-warning" />
              <span>{{ t('oss.buyPage.usageNotesDesc4') }}</span>
            </div>
          </div>
        </div>

        <div class="add-on-pack-v2__field">
          <div class="add-on-pack-v2__field-label" :style="`width: ${resourcePackWidth}`">
            {{ t('oss.buyPage.effectiveRegion') }}
          </div>
          <div class="add-on-pack-v2__field-content">
            <div class="add-on-pack-v2__option-list add-on-pack-v2__option-list--region">
              <el-tooltip
                v-for="(item, index) in config.region"
                :key="index"
                :disabled="!item.disabled"
                :content="t('oss.buyPage.eRTip')"
                placement="top"
                effect="light"
              >
                <div
                  class="add-on-pack-v2__option"
                  :class="{ 'is-active': form.region === item.value, 'is-disabled': item.disabled }"
                  @click="changeRegionConfig(item, 'region')"
                >
                  {{ item.label }}
                </div>
              </el-tooltip>
            </div>
            <div class="add-on-pack-v2__field-desc">
              {{ t('oss.buyPage.effectiveRegionChoice') }}
            </div>
          </div>
        </div>

        <div class="add-on-pack-v2__field">
          <div class="add-on-pack-v2__field-label" :style="`width: ${resourcePackWidth}`">
            {{ t('oss.buyPage.billingItemCategory') }}
          </div>
          <div class="add-on-pack-v2__field-content">
            <div class="add-on-pack-v2__option-list add-on-pack-v2__option-list--category">
              <div
                v-for="(item, index) in config.category"
                :key="index"
                class="add-on-pack-v2__option"
                :class="{ 'is-active': form.category === item.value }"
                @click="changeRegionConfig(item, 'category')"
              >
                {{ item.label }}
              </div>
            </div>
            <div class="add-on-pack-v2__field-desc">
              {{ config.category.find(v => v.value === form.category)?.desc }}
            </div>
          </div>
        </div>

        <div class="add-on-pack-v2__field">
          <div class="add-on-pack-v2__field-label" :style="`width: ${resourcePackWidth}`">
            {{ t('oss.buyPage.ResourcePackType') }}
          </div>
          <div class="add-on-pack-v2__field-content">
            <div class="add-on-pack-v2__option-list add-on-pack-v2__option-list--pack-type">
              <div
                v-for="(item, index) in classOptions"
                :key="index"
                class="add-on-pack-v2__option"
                :class="{ 'is-active': form.class === item.value }"
                @click="changeRegionConfig(item, 'class')"
              >
                {{ item.label }}
              </div>
            </div>
            <div class="add-on-pack-v2__field-desc">
              {{ classOptions.find(v => v.value === form.class)?.desc }}
            </div>
          </div>
        </div>

        <div class="add-on-pack-v2__field">
          <div class="add-on-pack-v2__field-label" :style="`width: ${resourcePackWidth}`">
            {{ t('oss.buyPage.resourcePackSpecifications') }}
          </div>
          <div class="add-on-pack-v2__field-content">
            <div class="add-on-pack-v2__option-list add-on-pack-v2__option-list--spec">
              <div
                v-for="(item, index) in specOptions"
                :key="index"
                class="add-on-pack-v2__option"
                :class="{ 'is-active': form.specId === item.value }"
                @click="changeRegionConfig(item, 'specId')"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
        </div>

        <div class="add-on-pack-v2__field">
          <div class="add-on-pack-v2__field-label" :style="`width: ${resourcePackWidth}`">
            {{ t('oss.buyPage.validityPeriod') }}
          </div>
          <div class="add-on-pack-v2__field-content">
            <div class="add-on-pack-v2__option-list add-on-pack-v2__option-list--validity">
              <div
                v-for="(item, index) in validityOptions"
                :key="index"
                class="add-on-pack-v2__option"
                :class="{ 'is-active': form.validityMonth === item.value }"
                @click="changeRegionConfig(item, 'validityMonth')"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
        </div>

        <div class="add-on-pack-v2__field">
          <div class="add-on-pack-v2__field-label" :style="`width: ${resourcePackWidth}`">
            {{ t('oss.buyPage.buyCount') }}
          </div>
          <div class="add-on-pack-v2__field-content">
            <el-input-number v-model="form.count" :min="1" :max="10" />
          </div>
        </div>

        <div class="add-on-pack-v2__field">
          <div class="add-on-pack-v2__field-label" :style="`width: ${resourcePackWidth}`">
            {{ t('oss.buyPage.effectiveTime') }}
          </div>
          <div class="add-on-pack-v2__field-content">
            <div class="add-on-pack-v2__option-list add-on-pack-v2__option-list--effective">
              <div
                v-for="(item, index) in config.effective"
                :key="index"
                class="add-on-pack-v2__option"
                :class="{ 'is-active': form.effectiveTime === item.value }"
                @click="changeRegionConfig(item, 'effectiveTime')"
              >
                {{ item.label }}
              </div>
              <div v-if="form.effectiveTime === 2" class="add-on-pack-v2__time-picker">
                <el-date-picker v-model="form.time" type="datetime" :clearable="false" :placeholder="t('selectTime')" />
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon class="add-on-pack-v2__time-icon" name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </div>
            <div class="add-on-pack-v2__field-desc">
              {{ config.effective.find(v => v.value === form.effectiveTime)?.desc }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import t from '@/utils/i18n'
import { useOss } from '@/views/v2/oss/hooks/use-oss'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useI18nStyle } from '@/hooks/use-i18n-style'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const useTipMap = {
  [ja]: 100,
  [en]: 135,
  [zh]: 68,
}
const useTipWidth = useI18nStyle(useTipMap)
const resourcePackWidth = useI18nStyle({
  [ja]: '160px',
  [en]: '160px',
  [zh]: '82px',
})

const { formAddOn: form, config, resourcePackList, priceSource, getAvailableResourcePacks } = useOss()

// 类别选项（纯计算）
const classOptions = computed(() => {
  const list = [
    [{ label: t('oss.buyPack.standardStoragePack'), value: 0, desc: t('oss.buyPage.standardStorageCapacityDesc') }],
    [
      {
        label: t('oss.buyPack.publicDownstreamTrafficPack'),
        value: 2,
        desc: t('oss.buyPage.publicDownstreamTrafficDesc'),
      },
      // {
      //   label: t('oss.buyPack.globalAccelerationTrafficPack'),
      //   value: 3,
      //   desc: t('oss.buyPage.globalAccelerationTrafficDesc'),
      // },
    ],
    [
      {
        label: t('oss.buyPack.standardStorageRequestPack'),
        value: 1,
        desc: t('oss.buyPage.standardStorageCapacityDesc1'),
      },
    ],
  ]
  return list[(form.value.category || 1) - 1] || []
})

// 获取可用资源包
onMounted(() => {
  getAvailableResourcePacks({ bundle: 0 })
})

// 有效期 options（从小到大，12 的倍数转换为年）
const validityOptions = computed(() => {
  const list = Array.from(
    new Set(
      resourcePackList.value.filter((v: any) => v.class === form.value.class).map((item: any) => item.validityMonth),
    ),
  ).sort((a, b) => Number(a) - Number(b))
  return list.map(item => {
    const months = Number(item)
    const label = months % 12 === 0 ? `${months / 12}年` : `${months}个月`
    return { label, value: months }
  })
})

// 规格 options
const specOptions = computed(() => {
  const list = resourcePackList.value.filter(
    (v: any) => v.class === form.value.class && v.validityMonth === form.value.validityMonth,
  )
  return list.map((item: any) => ({ label: `${item.amount}${item.unit}`, value: item.specId, raw: item }))
})

// 当前选中 spec 对象（方便取 price）
const selectedSpec = computed(() => {
  return resourcePackList.value.find((v: any) => v.specId === form.value.specId) || null
})

const toNumber = (v: any) => {
  const n = Number(v)
  return Number.isNaN(n) ? 0 : n
}

// 计算价格（纯计算）
const finalPrice = computed(() => {
  const item = selectedSpec.value
  const cnt = Math.max(1, toNumber(form.value.count))
  const p = toNumber(item?.discountPrice ?? 0)
  return Number((p * cnt).toFixed(2))
})
const originalPrice = computed(() => {
  const item = selectedSpec.value
  const cnt = Math.max(1, toNumber(form.value.count))
  const p = toNumber(item?.price ?? 0)
  return Number((p * cnt).toFixed(2))
})

// 同步到 priceSource（集中副作用）
watch(
  [finalPrice, originalPrice],
  () => {
    priceSource.value.finalTotal = finalPrice.value
    priceSource.value.originalTotal = originalPrice.value
  },
  { immediate: true },
)

// 当 category 变化，自动选择默认 class
watch(
  () => form.value.category,
  () => {
    form.value.class = classOptions.value[0]?.value ?? form.value.class
  },
  { immediate: true },
)

// 当 class 变化，立即设置有效期为首项（无异步、无 setTimeout）
watch(
  () => form.value.class,
  () => {
    form.value.validityMonth = validityOptions.value[0]?.value ?? form.value.validityMonth
  },
  { immediate: true },
)

// 当有效期变化，设置默认 specId
watch(
  () => [form.value.validityMonth, form.value.class, form.value.category],
  () => {
    form.value.specId = specOptions.value[0]?.value
  },
  { immediate: true },
)

// 当 resourcePackList 更新时，保证当前选择仍然有效，否则重置为首项或 undefined
watch(
  resourcePackList,
  () => {
    // 保证 validityMonth 在可选范围内
    if (!validityOptions.value.find(v => v.value === form.value.validityMonth)) {
      form.value.validityMonth = validityOptions.value[0]?.value
    }
    // 保证 specId 有效
    if (!specOptions.value.find(v => v.value === form.value.specId)) {
      form.value.specId = specOptions.value[0]?.value
    }
  },
  { immediate: true },
)

const changeRegionConfig = (item: any, key: string) => {
  if (!key) return
  if (item.disabled) return
  form.value[key] = item.value
}
</script>

<style lang="scss" scoped>
.add-on-pack-v2 {
  color: #191c23;
}

.add-on-pack-v2__section + .add-on-pack-v2__section {
  margin-top: 20px;
}

.add-on-pack-v2__section-title {
  margin: 0 0 24px;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  color: #191c23;
}

.add-on-pack-v2__notice-list,
.add-on-pack-v2__config {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.add-on-pack-v2__notice-row,
.add-on-pack-v2__field {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.add-on-pack-v2__notice-content,
.add-on-pack-v2__field-content {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.add-on-pack-v2__field-label {
  flex-shrink: 0;
  min-height: 34px;
  font-size: 14px;
  line-height: 34px;
  color: #191c23;
  white-space: nowrap;
}

.add-on-pack-v2__field-content--inline {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  align-items: center;
}

.add-on-pack-v2__hint-item {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 14px;
  line-height: 22px;
}

.add-on-pack-v2__hint-icon {
  color: #ff720d;
}

.add-on-pack-v2__option-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.add-on-pack-v2__option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 76px;
  min-height: 34px;
  padding: 5px 12px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;

  &.is-active {
    color: #fff;
    background: #06f;
    border-color: #06f;
  }

  &.is-disabled {
    color: #b7c0cd;
    cursor: not-allowed;
    background: #f5f7fa;
  }
}

.add-on-pack-v2__option-list--region,
.add-on-pack-v2__option-list--pack-type {
  .add-on-pack-v2__option {
    min-width: 122px;
  }
}

.add-on-pack-v2__option-list--category,
.add-on-pack-v2__option-list--validity {
  .add-on-pack-v2__option {
    min-width: 76px;
  }
}

.add-on-pack-v2__option-list--effective {
  .add-on-pack-v2__option {
    min-width: 80px;
  }
}

.add-on-pack-v2__field-desc {
  margin-top: 10px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.add-on-pack-v2__time-picker {
  display: inline-flex;
  gap: 10px;
  align-items: center;
}

.add-on-pack-v2__time-icon {
  color: #828b9c;
}

:deep(.add-on-pack-v2__notice-row .el-tag) {
  padding: 2px 6px;
  font-size: 14px;
  font-weight: 400;
  color: #06f;
  background: rgb(0 102 255 / 4%);
  border: 0;
  border-radius: 0;
}

:deep(.add-on-pack-v2__field .el-input-number) {
  width: 140px;
}

:deep(.add-on-pack-v2__field .el-date-editor) {
  width: auto;
}

:deep(.add-on-pack-v2__field .el-input-number .el-input__wrapper),
:deep(.add-on-pack-v2__field .el-date-editor .el-input__wrapper) {
  min-height: 34px;
  border-radius: 0;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.add-on-pack-v2__field .el-input-number__decrease),
:deep(.add-on-pack-v2__field .el-input-number__increase) {
  width: 36px;
  color: #50596a;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 0;
}

:deep(.add-on-pack-v2__field .el-input-number__decrease) {
  border-right: 0;
}

:deep(.add-on-pack-v2__field .el-input-number__increase) {
  border-left: 0;
}

@media (width <= 768px) {
  .add-on-pack-v2__notice-row,
  .add-on-pack-v2__field {
    flex-direction: column;
    gap: 8px;
  }

  .add-on-pack-v2__field-label {
    width: auto !important;
    min-height: 0;
    line-height: 22px;
  }
}
</style>
