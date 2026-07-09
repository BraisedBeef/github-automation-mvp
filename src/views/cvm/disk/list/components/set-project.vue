<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('disk.setProject.title')"
    width="760px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="cancel"
    @open="open"
  >
    <Collapse v-model="isCollapse" :text="t('disk.setProject.title', [1])">
      <el-table :data="[disk]" class="mt20 table" max-height="600px">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('disk.setProject.idName')">
          <template #default="{ row }">
            <div class="text-primary text-over">
              {{ row.diskId }}
            </div>
            <div class="text-over">
              {{ row.diskName }}
            </div>
          </template>
        </el-table-column>
        <!-- 计费模式 -->
        <el-table-column min-width="200" :label="t('disk.setProject.costType')">
          <template #default="{ row }">
            <span>{{ COST_TYPE_MAP[row.costType] }}</span>
          </template>
        </el-table-column>
        <!-- 创建/到期时间 -->
        <el-table-column min-width="220" :label="t('disk.setProject.time')">
          <template #header>
            <div class="df ac">
              <span class="mr10">{{ t('disk.setProject.time') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div>
              {{ t('disk.setProject.createTime', [maoYunDayJs(row?.createTime).format(FORMAT_TIME)]) }}
            </div>
            <div>
              {{ t('disk.setProject.expiresTime', [maoYunDayJs(row?.expiredTime).format(FORMAT_TIME)]) }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>

    <div class="search-wrap mt20">
      <el-input v-model="condition" :placeholder="t('disk.setProject.searchPh')">
        <template #suffix>
          <SvgIcon name="dns-search" class="cursor-pointer" @click="getUserProjectFn" />
        </template>
      </el-input>
    </div>

    <el-table v-loading="loading" :data="projectList" class="mt20 table">
      <!-- 项目名称 -->
      <el-table-column min-width="200" :label="t('disk.setProject.projectName')">
        <template #default="{ row }">
          <el-radio v-model="checkedProjectId" :label="row.id">
            <div class="text-over">
              {{ row.projectName || '-' }}
            </div>
          </el-radio>
        </template>
      </el-table-column>
      <!-- 项目说明 -->
      <el-table-column min-width="200" :label="t('disk.setProject.projectDesc')">
        <template #default="{ row }">
          <span>{{ row.remarks || '-' }}</span>
        </template>
      </el-table-column>
    </el-table>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { COST_TYPE_MAP } from '@/views/cvm/ins/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { _assignToProject } from '@/apis/cvm/disk'
import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'

interface PropType {
  disk: any
}

const props = withDefaults(defineProps<PropType>(), {
  disk: () => ({}),
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const { loading, getUserProject } = useBaseConfig()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const projectList = ref<any[]>([]) // 项目列表
const isCollapse = ref<boolean>(false) // 是否收起
const checkedProjectId = ref<number>(0) // 勾选的项目
const condition = ref<string>('') // 查询条件

const confirmHandle = () => {
  if (!checkedProjectId.value) {
    return message.warning(t('disk.setProject.projectWarning'))
  }

  assignToProject()
}

// 弹窗打开
const open = () => {
  getUserProjectFn()
}

// 弹窗关闭
const cancel = () => {
  condition.value = ''
  checkedProjectId.value = 0
  isCollapse.value = false
}

// 用户项目列表
const getUserProjectFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      projectList.value = res.data || []
    }
  }

  getUserProject(
    {
      projectName: condition.value,
    },
    cb,
  )
}

// 分配至项目
const assignToProject = async () => {
  try {
    comfirmLoading.value = true

    const res = await _assignToProject({
      id: props.disk.id, // 硬盘id
      projectId: checkedProjectId.value, // 项目id
    })

    console.log(`_assignToProject===>`, res)

    if (res.success) {
      message.success(res.msg)

      show.value = false
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    comfirmLoading.value = false
  }
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped></style>
