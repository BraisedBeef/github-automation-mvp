<template>
  <div class="cache">
    <div class="page-box">
      <div class="head">
        {{ t('cacheRule') }}
      </div>
      <div class="tip mt20">
        {{ t('cacheRuleTip') }}
      </div>
      <div class="mt20">
        <el-button
          :disabled="+route.query.status > 2 || route.query.is_lock == 1"
          type="primary"
          @click="cacheDialogHandle"
        >
          {{ t('edit') }}
        </el-button>
      </div>
      <el-table :data="cache.cache_rule_conf.rules" class="mt20" table-layout="auto">
        <el-table-column prop="type" :label="t('type')">
          <template #default="{ row }">
            {{ getValueMap(cacheType, row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="content" :label="t('content1')">
          <template #default="{ row }">
            {{ row.content || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="priority" :label="t('priority')" />
        <el-table-column prop="url_params_status" :label="t('URLparams')">
          <template #default="{ row }">
            {{ getValueMap(urlParams, row.url_params_status) }}
          </template>
        </el-table-column>
        <el-table-column prop="url_params" :label="t('URLvalue')">
          <template #default="{ row }">
            {{ row.url_params || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="cache_status" :label="t('cacheFollowOrigin')">
          <template #default="{ row }">
            {{ getValueMap(cacheMode, row.cache_status) }}
          </template>
        </el-table-column>
        <el-table-column prop="ttl" :label="t('cacheExpireTime')">
          <template #default="{ row }">
            {{ row.cache_status === 2 ? row.ttl + getValueMap(cacheTime, row.ttl_unit) : '-' }}
          </template>
        </el-table-column>
      </el-table>
    </div>
    <CatDialog
      v-model:dialog="cacheDialog.show"
      title="setCacheRules"
      width="90%"
      destroy-on-close
      @confirm="updateCacheConfig"
    >
      <el-form ref="cacheFormDom" :model="cacheDialog.tableData">
        <el-table :data="cacheDialog.tableData" table-layout="auto">
          <el-table-column :label="t('type')">
            <template #default="{ row }">
              <CatSelect v-if="row.type === 0" v-model="row.type" :disabled="row.type === 0" :list="cacheType" />
              <CatSelect
                v-else
                v-model="row.type"
                :list="cacheType1"
                @change="
                  () => {
                    row.content = ''
                    cacheFormDom?.clearValidate(['content'])
                  }
                "
              />
            </template>
          </el-table-column>
          <el-table-column :label="t('content1')" width="200px">
            <template #default="{ row }">
              <el-form-item
                prop="content"
                :rules="{
                  validator: () => validContent(row.content, row.type),
                  message: '',
                  trigger: 'change',
                }"
              >
                <TipInput
                  v-model="row.content"
                  :rule="validContent(row.content, row.type)"
                  :placeholder="setPlaceholder(row.type)"
                  :error-text="getStringLength(20, row.content, ';') < 0 ? t('allto20') : t('contentError')"
                  :disabled="row.type === 0 || row.type === 4"
                  teleported
                  placement="top"
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column :label="t('priority')" prop="priority">
            <template #header>
              <div class="df ac">
                <div>{{ t('priority') }}</div>
                <el-tooltip effect="light" :content="t('priorityHeadTip')" placement="top">
                  <div class="dif ac"><SvgIcon name="cat-cdn-help" class="ml4" />&nbsp;</div>
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row, $index }">
              <el-form-item
                prop="priority"
                :rules="{
                  validator: () =>
                    row.priority > 0 &&
                    row.priority < 101 &&
                    tableColumnNotRepeat(cacheDialog.tableData, row, 'priority', $index),
                  message: '',
                  trigger: 'change',
                }"
              >
                <TipInput
                  v-model.number="row.priority"
                  :rule="
                    row.priority > 0 &&
                    row.priority < 101 &&
                    tableColumnNotRepeat(cacheDialog.tableData, row, 'priority', $index)
                  "
                  placeholder="from1to100"
                  :error-text="
                    tableColumnNotRepeat(cacheDialog.tableData, row, 'priority', $index)
                      ? t('contentError')
                      : t('priorityRepeat')
                  "
                  teleported
                  placement="top"
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column :label="t('URLparams')">
            <template #default="{ row }">
              <CatSelect v-model="row.url_params_status" :list="urlParams" />
            </template>
          </el-table-column>
          <el-table-column :label="t('URLvalue')">
            <template #default="{ row }">
              <el-form-item
                prop="url_params"
                :rules="{
                  validator: () => validParams(row.url_params, row.url_params_status),
                  message: '',
                  trigger: 'change',
                }"
              >
                <TipInput
                  v-model="row.url_params"
                  :rule="validParams(row.url_params, row.url_params_status)"
                  :placeholder="row.url_params_status < 2 ? '' : 'paramsSplit'"
                  error-text="paramsError"
                  :disabled="row.url_params_status < 2"
                  teleported
                  placement="top"
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column :label="t('effectiveMode')" prop="cache_status">
            <template #default="{ row }">
              <CatSelect
                v-model="row.cache_status"
                :list="cacheMode"
                @change="
                  v => {
                    row.ttl = v === 2 ? 30 : 0
                  }
                "
              />
            </template>
          </el-table-column>
          <el-table-column :label="t('cacheExpireTime')" prop="ttl" width="220px">
            <template #header>
              <div class="df ac">
                <div>{{ t('cacheExpireTime') }}</div>
                <el-tooltip effect="light" :content="t('cacheExpireTip')" placement="top" popper-class="max-400">
                  <div class="dif ac"><SvgIcon name="cat-cdn-help" class="ml4" />&nbsp;</div>
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <div class="df">
                <el-form-item
                  prop="ttl"
                  :rules="{
                    validator: () => isTrueTime(row),
                    message: '',
                    trigger: 'change',
                  }"
                >
                  <TipInput
                    v-model.number="row.ttl"
                    :rule="isTrueTime(row)"
                    error-text="cacheExpireError"
                    :disabled="row.cache_status != 2"
                    teleported
                    placement="top"
                  />
                </el-form-item>
                <CatSelect
                  v-model="row.ttl_unit"
                  :list="cacheTime"
                  :disabled="row.cache_status != 2"
                  style="width: 120px; margin-left: 10px"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="t('operation')" width="100px">
            <template #default="{ row, $index }">
              <el-link type="primary" :disabled="row.type === 0" @click="cacheDialog.tableData.splice($index, 1)">
                {{ t('delete') }}
              </el-link>
            </template>
          </el-table-column>
          <template #append>
            <div class="df fdc">
              <div class="df ml14" style="margin: 14px 0">
                <el-button type="primary" class="mr14" @click="addCacheRule">
                  {{ t('add') }}
                </el-button>
                <el-link type="primary" font-size="12px" @click="cacheDialog.showTip = !cacheDialog.showTip">
                  {{ t('seeCachaRuleConfig')
                  }}<el-icon
                    :style="{
                      transform: `rotate(${cacheDialog.showTip ? 90 : -90}deg)`,
                      'margin-left': '6px',
                      transition: 'all 0.3s',
                    }"
                  >
                    <ArrowRight />
                  </el-icon>
                </el-link>
              </div>
              <el-tabs v-show="cacheDialog.showTip" tab-position="left" class="mb20">
                <el-tab-pane :label="t('siteAccele')">
                  <div class="df dialog-tab">
                    <div class="left">
                      <div class="title">
                        {{ t('fileType') }}
                      </div>
                      <div>{{ t('fileTypeTip1') }}</div>
                      <div>{{ t('fileTypeTip2') }}</div>
                      <div>{{ t('fileTypeTip3') }}</div>
                    </div>
                    <div class="right">
                      <div class="title">
                        {{ t('cacheTimeoutTip') }}
                      </div>
                      <div>{{ t('cacheTip1') }}</div>
                      <div>{{ t('cacheTip2') }}</div>
                      <div>{{ t('cacheTip3') }}</div>
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane :label="t('downloadAccele')">
                  <div class="df dialog-tab">
                    <div class="left">
                      <div class="title">
                        {{ t('fileType') }}
                      </div>
                      <div>{{ t('fileTypeTip4') }}</div>
                      <div>{{ t('fileTypeTip6') }}</div>
                    </div>
                    <div class="right">
                      <div class="title">
                        {{ t('cacheTimeoutTip') }}
                      </div>
                      <div>{{ t('cacheTip1') }}</div>
                      <div>{{ t('cacheTip3') }}</div>
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane :label="t('vodAccele')">
                  <div class="df dialog-tab">
                    <div class="left">
                      <div class="title">
                        {{ t('fileType') }}
                      </div>
                      <div>{{ t('fileTypeTip4') }}</div>
                      <div>{{ t('fileTypeTip5') }}</div>
                      <div>{{ t('fileTypeTip7') }}</div>
                    </div>
                    <div class="right">
                      <div class="title">
                        {{ t('cacheTimeoutTip') }}
                      </div>
                      <div>{{ t('cacheTip1') }}</div>
                      <div>{{ t('cacheTip2') }}</div>
                      <div>{{ t('cacheTip3') }}</div>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </template>
        </el-table>
      </el-form>
    </CatDialog>

    <div class="page-box mt20">
      <div class="head">
        {{ t('browserExpireTIme') }}
      </div>
      <div class="tip mt20">
        {{ t('browserCacheRuleTip') }}
      </div>
      <div class="mt20">
        <el-button
          :disabled="+route.query.status > 2 || route.query.is_lock == 1"
          type="primary"
          @click="browserDialogHandle"
        >
          {{ t('edit') }}
        </el-button>
      </div>
      <el-table :data="cache.browser_cache_conf.rules" class="mt20" table-layout="auto">
        <el-table-column prop="type" :label="t('type')">
          <template #default="{ row }">
            {{ getValueMap(cacheType, row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="content" :label="t('content1')">
          <template #default="{ row }">
            {{ row.content || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="priority" :label="t('priority')" />
        <el-table-column prop="cache_status" :label="t('effectiveMode')">
          <template #default="{ row }">
            {{ getValueMap(cacheMode, row.cache_status) }}
          </template>
        </el-table-column>
        <el-table-column prop="ttl" :label="t('cacheExpireTime')">
          <template #default="{ row }">
            {{ row.cache_status == 2 ? row.ttl + getValueMap(cacheTime, row.ttl_unit) : '-' }}
          </template>
        </el-table-column>
      </el-table>
    </div>
    <CatDialog
      v-model:dialog="browserDialog.show"
      title="browserExpireTIme"
      width="90%"
      destroy-on-close
      @confirm="updateBrowserConfig"
    >
      <el-form ref="broserFormDom" :model="browserDialog.tableData">
        <el-table :data="browserDialog.tableData">
          <el-table-column :label="t('type')">
            <template #default="{ row }">
              <CatSelect
                v-model="row.type"
                :list="cacheType"
                @change="
                  () => {
                    row.content = ''
                    broserFormDom?.clearValidate(['content'])
                  }
                "
              />
            </template>
          </el-table-column>
          <el-table-column :label="t('content1')" width="200px">
            <template #default="{ row }">
              <el-form-item
                prop="content"
                :rules="{
                  validator: () => validContent(row.content, row.type),
                  message: '',
                  trigger: 'change',
                }"
              >
                <TipInput
                  v-model="row.content"
                  :rule="validContent(row.content, row.type)"
                  :placeholder="setPlaceholder(row.type)"
                  :error-text="getStringLength(20, row.content, ';') < 0 ? 'allto20' : 'contentError'"
                  :disabled="row.type === 0 || row.type === 4"
                  teleported
                  placement="top"
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column :label="t('priority')" prop="priority">
            <template #header>
              <div class="df ac">
                <div>{{ t('priority') }}</div>
                <el-tooltip effect="light" :content="t('priorityHeadTip')" placement="top">
                  <div class="dif ac"><SvgIcon name="cat-cdn-help" class="ml4" />&nbsp;</div>
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row, $index }">
              <el-form-item
                prop="priority"
                :rules="{
                  validator: () =>
                    row.priority > 0 &&
                    row.priority < 101 &&
                    tableColumnNotRepeat(browserDialog.tableData, row, 'priority', $index),
                  message: '',
                  trigger: 'change',
                }"
              >
                <TipInput
                  v-model.number="row.priority"
                  :rule="
                    row.priority > 0 &&
                    row.priority < 101 &&
                    tableColumnNotRepeat(browserDialog.tableData, row, 'priority', $index)
                  "
                  placeholder="from1to100"
                  :error-text="
                    tableColumnNotRepeat(browserDialog.tableData, row, 'priority', $index)
                      ? 'contentError'
                      : 'priorityRepeat'
                  "
                  teleported
                  placement="top"
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column :label="t('effectiveMode')">
            <template #default="{ row }">
              <CatSelect
                v-model="row.cache_status"
                :list="cacheMode"
                @change="
                  v => {
                    row.ttl = v === 2 ? 30 : 0
                  }
                "
              />
            </template>
          </el-table-column>
          <el-table-column :label="t('cacheExpireTime')" prop="ttl" width="220px">
            <template #header>
              <div class="df ac">
                <div>{{ t('cacheExpireTime') }}</div>
                <el-tooltip effect="light" :content="t('cacheExpireTip')" placement="top">
                  <div class="dif ac"><SvgIcon name="cat-cdn-help" class="ml4" />&nbsp;</div>
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <div class="df">
                <el-form-item
                  prop="ttl"
                  :rules="{
                    validator: () => isTrueTime(row),
                    message: '',
                    trigger: 'change',
                  }"
                >
                  <TipInput
                    v-model.number="row.ttl"
                    :rule="isTrueTime(row)"
                    error-text="cacheExpireError"
                    :disabled="row.cache_status != 2"
                    teleported
                    placement="top"
                  />
                </el-form-item>
                <CatSelect
                  v-model="row.ttl_unit"
                  :list="cacheTime"
                  :disabled="row.cache_status != 2"
                  style="width: 120px; margin-left: 10px"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="t('operation')" width="100px">
            <template #default="{ $index }">
              <el-link type="primary" @click="browserDialog.tableData.splice($index, 1)">
                {{ t('delete') }}
              </el-link>
            </template>
          </el-table-column>
          <template #append>
            <el-button type="primary" @click="addBrowserRule">
              {{ t('add') }}
            </el-button>
          </template>
        </el-table>
      </el-form>
    </CatDialog>

    <div class="page-box mt20">
      <div class="head">
        {{ t('statusCacheTime') }}
      </div>
      <div class="tip mt20">
        {{ t('errorStatusCacheTime') }}
      </div>
      <div class="mt20">
        <el-button
          :disabled="+route.query.status > 2 || route.query.is_lock == 1"
          type="primary"
          @click="statusCodeHandle('add')"
        >
          {{ t('add') }}
        </el-button>
      </div>
      <el-table :data="cache.http_status_cache_conf.rules" table-layout="auto" class="mt20">
        <el-table-column prop="http_status" :label="t('statusCode')" />
        <el-table-column prop="ttl" :label="t('cacheTime')">
          <template #default="{ row }">
            <div>{{ row.ttl + getValueMap(cacheTime, row.ttl_unit) }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="t('operation')" width="120px">
          <template #default="{ row }">
            <div class="table-handle">
              <el-link
                :disabled="+route.query.status > 2 || route.query.is_lock == 1"
                type="primary"
                @click="statusCodeHandle('edit', row)"
              >
                {{ t('edit') }}
              </el-link>
              <el-link
                :disabled="+route.query.status > 2 || route.query.is_lock == 1"
                type="primary"
                @click="
                  () => {
                    statusCodeDialog.form = { ...row }
                    statusCodeDialog.showDelete = true
                  }
                "
              >
                {{ t('delete') }}
              </el-link>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <CatDialog
      v-model:dialog="statusCodeDialog.show"
      :title="statusCodeDialog.title + 'statusCacheTime'"
      width="550"
      destroy-on-close
      @confirm="addStatusCodeRule"
    >
      <el-form ref="statusDom" :model="statusCodeDialog.form" label-position="left" label-width="auto">
        <el-form-item :label="t('statusCode')">
          <CatSelect v-model="statusCodeDialog.form.http_status" :list="statusCodeCurrent" />
        </el-form-item>
        <el-form-item :label="t('cacheTime')" prop="ttl">
          <div class="df ac">
            <el-form-item
              prop="ttl"
              :rules="{
                validator: (r, v) => validTime(v, statusCodeDialog.form.ttl_unit) || v === 0,
                message: !statusCodeDialog.form.ttl ? '' : t('yearTip'),
                trigger: 'change',
              }"
            >
              <el-input
                v-model.number="statusCodeDialog.form.ttl"
                :placeholder="t('inputCacheTime')"
                class="mr14"
                style="width: 200px"
              />
            </el-form-item>
            <CatSelect v-model="statusCodeDialog.form.ttl_unit" :list="cacheTime" style="width: 80px" />
          </div>
        </el-form-item>
      </el-form>
    </CatDialog>

    <CatDialog
      v-model:dialog="statusCodeDialog.showDelete"
      title="deletestatusCacheTime"
      width="550"
      destroy-on-close
      @confirm="delStatusCodeRule"
    >
      <div>
        {{ t('willDeleteCacheTime') }} {{ t('statusCode') }}:<el-text type="primary">
          {{ statusCodeDialog.form.http_status }}
        </el-text>
      </div>
    </CatDialog>

    <div class="page-box mt20">
      <div class="head">
        {{ t('accessURLrewrite') }}
      </div>
      <div class="tip mt20">
        {{ t('accessURLrewriteTip') }}
      </div>
      <div class="mt20">
        <el-button
          :disabled="+route.query.status > 2 || route.query.is_lock == 1"
          type="primary"
          @click="editURLrewrite(URLrewrite.rawForm)"
        >
          {{ t('add') }}
        </el-button>
      </div>
      <el-table :data="URLrewrite.tableData" class="mt20" table-layout="auto">
        <el-table-column :label="t('matchType')" prop="mate_type">
          <template #default="{ row }">
            {{ row.mate_type ? t('allPathMatch') : t('preMatch') }}
          </template>
        </el-table-column>
        <el-table-column :label="t('waitRewriteURL')" prop="source_url" />
        <el-table-column :label="t('targetPath')" prop="target_url" />
        <el-table-column :label="t('priority')" prop="priority" />
        <el-table-column :label="t('operation')" width="100px">
          <template #default="{ row, $index }">
            <div class="table-handle">
              <el-link
                :disabled="+route.query.status > 2 || route.query.is_lock == 1"
                type="primary"
                @click="editURLrewrite(row, $index)"
              >
                {{ t('edit') }}
              </el-link>
              <el-link
                :disabled="+route.query.status > 2 || route.query.is_lock == 1"
                type="primary"
                @click="updateURLrewrite(true, $index)"
              >
                {{ t('delete') }}
              </el-link>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <CatPagination
        v-model:pagination="URLrewrite.pagination"
        :total="URLrewrite.total"
        :custom-keys="['page', 'page_size']"
        @change="getURLrewriteData"
      />
    </div>
    <CatDialog
      v-model:dialog="URLrewrite.show"
      title="accessURLrewrite"
      width="780px"
      destroy-on-close
      @confirm="updateURLrewrite(false)"
    >
      <el-form ref="URLrewriteDom" :model="URLrewrite.form!" label-position="left" label-width="auto">
        <el-form-item :label="t('statusCode')" prop="mate_type">
          <div class="df fdc">
            <el-checkbox
              v-model="URLrewrite.form!.mate_type"
              :label="t('allPathMatch')"
              :true-label="1"
              :false-label="0"
              size="large"
            />
            <div class="form-tip mt10">
              {{ t('allPathMatchTip') }}
            </div>
          </div>
        </el-form-item>
        <el-form-item
          :label="t('waitRewriteURL')"
          prop="source_url"
          :rules="{
            validator: (r, v) =>
              isTrueURL(v) &&
              v !== URLrewrite.form!.target_url &&
              tableColumnNotRepeat(cache.url_rewrite_conf.rules, URLrewrite.form, 'source_url', URLrewrite.index),
            message: '',
            trigger: 'change',
          }"
        >
          <div class="df fdc w-full">
            <el-input
              v-model.number="URLrewrite.form!.source_url"
              @change="URLrewriteDom?.clearValidate(['target_url'])"
            />
            <div class="form-tip mt10">
              {{ t('matchDirPathTip1') }}
            </div>
          </div>
        </el-form-item>
        <el-form-item
          :label="t('targetPath')"
          prop="target_url"
          :rules="{
            validator: (r, v) => isTrueURL(v) && v !== URLrewrite.form!.source_url,
            message: '',
            trigger: 'change',
          }"
        >
          <div class="df fdc w-full">
            <el-input
              v-model.number="URLrewrite.form!.target_url"
              @change="URLrewriteDom?.clearValidate(['source_url'])"
            />
            <div class="form-tip mt10">
              {{ t('matchDirPathTip2') }}
            </div>
          </div>
        </el-form-item>
        <el-form-item
          :label="t('priority')"
          prop="priority"
          :rules="{
            validator: (r, p) =>
              p > 0 &&
              p < 101 &&
              tableColumnNotRepeat(cache.url_rewrite_conf.rules, URLrewrite.form, 'priority', URLrewrite.index),
            message: '',
            trigger: 'change',
          }"
        >
          <div class="df fdc w-full">
            <el-input v-model.number="URLrewrite.form!.priority" :placeholder="t('from1to100')" />
            <div class="form-tip mt10">
              {{ t('priorityTip1') }}
            </div>
          </div>
        </el-form-item>
      </el-form>
    </CatDialog>
  </div>
