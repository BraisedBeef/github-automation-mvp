<template>
  <div class="combo-pack">
    <div class="item df ac">
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
              {{ t('oss.buyPage.noticeDesc1') }}
            </div>
          </div>
          <div class="use-tip mt20">
            <div :style="`width: ${useTipWidth}px; flex-shrink: 0;`">
              <el-tag class="mr14">
                {{ t('oss.buyPage.billingRules') }}
              </el-tag>
            </div>
            <div class="tip-right">
              {{ t('oss.buyPage.billingRulesDesc1') }}
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
    </div>

    <div class="key-wrap1">
      <Title :text="t('oss.buyPage.configureComboPack')" />
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
              <span>{{ t('oss.buyPage.usageNotesDesc3') }}</span>
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
        <div class="use-tip mt20">
          <p class="label" :style="`width: ${resourcePackWidth}`">
            {{ t('oss.buyPage.validityPeriod') }}
          </p>
          <div class="btns-wrap">
            <div class="btns df mb16">
              <div
                v-for="(item, index) in validityMonthOptions"
                :key="index"
                class="btn cursor-pointer"
                :class="form.validityMonth === item.value && 'active'"
                @click="changeRegionConfig(item, 'validityMonth')"
              >
                {{ item.label }}
              </div>
            </div>
            <!-- <div class="tag-desc">
              <el-tag type="danger">{{ t('oss.attention') }}</el-tag>
              <span class="desc1">{{ t('oss.buyPage.attentionDesc1') }}</span>
            </div>
            <el-checkbox class="mt20" v-model="form.autoRenew">{{ t('oss.buyPage.autoRenewal') }}</el-checkbox> -->
          </div>
        </div>
      </div>
    </div>

    <div class="key-wrap2">
      <Title :text="t('oss.buyPage.configurePackType')" />
      <div class="card-wrap">
        <div class="card">
          <div class="icon" :style="`width: ${iconWidth};`">
            {{ t('oss.buyPage.required') }}
          </div>

          <div class="content">
            <div class="card-title">
              <div class="title">
                {{ t('oss.buyPage.storageCapacityPack') }}
              </div>
              <div class="desc">
                {{ t('oss.buyPage.storageCapacityPackDesc') }}
              </div>
            </div>

            <div class="card-form">
              <div class="form-item">
                <div class="label">
                  {{ t('oss.buyPage.type') }}
                </div>
                <el-select v-model="form.class1.type">
                  <el-option :label="t('oss.buyPage.standardStorageCapacity')" :value="0" />
                </el-select>
              </div>
              <div class="type-tip">*{{ t('oss.buyPage.standardStorageCapacityDesc') }}</div>
              <div class="form-item">
                <div class="label">
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
              <div class="form-item">
                <div class="label">
                  {{ t('oss.buyPage.buyCount') }}
                </div>
                <el-input-number v-model="form.class1.count" :min="1" :max="10" />
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="price">${{ form.class1.price.toFixed(2) }} USD</div>
            <div class="original-price">${{ form.class1.originalPrice.toFixed(2) }} USD</div>
          </div>
        </div>

        <div class="card">
          <div class="icon" :style="`width: ${iconWidth};`">
            {{ t('oss.buyPage.required') }}
          </div>

          <div class="content">
            <div class="card-title">
              <div class="title">
                {{ t('oss.buyPage.trafficPack') }}
              </div>
              <div class="desc">
                {{ t('oss.buyPage.trafficPackDesc') }}
              </div>
            </div>

            <div class="card-form">
              <div class="form-item">
                <div class="label">
                  {{ t('oss.buyPage.type') }}
                </div>
                <el-select v-model="form.class2.type">
                  <el-option :label="t('oss.buyPage.publicDownstreamTraffic')" :value="2" />
                  <!-- <el-option :label="t('oss.buyPage.globalAccelerationTraffic')" :value="3" /> -->
                </el-select>
              </div>
              <div class="type-tip">*{{ t('oss.buyPage.publicDownstreamTrafficDesc') }}</div>
              <div class="form-item">
                <div class="label">
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
              <div class="form-item">
                <div class="label">
                  {{ t('oss.buyPage.buyCount') }}
                </div>
                <el-input-number v-model="form.class2.count" :min="1" :max="10" />
              </div>
            </div>
          </div>
          <div class="card-footer">
            <div class="price">${{ form.class2.price.toFixed(2) }} USD</div>
            <div class="original-price">${{ form.class2.originalPrice.toFixed(2) }} USD</div>
          </div>
        </div>

        <div class="card">
          <div class="icon" :style="`width: ${iconWidth};`">
            {{ t('oss.buyPage.required') }}
          </div>

          <div class="content">
            <div class="card-title">
              <div class="title">
                {{ t('oss.buyPage.readWriteRequestPack') }}
              </div>
              <div class="desc">
                {{ t('oss.buyPage.readWriteRequestPackDesc') }}
              </div>
            </div>

            <div class="card-form">
              <div class="form-item">
                <div class="label">
                  {{ t('oss.buyPage.type') }}
                </div>
                <el-select v-model="form.class3.type">
                  <el-option :label="t('oss.buyPage.standardStorageRequest')" :value="1" />
                </el-select>
              </div>
              <div class="type-tip">*{{ t('oss.buyPage.standardStorageRequestDesc') }}</div>
              <div class="form-item">
                <div class="label">
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
              <div class="form-item">
                <div class="label">
                  {{ t('oss.buyPage.buyCount') }}
                </div>
                <el-input-number v-model="form.class3.count" :min="1" :max="10" />
              </div>
            </div>
          </div>
          <div class="card-footer">
            <div class="price">${{ form.class3.price.toFixed(2) }} USD</div>
            <div class="original-price">${{ form.class3.originalPrice.toFixed(2) }} USD</div>
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
  [ja]: '90px',
  [en]: '100px',
  [zh]: '110px',
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
.gap5 {
  gap: 5px;
}

