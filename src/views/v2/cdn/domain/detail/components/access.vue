<template>
  <div class="cdn-domain-detail-access-v2">
    <section class="cdn-domain-detail-access-v2__section">
      <div class="cdn-domain-detail-access-v2__section-head">
        <h3 class="cdn-domain-detail-access-v2__title">
          {{ t('antiTheftConfig') }}
        </h3>
        <p class="cdn-domain-detail-access-v2__desc">
          {{ t('antiTheftConfigTip') }}
        </p>
      </div>

      <div class="cdn-domain-detail-access-v2__switch-row">
        <span class="cdn-domain-detail-access-v2__label">{{ t('enableConfig') }}</span>
        <div class="cdn-domain-detail-access-v2__switch-content">
          <el-switch
            v-model="access_config.referer_conf.status"
            :before-change="switchReferer"
            :loading="referer.loading"
            :disabled="isReadOnly"
          />
          <button
            v-if="access_config.referer_conf.status"
            class="cdn-domain-detail-access-v2__link"
            type="button"
            :disabled="isReadOnly"
            @click="editReferer"
          >
            {{ t('edit') }}
          </button>
        </div>
      </div>

      <template v-if="access_config.referer_conf.status">
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label">{{ t('type') }}</span>
          <div class="cdn-domain-detail-access-v2__content">
            referer{{ access_config.referer_conf.type ? t('whiteList') : t('blackList') }}
          </div>
        </div>
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label"
            >{{ t('emptyReferer') }}(
            {{ access_config.referer_conf.allow_empty ? t('allow') : t('refuse') }}referer)</span
          >
          <!-- <span class="cdn-domain-detail-access-v2__content" /> -->
        </div>
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label">{{ t('rule') }}</span>
          <div class="cdn-domain-detail-access-v2__content">
            <el-input
              v-model="access_config.referer_conf.referer_list"
              disabled
              type="textarea"
              resize="none"
              rows="5"
              :placeholder="'example1.com\nexample2.com\nexample3.com'"
            />
          </div>
        </div>
      </template>
      <p v-else class="cdn-domain-detail-access-v2__empty">
        {{ t('noAntiTheftRule') }}
      </p>
    </section>

    <section class="cdn-domain-detail-access-v2__section">
      <div class="cdn-domain-detail-access-v2__section-head">
        <h3 class="cdn-domain-detail-access-v2__title">IP {{ t('blackAndWhitelistConfig') }}</h3>
        <p class="cdn-domain-detail-access-v2__desc">
          {{ t('blackAndWhitelistConfigTip') }}
        </p>
      </div>

      <div class="cdn-domain-detail-access-v2__switch-row">
        <span class="cdn-domain-detail-access-v2__label">{{ t('configStatus') }}</span>
        <div class="cdn-domain-detail-access-v2__switch-content">
          <el-switch
            v-model="access_config.ip_filter_conf.status"
            :before-change="switchIP"
            :loading="ip.loading"
            :disabled="isReadOnly"
          />
          <button
            v-if="access_config.ip_filter_conf.status"
            class="cdn-domain-detail-access-v2__link"
            type="button"
            :disabled="isReadOnly"
            @click="editIP"
          >
            {{ t('edit') }}
          </button>
        </div>
      </div>

      <template v-if="access_config.ip_filter_conf.status">
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label">{{ t('type') }}</span>
          <div class="cdn-domain-detail-access-v2__content">
            IP{{ access_config.ip_filter_conf.rule.ip_type ? t('whiteList') : t('blackList') }}
          </div>
        </div>
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label">{{ t('rule') }}</span>
          <div class="cdn-domain-detail-access-v2__content">
            <el-input
              v-model="access_config.ip_filter_conf.rule.ip_list"
              disabled
              type="textarea"
              resize="none"
              rows="5"
              :placeholder="'1.1.1.1\n2.2.2.2\n255.255.255'"
            />
          </div>
        </div>
      </template>
    </section>

    <section class="cdn-domain-detail-access-v2__section">
      <div class="cdn-domain-detail-access-v2__section-head">
        <h3 class="cdn-domain-detail-access-v2__title">
          {{ t('ipFreqSet') }}
        </h3>
        <p class="cdn-domain-detail-access-v2__desc">
          {{ t('freqTip') }}
        </p>
      </div>

      <div class="cdn-domain-detail-access-v2__switch-row">
        <span class="cdn-domain-detail-access-v2__label">{{ t('configStatus') }}</span>
        <div class="cdn-domain-detail-access-v2__switch-content">
          <el-switch
            v-model="access_config.ip_frequency_conf.status"
            :before-change="switchIPfreq"
            :loading="ipFreq.loading"
            :disabled="isReadOnly"
          />
          <button
            v-if="access_config.ip_frequency_conf.status"
            class="cdn-domain-detail-access-v2__link"
            type="button"
            :disabled="isReadOnly"
            @click="openIPfreq"
          >
            {{ t('edit') }}
          </button>
        </div>
      </div>

      <div v-if="access_config.ip_frequency_conf.status" class="cdn-domain-detail-access-v2__info-row">
        <span class="cdn-domain-detail-access-v2__label">{{ t('accessThreshold') }}</span>
        <div class="cdn-domain-detail-access-v2__content">{{ access_config.ip_frequency_conf.freq }}QPS</div>
      </div>
    </section>

    <section class="cdn-domain-detail-access-v2__section">
      <div class="cdn-domain-detail-access-v2__section-head">
        <h3 class="cdn-domain-detail-access-v2__title">
          {{ t('authConfig') }}
        </h3>
        <p class="cdn-domain-detail-access-v2__desc">
          {{ t('authConfigTip') }}
        </p>
      </div>

      <div class="cdn-domain-detail-access-v2__action-row">
        <el-button plain type="primary" :disabled="isReadOnly" @click="openAuthCalc">
          {{ t('authCalc') }}
        </el-button>
      </div>

      <div class="cdn-domain-detail-access-v2__switch-row">
        <span class="cdn-domain-detail-access-v2__label">{{ t('configStatus') }}</span>
        <div class="cdn-domain-detail-access-v2__switch-content">
          <el-switch
            v-model="access_config.auth_conf.status"
            :before-change="switchAuth"
            :loading="auth.loading"
            :disabled="isReadOnly"
          />
          <button
            v-if="access_config.auth_conf.status"
            class="cdn-domain-detail-access-v2__link"
            type="button"
            :disabled="isReadOnly"
            @click="editAuth"
          >
            {{ t('edit') }}
          </button>
        </div>
      </div>

      <div v-if="access_config.auth_conf.status" class="cdn-domain-detail-access-v2__grid">
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label">{{ t('authMode') }}</span>
          <div class="cdn-domain-detail-access-v2__content">
            {{ getValueMap(authTypeList, access_config.auth_conf.auth_type) }}
          </div>
        </div>
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label">{{ t('authAgol') }}</span>
          <div class="cdn-domain-detail-access-v2__content">
            {{ getValueMap(authAlgorithmList, access_config.auth_conf.encrypt_manager) }}
          </div>
        </div>
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label">{{ t('key1') }}</span>
          <div class="cdn-domain-detail-access-v2__content cdn-domain-detail-access-v2__content--break">
            {{ access_config.auth_conf.auth_key || '--' }}
          </div>
        </div>
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label">{{ t('key2') }}</span>
          <div class="cdn-domain-detail-access-v2__content cdn-domain-detail-access-v2__content--break">
            {{ access_config.auth_conf.auth_key_backup || '--' }}
          </div>
        </div>
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label">{{ t('signParams') }}</span>
          <div class="cdn-domain-detail-access-v2__content">
            {{ access_config.auth_conf.auth_parameter || '--' }}
          </div>
        </div>
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label">{{ t('trueTime') }}</span>
          <div class="cdn-domain-detail-access-v2__content">
            {{ access_config.auth_conf.valid_time || '--' }}
          </div>
        </div>
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label">{{ t('timeMethod') }}</span>
          <div class="cdn-domain-detail-access-v2__content">
            {{ getValueMap(timeFormatList, access_config.auth_conf.time_format) }}
          </div>
        </div>
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label">{{ t('authRange') }}</span>
          <div class="cdn-domain-detail-access-v2__content">
            {{ getValueMap(authRangeList, access_config.auth_conf.auth_range) }}
          </div>
        </div>
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label">{{ t('fileEXT') }}</span>
          <div class="cdn-domain-detail-access-v2__content">
            {{ access_config.auth_conf.file_suffix || '--' }}
          </div>
        </div>
      </div>
    </section>

    <section class="cdn-domain-detail-access-v2__section">
      <div class="cdn-domain-detail-access-v2__section-head">
        <h3 class="cdn-domain-detail-access-v2__title">
          {{ t('userAgentList') }}
        </h3>
        <p class="cdn-domain-detail-access-v2__desc">
          {{ t('userAgentTip') }}
        </p>
      </div>

      <div class="cdn-domain-detail-access-v2__switch-row">
        <span class="cdn-domain-detail-access-v2__label">{{ t('configStatus') }}</span>
        <div class="cdn-domain-detail-access-v2__switch-content">
          <el-switch
            v-model="access_config.user_agent_conf.status"
            :before-change="switchAgent"
            :loading="agent.loading"
            :disabled="isReadOnly"
          />
          <button
            v-if="access_config.user_agent_conf.status"
            class="cdn-domain-detail-access-v2__link"
            type="button"
            :disabled="isReadOnly"
            @click="editAgent"
          >
            {{ t('edit') }}
          </button>
        </div>
      </div>

      <template v-if="access_config.user_agent_conf.status">
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label">{{ t('type') }}</span>
          <div class="cdn-domain-detail-access-v2__content">
            User-Agent {{ access_config.user_agent_conf.rule.type ? t('whiteList') : t('blackList') }}
          </div>
        </div>
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label">{{ t('rule') }}</span>
          <div class="cdn-domain-detail-access-v2__content">
            <el-input
              v-model="access_config.user_agent_conf.rule.agent_list"
              disabled
              type="textarea"
              resize="none"
              rows="5"
            />
          </div>
        </div>
      </template>
    </section>

    <section class="cdn-domain-detail-access-v2__section">
      <div class="cdn-domain-detail-access-v2__section-head">
        <h3 class="cdn-domain-detail-access-v2__title">
          {{ t('remoteAuth') }}
        </h3>
        <p class="cdn-domain-detail-access-v2__desc">
          {{ t('customRemoteAuth') }}
        </p>
      </div>

      <div class="cdn-domain-detail-access-v2__switch-row">
        <span class="cdn-domain-detail-access-v2__label">{{ t('configStatus') }}</span>
        <div class="cdn-domain-detail-access-v2__switch-content">
          <el-switch
            v-model="access_config.remote_auth_conf.status"
            :before-change="switchRemote"
            :loading="remote.loading"
            :disabled="isReadOnly"
          />
          <button
            v-if="access_config.remote_auth_conf.status"
            class="cdn-domain-detail-access-v2__link"
            type="button"
            :disabled="isReadOnly"
            @click="editRemote"
          >
            {{ t('edit') }}
          </button>
        </div>
      </div>

      <p v-if="access_config.remote_auth_conf.status" class="cdn-domain-detail-access-v2__tip">
        *{{ t('remoteAuthTip') }}
      </p>

      <div v-if="access_config.remote_auth_conf.status" class="cdn-domain-detail-access-v2__grid">
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label">{{ t('remoteAuthAddress') }}</span>
          <div class="cdn-domain-detail-access-v2__content cdn-domain-detail-access-v2__content--break">
            {{ access_config.remote_auth_conf.auth_url || '--' }}
          </div>
        </div>
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label">{{ t('resMethod') }}</span>
          <div class="cdn-domain-detail-access-v2__content">
            {{ getValueMap(reqMethodList, access_config.remote_auth_conf.req_method) || '--' }}
          </div>
        </div>
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label">{{ t('authFileType') }}</span>
          <div class="cdn-domain-detail-access-v2__content">
            {{ getValueMap(fileTypeList, access_config.remote_auth_conf.file_type) }}
          </div>
        </div>
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label">{{ t('authTimeoutMin') }}</span>
          <div class="cdn-domain-detail-access-v2__content">
            {{ access_config.remote_auth_conf.timeout_duration || '--' }}
          </div>
        </div>
        <div class="cdn-domain-detail-access-v2__info-row">
          <span class="cdn-domain-detail-access-v2__label">{{ t('timeoutAction') }}</span>
          <div class="cdn-domain-detail-access-v2__content">
            {{ getValueMap(timeoutActionList, access_config.remote_auth_conf.timeout_action) }}
          </div>
        </div>
      </div>
    </section>

    <CatDialog
      v-model:dialog="referer.show"
      title="startAntiTheftConfig"
      width="780px"
      destroy-on-close
      @confirm="updateReferer"
    >
      <CatTip>
        <div>{{ t('antiTheftTip1') }}</div>
        <div>{{ t('antiTheftTip2') }}</div>
        <div>{{ t('antiTheftTip3') }}</div>
      </CatTip>
      <el-form ref="refererDom" :model="referer.form" label-width="auto" label-position="left" class="mt20">
        <el-form-item :label="t('antiTheftType')">
          <CatRadioGroup v-model="referer.form.type" :list="nameList" />
        </el-form-item>
        <el-form-item
          label="&nbsp;"
          prop="referer_list"
          style="margin-bottom: 0"
          :rules="{
            validator: () => isIPorDomain(referer.form.referer_list),
            message: !referer.form.referer_list ? '' : t('domainAndIPerrorTip'),
            trigger: 'change',
          }"
        >
          <el-input
            v-model="referer.form.referer_list"
            type="textarea"
            resize="none"
            rows="5"
            :spellcheck="false"
            :placeholder="t('inputDomainAndIPTip')"
          />
        </el-form-item>
        <el-form-item label="&nbsp;" style="margin-bottom: 0">
          <div v-html="alsoInput(getStringLength(400, referer.form.referer_list))" />
        </el-form-item>
        <el-form-item :label="t('emptyReferer')" prop="allow_empty">
          <el-checkbox
            v-model="referer.form.allow_empty"
            :label="t('allowEmptyReferer')"
            class="referer-checkbox-icon"
          />
          <el-tooltip effect="light" placement="right">
            <template #content>
              <div style="width: 400px">
                {{ t('emptyRefererTip') }}
              </div>
            </template>
            <div class="dif ac"><SvgIcon name="cat-cdn-help" class="ml4" />&nbsp;</div>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </CatDialog>

    <CatDialog v-model:dialog="ip.show" title="configIPlist" width="780px" destroy-on-close @confirm="updateIP">
      <CatTip>
        <div>{{ t('configIPlistTip1') }}</div>
        <div>{{ t('configIPlistTip2') }}</div>
        <div>{{ t('configIPlistTip3') }}</div>
        <div>{{ t('configIPlistTip4') }}</div>
        <div>{{ t('configIPlistTip5') }}</div>
      </CatTip>
      <el-form ref="ipDom" :model="ip.form.rule" label-width="auto" label-position="left" class="mt20">
        <el-form-item :label="t('type')">
          <CatRadioGroup v-model="ip.form.rule.ip_type" :list="nameList" />
        </el-form-item>
        <el-form-item
          :label="t('rule')"
          prop="ip_list"
          style="margin-bottom: 0"
          :rules="{
            validator: () => isIP(ip.form.rule.ip_list),
            message: !ip.form.rule.ip_list ? '' : t('ipError'),
            trigger: 'change',
          }"
        >
          <el-input
            v-model="ip.form.rule.ip_list"
            type="textarea"
            resize="none"
            rows="5"
            spellcheck="false"
            :placeholder="t('200ipTip')"
          />
        </el-form-item>
        <el-form-item label="&nbsp;" style="margin-bottom: 0">
          <div v-html="alsoInput(getStringLength(200, ip.form.rule.ip_list))" />
        </el-form-item>
      </el-form>
    </CatDialog>

    <CatDialog v-model:dialog="ipFreq.show" title="configIPfreq" width="780px" destroy-on-close @confirm="updateIPfreq">
      <CatTip>{{ t('IPfreqTip') }}</CatTip>
      <el-form ref="ipFreqDom" :model="ipFreq.form" label-width="auto" label-position="left" class="mt20">
        <el-form-item
          :label="t('accessThreshold')"
          prop="freq"
          :rules="{ validator: (r, v) => v !== '' && v > 0 && v <= 100000, message: '', trigger: 'change' }"
        >
          <el-input-number v-model="ipFreq.form.freq" :min="1" :max="100000" :step="1" :step-strictly="true" />
        </el-form-item>
      </el-form>
      <el-text type="info">
        {{ t('freqTip2') }}
      </el-text>
    </CatDialog>

    <CatDialog
      v-model:dialog="auth_calc.show"
      title="authCalc"
      width="780px"
      destroy-on-close
      @confirm="updateAuthCalc"
      @cancel="cancelAuthCalc"
    >
      <CatTip>{{ t('addOriginTip') }}</CatTip>
      <el-form
        ref="authCalcDom"
        :model="auth_calc.form!"
        hide-required-asterisk
        label-position="left"
        label-width="auto"
        class="mt20"
      >
        <el-form-item :label="t('originServerType')">
          <CatRadioGroup v-model="auth_calc.form!.auth_type" :list="authTypeList" />
        </el-form-item>
        <el-form-item :label="t('authAgol')">
          <CatRadioGroup v-model="auth_calc.form!.encrypt_manager" :list="authAlgorithmList" />
        </el-form-item>
        <el-form-item
          :label="t('key1')"
          prop="auth_key"
          :rules="{
            validator: (r, v) => KEY_REG(v),
            message: '',
            trigger: 'change',
          }"
        >
          <div class="df fdc w-full">
            <el-input v-model="auth_calc.form!.auth_key" :placeholder="t('key1Tip')" />
            <div class="mt10 pointer">
              {{ t('keyRules') }}
              <el-text type="primary" @click="auth_calc.form!.auth_key = create32key()">
                {{ t('randomGeneration') }}
              </el-text>
            </div>
          </div>
        </el-form-item>
        <el-form-item
          :label="t('key2')"
          prop="auth_key_backup"
          :rules="{
            validator: (r, v) => KEY_REG(v) || !v,
            message: '',
            trigger: 'change',
          }"
        >
          <div class="df fdc w-full">
            <el-input v-model="auth_calc.form!.auth_key_backup" :placeholder="t('key2Tip')" />
            <div class="mt10 pointer">
              {{ t('keyRules') }}
              <el-text type="primary" @click="auth_calc.form!.auth_key_backup = create32key()">
                {{ t('randomGeneration') }}
              </el-text>
            </div>
          </div>
        </el-form-item>
        <el-form-item
          v-if="auth_calc.form!.auth_type === 0 || auth_calc.form!.auth_type === 3"
          :label="t('authParams')"
          prop="auth_parameter"
          :rules="{
            validator: (r, v) => AUTH_PARAMS_REG.test(v),
            message: !auth_calc.form!.auth_parameter ? '' : t('authParamsErrorTip'),
            trigger: 'change',
          }"
        >
          <el-input v-model="auth_calc.form!.auth_parameter" :placeholder="t('inputAuthParams')" />
        </el-form-item>
        <el-form-item
          :label="t('accessPath')"
          prop="path"
          :rules="{
            validator: (r, v) => /^\/(?!.*\/$)([^*\/]*\/)*[^*\/]*$/.test(v),
            message: !auth_calc.form!.path ? '' : t('pathErrorTip'),
            trigger: 'change',
          }"
        >
          <el-input v-model="auth_calc.form!.path" :placeholder="t('accessPathTip')" />
        </el-form-item>
        <el-form-item
          :label="t('timeSet')"
          prop="start_time"
          :rules="{
            validator: (r, v) => new Date(v).getTime() > 0,
            message: '',
            trigger: 'change',
          }"
        >
          <el-date-picker
            v-model="auth_calc.form!.start_time"
            type="datetime"
            :clearable="false"
            :placeholder="t('selectTime')"
          />
          <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
            <SvgIcon class="ml10" name="cat-cdn-help" />
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="t('timeMethod')" prop="time_format">
          <div v-if="auth_calc.form!.auth_type == 0">{{ t('deci10') }}（Unix {{ t('timeStamp') }}）</div>
          <div v-if="auth_calc.form!.auth_type == 1">{{ t('deci10') }}（YYYYMMDDHHMM）</div>
          <div v-if="auth_calc.form!.auth_type == 2">{{ t('deci16') }}（Unix {{ t('timeStamp') }}）</div>
          <el-radio-group v-if="auth_calc.form!.auth_type == 3" v-model="auth_calc.form!.time_format">
            <el-radio :label="0"> {{ t('deci10') }}（Unix {{ t('timeStamp') }}） </el-radio>
            <el-radio :label="1"> {{ t('deci16') }}（Unix {{ t('timeStamp') }}） </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          :label="t('trueTimeUnit')"
          prop="valid_time"
          :rules="{
            validator: (r, v) => 0 <= v && v < '31536000',
            message: '',
            trigger: 'change',
          }"
        >
          <el-input v-model.number="auth_calc.form!.valid_time" />
        </el-form-item>
        <el-form-item v-if="auth_calc_result.url" :label="t('authURL')">
          <div class="cdn-domain-detail-access-v2__word-break">
            {{ auth_calc_result.url }}
          </div>
        </el-form-item>
        <el-form-item v-if="auth_calc_result.url_backup" :label="t('authURL2')">
          <div class="cdn-domain-detail-access-v2__word-break">
            {{ auth_calc_result.url_backup }}
          </div>
        </el-form-item>
        <el-form-item v-if="auth_calc_result.expire_at" :label="t('expireTime1')">
          <div class="cdn-domain-detail-access-v2__word-break">
            {{ getDateDayjs(auth_calc_result.expire_at * 1000, 'string', true) }}
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="cat-dialog-footer">
          <el-button class="mr20" type="primary" @click="updateAuthCalc">
            {{ t('generate') }}
          </el-button>
          <el-button type="primary" @click="auth_calc.show = false">
            {{ t('cancel') }}
          </el-button>
        </div>
      </template>
    </CatDialog>

    <CatDialog v-model:dialog="auth.show" title="authConfig" width="780px" destroy-on-close @confirm="updateAuth">
      <CatTip>{{ t('addOriginTip') }}</CatTip>
      <el-form ref="authDom" :model="auth.form" label-position="left" label-width="auto" class="mt20">
        <el-form-item :label="t('originServerType')">
          <CatRadioGroup v-model="auth.form.auth_type" :list="authTypeList" />
        </el-form-item>
        <el-form-item :label="t('authAgol')">
          <CatRadioGroup v-model="auth.form.encrypt_manager" :list="authAlgorithmList" />
        </el-form-item>
        <el-form-item :label="t('modeExample')">
          <div class="cdn-domain-detail-access-v2__word-break">
            {{ getTemplate }}
          </div>
        </el-form-item>
        <el-form-item :label="t('authRange')">
          <CatSelect
            v-model="auth.form.auth_range"
            :list="authRangeList"
            class="200px;"
            @change="authDom?.clearValidate(['file_suffix'])"
          />
        </el-form-item>
        <el-form-item
          v-if="auth.form.auth_range > 0"
          label=" "
          prop="file_suffix"
          :rules="{
            validator: (r, v) => validContent(v, 1),
            message: !auth.form.file_suffix ? '' : t('formatErrorTip'),
            trigger: 'change',
          }"
        >
          <el-input v-model="auth.form.file_suffix" />
        </el-form-item>
        <el-form-item
          :label="t('key1')"
          prop="auth_key"
          :rules="{
            validator: (r, v) => KEY_REG(v),
            message: '',
            trigger: 'change',
          }"
        >
          <div class="df fdc w-full">
            <el-input v-model="auth.form!.auth_key" :placeholder="t('key1Tip')" />
            <div class="mt10 pointer">
              {{ t('keyRules') }}
              <el-text type="primary" @click="auth.form!.auth_key = create32key()">
                {{ t('randomGeneration') }}
              </el-text>
            </div>
          </div>
        </el-form-item>
        <el-form-item
          :label="t('key2')"
          prop="auth_key_backup"
          :rules="{
            validator: (r, v) => KEY_REG(v) || !v,
            message: '',
            trigger: 'change',
          }"
        >
          <div class="df fdc w-full">
            <el-input v-model="auth.form!.auth_key_backup" :placeholder="t('key2Tip')" />
            <div class="mt10 pointer">
              {{ t('keyRules') }}
              <el-text type="primary" @click="auth.form!.auth_key_backup = create32key()">
                {{ t('randomGeneration') }}
              </el-text>
            </div>
          </div>
        </el-form-item>
        <el-form-item
          v-if="auth.form!.auth_type === 0 || auth.form!.auth_type === 3"
          :label="t('authParams')"
          prop="auth_parameter"
          :rules="{
            validator: (r, v) => AUTH_PARAMS_REG.test(v),
            message: !auth.form!.auth_parameter ? '' : t('authParamsErrorTip'),
            trigger: 'change',
          }"
        >
          <el-input v-model="auth.form!.auth_parameter" :placeholder="t('inputAuthParams')" />
        </el-form-item>
        <el-form-item
          :label="t('trueTimeUnit')"
          prop="valid_time"
          :rules="{
            validator: (r, v) => 0 <= v && v < '31536000',
            message: '',
            trigger: 'change',
          }"
        >
          <el-input v-model.number="auth.form.valid_time" />
        </el-form-item>
        <el-form-item :label="t('timeMethod')" prop="time_format">
          <div v-if="auth.form!.auth_type == 0">{{ t('deci10') }}（Unix {{ t('timeStamp') }}）</div>
          <div v-if="auth.form!.auth_type == 1">{{ t('deci10') }}（YYYYMMDDHHMM）</div>
          <div v-if="auth.form!.auth_type == 2">{{ t('deci16') }}（Unix {{ t('timeStamp') }}）</div>
          <el-radio-group v-if="auth.form!.auth_type == 3" v-model="auth.form!.time_format">
            <el-radio :label="0"> {{ t('deci10') }}（Unix {{ t('timeStamp') }}） </el-radio>
            <el-radio :label="1"> {{ t('deci16') }}（Unix {{ t('timeStamp') }}） </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </CatDialog>

    <CatDialog v-model:dialog="agent.show" title="userAgentList" width="780px" destroy-on-close @confirm="updateAgent">
      <CatTip>{{ t('addOriginTip') }}</CatTip>
      <el-form
        ref="agentDom"
        :model="agent.form.rule"
        label-width="auto"
        label-position="left"
        hide-required-asterisk
        class="mt20"
      >
        <el-form-item :label="t('antiTheftType')" prop="type">
          <div>
            <CatRadioGroup v-model="agent.form.rule.type" :list="nameList" />
            <div>{{ t('userAgentDialogTip1') }}</div>
          </div>
        </el-form-item>
        <el-form-item
          :label="t('rule')"
          prop="agent_list"
          style="margin-bottom: 0"
          :rules="{
            message: agent.form.rule.agent_list ? t('userAgentRuleTip') : '',
            validator: (r, v) => v.length > 0 && getStringLength(10, v) >= 0 && validRules(v),
            trigger: 'change',
          }"
        >
          <el-input
            v-model="agent.form.rule.agent_list"
            :placeholder="t('pleaseSetRule')"
            type="textarea"
            resize="none"
            rows="5"
            spellcheck="false"
          />
        </el-form-item>
        <el-form-item label=" ">
          <div class="mt10">
            {{ t('userAgentDialogTip2') }}
          </div>
        </el-form-item>
      </el-form>
    </CatDialog>

    <CatDialog
      v-model:dialog="remote.show"
      title="remoteAuthConfig"
      width="780px"
      destroy-on-close
      @confirm="updateRemote"
    >
      <el-form ref="remoteDom" :model="remote.form" label-width="auto" label-position="left">
        <el-form-item
          :label="t('remoteAuthAddress')"
          prop="auth_url"
          :rules="{
            validator: (r, v) => authPathReg.test(v),
            message: !remote.form.auth_url ? '' : t('authAddressErrorTip'),
            trigger: 'change',
          }"
        >
          <el-input v-model="remote.form.auth_url" :placeholder="t('authAddressInputTip')" />
        </el-form-item>
        <el-form-item :label="t('resMethod')">
          <CatRadioGroup v-model="remote.form.req_method" :list="reqMethodList" />
        </el-form-item>
        <el-form-item :label="t('type')">
          <CatSelect v-model="remote.form.file_type" :list="setFileTypeList" />
        </el-form-item>
        <el-form-item
          v-if="remote.form.file_type === 1"
          label="&nbsp;"
          prop="file_suffix"
          :rules="{
            validator: (r, v) => validFileExtension(v, /^[a-zA-Z0-9]+$/, '|'),
            message: !remote.form.file_suffix ? '' : t('inputTrueFileType'),
            trigger: 'change',
          }"
        >
          <el-input v-model="remote.form.file_suffix" :placeholder="t('fileTypeTip')" />
        </el-form-item>
        <el-form-item :label="t('authTimeout')" prop="timeout_duration">
          <el-form-item
            prop="timeout_duration"
            :inline-message="false"
            :rules="{
              validator: (r, v) => v === 0 || (v > 50 && v < 3000),
              message: !remote.form.timeout_duration ? '' : t('input50To3000'),
              trigger: 'change',
            }"
          >
            <el-input v-model.number="remote.form.timeout_duration" class="w-140px" style="width: 200px" />
          </el-form-item>
        </el-form-item>
        <el-form-item :label="t('timeoutAction')">
          <CatRadioGroup v-model="remote.form.timeout_action" :list="timeoutActionList" />
        </el-form-item>
      </el-form>
    </CatDialog>
  </div>