</template>

<script lang="ts" setup>
import { cacheType, cacheType1, urlParams, cacheMode, cacheTime, statusCode } from '@/assets/data/common.js'
import { ArrowRight } from '@element-plus/icons-vue'
import {
  _getCacheConfig,
  _updateCacheConfig,
  _updateBrowserConfig,
  _addStatusCodeRule,
  _delStatusCodeRule,
  _updateStatusCodeRule,
  _updateCacheURLrewrite,
} from '@/apis/cdn/domain'
import t from '@/utils/i18n'
import {
  validTime,
  validContent,
  validParams,
  tableColumnNotRepeat,
  notification,
} from '@/views/cdn/domain/index-domain'
import { getStringLength } from '@/utils/string-utils'
import { getValueMap } from '@/utils/collection-utils'

import type { CacheRule, BrowserCacheRule, HttpStatusRule, StatusCodeRule, URLrewriteItem } from '@/views/cdn/common'
import type { FormInstance } from 'element-plus/es'

const route: any = useRoute()
const base_info = ref<any>(null)
base_info.value = JSON.parse(sessionStorage.cdn_domain_details)

const cache = ref<{
  cache_rule_conf: { rules: CacheRule[] }
  browser_cache_conf: { rules: BrowserCacheRule[] }
  http_status_cache_conf: { rules: HttpStatusRule[] }
  url_rewrite_conf: { rules: URLrewriteItem[] }
}>({
  cache_rule_conf: { rules: [] },
  browser_cache_conf: { rules: [] },
  http_status_cache_conf: { rules: [] },
  url_rewrite_conf: { rules: [] },
})
const getCacheConfig = async () => {
  await _getCacheConfig(route.query.id).then(res => {
    cache.value = res.data
    URLrewrite.total = cache.value.url_rewrite_conf.rules.length
    cache.value.cache_rule_conf.rules = res.data.cache_rule_conf.rules.map((v: CacheRule) => ({
      ...v,
      content: v.content?.join(';') || '',
      url_params: v.url_params?.join(';') || '',
    }))
    cache.value.browser_cache_conf.rules = res.data.browser_cache_conf.rules.map((v: BrowserCacheRule) => ({
      ...v,
      content: v.content?.join(';') || '',
    }))
    getURLrewriteData()
  })
}
getCacheConfig()