.combo-pack {
  padding-bottom: 100px;

  .item {
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
            margin-right: 40px;
            font-family: PingFangSC, 'PingFang SC';
            font-size: 14px;
            font-weight: 400;
            color: #555;
            white-space: nowrap;
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

  .key-wrap1 {
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

          // width: 56px;
          margin-right: 40px;
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          color: #555;
          white-space: nowrap;
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
      }
    }
  }

  .card-wrap {
    display: flex;
    gap: 20px;
    width: 100%;
    margin-top: 20px;

    .card {
      &:hover {
        box-shadow: 0 0 6px 4px rgb(0 0 0 / 8%);
      }

      position: relative;
      display: flex;
      flex-direction: column;
      width: calc(100% / 3);
      padding: 20px;
      padding-bottom: 32px;
      background: linear-gradient(45deg, #fff 45%, #dfeafe 100%);
      backdrop-filter: blur(10px);
      border-radius: 8px;
      box-shadow: 0 0 6px 1px rgb(0 0 0 / 8%);

      .icon {
        position: absolute;
        top: -2px;
        right: 0;
        width: 50px;
        height: 24px;
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 500;
        line-height: 24px;
        color: #fff;
        text-align: center;
        background-image: url('@/assets/images/storage/cat-mandatory-bg.png');
        background-size: 100% 100%;
      }

      .content {
        flex: 1;
      }

      .card-title {
        height: 100px;

        .title {
          margin-bottom: 8px;
          font-size: 20px;
          font-weight: 500;
          color: #282e3e;
        }

        .desc {
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          color: #5b6786;
        }
      }

      .card-form {
        margin: 32px 0;

        .form-item {
          display: flex;
          align-items: center;
          margin-bottom: 20px;

          .label {
            flex-shrink: 0;
            width: 80px;
            margin-right: 8px;
            font-size: 14px;
            font-weight: 400;
            color: #5b6786;
          }

          .el-select,
          .el-input-number {
            width: 100%;
          }
        }

        .type-tip {
          margin-top: -12px;
          margin-bottom: 16px;
          margin-left: 88px;
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          color: #999;
        }
      }

      .card-footer {
        display: flex;
        gap: 10px;
        align-items: baseline;
        height: 68px;
        padding-top: 32px;
        white-space: nowrap;
        border-top: 1px solid rgb(158 166 179 / 25%);

        .price {
          font-size: 28px;
          font-weight: 500;
          line-height: 36px;
          color: #fa6400;
        }

        .original-price {
          font-size: 14px;
          font-weight: 400;
          color: #999;
          text-decoration-line: line-through;
        }
      }
    }
  }
}
</style>