</template>

<script lang="ts" setup>
import {
  validContent,
  validFileExtension,
  validIP,
  notification,
  validDomain,
  alsoInput,
} from '@/views/cdn/domain/index-domain'
import { nameList, setFileTypeList } from '@/assets/data/common.js'
import { AUTH_PARAMS_REG } from '@/utils/reg'
import { getStringLength } from '@/utils/string-utils'
import { getValueMap } from '@/utils/collection-utils'
import { _throttle } from '@/utils/timing-utils'
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import {
  authTypeList,
  authAlgorithmList,
  timeFormatList,
  authRangeList,
  fileTypeList,
  timeoutActionList,
  reqMethodList,
} from '@/assets/data/common.js'
import {
  _getAccessConfig,
  _updateRefererConfig,
  _updateIPconfig,
  _updateIPfreqConfig,
  _updateAuthConfig,
  _updateAuthCalcConfig,
  _updateAgentConfig,
  _updateRemoteConfig,
} from '@/apis/cdn/domain'

import type {
  DomainAccessConfig,
  RefererConfig,
  IPconfig,
  IPfreqConfig,
  AuthConfig,
  AuthCalcConfig,
  AgentConfig,
  RemoteConfig,
} from '@/views/cdn/common'
import type { FormInstance } from 'element-plus/es'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'

