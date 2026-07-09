<template>
  <CatDialog2
    :dialog="dialog"
    :title="t('recordMana.addDialogTitle')"
    width="942px"
    :close-on-click-modal="false"
    :loading="loading"
    @cancel="close"
    @close="close"
    @confirm="() => handleConfirm(_form)"
  >
    <el-dropdown popper-class="record-exchange-popper" class="dns-record-exchange" trigger="hover">
      <SvgIcon name="dns-record-exchange" pointer @click="handleChange" />
      <template #dropdown>
        <div v-if="dialog" class="record-exchange-content">
          <div class="t">
            {{ t('recordMana.useLine') }}
          </div>
          <div class="pic">
            <img :src="RecordLineImg" alt="" />
          </div>
          <el-button type="primary" @click="handleChange">
            {{ t('recordMana.try') }}
          </el-button>
        </div>
      </template>
    </el-dropdown>
    <div class="content">
      <el-form ref="_form" :model="form" label-position="left" label-width="auto" :rules="rules" hide-required-asterisk>
        <el-form-item :label="t('columns.recordType')" @mouseenter="handleEnter('#record_type')">
          <el-select
            v-model="form.recordType"
            value-key="value"
            popper-class="custom-recordType-select"
            :loading="loading"
            @change="resetFormValid"
          >
            <el-option v-for="item in analysis" :key="item.name" :value="item.type" :label="item.name">
              <div class="custom-recordType">
                <div>{{ item.name }}</div>
                <div>{{ item.d1 }}</div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="t('columns.origin')" class="host_reocord" @mouseenter="handleEnter('#host_record')">
          <el-input v-model="form.hostRecord" placeholder="@">
            <template #append> .{{ domainName }} </template>
          </el-input>
        </el-form-item>
        <el-form-item :label="t('columns.lineType')" @mouseenter="handleEnter('#line_type')">
          <DnsLine
            v-model:id="form.lineTypeId"
            :options="lineTypes"
            tele-class="addr"
            style="width: 100%"
            @update:id="dnsLineChange"
            @change="dnsLineChange"
          />
        </el-form-item>
        <el-form-item
          :label="t('columns.recordValue')"
          class="ip"
          prop="recordValue"
          @mouseenter="handleEnter('#record_value')"
        >
          <el-input
            v-model="form.recordValue"
            maxlength="200"
            resize="none"
            :placeholder="t('recordMana.recordValuePlaceholder2')"
            type="textarea"
          />
        </el-form-item>
        <el-form-item
          v-if="activeRecordType.weight"
          :label="t('columns.weights')"
          prop="weight"
          @mouseenter="handleEnter('#weight')"
        >
          <el-input v-model="form.weight" :placeholder="t('recordMana.weightPlaceholder2')" />
        </el-form-item>
        <el-form-item v-if="activeRecordType.mx" :label="t('columns.mx')" prop="mx" @mouseenter="handleEnter('#mx')">
          <el-input v-model="form.mx" :placeholder="t('recordMana.mxPlaceholder2')" />
        </el-form-item>
        <el-form-item label="TTL" prop="ttl" @mouseenter="handleEnter('#ttl')">
          <el-input v-model="form.ttl" :placeholder="t('recordMana.ttlPlaceholder2')">
            <template #append>
              {{ t('common.second') }}
            </template>
          </el-input>
        </el-form-item>
        <el-form-item :label="t('columns.remark')" @mouseenter="handleEnter('#remark')">
          <el-input v-model="form.remark" :placeholder="t('recordMana.remarkPlaceholder2')" />
        </el-form-item>
      </el-form>
      <div class="msg" :class="{ empty: !active }">
        <template v-if="!active">
          <SvgIcon name="add-record-empty" />
          <div>{{ t('recordMana.addDes') }}</div>
        </template>
        <template v-else>
          <div class="msg-info">
            <div class="info-title">
              {{ addNoticeObj[active].title }}
            </div>
            <div class="info-content">
              <div
                v-for="(item, index) in computedNoticeObj[active]"
                :key="index"
                :class="active.replace('#', '')"
                class="info-item"
              >
                <span v-if="item.title">{{ item.title }}</span>
                <span>{{ item.text }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </CatDialog2>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { INT0TO100_REG, POSITIVE_0_INT_REG } from '@/utils/reg'
import { FormInstance } from 'element-plus/es/components'
import CatDialog2 from '@/components/common/cat-dialog2/index.vue'
import { _throttle } from '@/utils/timing-utils'
import RecordLineImg from '@/assets/images/dns/record-line2.png'
import DnsLine from '@/components/dns/dns-line/index.vue'
import { _matchRouteType } from '@/utils/dns-utils'

const props = withDefaults(
  defineProps<{
    dialog: boolean
    domainName?: string
    analysis?: any[]
    lineTypes?: any[]
    isEdit?: boolean
    noticeObj: any
    loading?: boolean
    row?: any
  }>(),
  {
    dialog: false,
    domainName: '',
    analysis: () => [],
    lineTypes: () => [],
    isEdit: false,
    noticeObj: () => ({}),
    row: () => ({}),
  },
)
const emit = defineEmits<{
  (event: 'close', row: any): void
  (event: 'confirm', row: any): void
  (event: 'be-line', row: any): void
  (event: 'change-value-tip', type?: number): void
  (event: 'update:dialog', dialog: boolean): void
}>()

const close = _throttle(() => {
  console.log('触发close')
  emit('update:dialog', false)
  emit('close', form.value)
  resetFormValid()
}, 300)

const _form = ref()

const handleEnter = (id: string) => {
  active.value = id
}

const checkWeight = (rule: any, value: any, callback: any) => {
  if (!INT0TO100_REG.test(value)) {
    callback(new Error(t('recordMana.weightValidate')))
  } else {
    callback()
  }
}
const checkTTL = (rule: any, value: any, callback: any) => {
  if (!value) {
    // form.value.ttl = 600
    callback(new Error(''))
  } else if (value < 1 || value > 604800) {
    callback(new Error(t('recordMana.TTLvalidate2')))
  } else if (!POSITIVE_0_INT_REG.test(value)) {
    callback(new Error(t('recordMana.TTLvalidate1')))
  } else {
    callback()
  }
}
const checkMx = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error(t('')))
  } else if (value < 0 || value > 50) {
    callback(new Error(t('recordMana.mxValidate2')))
  } else if (!POSITIVE_0_INT_REG.test(value)) {
    callback(new Error(t('recordMana.mxValidate1')))
  } else {
    callback()
  }
}

