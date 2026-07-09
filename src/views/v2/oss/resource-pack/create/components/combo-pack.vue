<template>
  <div class="combo-pack-v2">
    <section class="combo-pack-v2__section">
      <h2 class="combo-pack-v2__section-title">
        {{ t('oss.buyPage.notice') }}
      </h2>
      <div class="combo-pack-v2__notice-list">
        <div class="combo-pack-v2__notice-row">
          <div :style="`width: ${useTipWidth}px; flex-shrink: 0;`">
            <el-tag>{{ t('oss.buyPage.instructions') }}</el-tag>
          </div>
          <div class="combo-pack-v2__notice-content">
            {{ t('oss.buyPage.noticeDesc1') }}
          </div>
        </div>
        <div class="combo-pack-v2__notice-row">
          <div :style="`width: ${useTipWidth}px; flex-shrink: 0;`">
            <el-tag>{{ t('oss.buyPage.billingRules') }}</el-tag>
          </div>
          <div class="combo-pack-v2__notice-content">
            {{ t('oss.buyPage.billingRulesDesc1') }}
          </div>
        </div>
        <div class="combo-pack-v2__notice-row">
          <div :style="`width: ${useTipWidth}px; flex-shrink: 0;`">
            <el-tag>{{ t('oss.buyPage.otherInstructions') }}</el-tag>
          </div>
          <div class="combo-pack-v2__notice-content">
            {{ t('oss.buyPage.otherInstructionsDesc1') }}
          </div>
        </div>
      </div>
    </section>

    <section class="combo-pack-v2__section">
      <h2 class="combo-pack-v2__section-title">
        {{ t('oss.buyPage.configureComboPack') }}
      </h2>
      <div class="combo-pack-v2__config">
        <div class="combo-pack-v2__field">
          <div class="combo-pack-v2__field-label" :style="`width: ${resourcePackWidth}`">
            {{ t('oss.buyPage.usageNotes') }}
          </div>
          <div class="combo-pack-v2__field-content combo-pack-v2__field-content--inline">
            <div class="combo-pack-v2__hint-item">
              <SvgIcon class="combo-pack-v2__hint-icon" name="dialog-warning" />
              <span>{{ t('oss.buyPage.usageNotesDesc1') }}</span>
            </div>
            <div class="combo-pack-v2__hint-item">
              <SvgIcon class="combo-pack-v2__hint-icon" name="dialog-warning" />
              <span>{{ t('oss.buyPage.usageNotesDesc2') }}</span>
            </div>
            <div class="combo-pack-v2__hint-item">
              <SvgIcon class="combo-pack-v2__hint-icon" name="dialog-warning" />
              <span>{{ t('oss.buyPage.usageNotesDesc3') }}</span>
            </div>
          </div>
        </div>

        <div class="combo-pack-v2__field">
          <div class="combo-pack-v2__field-label" :style="`width: ${resourcePackWidth}`">
            {{ t('oss.buyPage.effectiveRegion') }}
          </div>
          <div class="combo-pack-v2__field-content">
            <div class="combo-pack-v2__option-list">
              <el-tooltip
                v-for="(item, index) in config.region"
                :key="index"
                :disabled="!item.disabled"
                :content="t('oss.buyPage.eRTip')"
                placement="top"
                effect="light"
              >
                <div
                  class="combo-pack-v2__option"
                  :class="{ 'is-active': form.region === item.value, 'is-disabled': item.disabled }"
                  @click="changeRegionConfig(item, 'region')"
                >
                  {{ item.label }}
                </div>
              </el-tooltip>
            </div>
            <div class="combo-pack-v2__field-desc">
              {{ t('oss.buyPage.effectiveRegionChoice') }}
            </div>
          </div>
        </div>

        <div class="combo-pack-v2__field">
          <div class="combo-pack-v2__field-label" :style="`width: ${resourcePackWidth}`">
            {{ t('oss.buyPage.validityPeriod') }}
          </div>
          <div class="combo-pack-v2__field-content">
            <div class="combo-pack-v2__option-list">
              <div
                v-for="(item, index) in validityMonthOptions"
                :key="index"
                class="combo-pack-v2__option"
                :class="{ 'is-active': form.validityMonth === item.value }"
                @click="changeRegionConfig(item, 'validityMonth')"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="combo-pack-v2__section">
      <h2 class="combo-pack-v2__section-title">
        {{ t('oss.buyPage.configurePackType') }}
      </h2>
      <div class="combo-pack-v2__card-list">
        <div class="combo-pack-v2__card combo-pack-v2__card--accent">
          <div class="combo-pack-v2__badge" :style="`width: ${iconWidth};`">
            {{ t('oss.buyPage.required') }}
          </div>

          <div class="combo-pack-v2__card-content">
            <div class="combo-pack-v2__card-title">
              <div class="combo-pack-v2__card-name">
                {{ t('oss.buyPage.storageCapacityPack') }}
              </div>
              <div class="combo-pack-v2__card-desc">
                {{ t('oss.buyPage.storageCapacityPackDesc') }}
              </div>
            </div>

            <div class="combo-pack-v2__form">
              <div class="combo-pack-v2__form-item combo-pack-v2__form-item--type">
                <div class="combo-pack-v2__form-label">
                  {{ t('oss.buyPage.type') }}
                </div>
                <el-select v-model="form.class1.type">
                  <el-option :label="t('oss.buyPage.standardStorageCapacity')" :value="0" />
                </el-select>
              </div>
              <div class="combo-pack-v2__type-tip">*{{ t('oss.buyPage.standardStorageCapacityDesc') }}</div>
              <div class="combo-pack-v2__form-item">
                <div class="combo-pack-v2__form-label">
                  {{ t('oss.buyPage.traffic') }}
                </div>
                <el-select v-model="form.class1.flow">
                  <el-option
                    v-for="item in getPackByType(0)"
                    :key="item.specId"
                    :label="item.amount + item.unit"
                    :value="item.specId"
                  />
                </el-select>
              </div>
              <div class="combo-pack-v2__form-item">
                <div class="combo-pack-v2__form-label">
                  {{ t('oss.buyPage.buyCount') }}
                </div>
                <el-input-number v-model="form.class1.count" :min="1" :max="10" />
              </div>
            </div>
          </div>

          <div class="combo-pack-v2__price">
            <div class="combo-pack-v2__price-current">${{ form.class1.price.toFixed(2) }} <span>USD</span></div>
            <div class="combo-pack-v2__price-origin">${{ form.class1.originalPrice.toFixed(2) }} USD</div>
          </div>
        </div>

        <div class="combo-pack-v2__card">
          <div class="combo-pack-v2__badge" :style="`width: ${iconWidth};`">
            {{ t('oss.buyPage.required') }}
          </div>

          <div class="combo-pack-v2__card-content">
            <div class="combo-pack-v2__card-title">
              <div class="combo-pack-v2__card-name">
                {{ t('oss.buyPage.trafficPack') }}
              </div>
              <div class="combo-pack-v2__card-desc">
                {{ t('oss.buyPage.trafficPackDesc') }}
              </div>
            </div>

            <div class="combo-pack-v2__form">
              <div class="combo-pack-v2__form-item combo-pack-v2__form-item--type">
                <div class="combo-pack-v2__form-label">
                  {{ t('oss.buyPage.type') }}
                </div>
                <el-select v-model="form.class2.type">
                  <el-option :label="t('oss.buyPage.publicDownstreamTraffic')" :value="2" />
                </el-select>
              </div>
              <div class="combo-pack-v2__type-tip">*{{ t('oss.buyPage.publicDownstreamTrafficDesc') }}</div>
              <div class="combo-pack-v2__form-item">
                <div class="combo-pack-v2__form-label">
                  {{ t('oss.buyPage.traffic') }}
                </div>
                <el-select v-model="form.class2.flow">
                  <el-option
                    v-for="item in getPackByType(2)"
                    :key="item.specId"
                    :label="item.amount + item.unit"
                    :value="item.specId"
                  />
                </el-select>
              </div>
              <div class="combo-pack-v2__form-item">
                <div class="combo-pack-v2__form-label">
                  {{ t('oss.buyPage.buyCount') }}
                </div>
                <el-input-number v-model="form.class2.count" :min="1" :max="10" />
              </div>
            </div>
          </div>

          <div class="combo-pack-v2__price">
            <div class="combo-pack-v2__price-current">${{ form.class2.price.toFixed(2) }} <span>USD</span></div>
            <div class="combo-pack-v2__price-origin">${{ form.class2.originalPrice.toFixed(2) }} USD</div>
          </div>
        </div>

        <div class="combo-pack-v2__card">
          <div class="combo-pack-v2__badge" :style="`width: ${iconWidth};`">
            {{ t('oss.buyPage.required') }}
          </div>

          <div class="combo-pack-v2__card-content">
            <div class="combo-pack-v2__card-title">
              <div class="combo-pack-v2__card-name">
                {{ t('oss.buyPage.readWriteRequestPack') }}
              </div>
              <div class="combo-pack-v2__card-desc">
                {{ t('oss.buyPage.readWriteRequestPackDesc') }}
              </div>
            </div>

            <div class="combo-pack-v2__form">
              <div class="combo-pack-v2__form-item combo-pack-v2__form-item--type">
                <div class="combo-pack-v2__form-label">
                  {{ t('oss.buyPage.type') }}
                </div>
                <el-select v-model="form.class3.type">
                  <el-option :label="t('oss.buyPage.standardStorageRequest')" :value="1" />
                </el-select>
              </div>
              <div class="combo-pack-v2__type-tip">*{{ t('oss.buyPage.standardStorageRequestDesc') }}</div>
              <div class="combo-pack-v2__form-item">
                <div class="combo-pack-v2__form-label">
                  {{ t('oss.buyPage.traffic') }}
                </div>
                <el-select v-model="form.class3.flow">
                  <el-option
                    v-for="item in getPackByType(1)"
                    :key="item.specId"
                    :label="item.amount + item.unit"
                    :value="item.specId"
                  />
                </el-select>
              </div>
              <div class="combo-pack-v2__form-item">
                <div class="combo-pack-v2__form-label">
                  {{ t('oss.buyPage.buyCount') }}
                </div>
                <el-input-number v-model="form.class3.count" :min="1" :max="10" />
              </div>
            </div>
          </div>

          <div class="combo-pack-v2__price">
            <div class="combo-pack-v2__price-current">${{ form.class3.price.toFixed(2) }} <span>USD</span></div>
            <div class="combo-pack-v2__price-origin">${{ form.class3.originalPrice.toFixed(2) }} USD</div>
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
  [ja]: '90px',
  [en]: '100px',
  [zh]: '68px',
})