const route: any = useRoute()

const isReadOnly = computed(() => +route.query.status > 2 || route.query.is_lock == 1)

const access_config = ref<DomainAccessConfig>({
  referer_conf: {
    status: false,
    type: 0,
    referer_list: [],
    allow_empty: 0,
  },
  ip_filter_conf: {
    status: false,
    rule: {
      ip_type: 0,
      ip_list: [],
    },
  },
  ip_frequency_conf: {
    status: false,
    freq: 0,
  },
  auth_conf: {
    status: false,
    auth_type: 0,
    auth_range: 0,
    file_suffix: [],
    auth_key: '',
    auth_key_backup: '',
    auth_parameter: '',
    encrypt_manager: 0,
    valid_time: 1,
    time_format: 0,
  },
  user_agent_conf: {
    status: false,
    rule: {
      type: 0,
      agent_list: [],
    },
  },
  remote_auth_conf: {
    status: false,
    auth_url: '',
    req_method: 0,
    file_type: 0,
    file_suffix: '',
    timeout_duration: 60,
    timeout_action: 0,
  },
})
const getAccessConfig = async () => {
  await _getAccessConfig(route.query.id as any).then(res => {
    access_config.value = res.data
    for (const key in access_config.value) {
      if (access_config.value[key].hasOwnProperty('status')) {
        access_config.value[key].status = !!res.data[key].status
      }
    }
    access_config.value.referer_conf.allow_empty = !!access_config.value.referer_conf.allow_empty
    access_config.value.referer_conf.referer_list = access_config.value.referer_conf.referer_list?.join('\n') || ''
    access_config.value.ip_filter_conf.rule.ip_list = access_config.value.ip_filter_conf.rule.ip_list?.join('\n') || ''
    access_config.value.auth_conf.file_suffix = access_config.value.auth_conf.file_suffix?.join(',') || ''
    access_config.value.user_agent_conf.rule.agent_list =
      access_config.value.user_agent_conf.rule.agent_list?.join('\n') || ''
    access_config.value.remote_auth_conf.file_suffix = access_config.value.remote_auth_conf.file_suffix?.join('|') || ''
  })
}
getAccessConfig()

