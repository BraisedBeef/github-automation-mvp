<template>
  <div class="components-show">
    <div class="components-title">
      <div>组件</div>
      <div class="svg-title-r">
        <el-tooltip content="在这里!" :visible="!show" placement="left" popper-class="cat-tooltip-popper">
          <el-switch v-model="show" class="handle-show" />
        </el-tooltip>
        <span :style="{ color: show ? '#0FBE5B' : '#555555', 'margin-left': '8px' }">{{ show ? '展示' : '收起' }}</span>
      </div>
    </div>
    <div v-if="show" class="components-wrap">
      <!-- 左侧导航 -->
      <div class="components-menu">
        <div
          v-for="item in menu"
          :key="item.value"
          class="components-menu-item"
          :class="{ active: activeComponent === item.value }"
          @click="handleChange(item)"
        >
          {{ item.label }}
        </div>
      </div>
      <!-- 右侧内容 -->
      <div class="components-content">
        <div class="components-content-inner">
          <div class="components-item-title">
            {{ activeComputed?.title }}
          </div>
          <div class="components-item">
            <!-- 步骤条 -->
            <template v-if="activeComponent === 'step'">
              <CatStep v-model="step.active" :steps="step.steps" :v-change="false" />
              <el-button
                :disabled="step.active === step.steps[step.steps.length - 1].value"
                type="primary"
                @click="nextStep(1)"
              >
                下一步
              </el-button>
              <el-button :disabled="step.active === step.steps[0].value" @click="nextStep(0)"> 上一步 </el-button>
            </template>
            <!-- 标签页 -->
            <template v-else-if="activeComponent === 'tab'">
              <CatTabs v-model="tab.active" :tabs="tab.tabs">
                <CatTabPane :value="1"> 标签一的content </CatTabPane>
                <CatTabPane :value="2"> 标签二的content </CatTabPane>
              </CatTabs>
            </template>
            <!-- 标签盒子 -->
            <template v-else-if="activeComponent === 'tab_box'">
              <CatTabsBox v-model="tab_box.active" :list="tab_box.list" />
            </template>
            <!-- 模态框 -->
            <template v-else-if="activeComponent === 'dialog'">
              <el-button type="primary" style="margin-right: 20px" @click="() => (dialog.show = true)">
                点击我!
              </el-button>
              <el-checkbox v-model="dialog.disabled" label="禁止confirm按钮" />
              <el-input
                v-model="dialog.cancelText"
                style="width: 120px; margin-left: 20px"
                :max-length="20"
                placeholder="留下点足迹吧"
              />
              <CatDialog
                v-model:dialog="dialog.show"
                title="标题"
                icon="file-failed"
                :loading="dialog.loading"
                :disabled="dialog.disabled"
                :cancel-text="dialog.cancelText"
                width="666"
                @confirm="dialogConfirm"
              >
                内容区域
              </CatDialog>
            </template>
            <!-- 分页器 -->
            <template v-else-if="activeComponent === 'pager'">
              <div>
                我是文本显示, 不属于分页组件
                <br />
                当前页码: {{ pager.page }}
                <br />
                每页显示: {{ pager.pageSize }}
              </div>
              <CatPagination v-model:pagination="pager" :total="999" />
            </template>
            <!-- 下拉列表 -->
            <template v-else-if="activeComponent === 'select'">
              <CatSelect v-model="selectValue" :list="selectList" placeholder="随便写的" />
              <CatSelect v-model="selectValue" :list="selectList" placeholder="随便写的">
                <template #start>
                  <el-option label="单独加的第一个" value="sb1" />
                </template>
                <template #end>
                  <el-option label="单独加的最后一个" value="sb2" />
                </template>
              </CatSelect>
            </template>
            <!-- 提示 -->
            <template v-else-if="activeComponent === 'tip'">
              <CatTip type="primary">
                提示了哈提示了哈提示了哈提示了哈提示了哈提示了哈提示了哈提示了哈提示了哈提示了哈提示了哈提示了哈提示了哈提示了哈提示了哈提示了哈
              </CatTip>
            </template>
            <!-- 表格 -->
            <template v-if="activeComponent === 'table'">
              <CatTable
                v-model:sort="sortData"
                :columns="columns"
                :table-data="tableData"
                :selection="40"
                @update:sort="handleSort"
                @select-change="handleSelection"
              >
                <template #b-header> 自定义头部内容也是可以的 </template>
                <template #a="{ row }">
                  {{ row.a }}
                </template>
                <template #handle="{ row, rowIndex }">
                  <el-button>{{ '这里是操作' + '-' + row.b + '-' + rowIndex }}</el-button>
                </template>
              </CatTable>
            </template>
            <!-- 输入框 -->
            <template v-if="activeComponent === 'input'">
              <span>基础输入：</span>
              <CatInput style="margin-right: 20px; margin-bottom: 20px" />
              <span>只能输入数字：</span>
              <CatInput just-number style="margin-bottom: 20px" />
              <br />
              <CatInput
                v-model="input3"
                placeholder="非常方便的非空校验："
                :verify-empty="{ message: '校验提示信息', trigger: 'change' }"
              />
              <br />
              <CatInput
                v-model="input4"
                style="margin: 20px 0"
                placeholder="更换一下校验风格："
                error-tooltip="right"
                :verify-empty="{ message: '校验提示信息', trigger: 'change' }"
              />
              <br />
              <CatInput v-model="input5" placeholder="自定义校验：" error-tooltip="bottom" :rules="rules" />
            </template>
            <!-- more -->
            <template v-else-if="activeComponent === 'more'"> ... </template>

            <!-- script -->
            <div
              v-if="activeComputed?.script"
              class="components-script"
              :style="{ height: showScript ? 'auto' : '38px' }"
            >
              <div class="components-script-handle">
                <span>代码片段</span>
                <div>
                  <SvgIcon name="copy" class="copy" @click="handleCopy" />
                  <SvgIcon name="sub-back" class="toggle" :class="{ active: showScript }" @click="toggleScript" />
                </div>
              </div>
              <div class="components-script-info" :style="{ transform: `scaleY(${showScript ? '1' : '0'})` }">
                {{ activeComputed?.script }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { componentsShow } from './config'
import { _throttle } from '@/utils/timing-utils'
import { handleCopyValue } from '@/utils/dom-utils'
import type { ComponentMenu } from './type'
import CatStep from '../cat-step/index.vue'
import CatTabs from '../cat-tabs/index.vue'
import CatTabsBox from '../cat-tabs-box/index.vue'
import CatDialog from '../cat-dialog/index.vue'
import CatPagination from '../cat-pagination/index.vue'
import { message } from '@/utils/message'
import CatTable from '../cat-table/index.vue'
import { InputValidate } from '../cat-input/index.vue'

const show = ref(true)
const showScript = ref(true)
const menu = ref<ComponentMenu[]>(componentsShow.menu)
const activeComponent = ref('input')
const activeComputed = computed(() => menu.value.find(item => item.value === activeComponent.value))
// 切换显示组件
const handleChange = (item: { label: string; value: string }) => {
  showScript.value = true
  activeComponent.value = item.value
}
// 切换显示script
const toggleScript = () => {
  showScript.value = !showScript.value
}
// 复制代码
const handleCopy = async () => {
  if (activeComputed.value?.script) await handleCopyValue(activeComputed.value?.script)
  message.success('复制成功')
}

/**************************** step *************************/
const step = ref({
  active: 'e',
  steps: [
    { label: '步骤一', value: 'a' },
    { label: '步骤二', value: 'b' },
    {
      label: '这个步骤名字太长显示不下只能hover了',
      value: 'c',
    },
    { label: '步骤四', value: 'e' },
  ],
})

const nextStep = (t: 0 | 1) => {
  const index = step.value.steps.findIndex(item => item.value === step.value.active)
  if (index === -1) {
    step.value.active = step.value.steps[0].value
    return
  }
  if (t) {
    step.value.active = step.value.steps[index + 1].value
  } else {
    step.value.active = index === 0 ? '' : step.value.steps[index - 1].value
  }
}

/*************************** step ****************************/

/**************************** tabs *************************/
const tab = ref({
  active: 2,
  tabs: [
    { label: '标签一', value: 1 },
    { label: '标签二', value: 2 },
  ],
})
/**************************** tabs *************************/

/**************************** tabs-box *************************/
const tab_box = ref({
  active: 'green',
  list: [
    { label: '鹤顶红', value: 'red' },
    { label: '咸鸭蛋无敌超级黄', value: 'yellow' },
    { label: '苏打绿', value: 'green' },
  ],
})

/**************************** tabs-box *************************/

/**************************** dialog *************************/
const dialog = ref({
  show: false,
  loading: false,
  disabled: false,
  cancelText: '原始人',
})
const dialogConfirm = () => {
  dialog.value.loading = true
  setTimeout(() => {
    dialog.value.loading = false
    dialog.value.show = false
  }, 2000)
}
/**************************** dialog *************************/
/**************************** pagination *************************/
const pager = ref({
  page: 1,
  pageSize: 10,
})
/**************************** pagination *************************/
const selectValue = ref('')
const selectList = ref([
  { label: 'label1', value: 0, disabled: false },
  { label: 'label2', value: 1, disabled: true },
])
/**************************** pagination *************************/

/**************************** table *************************/
const columns: TableColumn[] = [
  { prop: 'a', label: '好听就是响头' },
  { prop: 'b', label: '啊数据库戴纳肯几十年单手打哪三大年卡手机打' },
  { prop: 'handle', label: '操作', fixed: 'right', width: 200 },
]
const tableData: any[] = [
  { id: 1, a: 'a1', b: 'b1' },
  {
    id: 2,
    a: '文本超出了应该是会自动tooltip的！多写点文字方便触发, 新的一年即将来临祝你万事如意心想事成笑口常开',
    b: 'b2',
  },
  { id: 3, a: 'a3', b: 'b3' },
]

const sortData = ref<any>({
  a: '', // '' | 'up' | 'down'
})

const handleSort = sort => {
  message.success(`当前点击排序的列: ${Object.keys(sort)[0]}, 状态: ${Object.values(sort)[0]}`)
}

const handleSelection = selection => {
  message.success(`开启了多选, 目前已选择的表格行数量：${selection.length}`)
}

// 开启选项
/**************************** table *************************/

/**************************** input *************************/
const input3 = ref('')
const input4 = ref('')
const input5 = ref('')
const customCheck = (rule, value: string, callback) => {
  if (!value) {
    callback(new Error('不能为空！'))
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,16}$/.test(value)) {
    callback(new Error('请输入6 ~ 16个字符，必须包含大写字母，小写字母，数字'))
  } else {
    callback()
  }
}
const rules: InputValidate[] = [
  {
    validator: customCheck,
    trigger: 'blur',
  },
]
/**************************** input *************************/
</script>

