<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('recipient.productSubscribeMana')"
    width="790px"
    :loading="updateUserProductSubLoading"
    @open="open"
    @confirm="confirmHandle"
  >
    <div class="info">
      <div class="item mb20 df ac">
        <div class="key-wrap" :class="labelWidthClass">
          {{ t('subscribe.userName') }}
        </div>
        <span class="value">{{ productSubscribe.userName }}</span>
      </div>
      <div class="item mb20 df ac">
        <div class="key-wrap" :class="labelWidthClass">
          {{ t('subscribe.productServices') }}
        </div>
        <span class="value">{{ t('recipient.productServicesDesc') }}</span>
      </div>
    </div>

    <el-row justify="space-between" :gutter="20">
      <!-- 选择产品 -->
      <el-col :span="12">
        <div class="left-list-wrap">
          <div class="search-wrap">
            <el-input v-model.trim="condition" maxlength="30" :placeholder="t('subscribe.searchPlaceholder')" />
          </div>
          <!-- <div class="title">
            <span>{{ t('recipient.allProduct') }}</span>
          </div> -->
          <!-- 不做分页，滚动展示 -->
          <el-table
            ref="tableLeftRef"
            v-loading="loading"
            max-height="320px"
            :data="viewList"
            header-row-class-name="header-row"
            :row-class-name="tableRowClassName"
            @selection-change="handleRowSelectChange"
          >
            <el-table-column type="selection" />
            <el-table-column prop="productCode" :label="t('subscribe.productId')" />
          </el-table>
        </div>
      </el-col>
      <!-- 已选择 -->
      <el-col :span="12">
        <div class="right-list-wrap">
          <div class="title df ac jsb">
            <span>{{ t('recipient.selectProduct', [selectList.length, productSubscribe.products.length]) }}</span>
            <span class="text-primary cursor-pointer" @click="clearAll(tableLeftRef)">{{ t('components.clear') }}</span>
          </div>
          <el-table
            v-loading="loading"
            max-height="320px"
            :show-header="false"
            :data="selectList"
            header-row-class-name="header-row"
            :row-class-name="'row'"
          >
            <el-table-column prop="productCode" :label="t('subscribe.productId')" width="160" />
            <!-- 操作 -->
            <el-table-column prop="number" align="right">
              <template #default="{ row }">
                <!-- 删除 -->
                <el-icon @click="deleteSelectRowList(row)">
                  <CircleCloseFilled />
                </el-icon>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </CatDialog>
</template>
<script lang="ts" setup>
import { CircleCloseFilled } from '@element-plus/icons-vue'
import { message } from '@/utils/message'
import { _updateUserProductSubscribe, _subscribeOverview } from '@/apis/account-system/news'
import t from '@/utils/i18n'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

const props = withDefaults(
  defineProps<{
    uid: number
  }>(),
  { uid: 0 },
)

const emits = defineEmits<{
  (event: 'success'): void
}>()

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const labelWidthClassMap = {
  [ja]: 'key-wrap-w150px',
  [en]: 'key-wrap-w180px',
  [zh]: 'key-wrap-w110px',
}

const labelWidthClass = useI18nStyle(labelWidthClassMap)

const loading = ref<boolean>(false)
const updateUserProductSubLoading = ref<boolean>(false)
const selectList = ref<any>([]) // 选中的角色列表
const show = ref<boolean>(false) // 弹窗显示
const condition = ref<string>('') // 查询条件
const tableLeftRef = ref<any>()
const productSubscribe = reactive<{ count: number; products: any[]; userName: string }>({
  count: 0,
  products: [],
  userName: '',
}) // 产品订阅详情

const confirmHandle = () => {
  updateUserProductSubscribe()
}

// 清空
const clearAll = ins => {
  ins.clearSelection()
}

// 设置row类名
const tableRowClassName = ({ row, rowIndex }: { row: any; rowIndex: number }) => {
  return selectList.value.includes(row) ? 'select-row row' : 'row'
}