const referer = reactive<{ show: boolean; loading: boolean; form: RefererConfig }>({
  show: false,
  loading: false,
  form: {
    status: false,
    type: 0,
    referer_list: '',
    allow_empty: 0,
  },
})
const refererDom = ref<FormInstance | null>(null)
const editReferer = () => {
  referer.form = JSON.parse(JSON.stringify(access_config.value.referer_conf))
  referer.show = true
}
const switchReferer = _throttle(() => {
  referer.form = JSON.parse(JSON.stringify(access_config.value.referer_conf))
  if (!referer.form.status && !referer.form.referer_list.length) {
    referer.form.status = true
    referer.show = true
    return
  }
  updateReferer(true)
}, 2000)
const updateReferer = async (isSwitch = false) => {
  if (!isSwitch) {
    const valid = await refererDom.value!.validate(v => v)
    if (!valid) return
  }
  const params = {
    id: route.query.id,
    form: {
      type: referer.form.type,
      status: isSwitch ? +!referer.form.status : +referer.form.status,
      allow_empty: +referer.form.allow_empty,
      referer_list: referer.form.referer_list.trim().split('\n'),
    },
  }
  referer.loading = true
  return _updateRefererConfig(params)
    .then(() => {
      getAccessConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      referer.show = false
      referer.loading = false
    })
}
const isIPorDomain = (data: string) => {
  const arr = data.split('\n')
  if (arr.length > 400) return false
  for (let i = 0; i < arr.length; i++) {
    if (!validDomain(arr[i]) && !validIP(arr[i])) {
      return false
    }
  }
  return true
}