const iconWidth = useI18nStyle({
  [ja]: '50px',
  [en]: '84px',
  [zh]: '50px',
})

const { form, validityMonthOptions, resourcePackList, config, resourcePackInquiry, getAvailableResourcePacks } =
  useOss()

onMounted(() => {
  getAvailableResourcePacks({ bundle: 1 })
})

// 通过有限期筛选资源包（保持纯计算，不做副作用）
const filterResourcePack = computed(() => {
  return resourcePackList.value.filter((item: any) => {
    return item.validityMonth === form.value.validityMonth
  })
})

const packMap = computed(() => {
  const map = new Map()
  filterResourcePack.value.forEach(item => {
    if (!map.has(item.class)) {
      map.set(item.class, [])
    }
    map.get(item.class).push(item)
  })
  return map
})

const getPackByType = (type: number) => packMap.value.get(type) || []

const specMap = computed(() => {
  const map = new Map<number | string, any>()
  for (const s of resourcePackList.value) {
    map.set(s.specId, s)
  }
  return map
})

const getSpecById = (specId: number | string) => {
  return specMap.value.get(specId) || null
}

const toNumber = (v: any) => {
  const n = Number(v)
  return Number.isNaN(n) ? 0 : n
}

// 计算单价与总价
const calcPrice = (specId: number | string, count: any) => {
  const spec = getSpecById(specId)
  if (!spec) return 0
  const unitPrice = toNumber(spec.discountPrice ?? 0)
  const c = Math.max(0, toNumber(count))
  return Number((unitPrice * c).toFixed(2))
}
const calcOriginalPrice = (specId: number | string, count: any) => {
  const spec = getSpecById(specId)
  if (!spec) return 0
  const unitPrice = toNumber(spec.price ?? 0)
  const c = Math.max(0, toNumber(count))
  return Number((unitPrice * c).toFixed(2))
}

