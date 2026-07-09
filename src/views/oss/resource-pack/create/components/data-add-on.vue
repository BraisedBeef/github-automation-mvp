<template>
  <div class="add-on-pack">
    <div class="key-wrap">
      <Title :text="t('oss.buyPage.notice')" />
      <div class="rules">
        <div class="use-tip">
          <div :style="`width: ${useTipWidth}px; flex-shrink: 0;`">
            <el-tag class="mr14">
              {{ t('oss.buyPage.instructions') }}
            </el-tag>
          </div>
          <div class="tip-right">
            {{ t('oss.buyPage.noticeDesc2') }}
          </div>
        </div>
        <div class="use-tip mt20">
          <div :style="`width: ${useTipWidth}px; flex-shrink: 0;`">
            <el-tag class="mr14">
              {{ t('oss.buyPage.billingRules') }}
            </el-tag>
          </div>
          <div class="tip-right">
            {{ t('oss.buyPage.billingRulesDesc2') }}
          </div>
        </div>
        <div class="use-tip mt20">
          <div :style="`width: ${useTipWidth}px; flex-shrink: 0;`">
            <el-tag class="mr14">
              {{ t('oss.buyPage.otherInstructions') }}
            </el-tag>
          </div>
          <div class="tip-right">
            {{ t('oss.buyPage.otherInstructionsDesc1') }}
          </div>
        </div>
      </div>
    </div>

    <div class="key-wrap">
      <Title :text="t('oss.buyPage.selectResourcePack')" />
      <div class="rules">
        <div class="use-tip">
          <p class="label" :style="`width: ${resourcePackWidth}`">
            {{ t('oss.buyPage.usageNotes') }}
          </p>
          <div class="label-tip">
            <div class="df ac gap5">
              <SvgIcon class="icon" name="dialog-warning" />
              <span>{{ t('oss.buyPage.usageNotesDesc1') }}</span>
            </div>
            <div class="df ac gap5">
              <SvgIcon class="icon" name="dialog-warning" />
              <span>{{ t('oss.buyPage.usageNotesDesc2') }}</span>
            </div>
            <div class="df ac gap5">
              <SvgIcon class="icon" name="dialog-warning" />
              <span>{{ t('oss.buyPage.usageNotesDesc4') }}</span>
            </div>
          </div>
        </div>
        <div class="use-tip mt20">
          <p class="label" :style="`width: ${resourcePackWidth}`">
            {{ t('oss.buyPage.effectiveRegion') }}
          </p>
          <div class="btns-wrap">
            <div class="btns df mb16">
              <el-tooltip
                v-for="(item, index) in config.region"
                :key="index"
                :disabled="!item.disabled"
                :content="t('oss.buyPage.eRTip')"
                placement="top"
                effect="light"
              >
                <div
                  class="btn cursor-pointer"
                  :class="{ active: form.region === item.value, disabled: item.disabled }"
                  @click="changeRegionConfig(item, 'region')"
                >
                  {{ item.label }}
                </div>
              </el-tooltip>
            </div>
            <div class="desc">
              {{ t('oss.buyPage.effectiveRegionChoice') }}
            </div>
          </div>
        </div>
        <!-- 计费项分类 -->
        <div class="use-tip mt20">
          <p class="label" :style="`width: ${resourcePackWidth}`">
            {{ t('oss.buyPage.billingItemCategory') }}
          </p>
          <div class="btns-wrap">
            <div class="btns df mb16">
              <div
                v-for="(item, index) in config.category"
                :key="index"
                class="btn cursor-pointer"
                :class="form.category === item.value && 'active'"
                @click="changeRegionConfig(item, 'category')"
              >
                {{ item.label }}
              </div>
            </div>
            <div class="desc">
              {{ config.category.find(v => v.value === form.category)?.desc }}
            </div>
          </div>
        </div>
        <!-- 资源包类型 -->
        <div class="use-tip mt20">
          <p class="label" :style="`width: ${resourcePackWidth}`">
            {{ t('oss.buyPage.ResourcePackType') }}
          </p>
          <div class="btns-wrap">
            <div class="btns df mb16">
              <div
                v-for="(item, index) in classOptions"
                :key="index"
                class="btn cursor-pointer"
                :class="form.class === item.value && 'active'"
                @click="changeRegionConfig(item, 'class')"
              >
                {{ item.label }}
              </div>
            </div>
            <div class="desc">
              {{ classOptions.find(v => v.value === form.class)?.desc }}
            </div>
          </div>
        </div>
        <!-- 有效期 -->
        <div class="use-tip mt20">
          <p class="label" :style="`width: ${resourcePackWidth}`">
            {{ t('oss.buyPage.validityPeriod') }}
          </p>
          <div class="btns-wrap">
            <div class="btns df mb16">
              <div
                v-for="(item, index) in validityOptions"
                :key="index"
                class="btn cursor-pointer"
                :class="form.validityMonth === item.value && 'active'"
                @click="changeRegionConfig(item, 'validityMonth')"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
        </div>
        <!-- 资源包规格 -->
        <div class="use-tip mt20">
          <p class="label" :style="`width: ${resourcePackWidth}`">
            {{ t('oss.buyPage.resourcePackSpecifications') }}
          </p>
          <div class="btns-wrap">
            <div class="btns df mb16">
              <div
                v-for="(item, index) in specOptions"
                :key="index"
                class="btn cursor-pointer"
                :class="form.specId === item.value && 'active'"
                @click="changeRegionConfig(item, 'specId')"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
        </div>

        <div class="use-tip mt20">
          <p class="label" :style="`width: ${resourcePackWidth}`">
            {{ t('oss.buyPage.buyCount') }}
          </p>
          <div class="btns-wrap">
            <el-input-number v-model="form.count" :min="1" :max="10" />
          </div>
        </div>
        <div class="use-tip mt20">
          <p class="label" :style="`width: ${resourcePackWidth}`">
            {{ t('oss.buyPage.effectiveTime') }}
          </p>
          <div class="btns-wrap">
            <div class="btns df mb16">
              <div
                v-for="(item, index) in config.effective"
                :key="index"
                class="btn cursor-pointer"
                :class="form.effectiveTime === item.value && 'active'"
                @click="changeRegionConfig(item, 'effectiveTime')"
              >
                {{ item.label }}
              </div>
              <div v-if="form.effectiveTime === 2" class="df ac">
                <el-date-picker v-model="form.time" type="datetime" :clearable="false" :placeholder="t('selectTime')" />
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon class="ml10" name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </div>
            <div class="desc">
              {{ config.effective.find(v => v.value === form.effectiveTime)?.desc }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import t from '@/utils/i18n'
import { useOss } from '@/views/oss/hooks/use-oss'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useI18nStyle } from '@/hooks/use-i18n-style'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const useTipMap = {
  [ja]: 100,
  [en]: 135,
  [zh]: 75,
}
const useTipWidth = useI18nStyle(useTipMap)
const resourcePackWidth = useI18nStyle({
  [ja]: '160px',
  [en]: '160px',
  [zh]: '110px',
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
.gap5 {
  gap: 5px;
}

.add-on-pack {
  padding-bottom: 100px;

  .key-wrap {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #555;

    .rules {
      margin-top: 20px;
      margin-bottom: 40px;
      user-select: none;
      border-radius: 4px;

      .use-tip {
        display: flex;

        .label {
          flex-shrink: 0;
          min-width: 110px;

          // white-space: nowrap;
          margin-right: 8px;
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          line-height: 34px;
          color: #555;
        }

        .label-tip {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .btns-wrap {
          .btns {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;

            .btn {
              height: 34px;
              padding: 7px 31px;
              font-family: PingFangSC, 'PingFang SC';
              font-size: 14px;
              font-weight: 400;
              color: #000;
              background: #eee;
              border-radius: 4px;

              &.active {
                color: #fff;
                background: var(--primary-color);
              }

              &.disabled {
                cursor: not-allowed;
              }
            }
          }

          .desc {
            margin-top: 8px;
            font-size: 14px;
            font-weight: 400;
            color: #999;
          }

          .tag-desc {
            display: flex;
            gap: 5px;
            align-items: center;
            margin-top: 8px;

            .desc1 {
              font-size: 14px;
              font-weight: 400;
              color: #fe4d4f;
            }
          }
        }

        .el-tag {
          border: none;
        }

        .tip-right {
          line-height: 24px;
        }
      }
    }
  }
}
</style>