const ip = reactive<{ show: boolean; loading: boolean; form: IPconfig }>({
  show: false,
  loading: false,
  form: {
    status: false,
    rule: {
      ip_type: 0,
      ip_list: [],
    },
  },
})
const ipDom = ref<FormInstance | null>(null)
const editIP = () => {
  ip.form = JSON.parse(JSON.stringify(access_config.value.ip_filter_conf))
  ip.show = true
}
const switchIP = _throttle(() => {
  ip.form = JSON.parse(JSON.stringify(access_config.value.ip_filter_conf))
  if (!ip.form.status && !ip.form.rule.ip_list.length) {
    ip.form.status = true
    ip.show = true
    return
  }
  updateIP(true)
}, 2000)
const updateIP = async (isSwitch = false) => {
  if (!isSwitch) {
    const valid = await ipDom.value!.validate(v => v)
    if (!valid) return
  }
  const params = {
    id: route.query.id,
    form: {
      status: isSwitch ? +!ip.form.status : +ip.form.status,
      rule: {
        ip_type: +ip.form.rule.ip_type,
        ip_list: ip.form.rule.ip_list.trim().split('\n'),
      },
    },
  }
  ip.loading = true
  return _updateIPconfig(params)
    .then(() => {
      getAccessConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      ip.show = false
      ip.loading = false
    })
}
const isIP = (data: string) => {
  const arr = data.split('\n')
  if (arr.length > 200) return false
  for (let i = 0; i < arr.length; i++) {
    if (!validIP(arr[i])) {
      return false
    }
  }
  return true
}

