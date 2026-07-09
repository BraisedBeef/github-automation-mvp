<template>
  <div class="dns-upload-wrap">
    <el-upload
      class="dns-upload"
      :auto-upload="false"
      :show-file-list="false"
      drag
      action="#"
      :disabled="disabled"
      :on-change="handleChange"
    >
      <slot>
        <template v-if="!file.file">
          <SvgIcon name="batch-import" class="upload-icon" />
          <div class="upload-text">
            {{ t('batchOperation.importRecordNotice') }}{{ t('batchOperation.importRecordNotice2') }}
            <el-link type="primary">
              {{ t('batchOperation.importRecordNotice2') }}
            </el-link>
          </div>
        </template>
        <template v-else>
          <div class="file-name" @click.stop>
            <SvgIcon v-show="file.status === 'success'" name="file-success" />
            <SvgIcon v-show="file.status === 'failed'" name="file-failed" />

            {{ file.file.name }}
          </div>
          <div class="file-handle">
            <template v-if="file.status === 'loading'">
              <el-icon class="is-loading">
                <Loading />
              </el-icon>
            </template>
            <template v-else>
              <div class="btn">
                {{ t('components.reUpload') }}
              </div>
              <span />
              <div class="btn" @click.stop="handleDelete">
                {{ t('common.delete') }}
              </div>
            </template>
          </div>
        </template>
      </slot>
    </el-upload>
    <slot name="tips" />
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons'
import t from '@/utils/i18n'
const props = withDefaults(
  defineProps<{
    file?: { file: any; status: 'success' | 'failed' | '' | 'loading' }
    size?: number // mb
    types?: string[]
    disabled?: boolean
  }>(),
  {
    file: () => ({
      file: void 0,
      status: '',
    }),
    size: 10,
    // xls, csv, text, zone
    types: () => [
      'application/vnd.ms-excel',
      'text/csv',
      'text/plain',
      'zone',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
    ],
    disabled: false,
  },
)
const emit = defineEmits<{
  (event: 'failed', file: any): void
  (event: 'success', file: any): void
  (event: 'clear'): void
}>()

const handleChange = ({ raw }: any) => {
  let { size, type, name } = raw
  if (!type) {
    const nameArr = name.split('.')
    type = nameArr[nameArr.length - 1]
  }
  if (!sizeValidate(size)) {
    emit('failed', raw)
  } else if (!typeValidate(type)) {
    emit('failed', raw)
  } else {
    // 通过校验
    console.log('通过校验', size, type, raw)
    emit('success', raw)
  }
}

// 校验大小
const sizeValidate = (size: number) => {
  return size <= props.size * 1024 * 1024
}
// 校验格式
const typeValidate = (type: string) => {
  return props.types.includes(type)
}

const handleDelete = () => {
  emit('clear')
}
</script>

<style scoped lang="scss">
.dns-upload-wrap {
  :deep(.dns-upload) {
    width: 100%;
    height: 240px;
    margin-bottom: 20px;

    .el-upload {
      width: 100%;
      height: 100%;

      .el-upload-dragger {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding: 0 24px;
        border-radius: 4px;

        .upload-icon {
          width: 54px;
          height: 54px;
          margin-bottom: 20px;
        }

        .upload-text {
          display: flex;
          align-items: center;
          font-family: 'PingFang SC-Regular', 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          color: #555;

          span {
            color: var(--primary-color);
          }

          .el-link {
            margin-left: 4px;
          }
        }

        .file-name {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          overflow: hidden;
          font-size: 18px;
          color: #6b7a8e;
          overflow-wrap: break-word;

          svg {
            flex-shrink: 0;
            width: 16px;
            height: 16px;
            margin-right: 6px;
          }
        }

        .file-handle {
          display: flex;
          align-items: center;
          height: 28px;

          & > span {
            width: 1px;
            height: 16px;
            margin: 0 14px;
            background-color: #b0bbca;
          }

          .btn {
            display: flex;
            align-items: center;
            height: 36px;
            font-family: PingFangSC-Regular, 'PingFang SC';
            font-size: 14px;
            font-weight: 400;
            color: var(--primary-color);
            cursor: pointer;
            user-select: none;
            border-radius: 4px;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
    }
  }
}
</style>