const prices = computed(() => ({
  class1: calcPrice(form.value.class1.flow, form.value.class1.count),
  class2: calcPrice(form.value.class2.flow, form.value.class2.count),
  class3: calcPrice(form.value.class3.flow, form.value.class3.count),
}))
const originalPrices = computed(() => ({
  class1: calcOriginalPrice(form.value.class1.flow, form.value.class1.count),
  class2: calcOriginalPrice(form.value.class2.flow, form.value.class2.count),
  class3: calcOriginalPrice(form.value.class3.flow, form.value.class3.count),
}))

// 将计算结果有控制地同步回 form
watch(
  prices,
  newPrices => {
    form.value.class1.price = newPrices.class1
    form.value.class2.price = newPrices.class2
    form.value.class3.price = newPrices.class3
  },
  { immediate: true },
)
watch(
  originalPrices,
  newOriginalPrices => {
    form.value.class1.originalPrice = newOriginalPrices.class1
    form.value.class2.originalPrice = newOriginalPrices.class2
    form.value.class3.originalPrice = newOriginalPrices.class3
  },
  { immediate: true },
)
// 总价
watch(
  [prices],
  () => {
    resourcePackInquiry({
      region: form.value.region,
      timestamp: Date.now(),
      items: [
        {
          specId: form.value.class1.flow,
          quantity: form.value.class1.count,
          validityMonth: form.value.validityMonth,
        },
        {
          specId: form.value.class2.flow,
          quantity: form.value.class2.count,
          validityMonth: form.value.validityMonth,
        },
        {
          specId: form.value.class3.flow,
          quantity: form.value.class3.count,
          validityMonth: form.value.validityMonth,
        },
      ],
    })
  },
  { deep: true },
)