const ipFreq = reactive<{ show: boolean; loading: boolean; form: IPfreqConfig }>({
  show: false,
  loading: false,
  form: {
    status: false,
    freq: 0,
  },
})
const ipFreqDom = ref<FormInstance | null>(null)
const openIPfreq = () => {
  ipFreq.form = { ...access_config.value.ip_frequency_conf }
  ipFreq.show = true
}
const switchIPfreq = _throttle(() => {
  ipFreq.form = { ...access_config.value.ip_frequency_conf }
  if (!access_config.value.ip_frequency_conf.status && !access_config.value.ip_frequency_conf.freq) {
    ipFreq.form.status = true
    ipFreq.show = true
    return
  }
  updateIPfreq(true)
}, 2000)
const updateIPfreq = async (isSwitch = false) => {
  if (!isSwitch) {
    const valid = await ipFreqDom.value!.validate(v => v)
    if (!valid) return
  }
  const params = {
    id: route.query.id,
    form: {
      status: isSwitch ? +!ipFreq.form.status : +ipFreq.form.status,
      freq: ipFreq.form.freq,
    },
  }
  ipFreq.loading = true
  _updateIPfreqConfig(params)
    .then(({ code }) => {
      if (code == 200) {
        getAccessConfig()
        notification({ type: 'success', msg: 'setSuccess' })
      }
    })
    .finally(() => {
      ipFreq.show = false
      ipFreq.loading = false
    })
}

