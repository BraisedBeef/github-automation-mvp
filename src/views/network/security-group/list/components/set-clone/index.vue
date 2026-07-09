<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('securityGroup.cloneSecurityGroup')"
    width="570px"
    :loading="state.comfirmLoading"
    @confirm="confirmHandle"
    @cancel="cancelFn"
    @update:dialog="() => {}"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToOne" />

    <div class="form-wrap">
      <el-form
        ref="formRef"
        require-asterisk-position="right"
        label-width="auto"
        :model="state.form"
        :rules="rules"
        label-position="left"
      >
        <!-- 原名称 -->
        <el-form-item :label="t('securityGroup.oldName')" prop="oldName">
          <div class="form-value">
            {{ cloneData.name }}
          </div>
        </el-form-item>
        <!-- 目标地域 -->
        <el-form-item :label="t('securityGroup.targetRegion')" prop="targetRegionId" class="area-wrap">
          <div class="df ac">
            <div class="w220">
              <el-select
                v-model="state.form.targetAreaId"
                class="select-opts w-full"
                :placeholder="t('securityGroup.selectLocation')"
                @change="changeArea"
              >
                <el-option v-for="item in props.areaList" :key="item.id" :label="item.location" :value="item.id" />
              </el-select>
            </div>
            <div class="w224 ml10">
              <el-select
                v-model="state.form.targetRegionId"
                class="select-opts w-full"
                :placeholder="t('securityGroup.selectRegion')"
              >
                <el-option v-for="item in state.regionList" :key="item.id" :label="item.regionName" :value="item.id" />
              </el-select>
            </div>
          </div>
        </el-form-item>
        <!-- 新名称 -->
        <el-form-item :label="t('securityGroup.newName')" prop="targetName">
          <el-input
            v-model.trim="state.form.targetName"
            :placeholder="t('securityGroup.inputNewName')"
            maxlength="60"
          />
          <p class="name-desc">
            {{ t('securityGroup.addNameCondition') }}
          </p>
        </el-form-item>
      </el-form>
    </div>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { FormRules } from 'element-plus/es/components/form/src/types'
import { message } from '@/utils/message'
import { getCloneSecurityGroup } from '@/apis/network/security-group'

interface PropType {
  areaList: any[]
  regionId: number
}

const props = withDefaults(defineProps<PropType>(), {})

const emits = defineEmits<{
  (event: 'success'): void
}>()

const tips = computed(() => [
  {
    main: t('securityGroup.cloneSecurityGroupTip'),
  },
])

const initForm = {
  targetAreaId: '',
  targetRegionId: '',
  targetName: '',
}

const show = ref<boolean>(false) // 弹窗显示
const cloneData = ref<any>({}) // 克隆的数据
const formRef = ref<any>()

const state = reactive<{
  comfirmLoading: boolean
  form: { targetAreaId: string | number; targetRegionId: string | number; targetName: string }
  regionList: any[]
}>({
  comfirmLoading: false,
  form: { ...initForm },
  regionList: [],
})

const rules = reactive<FormRules<any>>({
  targetRegionId: [{ required: true, message: '', trigger: 'blur' }],
  targetName: [
    { required: true, message: '', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error(''))
        } else if (!/^[\w\u4e00-\u9fa5.-]{1,60}$/.test(value)) {
          callback(new Error(''))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
})

// 切换大区
const changeArea = (val: number) => {
  state.regionList = props.areaList.find(item => item.id === val)?.regionDTOS || []
}

// 提交方法
const confirmHandle = async () => {
  await formRef.value.validate()
  const params = {
    targetRegionId: state.form.targetRegionId,
    targetName: state.form.targetName,
    regionId: props.regionId,
    id: cloneData.value.id,
    targetDescription: cloneData.value.description,
  }
  state.comfirmLoading = true
  try {
    const res = await getCloneSecurityGroup(params)
    state.comfirmLoading = false
    if (res.success) {
      message.success(t('securityGroup.cloneSuccess'))
      cancelFn()
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.comfirmLoading = false
    console.log('error', err)
  }
}

const cancelFn = () => {
  state.form = { ...initForm }
  state.regionList = []
  cloneData.value = {}
  show.value = false
}

defineExpose({
  show,
  cloneData,
})
</script>
<style scoped lang="scss">
.name-desc {
  margin-top: 10px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 12px;
  font-weight: 400;
  line-height: 17px;
  color: #999;
}

.form-value {
  line-height: 34px;
}

.w220 {
  width: 220px;
}

.w224 {
  width: 224px;
}

.ml10 {
  margin-left: 10px;
}
</style>