const form = ref<any>({
  recordType: '', // 记录类型
  hostRecord: '', // 源站地址
  lineTypeId: '', // 线路类型id
  recordValue: '',
  weight: '', // 权重
  mx: '',
  ttl: '',
  remark: '', // 备注
})

const dnsLineChange = () => {
  console.log('dnsLineChange', form.value)
}

const rules = {
  recordValue: [{ message: '', required: true, trigger: 'blur' }],
  weight: [{ validator: checkWeight, trigger: 'blur' }],
  ttl: [{ validator: checkTTL, trigger: 'blur' }],
  mx: [{ validator: checkMx, trigger: 'blur' }],
}

const active = ref<string>('')

const activeRecordType = computed(() => {
  return props.analysis.find(item => item.type === form.value.recordType) || {}
})

const addNoticeObj = {
  '#record_type': {
    title: t('recordMana.howRecordType'),
  },
  '#host_record': {
    title: t('recordMana.howHostRecord'),
  },
  '#line_type': {
    title: t('recordMana.howLineType'),
  },
  '#record_value': {
    title: t('recordMana.howRecordValue'),
  },
  '#weight': {
    title: t('recordMana.howMx'),
  },
  '#ttl': {
    title: 'TTL',
  },
  '#mx': {
    title: t('recordMana.howMx'),
  },
  '#remark': {
    title: t('columns.remark'),
  },
}

const computedNoticeObj = computed(() => {
  props.noticeObj['#remark'] = [{ text: t('recordMana.remarkTip') }]
  const type = _matchRouteType(form.value.lineTypeId, props.lineTypes, '')
  props.noticeObj['#line_type'] = [
    {
      title: type?.lineName,
      text: type?.isDefault
        ? t('recordMana.line_type2')
        : t('recordMana.line_type_custom', { lineName: type?.lineName }),
    },
  ]

  return props.noticeObj
})

const handleConfirm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
      emit('confirm', form.value)
    } else {
      console.log('error submit!', fields)
    }
  })
}

const resetFormValid = (t?: number) => {
  emit('change-value-tip', t)
  if (_form.value) {
    _form.value.clearValidate()
  }
}
const resetForm = () => {
  _form.value.clearValidate()
  _form.value.resetField()
}

const handleChange = () => {
  emit('be-line', form.value)
}

watch(
  () => props.analysis,
  () => {
    if (!props.isEdit && props.analysis[0]) {
      form.value.recordType = props.analysis[0].type
    }
  },
  { immediate: true },
)
watch(
  () => props.lineTypes,
  () => {
    console.log('纳尼', props.lineTypes)

    if (!props.isEdit && props.lineTypes[0]) {
      form.value.lineTypeId = props.lineTypes[0].lineId
    }
  },
  { immediate: true },
)