const auth = reactive<{ show: boolean; loading: boolean; form: AuthConfig }>({
  show: false,
  loading: false,
  form: {
    status: false,
    auth_type: 0,
    auth_range: 0,
    file_suffix: [],
    auth_key: '',
    auth_key_backup: '',
    auth_parameter: '',
    encrypt_manager: 0,
    valid_time: 0,
    time_format: 0,
  },
})
const templateList: { type: number; al: number; template: string }[] = [
  {
    type: 0,
    al: 0,
    template:
      'http://example.com/test/1.jpg?sign=1698997921-AxN9bUMy9Mehn0iTPiFT1EYrKy-0-1f584e74937457d1ddbaa2ec845fa13b',
  },
  {
    type: 0,
    al: 1,
    template:
      'http://example.com/test/1.jpg?sign=1698998065-SyFLiwIhsApf6fwyoDkRiQbg27C43-0-4cadd3a07fdc41ad902f8851ce73b93cd9e4528c6efb14e7df5b0ad7bc926df5',
  },
  {
    type: 1,
    al: 0,
    template: 'http://example.com/202311031556/261bea9e689bb17bfe5a0341fe75fc33/test/1.jpg',
  },
  {
    type: 1,
    al: 1,
    template:
      'http://example.com/202311031556/831bc9fab06421c2733b023d946eb118b866197c1013b925a81cbeabfba2ae8f/test/1.jpg',
  },
  {
    type: 2,
    al: 0,
    template: 'http:///example.com/5600cf5e93bace18e4b11b4ff642055b/6544a7ca/test/1.jpg',
  },
  {
    type: 2,
    al: 1,
    template: 'http://example.com/8b3f6df1b1b4b230bec19fa63e36925d24c86315abdfec04acb65e8e6c925694/6544a7d2/test/1.jpg',
  },
  {
    type: 3,
    al: 0,
    template: 'http://example.com/test/1.jpg?sign=151b4ef0e78e45d0b8285579052b9b85&t=1698998234',
  },
  {
    type: 3,
    al: 1,
    template:
      'http://example.com/test/1.jpg?sign=1f6ddcaa78afddc359a1e2be65295d88fcab7cc962e3bf8e2da08f6549b348bf&t=1698998240',
  },
]
const getTemplate: ComputedRef<string> = computed(() => {
  return templateList.find(v => v.type == auth.form.auth_type && v.al == auth.form.encrypt_manager)!.template
})
const authDom = ref<FormInstance | null>(null)
const editAuth = () => {
  auth.form = { ...access_config.value.auth_conf }
  auth.show = true
}
const switchAuth = _throttle(() => {
  auth.form = { ...access_config.value.auth_conf }
  if (!access_config.value.auth_conf.status && !access_config.value.auth_conf.auth_key) {
    auth.form.status = true
    auth.show = true
    return
  }
  updateAuth(true)
}, 2000)
const updateAuth = async (isSwitch = false) => {
  if (!isSwitch) {
    const valid = await authDom.value?.validate(b => b)
    if (!valid) return
  }
  const params: any = {
    id: route.query.id,
    form: {
      ...auth.form,
      status: isSwitch ? +!auth.form.status : +auth.form.status,
      file_suffix: auth.form.file_suffix.split(';'),
    },
  }
  if (auth.form!.auth_type == 0 || auth.form!.auth_type == 1) {
    params.form.time_format = 0
  } else if (auth.form!.auth_type == 2) {
    params.form.time_format = 1
  }
  auth.loading = true
  return _updateAuthConfig(params)
    .then(() => {
      getAccessConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      auth.show = false
      auth.loading = false
    })
}

const auth_calc = reactive<{ show: boolean; form: AuthCalcConfig | null; rawForm: AuthCalcConfig }>({
  show: false,
  form: null,
  rawForm: {
    domain_name: '',
    auth_type: 0,
    auth_range: 0,
    path: '',
    auth_key: '',
    auth_key_backup: '',
    auth_parameter: '',
    encrypt_manager: 0,
    start_time: 0,
    valid_time: 1,
    time_format: 0,
  },
})
const KEY_REG = v => {
  if (!/^[a-zA-Z0-9]{16,32}$/.test(v)) {
    return false
  } else {
    let type = 0
    if (/[a-z]/.test(v)) type++
    if (/[A-Z]/.test(v)) type++
    if (/[0-9]/.test(v)) type++
    if (type >= 2) return true
    else return false
  }
}
const auth_calc_result = ref<{
  url: string
  url_backup: string
  expire_at: any
}>({
  url: '',
  url_backup: '',
  expire_at: '',
})
const authCalcDom = ref<FormInstance | null>(null)
const openAuthCalc = () => {
  auth_calc.form = { ...auth_calc.rawForm }
  auth_calc.show = true
}
const updateAuthCalc = async () => {
  const valid = await authCalcDom.value?.validate(b => b)
  if (!valid) return
  const params: AuthCalcConfig | any = {
    ...auth_calc.form,
    start_time: maoYunDayJs(auth_calc.form!.start_time).valueOf() / 1000,
    domain_name: route.query.domain as any,
  }
  if (auth_calc.form!.auth_type == 0 || auth_calc.form!.auth_type == 1) {
    params.time_format = 0
  } else if (auth_calc.form!.auth_type == 2) {
    params.time_format = 1
  }
  _updateAuthCalcConfig(params).then(res => {
    if (res.code === 200) {
      auth_calc_result.value = res.data
    }
  })
}
const cancelAuthCalc = () => {
  for (const key in auth_calc_result.value) {
    auth_calc_result.value[key] = ''
  }
  auth_calc.show = false
}
const create32key = () => {
  let rawString = ''
  for (let i = 65; i <= 90; i++) {
    rawString += String.fromCharCode(i)
  }
  rawString += rawString.toLocaleLowerCase()
  for (let k = 0; k < 10; k++) {
    rawString += k
  }
  let key = ''
  for (let j = 0; j < 32; j++) {
    key += rawString[Math.floor(Math.random() * rawString.length)]
  }
  return key
}

