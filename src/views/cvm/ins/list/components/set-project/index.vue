<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.setProject.title')"
    width="760px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="cancel"
    @open="open"
  >
    <Collapse v-model="isCollapse" :text="t('ins.setProject.selectIns', [insList.length])">
      <el-table :data="insList" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('ins.setProject.idName')">
          <template #default="{ row }">
            <div class="text-primary">
              {{ row.insUuid }}
            </div>
            <div>{{ row.instanceName }}</div>
          </template>
        </el-table-column>
        <!-- 实例类型 -->
        <el-table-column min-width="200" :label="t('ins.setProject.insType')">
          <template #default="{ row }">
            <div class="df ac">
              <span class="mr10">{{ row.specificationInfo?.typeName }}</span>
              <SvgIcon style="width: 17px; height: 17px" :name="INS_SYS_SVG_MAP[row.imageInfo.platform]?.actived" />
            </div>
          </template>
        </el-table-column>
        <!-- 实例配置 -->
        <el-table-column min-width="300" :label="t('ins.setProject.insConfig')">
          <template #default="{ row }">
            <div style="padding: 14px 0">
              <p>
                <span class="mr10">{{ t('ins.setProject.cores', [row.specificationInfo?.vcpus]) }}</span
                ><span class="mr10">{{ row.specificationInfo?.ram }}GB</span
                ><span class="mr10">{{ handleRowMainPublicBandwidth(row) }}Mbps</span>
              </p>
              <p>{{ t('ins.setProject.sysDisk') }}{{ handleRowSysDiskName(row) }}</p>
              <p>{{ t('ins.setProject.net') }}{{ handleRowVpcName(row) }}</p>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>

    <div class="search-wrap mt20">
      <el-input v-model="condition" :placeholder="t('ins.setProject.searchPh')">
        <template #suffix>
          <SvgIcon name="dns-search" class="cursor-pointer" @click="getUserProjectFn" />
        </template>
      </el-input>
    </div>

    <el-table v-loading="loading" :data="projectList" class="mt20 table">
      <!-- 项目名称 -->
      <el-table-column min-width="200" :label="t('ins.setProject.projectName')">
        <template #default="{ row }">
          <el-radio v-model="checkedProjectId" :label="row.id">
            <div class="text-over">
              {{ row.projectName || '-' }}
            </div>
          </el-radio>
        </template>
      </el-table-column>
      <!-- 项目说明 -->
      <el-table-column min-width="200" :label="t('ins.setProject.projectDesc')">
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
import { useInsTableRow } from '@/views/cvm/hooks/use-ins-table-row'
import { _updateInstanceName } from '@/apis/cvm/ins'
import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'
import { INS_SYS_SVG_MAP } from '@/views/cvm/ins/config'

interface PropType {
  insList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  insList: () => [],
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const { loading, getUserProject } = useBaseConfig()
const { handleRowSysDiskName, handleRowVpcName, handleRowMainPublicBandwidth } = useInsTableRow()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const projectList = ref<any[]>([]) // 项目列表
const isCollapse = ref<boolean>(false) // 是否收起
const checkedProjectId = ref<number>(0)
const condition = ref<string>('') // 查询条件

const confirmHandle = () => {
  if (!checkedProjectId.value) {
    return message.warning(t('ins.setProject.projectWarning'))
  }

  updateInstanceName()
}
// 弹窗打开
const open = () => {
  getUserProjectFn()
}

// 弹窗关闭
const cancel = () => {
  condition.value = ''
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

// 修改服务器信息
const updateInstanceName = async () => {
  try {
    comfirmLoading.value = true
    const serverIds = props.insList.map(el => el.id)

    const res = await _updateInstanceName({
      serverIds, // 服务器ID
      projectId: checkedProjectId.value, // 项目id
    })

    console.log(`_updateInstanceName===>`, res)

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
