<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ipGroup.addIpAddress')"
    width="760px"
    :loading="state.comfirmLoading"
    @confirm="confirmHandle"
    @open="open"
    @close="closeFn"
  >
    <div class="form-wrap">
      <div class="type-1-add-content">
        <el-form
          v-for="(item, index) in state.addList"
          :key="item.keys"
          :ref="
            (el: any) => {
              addFormList[index] = el
            }
          "
          :model="item[0]"
          :rules="rulesList[index]"
          label-width="0"
        >
          <el-table :data="item" :show-header="!index">
            <!-- IP地址 -->
            <el-table-column width="315" :label="t('ipGroup.ipAddress')">
              <template #header>
                <div class="df ac">
                  <p>{{ t('ipGroup.ipAddress') }}</p>
                  <div class="tooltip-box">
                    <el-tooltip placement="top" effect="light">
                      <el-icon><Warning /></el-icon>
                      <template #content>
                        <div class="tip-msg">
                          <p>{{ t('ipGroup.addIpGroupFormat') }}</p>
                          <p>{{ t('ipGroup.addIpGroupFormatOne') }}</p>
                          <p>{{ t('ipGroup.addIpGroupFormatTwo') }}</p>
                          <p>{{ t('ipGroup.addIpGroupFormatThree') }}</p>
                        </div>
                      </template>
                    </el-tooltip>
                  </div>
                </div>
              </template>
              <template #default="{ row }">
                <div class="py11 w272">
                  <el-form-item label="" prop="ip">
                    <el-input v-model.trim="row.ip" :placeholder="t('ipGroup.placeInputIpAddress')" />
                  </el-form-item>
                </div>
              </template>
            </el-table-column>
            <!-- 备注 -->
            <el-table-column width="315" :label="t('ipGroup.remark')">
              <template #default="{ row }">
                <div class="py11 w272">
                  <el-form-item label="" prop="description">
                    <el-input v-model.trim="row.description" :placeholder="t('ipGroup.placeInputRemark')" />
                  </el-form-item>
                </div>
              </template>
            </el-table-column>
            <!-- 操作 -->
            <el-table-column width="98" :label="t('ipGroup.operate')">
              <span v-if="state.addList.length > 1" class="text-primary cursor-pointer" @click="removeRow(index)">{{
                t('ipGroup.delete')
              }}</span>
              <!-- <el-icon class="cursor-pointer" color="#999999" v-if="!!index" @click="() => removeRow(index)">
                <CircleCloseFilled />
              </el-icon> -->
            </el-table-column>
          </el-table>
        </el-form>
        <div class="type-1-table-add cat-flex">
          <span class="text-primary cursor-pointer" @click="addRow">+{{ t('ipGroup.addNewLine') }}</span>
        </div>
      </div>
    </div>
  </CatDialog>
</template>
<script lang="ts" setup>
import t from '@/utils/i18n'
import { CircleCloseFilled } from '@element-plus/icons-vue'
import { Warning } from '@element-plus/icons-vue'
import { FormRules } from 'element-plus/es/components/form/src/types'
import { updateIpGroup } from '@/apis/network/ip-group'
import { message } from '@/utils/message'

interface PropType {
  detail: any
}

const props = withDefaults(defineProps<PropType>(), {})

const emits = defineEmits<{
  (event: 'success'): void
}>()

interface Form {
  ip: string
  description: string
}

const show = ref<boolean>(false)

const state = reactive<{
  comfirmLoading: boolean
  addList: any[][]
}>({
  comfirmLoading: false,
  addList: [[{ ip: '', description: '', etherType: 'IPv4', keys: new Date().getTime() }]],
})

const rules = reactive<FormRules<Form>>({
  ip: [
    {
      validator: (rule, value, callback) => {
        // --------- 这里还需要对ip地址进行校验 ------------
        if (value === '') {
          callback(new Error(t('')))
        } else {
          callback()
        }
      },
    },
  ],
})
const rulesList = ref<FormRules<Form>[]>([
  {
    ip: rules.ip,
  },
])

const addFormList = ref<any[]>([])

// 删除一行
const removeRow = index => {
  state.addList.splice(index, 1)
  rulesList.value.splice(index, 1)
}

// 添加一行
const addRow = () => {
  if (props.detail.ipList.length + state.addList.length >= 20) {
    message.warning(t('ipGroup.maxAddNumber'))
    return
  }
  state.addList.push([{ ip: '', description: '', etherType: 'IPv4', keys: new Date().getTime() }])
  rulesList.value.push({
    ip: rules.ip,
  })
}

const confirmHandle = async () => {
  const formList = addFormList.value.map((i, index) => {
    return i?.validate ? i.validate() : []
  })
  await Promise.all(formList)
  const ipList = state.addList.map(item => item[0])
  const params = {
    ...props.detail,
    ipList: [...props.detail.ipList, ...ipList],
  }
  state.comfirmLoading = true
  try {
    const res = await updateIpGroup(params)
    state.comfirmLoading = false
    if (res.success) {
      message.success(t('ipGroup.addIpSuccess'))
      emits('success')
      show.value = false
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.comfirmLoading = false
    console.log('error', err)
  }
}

const closeFn = () => {
  addFormList.value.forEach(i => {
    i?.resetFields()
  })
  state.addList = [[{ ip: '', description: '', etherType: 'IPv4' }]]
  addFormList.value = []
  rulesList.value = [
    {
      ip: rules.ip,
    },
  ]
  show.value = false
}

const open = () => {}

defineExpose({
  show,
})
</script>
<style lang="scss" scoped>
.w272 {
  width: 272px;
}

.type-1-add-content {
  position: relative;
  flex: 1;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid var(--border-c);

  .type-1-table-wrap {
    width: 100%;
  }

  .type-1-table-add {
    width: 100%;
    height: 60px;
    cursor: pointer;

    svg {
      width: 24px;
      height: 24px;
    }
  }
}

.tooltip-box {
  position: relative;
  top: 2px;
  margin-left: 5px;
}
</style>
