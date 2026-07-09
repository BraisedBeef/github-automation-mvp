<template>
  <CatDialog
    :title="t('myDomains.editGroup')"
    :dialog="dialog"
    class="group-dialog"
    :loading="state.loading"
    :width="720"
    @confirm="close"
    @update:dialog="(v: boolean) => !v && close()"
  >
    <div class="group-dialog-content">
      <!-- 分组操作 -->
      <div class="list">
        <div class="title">
          <div class="title-name">
            {{ t('myDomains.groupName') }}
          </div>
          <div class="title-handle">
            {{ t('columns.operation') }}
          </div>
        </div>
        <div class="list-content" @click.stop>
          <div v-for="(item, index) in state.newList" :key="item.value" class="list-content-item">
            <div class="litem-value">
              <el-input
                v-model.trim="item.label"
                :max-length="30"
                style="width: 360px"
                :placeholder="t('myDomains.enterGroupName')"
                :class="{ 'my-focus': state.current === index }"
              />
            </div>
            <div class="item-handle" @click.stop>
              <template v-if="state.current === index">
                <el-link type="primary" :disabled="!item.label || state.loading" @click="handleSave(item, index)">
                  {{ t('common.save') }}
                </el-link>
                <el-link type="primary" :disabled="state.loading" @click="handleCancel(item, index)">
                  {{ t('common.cancel') }}
                </el-link>
              </template>
              <template v-else>
                <el-link
                  type="primary"
                  :disabled="(state.current !== void 0 && state.current !== index) || state.loading"
                  @click="setFocus(item, index)"
                >
                  {{ t('common.edit') }}
                </el-link>
                <el-link
                  type="primary"
                  :disabled="(state.current !== void 0 && state.current !== index) || state.loading"
                  @click="handleDelete(item.value)"
                >
                  {{ t('common.delete') }}
                </el-link>
              </template>
            </div>
          </div>
        </div>
        <div class="list-handle">
          <SvgIcon name="group-add" pointer :class="{ disabled: state.current !== void 0 }" @click="handleAdd" />
        </div>
      </div>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import { _changeGroup, _deleteGroup } from '@/apis/dns/group'
import { _deepClone } from '@/utils/collection-utils'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
interface Item {
  label: string
  value: number
  isNew?: boolean
}
const props = withDefaults(
  defineProps<{
    list: Item[]
    dialog: boolean
  }>(),
  {
    dialog: false,
  },
)

const emit = defineEmits<{
  (event: 'update:dialog', dialog: boolean): void
  (event: 'refresh'): void
}>()

const state = reactive<{
  loading: boolean
  newList: Item[]
  current: any
  oldValue: string // 记录修改前的值
}>({
  loading: false,
  newList: [],
  current: void 0, // 当前聚焦的input
  oldValue: '',
})

// 点击修改
const setFocus = (item: Item, i: number) => {
  if (state.current !== void 0) {
    handleCancel(state.newList[state.current])
  }
  state.current = i
  if (!item.isNew) {
    state.oldValue = item.label
  }
  autoFocus(i)
}

// 点击保存
const handleSave = async (item: Item, i: number) => {
  const { value, label, isNew } = item
  let data: any = {
    name: label,
  }
  // 如果是新添加的
  if (!isNew) {
    data.groupId = value
  } else {
    data.groupId = 0
  }
  try {
    state.loading = true
    const { code } = await _changeGroup(data)
    state.loading = false
    if (code === 200) {
      message.success(`${isNew ? t('common.addSuccess') : t('common.changeSuccess')}`)
      emit('refresh')
      state.current = void 0
    }
  } catch (error) {
    state.loading = false
  }
}

// 点击取消
const handleCancel = (item: Item, i?: number) => {
  // 如果是新添加的
  if (item.isNew) {
    state.newList.pop()
    state.current = void 0
  } else {
    state.newList[state.current].label = state.oldValue
    state.current = void 0
  }
}

// 添加分组
const handleAdd = () => {
  if (state.current !== void 0) {
    return
  }
  state.newList.push({
    label: '',
    value: +new Date(),
    isNew: true, // 标注是新添加的数据
  })
  state.current = state.newList.length - 1
  autoFocus(state.current)
}

// 删除分组
const handleDelete = async (groupId: number) => {
  try {
    state.loading = true
    const { code } = await _deleteGroup({ groupId })
    state.loading = false
    if (code === 200) {
      message.success(t('common.deleteSuccess'))
      state.current = void 0
      emit('refresh')
    }
  } catch (error) {
    state.loading = false
  }
}

// 自动聚焦
const autoFocus = (i: number) => {
  nextTick(() => {
    const el = document.querySelectorAll('.list-content-item')[i].querySelectorAll('input')[0]
    el.focus()
  })
}

const close = () => {
  if (state.current !== void 0) {
    handleCancel(state.newList[state.current])
  }
  emit('update:dialog', false)
}

// 深拷贝list
watch(
  () => props.list,
  () => {
    state.newList = _deepClone(props.list)
  },
  { immediate: true, deep: true },
)
</script>

<style scoped lang="scss">
.list {
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--border-c);
  border-radius: 4px;

  & > div {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .title {
    height: 40px;
    font-family: 'PingFang SC-Regular', 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #999;
    background: var(--table-head-bgc);
    border-bottom: 1px solid var(--border-c);

    .title-name {
      flex: 1;
      flex-shrink: 0;
      padding-left: 20px;
    }

    .title-handle {
      flex-shrink: 0;
      width: 136px;
    }
  }

  .list-handle {
    flex-shrink: 0;
    justify-content: center;
    height: 60px;

    svg {
      width: 16px;
      height: 16px;
      color: var(--primary-color);

      &.disabled {
        color: #ddd;
        cursor: not-allowed;
      }
    }
  }

  .list-content {
    flex-direction: column;
    padding: 0;
    overflow: auto;

    &::-webkit-scrollbar {
      display: none;
    }

    .list-content-item {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 60px;
      border-bottom: 1px solid #eee;
    }

    .litem-value {
      width: calc(100% - 256px);
      padding-left: 20px;
      margin-right: 48px;

      :deep(.el-input) {
        height: 34px;
        border: 0;

        .el-input__wrapper {
          padding-left: 0;
          box-shadow: none;

          .el-input__inner {
            overflow: hidden;
            font-family: 'PingFang SC-Regular', 'PingFang SC';
            font-size: 14px;
            font-weight: 400;
            color: #000;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        &.my-focus {
          .el-input__wrapper {
            padding-left: 12px;
            box-shadow: 0 0 0 1px #d7dade inset;

            .el-input__inner {
              color: #000;
            }
          }
        }

        &.is-disabled {
          .el-input__wrapper {
            background-color: #fff;

            .el-input__inner {
              // placeholder
            }
          }
        }
      }
    }

    .item-handle {
      display: flex;
      flex-shrink: 0;
      width: 136px;

      .el-link {
        margin-right: 30px;
        user-select: none;
      }
    }
  }
}
</style>

<style></style>
