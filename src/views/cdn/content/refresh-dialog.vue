<template>
  <CatDialog
    :dialog="dialog"
    :title="config.title"
    class="complete-dialog"
    :close-on-click-modal="false"
    width="780px"
    :disabled="!!errorStr"
    :loading="refreshLoading"
    destroy-on-close
    @update:dialog="(v: boolean) => !v && close()"
    @confirm="handleConfirm"
  >
    <CatTip v-show="isRefresh">
      {{ t('contentRefreshTip') }}
    </CatTip>
    <CatTip v-show="!isRefresh">
      <div>{{ t('contentPrefetchTip') }}</div>
      <div>{{ t('notice') }}</div>
      <div>{{ t('contentPrefetchTip1') }}</div>
      <div>{{ t('contentPrefetchTip2') }}</div>
    </CatTip>

    <el-form ref="refresh_form" :model="form" class="mt20" label-position="left" label-width="auto">
      <el-form-item v-if="isRefresh" :label="t('type')" prop="type">
        <CatBlockSelect v-model="form.type" :list="typeList" />
      </el-form-item>
      <el-form-item v-if="form.type === 2 && isRefresh" :label="t('refreshMode')" prop="method">
        <CatRadioGroup v-model="form.method" :list="methodList" />
      </el-form-item>
      <el-form-item :label="t('content1')" prop="content">
        <template v-if="isRefresh">
          <CatRadioGroup v-model="form.content" :list="contentList" @change="() => (errorStr = '')" />
        </template>
        <template v-else>
          <CatRadioGroup v-model="form.content" :list="contentList" />
        </template>
      </el-form-item>
      <el-form-item
        v-if="form.content === 1"
        label=" "
        prop="path"
        :rules="{
          validator: (r, v) => validateContent(v),
          trigger: 'change',
          message: '',
        }"
      >
        <div style="width: 100%">
          <el-input
            v-model="form.path"
            type="textarea"
            :placeholder="config.placeholder[form.type]"
            resize="none"
            rows="6"
            :spellcheck="false"
          />
          <div class="count mt10">
            {{ t('todayRemainCount') }}
            {{
              config.title === 'contentRefresh' && form.type === 1
                ? quota.url_refresh
                : config.title === 'contentRefresh' && form.type === 2
                  ? quota.path_refresh
                  : quota.url_prefetch
            }}
          </div>
        </div>
      </el-form-item>
      <el-form-item v-else label=" ">
        <div class="content-upload">
          <el-upload :auto-upload="false" :show-file-list="false" drag :on-change="handleChange">
            <div v-if="!form.file">
              <div class="df ac jc">
                <el-link type="primary">
                  {{ t('clickUpload') }}
                </el-link>
                <div class="c000">
                  {{ t('orDragTo') }}
                </div>
              </div>
              <div class="c999">
                {{ t('uploadTip') }}
              </div>
              <div>
                <span class="c999">{{ t('todayRemainCount') }}</span>
                <span class="c999">
                  {{
                    config.title === 'contentRefresh' && form.type === 1
                      ? quota.url_refresh
                      : config.title === 'contentRefresh' && form.type === 2
                        ? quota.path_refresh
                        : quota.url_prefetch
                  }}
                </span>
              </div>
            </div>
            <div v-else>
              <div class="df ac jc">
                <SvgIcon :name="fileResult === 'success' ? 'cat-cdn-upload-success' : 'cat-cdn-upload-fail'" />
                <div class="ml4 c000">
                  {{ fileName }}
                </div>
              </div>
              <div class="re">
                <el-link type="primary">
                  {{ t('reUpload') }}
                </el-link>
                <span class="c999">&nbsp;|&nbsp;</span>
                <el-link type="primary" @click.stop="uploadDelete">
                  {{ t('delete') }}
                </el-link>
              </div>
            </div>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="URL Encode" prop="encode">
        <div class="df ac">
          <el-switch v-model="form.encode" class="mr20" />
          <div>{{ t('startUrlencodeTip') }}</div>
        </div>
      </el-form-item>
      <el-form-item v-if="errorStr">
        <div class="df ac">
          <SvgIcon name="tip-error" style="margin-right: 4px" />
          <el-text type="danger">
            {{ errorStr }}
          </el-text>
        </div>
      </el-form-item>
    </el-form>
  </CatDialog>
</template>

<script setup lang="ts">
import { _createPathRefresh, _createURLprefresh, _createURLrefresh, _getQuota } from '@/apis/cdn/content'
import { getTxtUrls, refreshDialogConfig } from './config'
import { validPathAndUrl } from '@/views/cdn/domain/index-domain'
import t from '@/utils/i18n'

import type { ContentRefrehs } from '@/apis/cdn/content'

const typeList = [
  { label: t('urlReresh'), value: 1 },
  { label: t('dirRefresh'), value: 2 },
]
const methodList = [
  { label: t('refreshChangeResource'), value: 1 },
  { label: t('refreshAllResource'), value: 2 },
]
const contentList = [
  { label: t('inputContent'), value: 1 },
  { label: t('uploadFiles'), value: 2 },
]

const props = withDefaults(
  defineProps<{
    dialog: boolean
    isRefresh: boolean // 是否为内容刷新 否则就是内容预取
  }>(),
  {
    dialog: false,
  },
)
const emit = defineEmits<{
  (event: 'close', dialog: boolean): void
  (event: 'success'): void
}>()