// table left 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  console.log(`handleRowSelectChange===>`, selection)
  selectList.value = selection
}

// table right 删除当前行
const deleteSelectRowList = (row: any) => {
  console.log(`deleteSelectRowList===>`, row)

  const i = selectList.value.findIndex(el => el.id === row.id)

  console.log(`deleteSelectRowList===>`, i)

  // 删除右边勾选
  if (i !== -1) {
    // console.log(`i===>`, i);

    selectList.value.splice(i, 1)
    console.log(selectList.value)
  }
  // 删除table left 勾选
  tableLeftRef.value?.toggleRowSelection(row)
}

// 视图上list
const viewList = computed(() => {
  return productSubscribe.products.filter(el => el.productCode.includes(condition.value))
})

const open = () => {
  subscribeOverview()
}

// 更新账户订阅消息
const updateUserProductSubscribe = async () => {
  try {
    updateUserProductSubLoading.value = true
    const productIds = selectList.value.map(el => el.productCode)

    const res = await _updateUserProductSubscribe({
      operateUid: props.uid,
      productIds,
    })
    console.log(`_updateUserProductSubscribe===>`, res)
    if (res.success) {
      emits('success')
      show.value = false
      message.success(t('user.subscribeSuccess'))
    } else {
      message.warning(t('user.subscribeFail'))
    }
  } catch (error) {
    console.log(error)
  } finally {
    updateUserProductSubLoading.value = false
  }
}

// 产品订阅管理
const subscribeOverview = async () => {
  try {
    loading.value = true
    const res = await _subscribeOverview({
      uid: props.uid,
    })
    console.log(`_subscribeOverview===>`, res)
    if (res.success) {
      productSubscribe.count = res.data?.count || 0
      productSubscribe.products = res.data?.products || []
      productSubscribe.userName = res.data?.userName || ''

      nextTick(() => {
        //table left勾选
        viewList.value.forEach(row => {
          if (row.subscribe) {
            tableLeftRef.value?.toggleRowSelection(row)
          }
        })
      })
    } else {
      productSubscribe.count = 0
      productSubscribe.products = []
      productSubscribe.userName = ''
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 条件
watch(condition, () => {
  nextTick(() => {
    //table left勾选
    viewList.value.forEach(row => {
      if (row.subscribe) {
        if (tableLeftRef.value) {
          tableLeftRef.value?.toggleRowSelection(row)
        }
      }
    })
  })
})

defineExpose({
  show,
})
</script>
<style lang="scss" scoped>
.title {
  height: 45px;
  padding-left: 20px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 45px;
  color: var(--primary-text);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-table) {
  .el-table__inner-wrapper::before {
    background: transparent !important;
  }

  .header-row {
    background-color: #fff;

    .el-table__cell {
      /* border-width: 0px; */
      background-color: #fff !important;

      .cell {
        /* padding-left: 0px !important; */
      }
    }
  }

  // 选中row
  .select-row {
    td {
      .cell {
        color: var(--primary-color);

        /* background: var(--el-table-current-row-bg-color); */
        background: var(--selected-bgc) !important;
      }
    }
  }

  .row {
    height: 38px;

    &:hover {
      background: var(--selected-bgc) !important;
    }

    .el-table__cell {
      height: 34px;
      border-width: 0;

      .cell {
        width: 100%;
        height: 34px;
        line-height: 34px !important;

        /* padding-left: 0px !important; */
      }
    }
  }
}

.left-list-wrap,
.right-list-wrap {
  box-sizing: border-box;
  width: 360px;
  padding: 11px;
  border: 1px solid var(--border-c);

  /* height: 372px; */
  border-radius: 4px;
}

.info {
  .key-wrap {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--common-text);
  }

  .key-wrap-w110px {
    flex-shrink: 0;
    width: 110px;
  }

  .key-wrap-w150px {
    flex-shrink: 0;
    width: 150px;
  }

  .key-wrap-w180px {
    flex-shrink: 0;
    width: 180px;
  }

  .value {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--primary-text);
  }
}
</style>