watch(
  packMap,
  () => {
    const list = ['class1', 'class2', 'class3']
    list.forEach(className => {
      const type = form.value[className].type
      const packs = getPackByType(type)
      if (packs.length && !packs.some(p => p.specId === form.value[className].flow)) {
        form.value[className].flow = packs[0].specId
      }
    })
  },
  { immediate: true },
)

watch(
  () => validityMonthOptions.value,
  val => {
    form.value.validityMonth = val.length ? val[0].value : 1
  },
  { deep: true, immediate: true },
)
const changeRegionConfig = (item: any, key: string) => {
  if (item.disabled) return
  form.value[key] = item.value
}
</script>

<style lang="scss" scoped>
.combo-pack-v2 {
  color: #191c23;
}

.combo-pack-v2__section + .combo-pack-v2__section {
  margin-top: 20px;
}

.combo-pack-v2__section:nth-of-type(3) {
  margin-top: 40px;
}

.combo-pack-v2__section-title {
  margin: 0 0 20px;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  color: #191c23;
}

.combo-pack-v2__notice-list,
.combo-pack-v2__config {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.combo-pack-v2__notice-row,
.combo-pack-v2__field {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.combo-pack-v2__notice-content,
.combo-pack-v2__field-content {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.combo-pack-v2__field-label {
  flex-shrink: 0;
  min-height: 34px;
  font-size: 14px;
  line-height: 34px;
  color: #191c23;
  white-space: nowrap;
}

.combo-pack-v2__field-content--inline {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  align-items: center;
}

.combo-pack-v2__hint-item {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 14px;
  line-height: 22px;
}

.combo-pack-v2__hint-icon {
  color: #ff720d;
}

.combo-pack-v2__option-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.combo-pack-v2__option {
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

.combo-pack-v2__field-desc {
  margin-top: 10px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.combo-pack-v2__card-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 34px;
}

.combo-pack-v2__card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 399px;
  padding: 24px 32px;
  background: #fff;
  border: 1px solid rgb(0 0 0 / 8%);
  box-shadow:
    0 4px 4px rgb(0 0 0 / 5%),
    0 10px 10px rgb(0 0 0 / 10%);

  &--accent {
    background:
      radial-gradient(circle at 88% 92%, rgb(132 177 255 / 28%) 0, rgb(132 177 255 / 0%) 34%),
      linear-gradient(148deg, #fff 0%, #fff 52%, #edf4ff 100%);
  }
}

.combo-pack-v2__badge {
  position: absolute;
  top: -2px;
  right: 0;
  height: 24px;
  font-size: 14px;
  font-weight: 500;
  line-height: 24px;
  color: #fff;
  text-align: center;
  background-image: url('@/assets/images/storage/cat-mandatory-bg.png');
  background-size: 100% 100%;
}

.combo-pack-v2__card-content {
  flex: 1;
}

.combo-pack-v2__card-title {
  min-height: 80px;
}

.combo-pack-v2__card-name {
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
  color: #191c23;
}

.combo-pack-v2__card-desc {
  font-size: 14px;
  line-height: 22px;
  color: #50596a;
}

.combo-pack-v2__form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 24px;
}

.combo-pack-v2__form-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.combo-pack-v2__form-label {
  flex-shrink: 0;
  width: 56px;
  min-height: 34px;
  font-size: 14px;
  line-height: 34px;
  color: #828b9c;
}

.combo-pack-v2__type-tip {
  margin: -16px 0 0 72px;
  font-size: 12px;
  line-height: 20px;
  color: #999;
}

.combo-pack-v2__price {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  padding-top: 24px;
}

.combo-pack-v2__price-current {
  font-size: 32px;
  font-weight: 700;
  line-height: 38px;
  color: #ff720d;

  span {
    margin-left: 2px;
    font-size: 12px;
    font-weight: 400;
  }
}

.combo-pack-v2__price-origin {
  padding-bottom: 4px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  text-decoration: line-through;
}

:deep(.combo-pack-v2__notice-row .el-tag) {
  padding: 2px 6px;
  font-size: 14px;
  font-weight: 400;
  color: #06f;
  background: rgb(0 102 255 / 4%);
  border: 0;
  border-radius: 0;
}

:deep(.combo-pack-v2__form .el-select),
:deep(.combo-pack-v2__form .el-input-number) {
  width: 284px;
  max-width: 100%;
}

.combo-pack-v2__form-item--type {
  :deep(.el-select) {
    width: 240px;
  }
}

:deep(.combo-pack-v2__form .el-input__wrapper),
:deep(.combo-pack-v2__form .el-select__wrapper) {
  min-height: 34px;
  border-radius: 0;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.combo-pack-v2__form .el-input-number) {
  justify-content: flex-start;
}

:deep(.combo-pack-v2__form .el-input-number .el-input__wrapper) {
  border-right: 0;
  border-left: 0;
}

:deep(.combo-pack-v2__form .el-input-number__decrease),
:deep(.combo-pack-v2__form .el-input-number__increase) {
  width: 36px;
  color: #50596a;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 0;
}

:deep(.combo-pack-v2__form .el-input-number__decrease) {
  border-right: 0;
}

:deep(.combo-pack-v2__form .el-input-number__increase) {
  border-left: 0;
}

@media (width <= 1200px) {
  .combo-pack-v2__card-list {
    grid-template-columns: 1fr;
  }
}

@media (width <= 768px) {
  .combo-pack-v2__notice-row,
  .combo-pack-v2__field,
  .combo-pack-v2__form-item {
    flex-direction: column;
    gap: 8px;
  }

  .combo-pack-v2__field-label,
  .combo-pack-v2__form-label {
    width: auto !important;
    min-height: 0;
    line-height: 22px;
  }

  .combo-pack-v2__type-tip {
    margin-left: 0;
  }
}
</style>