watch(
  () => props.dialog,
  () => {
    emit('change-value-tip')
    if (props.dialog) {
      if (props.isEdit) {
        form.value = { ...props.row, type: 'edit' }
      } else {
        const defaultLine = props.lineTypes.find(item => item.isDefault)
        form.value = {
          recordType: props.analysis[0].type,
          hostRecord: '', // 源站地址
          lineType: defaultLine?.lineValue,
          lineTypeId: defaultLine?.lineId,
          recordValue: '',
          weight: 0, // 权重
          mx: 0,
          ttl: 600,
          remark: '', // 备注
          isNew: true,
        }
      }
    }
  },
)

defineExpose({
  vmClose: () => {
    emit('update:dialog', false)
    resetFormValid()
  },
})
</script>

<style scoped lang="scss">
.content {
  display: flex;
  justify-content: space-between;

  /* min-height: 440px; */

  /* max-height: 460px; */
  height: 460px;

  :deep(.el-form) {
    width: 440px;

    .el-input {
      width: 100%;
    }

    .el-form-item {
      &.ip {
        .el-textarea {
          height: 120px;

          .el-textarea__inner {
            min-height: 120px !important;
          }
        }
      }

      &.host_reocord {
        label {
          max-width: 100px;
          line-height: 20px;
        }
      }

      .el-form-item__content {
        .el-select,
        .el-cascader {
          width: 100%;
        }
      }
    }
  }

  .msg {
    width: 440px;
    min-height: 300px;
    background-color: #fff;

    /* height: 100%; */

    &.empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      svg {
        width: 64px;
        height: 64px;
        margin-bottom: 12px;
      }
    }

    .msg-info {
      height: 100%;
      overflow-y: auto;

      &::-webkit-scrollbar {
        /* display: block !important; */
        display: unset;
      }

      .info-title {
        margin-bottom: 8px;
        font-family: PingFangSC, 'PingFang SC';

        // font-weight: 500;
        font-size: 14px;
        line-height: 20px;
        color: #000;
      }

      .info-content {
        .info-item {
          margin-bottom: 4px;

          span {
            font-family: PingFangSC, 'PingFang SC';
            font-size: 14px;
            font-weight: 400;
            line-height: 22px;
            color: #555;
          }
        }

        .line_type {
          display: flex;

          span:first-child {
            margin-right: 12px;
            color: #000;
            white-space: nowrap;
          }
        }

        .record_type {
          display: flex;
          margin-bottom: 4px;

          &:first-child {
            display: block;
            margin-bottom: 8px;

            span {
              color: #f7b500 !important;
            }
          }

          &:nth-child(2) {
            display: block;
            margin-bottom: 8px;

            span {
              color: #000 !important;
            }
          }

          span {
            word-break: break-all;

            &:first-child {
              flex-shrink: 0;
              width: 72px;
            }

            &:last-child {
              color: #555;
            }
          }
        }

        .ttl,
        .host_record,
        .line_type {
          &:not(:first-child) {
            display: flex;

            span:first-child {
              flex-shrink: 0;
              width: 80px;
              color: #000;
            }
          }
        }

        .ttl {
          &:not(:first-child) {
            span:first-child {
              width: 50px;
            }
          }
        }

        .mx {
          &:not(:first-child) {
            display: flex;

            span:first-child {
              flex-shrink: 0;
              width: 40px;
              color: #000;
            }
          }
        }
      }
    }
  }
}

.dns-record-exchange {
  position: absolute;
  top: 22px;
  right: 56px;

  svg {
    width: 16px;
    height: 16px;

    &:focus {
      outline: none;
    }

    &:hover {
      color: var(--primary-color);
    }
  }
}

.custom-recordType {
  display: flex;
  justify-content: space-between;
  width: 100%;

  div:first-child {
    margin-right: 20px;
    font-size: 14px;
  }

  div:last-child {
    /* font-size: 12px; */
  }
}
</style>

<style lang="scss">
.custom-recordType-select {
  min-width: 360px !important;
}

.record-exchange-content {
  padding: 10px;

  .t {
    margin-bottom: 8px;
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 14px;
    color: #000;
  }

  .pic {
    width: 100%;
    height: 160px;
    margin-bottom: 8px;

    img {
      width: 100%;
      height: 100%;
    }
  }

  .el-button {
    width: 100%;
  }
}

.record-exchange-popper {
  .el-scrollbar {
    min-width: 300px;
  }

  .el-popper__arrow {
    display: initial;
  }
}
</style>