const close = () => {
  refresh_form.value.resetFields()
  form.value.path = ''
  form.value.file = void 0
  errorStr.value = ''
  emit('close', false)
}

const config = computed(() => (props.isRefresh ? refreshDialogConfig.refresh : refreshDialogConfig.prefetch))
// 此次剩余配额
const laveQuotaOnly = computed(() => {
  let path
  if (form.value.content === 1) {
    path = form.value.path
  } else {
    path = fileContent.value
  }
  const arr = path
    .split('\n')
    .map(v => v.trim())
    .filter(v => v)

  const l =
    config.value.title === 'contentRefresh' && form.value.type === 1
      ? quota.value.url_refresh
      : config.value.title === 'contentRefresh' && form.value.type === 2
        ? quota.value.path_refresh
        : quota.value.url_prefetch

  return l - arr.length
})

const refresh_form = ref()
const refreshLoading = ref(false)
const form = ref<{
  type: 1 | 2 // 目录刷新  / url刷新
  method: 1 | 2 // 刷新变更资源 / 刷新全部资源
  content: 1 | 2 // 输入内容  / 上传文件
  encode: boolean // URL Encode
  path: string // 输入内容
  file: any // 上传的文件
}>({
  type: 1,
  method: 1,
  content: 1,
  encode: false,
  path: '',
  file: void 0,
})

const fileResult = ref<'success' | 'error' | ''>('')
const fileName = ref('')
const fileContent = ref('')
const handleChange = async ({ raw }: any) => {
  let { size, type, name } = raw
  form.value.file = raw
  fileName.value = name
  if (type.split('/')[0] !== 'text') {
    errorStr.value = t('textFileErrorTip')
    fileResult.value = 'error'
  } else {
    errorStr.value = ''
    fileResult.value = 'success'
    const result = (await getTxtUrls(form.value.file)) as any
    fileContent.value = result.replace(/\r|\n/g, '\n')
  }
}
const uploadDelete = () => {
  form.value.file = null
  errorStr.value = ''
}

const errorStr = ref('')
const validateContent = value => {
  const arr = value
    .split('\n')
    .map(v => v.trim())
    .filter(v => v)

  for (let i = 0; i < arr.length; i++) {
    if (props.isRefresh && form.value.type === 1) {
      if (
        !validPathAndUrl(arr[i], { checkDir: true, checkPath: false }) &&
        !validPathAndUrl(arr[i], { checkDir: false, checkPath: true })
      ) {
        return false
      }
    } else if (props.isRefresh && form.value.type === 2) {
      if (!validPathAndUrl(arr[i], { checkDir: true, checkPath: true })) {
        return false
      }
    } else {
      if (
        !validPathAndUrl(arr[i], { checkDir: true, checkPath: false }) &&
        !validPathAndUrl(arr[i], { checkDir: false, checkPath: false })
      ) {
        return false
      }
    }
  }
  return true
}

const quota = ref<{
  url_refresh: number
  path_refresh: number
  url_prefetch: number
}>({
  url_refresh: 0,
  path_refresh: 0,
  url_prefetch: 0,
})
const getQuota = () => {
  _getQuota().then(res => {
    quota.value = res.data
  })
}
watch(
  () => props.dialog,
  n => {
    if (n) {
      getQuota()
    }
  },
)

// format
// @ts-ignore
const formatUrls = async (): string[] => {
  let urls: string[] = []
  try {
    if (form.value.content === 1) {
      //输入内容
      urls = form.value.path.split('\n')
    } else {
      // 上传文件
      let s = (await getTxtUrls(form.value.file)) as any
      urls = s.replaceAll(/\r|\n/g, '\n').split('\n')
      if (urls[0]) {
        urls = urls.filter(item => item)
      }
      console.log('urls', urls)
    }
    return urls
  } catch (error) {
    return [] as string[]
  }
}

const handleConfirm = async () => {
  let valid
  if (form.value.content === 1) {
    valid = validateContent(form.value.path)
  } else {
    valid = validateContent(fileContent.value)
  }

  if (!valid) {
    errorStr.value || (errorStr.value = t('errorTip1'))
    return
  }
  errorStr.value = ''
  refreshLoading.value = true
  let formatForm: ContentRefrehs = {
    url_encode: form.value.encode, // 是否开启urlencode
  }
  let fn: any = void 0

  // 内容刷新 / 内容预取 使用不同的post函数
  if (!props.isRefresh) {
    fn = _createURLprefresh
  } else {
    fn = form.value.type === 1 ? _createURLrefresh : _createPathRefresh
  }
  // 内容刷新 且 选择的类型是目录刷新
  if (form.value.type === 1 && props.isRefresh) {
    formatForm.urls = await formatUrls()
    formatForm.refresh_type = form.value.method
  } else if (form.value.type === 2 && props.isRefresh) {
    formatForm.paths = await formatUrls()
    formatForm.refresh_type = form.value.method
  } else {
    formatForm.urls = await formatUrls()
  }
  fn(formatForm)
    .then(res => {
      refreshLoading.value = false
      if (res.code === 200) {
        emit('close', false)
        emit('success')
      }
    })
    .catch(() => {
      refreshLoading.value = false
    })
}
</script>

<style scoped lang="scss">
.content-upload {
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--border-c);
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    border: 1px solid var(--primary-color);
  }

  :deep(.el-upload-dragger) {
    border: none;
  }
}

.c999 {
  color: var(--sub-text);
}

.c000 {
  color: var(--primary-text);
}
</style>