const cacheDialog = reactive<{
  show: boolean
  tableData: CacheRule[]
  showTip: boolean
}>({
  show: false,
  tableData: [],
  showTip: false,
})
const cacheDialogHandle = () => {
  cacheDialog.tableData = JSON.parse(JSON.stringify(cache.value.cache_rule_conf.rules))
  cacheDialog.show = true
}
const cacheFormDom = ref<FormInstance | null>(null)
const addCacheRule = () => {
  cacheDialog.tableData.push({
    type: 1,
    content: '',
    priority: '',
    url_params_status: 0,
    url_params: '',
    cache_status: 0,
    ttl: 0,
    ttl_unit: 1,
  })
}
const updateCacheConfig = async () => {
  const valid = await cacheFormDom.value?.validate(b => b)
  if (!valid) return
  const tableData = cacheDialog.tableData.map(v => {
    const obj = {
      ...v,
      content: v.content ? v.content.split(';') : null,
      url_params: v.url_params ? v.url_params.split(';') : null,
    }
    return obj
  })
  _updateCacheConfig({
    id: route.query.id,
    tableData: { rules: tableData },
  })
    .then(() => {
      getCacheConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .catch(() => {
      notification({ type: 'failed', msg: 'configFailed' })
    })
    .finally(() => {
      cacheDialog.show = false
    })
}
const setPlaceholder = (type: number) => {
  if (type === 1) return 'jpg;zip;exe'
  if (type === 2) return '/test/folder01;/test/folder02'
  if (type === 3) return '/test/index.html;/test/*.jpg'
  else return ''
}
const isTrueTime = row => {
  if (row.cache_status != 2) {
    return true
  } else {
    return validTime(row.ttl, row.ttl_unit)
  }
}

const browserDialog = reactive<{
  show: boolean
  tableData: BrowserCacheRule[]
}>({
  show: false,
  tableData: [],
})
const browserDialogHandle = () => {
  browserDialog.tableData = JSON.parse(JSON.stringify(cache.value.browser_cache_conf.rules))
  browserDialog.show = true
}
const statusCodeCurrent = computed(() => {
  let arr = statusCode.map((vv: any, ii) => {
    if (cache.value.http_status_cache_conf.rules.some(v => v.http_status == vv.value)) {
      vv.disabled = true
    } else {
      vv.disabled = false
    }
    return vv
  })
  return arr
})
const broserFormDom = ref<FormInstance | null>(null)
const addBrowserRule = () => {
  browserDialog.tableData.push({
    type: 0,
    content: '',
    cache_status: 0,
    ttl: 0,
    ttl_unit: 1,
    priority: '',
  })
}
const updateBrowserConfig = async () => {
  const valid = await broserFormDom.value?.validate(b => b)
  if (!valid) return
  const tableData = browserDialog.tableData.map(v => {
    const obj = {
      ...v,
      content: v.content ? v.content?.split(';') : null,
    }
    return obj
  })
  _updateBrowserConfig({
    id: route.query.id,
    tableData: { rules: tableData },
  })
    .then(() => {
      getCacheConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .catch(() => {
      // notification({ type: 'failed', msg: 'configFailed' })
    })
    .finally(() => {
      browserDialog.show = false
    })
}

const statusCodeDialog = reactive<{
  show: boolean
  form: StatusCodeRule
  title: string
  showDelete: boolean
}>({
  show: false,
  form: {
    http_status: 400,
    ttl: '',
    ttl_unit: 1,
  },
  title: 'add',
  showDelete: false,
})
const statusCodeHandle = (title: 'add' | 'edit', row?: StatusCodeRule) => {
  if (base_info.value.channel_type === 3) {
    notification({ type: 'failed', msg: 'notValidWorkType' })
    return
  }
  if (row) {
    statusCodeDialog.form = { ...row }
  }
  statusCodeDialog.title = title
  statusCodeDialog.show = true
}
const statusDom = ref<FormInstance | null>(null)
const addStatusCodeRule = async () => {
  const valid = await statusDom.value?.validate(b => b)
  if (!valid) return
  const rule = { ...statusCodeDialog.form }
  if (statusCodeDialog.title === 'add') {
    if (cache.value.http_status_cache_conf.rules.find(v => v.http_status === statusCodeDialog.form.http_status)) {
      notification({ type: 'failed', msg: 'statusCodeNotRepeat' })
      return
    }
    await _addStatusCodeRule({ id: route.query.id, form: { rule } })
      .then(() => {
        getCacheConfig()
        notification({ type: 'success', msg: 'setSuccess' })
      })
      .catch(() => {
        // notification({ type: 'failed', msg: 'configFailed' })
      })
  } else {
    await _updateStatusCodeRule({ id: route.query.id, form: { rule } })
      .then(() => {
        getCacheConfig()
        notification({ type: 'success', msg: 'setSuccess' })
      })
      .catch(() => {
        // notification({ type: 'failed', msg: 'configFailed' })
      })
  }
  statusCodeDialog.show = false
}
const delStatusCodeRule = () => {
  _delStatusCodeRule({ id: route.query.id, rule_id: statusCodeDialog.form.id })
    .then(() => {
      getCacheConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .catch(() => {
      // notification({type:'failed',msg:'configFailed'})
    })
    .finally(() => {
      statusCodeDialog.showDelete = false
    })
}

const URLrewrite = reactive<{
  show: boolean
  form: URLrewriteItem | null
  rawForm: URLrewriteItem
  title: string
  index: number | undefined
  showDelete: boolean
  pagination: {
    page: number
    page_size: number
  }
  total: number
  tableData: any[]
}>({
  show: false,
  form: null,
  rawForm: {
    mate_type: 0,
    source_url: '',
    target_url: '',
    priority: '',
  },
  title: 'add',
  index: undefined,
  showDelete: false,
  pagination: {
    page: 1,
    page_size: 10,
  },
  total: 0,
  tableData: [],
})
const getURLrewriteData = () => {
  URLrewrite.tableData = cache.value.url_rewrite_conf.rules.slice(
    (URLrewrite.pagination.page - 1) * URLrewrite.pagination.page_size,
    URLrewrite.pagination.page * URLrewrite.pagination.page_size,
  )
}
const isTrueURL = v => {
  return /^\/(?:[^*\/]|\*)*(?:\/(?:[^*\/]|\*)*)*$/.test(v) && v.length > 0 && v.length < 75
}
const URLrewriteDom = ref<FormInstance | null>(null)
const editURLrewrite = (row, $index?) => {
  URLrewrite.form = { ...row }
  URLrewrite.index = $index
  URLrewrite.show = true
}
const updateURLrewrite = async (isDelete: boolean, index?: number) => {
  if (!isDelete) {
    const valid = await URLrewriteDom.value!.validate(b => b)
    if (!valid) return
  }
  let params
  if (isDelete) {
    cache.value.url_rewrite_conf.rules.splice(index!, 1)
    params = cache.value.url_rewrite_conf.rules
  } else if (URLrewrite.index !== undefined) {
    const arr = [...cache.value.url_rewrite_conf.rules]
    arr.splice(URLrewrite.index, 1)
    params = [URLrewrite.form, ...arr]
  } else {
    params = [URLrewrite.form, ...cache.value.url_rewrite_conf.rules]
  }
  _updateCacheURLrewrite({ id: route.query.id, form: { rules: params } })
    .then(() => {
      getCacheConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .catch(() => {
      // notification({ type: 'failed', msg: 'configFailed' })
    })
    .finally(() => {
      URLrewrite.show = false
    })
}
</script>

<style lang="scss" scoped>
@import '../../index-domain';

.cache {
  .dialog-tab {
    padding: 20px;
    font-size: 12px;
    line-height: 26px;
    background-color: #f9fafc;

    div {
      line-height: 2;
    }

    .left {
      padding-right: 50px;
    }

    .left {
      flex: 1;
      margin-right: 50px;
      border-right: 1px solid #eee;
    }

    .title {
      color: var(--el-color-primary);
    }
  }
}

:deep(.el-tabs__active-bar.is-left) {
  height: 48px !important;
}

:deep(.el-tabs__item) {
  height: 48px;
}
</style>