<style scoped lang="scss">
.components-show {
  width: 100%;
  padding: 24px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 0 4px #ccc;

  .components-title {
    display: flex;
    justify-content: space-between;
    font-size: 18px;

    .svg-title-r {
      display: flex;
      align-items: center;
      font-size: 16px;
    }

    .el-input {
      width: 200px;
    }
  }

  .components-wrap {
    display: flex;

    .components-menu {
      width: 160px;
      padding-right: 32px;
      margin-top: 20px;
      border-right: 1px solid #ccc;

      .components-menu-item {
        padding: 12px 20px;
        margin-bottom: 20px;
        color: var(--table-text);
        border-radius: 4px;

        &:hover {
          color: var(--primary-color);
          cursor: pointer;
        }

        &.active {
          color: var(--primary-color);
          background-color: #eef5fe;
        }
      }
    }

    .components-content {
      width: calc(100% - 160px);
      padding: 0 20px;

      .components-content-inner {
        padding: 20px;
      }
    }

    .components-item-title {
      margin-bottom: 20px;
      font-size: 20px;
      font-weight: bold;
    }

    .components-item {
      padding: 20px;
      border: 1px solid #ddd;

      .components-script {
        margin-top: 20px;
        overflow: hidden;
        background-color: #f5f7fa;
        border: 1px solid #ddd;
      }

      .components-script-handle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 36px;
        padding: 0 16px;
        background-color: #fff;

        svg {
          width: 16px;
          height: 16px;
          margin-left: 20px;
          color: var(--sub-text);

          &:hover {
            color: var(--primary-color);
          }
        }

        .toggle {
          transition: transform 0.3s;
          transform: rotateZ(-180deg);

          &.active {
            color: var(--primary-color);
            transform: rotateZ(-90deg);
          }
        }
      }

      .components-script-info {
        padding: 20px;
        color: var(--primary-color);
        white-space: pre-wrap;
        transition: transform 0.3s;
      }
    }
  }
}
</style>