const agent = reactive<{ show: boolean; loading: boolean; form: AgentConfig }>({
  show: false,
  loading: false,
  form: {
    status: false,
    rule: {
      type: 0,
      agent_list: [],
    },
  },
})
const agentDom = ref<FormInstance | null>(null)
const editAgent = () => {
  agent.form = JSON.parse(JSON.stringify(access_config.value.user_agent_conf))
  agent.show = true
}
const switchAgent = _throttle(() => {
  agent.form = JSON.parse(JSON.stringify(access_config.value.user_agent_conf))
  if (!access_config.value.user_agent_conf.status && !access_config.value.user_agent_conf.rule.agent_list.length) {
    agent.form.status = true
    agent.show = true
    return
  }
  updateAgent(true)
}, 2000)
const updateAgent = async (isSwitch = false) => {
  if (!isSwitch) {
    const valid = await agentDom.value!.validate(b => b)
    if (!valid) return
  }
  const params = {
    id: route.query.id,
    form: {
      status: isSwitch ? +!agent.form.status : +agent.form.status,
      rule: {
        type: +agent.form.rule.type,
        agent_list: agent.form.rule.agent_list.trim().split('\n'),
      },
    },
  }
  agent.loading = true
  return _updateAgentConfig(params)
    .then(() => {
      getAccessConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      agent.show = false
      agent.loading = false
    })
}
const validRules = (content: string) => {
  return content.split('\n').every(v => /^(?!\s+$)(?!\*+$)(?:\*[ -~]*|[ -~]*\*|[ -~]+)$/.test(v))
}

const remote = reactive<{ show: boolean; loading: boolean; form: RemoteConfig }>({
  show: false,
  loading: false,
  form: {
    status: false,
    auth_url: '',
    req_method: 0,
    file_type: 0,
    file_suffix: '',
    timeout_duration: 60,
    timeout_action: 0,
  },
})
const remoteDom = ref<FormInstance | null>(null)
const editRemote = () => {
  remote.form = { ...access_config.value.remote_auth_conf }
  remote.show = true
}
const switchRemote = _throttle(() => {
  remote.form = { ...access_config.value.remote_auth_conf }
  if (!access_config.value.remote_auth_conf.status && !access_config.value.remote_auth_conf.auth_url) {
    remote.form.status = true
    remote.show = true
    return
  }
  updateRemote(true)
}, 2000)
const updateRemote = async (isSwitch = false) => {
  if (!isSwitch) {
    const valid = await remoteDom.value!.validate(v => v)
    if (!valid) return
  }
  const params = {
    id: route.query.id,
    form: {
      ...remote.form,
      timeout_duration: remote.form.timeout_duration,
      status: isSwitch ? +!remote.form.status : +remote.form.status,
      file_suffix: remote.form.file_suffix.split('|'),
    },
  }
  remote.loading = true
  return _updateRemoteConfig(params)
    .then(({ code }) => {
      if (code == 200) {
        getAccessConfig()
        notification({ type: 'success', msg: 'setSuccess' })
      }
    })
    .finally(() => {
      remote.loading = false
      remote.show = false
    })
}
const authPathReg =
  /^(https?):\/\/(?:([a-z0-9\u00A0-\uFFFF-]{1,63}\.)+[a-z\u00A0-\uFFFF]{2,}|(?:(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d))(?:\/[a-z0-9\u00A0-\uFFFF-]+)*\/?$/i
</script>

<style lang="scss" scoped>
.cdn-domain-detail-access-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cdn-domain-detail-access-v2__section {
  padding: 20px;
  background: #fff;
}

.cdn-domain-detail-access-v2__section-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.cdn-domain-detail-access-v2__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #191c23;
}

.cdn-domain-detail-access-v2__desc,
.cdn-domain-detail-access-v2__empty,
.cdn-domain-detail-access-v2__tip {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.cdn-domain-detail-access-v2__empty {
  margin-top: 8px;
}

.cdn-domain-detail-access-v2__tip {
  margin-top: 12px;
}

.cdn-domain-detail-access-v2__action-row,
.cdn-domain-detail-access-v2__grid {
  margin-top: 16px;
}

.cdn-domain-detail-access-v2__action-row {
  margin-bottom: 20px;
}

.cdn-domain-detail-access-v2__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 32px;
}

.cdn-domain-detail-access-v2__info-row,
.cdn-domain-detail-access-v2__switch-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.cdn-domain-detail-access-v2__switch-row + .cdn-domain-detail-access-v2__info-row,
.cdn-domain-detail-access-v2__info-row + .cdn-domain-detail-access-v2__info-row,
.cdn-domain-detail-access-v2__switch-row + .cdn-domain-detail-access-v2__tip,
.cdn-domain-detail-access-v2__tip + .cdn-domain-detail-access-v2__grid,
.cdn-domain-detail-access-v2__switch-row + .cdn-domain-detail-access-v2__grid {
  margin-top: 16px;
}

.cdn-domain-detail-access-v2__label {
  flex: 0 0 96px;

  // padding-top: 5px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  white-space: nowrap;
}

.cdn-domain-detail-access-v2__content,
.cdn-domain-detail-access-v2__switch-content {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.cdn-domain-detail-access-v2__switch-content {
  gap: 8px;
}

.cdn-domain-detail-access-v2__content :deep(.el-textarea),
.cdn-domain-detail-access-v2__content :deep(.el-textarea__inner) {
  width: 100%;
}

.cdn-domain-detail-access-v2__content--break,
.cdn-domain-detail-access-v2__word-break {
  word-break: break-all;
}

.cdn-domain-detail-access-v2__link {
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;

  &:disabled {
    color: #bbc0ca;
    cursor: not-allowed;
  }
}

:deep(.el-switch) {
  --el-switch-on-color: #06f;
  --el-switch-off-color: #bbc0ca;
}

:deep(.referer-checkbox-icon) {
  .el-checkbox__inner {
    border-radius: 50%;
  }
}

@media (width <= 1200px) {
  .cdn-domain-detail-access-v2__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (width <= 768px) {
  .cdn-domain-detail-access-v2__section {
    padding: 16px;
  }

  .cdn-domain-detail-access-v2__info-row,
  .cdn-domain-detail-access-v2__switch-row {
    flex-wrap: wrap;
  }

  .cdn-domain-detail-access-v2__label {
    flex-basis: 100%;
    padding-top: 0;
  }
}
</style>
