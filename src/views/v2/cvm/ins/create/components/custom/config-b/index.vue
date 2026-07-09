<template>
  <div class="wrap custom-b-v2">
    <!-- 宽带与网络 -->
    <div id="network" class="item config-wrap df ac mb20">
      <div class="key-wrap">
        <Title :text="t('ins.custom.broadbandNet')" />
      </div>
    </div>

    <!-- 网络 -->
    <div class="item network-wrap df" :class="showNetworkDefaultDesc ? '' : 'ac'">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.custom.net') }}
      </div>
      <div class="value">
        <!-- vpc和subnet必须有勾选值 -->
        <div class="df ac" :class="showNetworkDefaultDesc ? 'mb16' : ''">
          <!-- vpc下拉 -->
          <el-select
            ref="moreOptsRef"
            v-model="store.netConfig.vpcCur"
            style="width: 320px; margin-right: 16px"
            :teleported="false"
            :placeholder="t('ins.custom.vpcPh')"
            :disabled="store.netConfig.vpcList?.length ? false : true"
            @change="changeVpc"
          >
            <el-option v-for="item in store.netConfig.vpcList" :key="item.id" :value="item.id" :label="item.vpcName" />
          </el-select>
          <!-- 子网下拉 -->
          <el-select
            ref="moreOptsRef"
            v-model="store.netConfig.subnetCur"
            style="width: 320px"
            :teleported="false"
            class="mr20"
            :placeholder="t('ins.custom.subnetPh')"
            :disabled="store.netConfig.subnetList?.length ? false : true"
            @change="() => {}"
          >
            <el-option
              v-for="item in store.netConfig.subnetList"
              :key="item.id"
              :value="item.id"
              :label="item.subnetName"
            />
          </el-select>
          <SvgIcon
            name="refresh"
            class="pointer"
            :class="loadingNetwork ? 'loadingAnimate' : ''"
            @click="refreshSubnet"
          />
        </div>
        <div class="network-default-desc">
          <!-- vpc和子网列表都没有 -->
          <template v-if="!store.netConfig.vpcList?.length && !store.netConfig.subnetList?.length">
            <i18n-t keypath="ins.custom.vpcDefaultDesc">
              <span class="text-primary pointer mr4" @click="createVpcFn">
                {{ t('ins.custom.quickCreate') }}
              </span>
            </i18n-t>
          </template>
          <!-- 只有子网列表没有(公有云) todo：阿发说拿新增vpc的按钮权限来判断公有云还是私有云 -->
          <template
            v-if="
              store.netConfig.vpcList?.length &&
              !store.netConfig.subnetList?.length &&
              !checkPermission(permMap.vpc.CREATE_VPC)
            "
          >
            <div>
              {{ t('ins.custom.noVpcOrSubnet') }}
            </div>
            <!--（只显示新增子网）-->
            <i18n-t keypath="ins.custom.subnetDefaultDesc">
              <span class="text-primary pointer mr4" @click="toSubnet">
                {{ t('ins.custom.createSubnet') }}
              </span>
              <SvgIcon name="share" class="pointer" style="width: 12px; height: 12px" />
            </i18n-t>
          </template>
          <!-- 只有子网列表没有（私有云） -->
          <template
            v-if="
              store.netConfig.vpcList?.length &&
              !store.netConfig.subnetList?.length &&
              checkPermission(permMap.vpc.CREATE_VPC)
            "
          >
            <div>
              {{ t('ins.custom.noVpcOrSubnet') }}
            </div>
            <!--（显示新增vpc和子网） -->
            <i18n-t keypath="ins.custom.vpcAndSubnetDefaultDesc">
              <span class="text-primary pointer tip-box" @click="toVpc">
                <span class="mr4">
                  {{ t('ins.custom.createVpc') }}
                </span>
                <SvgIcon name="share" class="pointer" style="width: 12px; height: 12px; margin-top: -3px" />
              </span>
              <span class="text-primary pointer tip-box" @click="toSubnet">
                <span class="mr4">
                  {{ t('ins.custom.createSubnet') }}
                </span>
                <SvgIcon name="share" class="pointer" style="width: 12px; height: 12px; margin-top: -3px" />
              </span>
            </i18n-t>
          </template>
          <!-- vpc和子网列表都有(私有云) -->
          <template
            v-if="
              store.netConfig.vpcList?.length &&
              store.netConfig.subnetList?.length &&
              checkPermission(permMap.vpc.CREATE_VPC)
            "
          >
            <i18n-t keypath="ins.custom.vpcAndSubnetDefaultDesc">
              <span class="text-primary pointer tip-box" @click="toVpc">
                <span class="mr4">
                  {{ t('ins.custom.createVpc') }}
                </span>
                <SvgIcon name="share" class="pointer" style="width: 12px; height: 12px; margin-top: -3px" />
              </span>
              <span class="text-primary pointer tip-box" @click="toSubnet">
                <span class="mr4">
                  {{ t('ins.custom.createSubnet') }}
                </span>
                <SvgIcon name="share" class="pointer" style="width: 12px; height: 12px; margin-top: -3px" />
              </span>
            </i18n-t>
          </template>
        </div>
      </div>
    </div>

    <!-- 公网IP -->
    <div class="item df ip-wrap">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.custom.publicIP') }}
      </div>
      <div class="value">
        <el-checkbox
          v-model="store.publicIpConfig.checked"
          class="mb16"
          :label="t('ins.custom.assignPublicIP')"
          size="large"
        />
        <div v-if="!store.publicIpConfig.checked" class="text-error publicIPDesc">
          {{ t('ins.custom.publicIPDesc') }}
        </div>
      </div>
    </div>

    <!-- 宽带计费模式 -->
    <div v-if="store.publicIpConfig.checked" class="item df ac cost-type-wrap">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.custom.broadbandCostType') }}
      </div>
      <div class="value">
        <!-- 实例为按量计费，带宽计费模式不包含按带宽计费 -->
        <div class="df">
          <div
            v-for="(item, index) in store.publicIpConfig.list.filter(el =>
              el.costType.includes(store.costTypeConfig.cur),
            )"
            :key="index"
            class="cost-type cursor-pointer"
            :class="store.publicIpConfig.chargeTypeCur === item.value && 'cost-type-actived'"
            @click="changeIpChargeType(item.value)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- 线路 -->
    <div v-if="store.publicIpConfig.checked" id="lineType" class="item df ac line-wrap">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.custom.lineType') }}
      </div>
      <div class="value">
        <div class="df">
          <div
            v-for="(item, index) in store.publicIpConfig.lineTypeList"
            :key="index"
            class="line cursor-pointer"
            :class="store.publicIpConfig.lineTypeCur === item.value && 'line-actived'"
            @click="changeIpLine(item.value)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- 共享流量包 -->
    <div
      v-if="store.publicIpConfig.checked && store.publicIpConfig.chargeTypeCur === 3"
      id="package"
      class="item df ac package-wrap"
    >
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.custom.sharedTrafficPackage') }}
      </div>
      <div class="value">
        <div class="df ac">
          <!-- 共享流量包下拉 -->
          <el-select
            ref="moreOptsRef"
            v-model="store.publicIpConfig.pkgIdCur"
            style="width: 320px"
            :teleported="false"
            class="mr20"
            :placeholder="t('ins.custom.packagePh')"
          >
            <el-option
              v-for="(item, index) in store.publicIpConfig.pkgList"
              :key="index"
              :label="`${item.pkgUuid} | (${item.pkgName})`"
              :value="item.id"
            >
              <div class="df ac opt-wrap w-full h-full">
                <div class="item text-over">
                  {{ `${item.pkgUuid} | (${item.pkgName})` }}
                </div>
              </div>
            </el-option>
          </el-select>
          <SvgIcon name="refresh" class="pointer" :class="loadingPkg ? 'loadingAnimate' : ''" @click="refreshPkg" />

          <div class="ml10">
            <span class="text-primary pointer mr4" @click="toPackage">{{ t('ins.custom.sharedPackageCreate') }}</span>
            <SvgIcon name="share" class="pointer" style="width: 12px; height: 12px" />
          </div>
        </div>
      </div>
    </div>

    <!-- 宽带值 -->
    <div
      v-if="store.region.showEipBandwidth && store.publicIpConfig.checked && store.publicIpConfig.chargeTypeCur !== 3"
      class="item df ac broadband-wrap"
    >
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.custom.broadbandNum') }}
      </div>
      <div class="value">
        <div class="df ac slider-wrap">
          <el-slider
            v-model="store.publicIpConfig.size"
            style="max-width: 600px"
            :show-stops="false"
            :min="bandwidthSliderConfig.min"
            :max="bandwidthSliderConfig.max"
            :marks="bandwidthSliderConfig.marks"
            :format-tooltip="value => value + 'Mbps'"
            @change="
              () => {
                fixedRef?.insIquiryFn()
              }
            "
          />

          <el-input-number
            v-model="store.publicIpConfig.size"
            style="margin-left: 36px"
            :min="bandwidthSliderConfig.min"
            :max="bandwidthSliderConfig.max"
            @change="
              () => {
                if (!store.publicIpConfig.size) {
                  store.publicIpConfig.size = bandwidthSliderConfig.min
                }
                fixedRef?.insIquiryFn()
              }
            "
          />
          <span class="ml10">Mbps</span>
        </div>
      </div>
    </div>

    <!-- 实例配置 -->
    <div class="item config-wrap df ac mb20">
      <div class="key-wrap">
        <Title :text="t('ins.custom.insConfig')" />
      </div>
    </div>

    <!-- 安全组 -->
    <div id="security-group" class="item df security-group-wrap">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.custom.securityGroup') }}
      </div>
      <div class="value" style="width: calc(100% - 150px)">
        <div class="df mb20">
          <div
            v-for="(item, index) in SECURITY_GROUP_CONFIG_LIST"
            :key="index"
            class="security-group cursor-pointer"
            :class="item.value === store.securityGroupConfig.cur && 'security-group-actived'"
            @click="changeSecurityGroupConfig(item)"
          >
            {{ item.label }}
          </div>
        </div>
        <!-- 新建安全组 -->
        <div v-if="store.securityGroupConfig.cur === 1">
          <div class="mb20 overflow-x-auto">
            <div class="border-box" :style="addSecurityGroupClass">
              <p class="tit mb20">
                {{ t('ins.custom.securityGroupCreateDesc') }}
              </p>

              <el-checkbox-group v-model="store.securityGroupConfig.create.checked">
                <el-row>
                  <el-col v-for="(item, index) in SECURITY_GROUP_CHECK_LIST" :key="index" :span="8">
                    <el-checkbox :label="item.value" class="mb20">
                      {{ item.label }}
                    </el-checkbox>
                  </el-col>
                </el-row>
              </el-checkbox-group>
            </div>
          </div>

          <!-- 安全组规则 -->
          <div>
            <p class="df ac cursor-pointer">
              <span
                class="text-primary mr4 see"
                @click="store.securityGroupConfig.create.isShow = !store.securityGroupConfig.create.isShow"
                >{{ t('ins.custom.seeSecurityGroup') }}</span
              >
              <el-icon :class="store.securityGroupConfig.create.isShow ? 'is-reverse' : ''" style="transition: 0.3s">
                <CaretRight style="color: #0063ff" />
              </el-icon>
            </p>

            <el-collapse-transition>
              <div v-show="store.securityGroupConfig.create.isShow">
                <CatTabs2
                  v-model="store.securityGroupConfig.create.tabCur"
                  class="tabs"
                  :tabs="store.securityGroupConfig.create.tabs"
                  @change="() => {}"
                />

                <TableV2 :data="securityGroupRules" class="mt20 table" :show-pagination="false" :empty-min-height="160">
                  <!-- 来源 -->
                  <el-table-column min-width="200" :label="t('ins.custom.source')">
                    <template #default="{ row }">
                      <div v-if="row.type === 1">
                        {{ row.remoteIpPrefix }}
                      </div>
                      <div v-if="row.type === 2">
                        {{ row.remoteGroupId }}
                      </div>
                      <div v-if="row.type === 3">
                        {{ row.remoteAddressGroupId }}
                      </div>
                    </template>
                  </el-table-column>
                  <!-- 协议端口 -->
                  <el-table-column min-width="200" :label="t('ins.custom.multiport')">
                    <template #default="{ row }">
                      <div>{{ row.multiport }}</div>
                    </template>
                  </el-table-column>
                  <!-- 策略 -->
                  <el-table-column min-width="200" :label="t('ins.custom.action')">
                    <template #default="{ row }">
                      {{ row.action === 'allow' ? t('ins.custom.yes') : t('ins.custom.no') }}
                    </template>
                  </el-table-column>
                  <!-- 备注 -->
                  <el-table-column min-width="200" :label="t('ins.custom.notes')">
                    <template #default="{ row }">
                      <div>{{ row.description }}</div>
                    </template>
                  </el-table-column>
                </TableV2>
              </div>
            </el-collapse-transition>
          </div>
        </div>
        <!-- 已有安全组 -->
        <div v-else>
          <div class="df ac mb16">
            <el-select
              ref="moreOptsRef"
              v-model="store.securityGroupConfig.already.checked"
              tag-type="info"
              multiple
              :multiple-limit="5"
              :teleported="false"
              class="multiple-select mr20 w-full w620px"
              :placeholder="t('ins.custom.securityGroupPh')"
              @change="() => {}"
            >
              <el-option
                v-for="item in store.securityGroupConfig.already.list"
                :key="item.id"
                :value="item.id"
                :label="item.name"
              />
            </el-select>
            <SvgIcon
              name="refresh"
              class="pointer"
              :class="loadingSecurityGroup ? 'loadingAnimate' : ''"
              @click="refreshSecurityGroup"
            />
          </div>
          <div class="w620px">
            <Tip :text="tips" type="OneToOne" :hide-margin-bottom="true" theme="danger" />
          </div>
        </div>
      </div>
    </div>

    <!-- 其他设置 -->
    <div class="item config-wrap df ac mb20">
      <div class="key-wrap">
        <Title :text="t('ins.custom.otherSet')" />
      </div>
    </div>

    <!-- 实例名称 -->
    <div id="name" class="item df name-wrap">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.custom.insName') }}
      </div>
      <div class="value">
        <el-input
          v-model="store.instanceName"
          class="w620px"
          :maxlength="INS_NAME_LEN_MAX"
          :placeholder="t('ins.custom.insNamePh')"
          :class="instanceNameVerifyRes ? '' : 'is-error'"
        />
        <p class="nameDesc mt10">
          {{ t('ins.custom.insNameDesc') }}
        </p>
      </div>
    </div>

    <!-- 登录方式 -->
    <div id="login" class="item df login-wrap">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.custom.loginType') }}
      </div>
      <div class="value">
        <div class="df mb16">
          <div
            v-for="(item, index) in loginConfigList"
            :key="index"
            class="login cursor-pointer"
            :class="store.loginConfig.cur === item.value && 'login-actived'"
            @click="changeLoginConfig(item)"
          >
            {{ item.label }}
          </div>
        </div>

        <div>
          <!-- 设置密码 -->
          <div v-if="store.loginConfig.cur === 1" class="bg-box w620px">
            <el-form
              ref="pwdFormRef"
              require-asterisk-position="right"
              label-width="auto"
              :model="store.loginConfig.form1"
              :rules="loginRules"
              label-position="left"
            >
              <!-- 登录名 -->
              <el-form-item :label="t('ins.custom.loginName')">
                <span>{{ platformDefaultName }}</span>
              </el-form-item>
              <!-- 密码 -->
              <el-form-item :label="t('ins.custom.pwd')" prop="password">
                <div class="pwd-wrap w-full">
                  <el-input
                    v-model.trim="store.loginConfig.form1.password"
                    class="w-full"
                    :placeholder="t('domainSet2.pwdPlaceholder2')"
                    @focus="showPwdPanel = true"
                    @blur="showPwdPanel = false"
                  />

                  <!-- pwd-panel -->
                  <transition name="el-zoom-in-top">
                    <div v-show="showPwdPanel" class="pwd-panel">
                      <p v-for="(item, index) in pwdText" :key="index" class="df">
                        <SvgIcon :name="item.right ? 'pwd-success' : 'pwd-warning'" class="mr4" /><span
                          class="common-text"
                          >{{ item.desc }}</span
                        >
                      </p>
                    </div>
                  </transition>
                </div>
              </el-form-item>
              <!-- 确认密码 -->
              <el-form-item :label="t('ins.custom.confirmPwd')" prop="confirmPassword" class="code-wrap">
                <div>
                  <el-input
                    v-model.trim="store.loginConfig.form1.confirmPassword"
                    class="ipt"
                    :placeholder="t('login.confirmNewPwd')"
                  />
                </div>
              </el-form-item>
            </el-form>
          </div>
          <!-- 立即关联密码 镜像选择为 Windows时，不展示 -->
          <div
            v-if="store.loginConfig.cur === 2 && store.sysConfig.platformCur.platform !== WINDOWS"
            class="bg-box mb16 w620px"
          >
            <el-form
              ref="sshFormRef"
              require-asterisk-position="right"
              label-width="auto"
              :model="store.loginConfig.form2"
              :rules="loginRules"
              label-position="left"
            >
              <!-- 登录名 -->
              <el-form-item :label="t('ins.custom.loginName')">
                <span>{{ platformDefaultName }}</span>
              </el-form-item>
              <!-- 密钥对 -->
              <el-form-item :label="t('ins.custom.sshKey')" prop="keyNameId">
                <div class="w-full">
                  <el-select
                    ref="moreOptsRef"
                    v-model="store.loginConfig.form2.keyNameId"
                    :teleported="false"
                    class="w-full mr20 mb16"
                    :placeholder="t('ins.custom.sshKeyPh')"
                    @change="() => {}"
                  >
                    <el-option
                      v-for="item in store.loginConfig.sshList"
                      :key="item.id"
                      :value="item.id"
                      :label="item.sshName"
                    />
                  </el-select>
                  <p class="login-desc">
                    <i18n-t keypath="ins.custom.sshKeyDesc">
                      <span class="text-primary cursor-pointer" @click="toSshKey">{{ t('ins.custom.createNow') }}</span>
                    </i18n-t>
                  </p>
                </div>
              </el-form-item>
            </el-form>
          </div>
          <!-- 自动生成密码 -->
          <div v-if="store.loginConfig.cur === 3" class="desc">
            {{ t('ins.fast.autoPwdDesc') }}
          </div>
        </div>
      </div>
    </div>

    <!-- 所属项目 后续开发 -->
    <!-- <div class="item df ac project-wrap" id="project">
      <div class="key-wrap" :style="labelClass">{{ t('ins.custom.project') }}</div>
      <div class="value">
        <el-select
          :teleported="false"
          class="select-opts mr20"
          v-model="store.projectConfig.cur"
          ref="moreOptsRef"
          :placeholder="t('ins.custom.project')"
          @change="() => {}"
        >
          <el-option :value="item.id" :label="item.projectName" v-for="item in store.projectConfig.list" :key="item.id">
          </el-option>
        </el-select>
      </div>
    </div> -->

    <!-- 云监控 后续开发 -->
    <!-- <div class="item df monitor-wrap">
      <div class="key-wrap" :style="labelClass">{{ t('ins.custom.monitor') }}</div>
      <div class="value">
        <el-checkbox v-model="store.monitorConfig.checked" :label="t('ins.custom.monitorChecked')" size="large" />
      </div>
    </div> -->

    <Fixed ref="fixedRef" :step="store.step" :next-loading="verifyLoading" @change-step="changeStep" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { CaretRight } from '@element-plus/icons-vue'
import Title from '@/views/cvm/ins/create/components/title/index.vue'
import { FormRules } from 'element-plus/es'
import { getQueryVpcPage } from '@/apis/network/private-network'
import { getQuerySubnetPage } from '@/apis/network/subnet'
import { getListSecurityGroup } from '@/apis/network/security-group'
import {
  SECURITY_GROUP_CHECK_LIST,
  isValidInsPwd,
  isValidInsPwdChar,
  isValidInsPwdLen,
  isValidInsPwdPlatformDefaultName,
  isValidInsPwdFirst,
  INS_NAME_LEN_MAX,
  INS_NAME_REG,
  SECURITY_GROUP_CONFIG_LIST,
  LOGIN_CONFIG_LIST,
  WINDOWS,
  isTimeCost,
  PUBLIC_IP_CONFIG_LIST,
} from '@/views/cvm/ins/config'
import { _listSSh } from '@/apis/cvm/ssh-key'
import Fixed from '../fixed.vue'
import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'
import { useIns } from '@/views/cvm/hooks/use-ins'
import { useCvmStore } from '@/store'
import { lineTypeList } from '@/views/network/public-ip/list/components/set-buy/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { bandwidthSliderConfig } from '@/views/network/public-ip/list/config'
import { _getImageInfo } from '@/apis/cvm/image'
import { getEipChargeType } from '@/apis/network/public-ip'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const labelMap = {
  [ja]: 'width: 150px',
  [en]: 'width: 130px',
  [zh]: 'width: 90px',
}

const addSecurityGroupMap = {
  [ja]: 'min-width: 1500px',
  [en]: 'min-width: 1600px',
  [zh]: 'min-width: 1090px',
}

const labelClass = useI18nStyle(labelMap)
const addSecurityGroupClass = useI18nStyle(addSecurityGroupMap)
const cvmStore = useCvmStore()

interface LoginForm {
  password: string
  confirmPassword?: string
}

interface LoginSshForm {
  keyNameId: string
}

// 校验密码
const checkPwd = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  } else if (!isValidInsPwd(platformDefaultName.value, value, store.sysConfig.platformCur.platform)) {
    callback(new Error(t('common.formatErr')))
  } else {
    callback()
  }
}

// 校验二次密码
const checkRePwd = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  } else if (value !== store.loginConfig.form1.password) {
    callback(new Error(t('myDomains.samePwdValidate')))
  } else {
    callback()
  }
}
const { getUserProject, createVpc } = useBaseConfig()
const {
  cvmInsCreateStore: store,
  getEipLineType,
  getShareTrafficPackageList,
  createInstanceDryRun,
  loading: verifyLoading,
} = useIns()

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.vpc,
  regionId: store.region.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const loginRules = reactive<FormRules<LoginForm | LoginSshForm>>({
  password: [{ required: true, validator: checkPwd, trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: checkRePwd, trigger: 'blur' }],
  keyNameId: [{ required: true, message: '', trigger: 'change' }],
})
const showPwdPanel = ref<boolean>(false)
const pwdText = ref<any[]>([
  {
    desc: t('ins.custom.pwdDesc1'),
    right: false,
  },
  {
    desc: t('ins.custom.pwdDesc2', ['!@%-_=+[]:./?']),
    right: false,
  },
  {
    desc: t('ins.custom.pwdDesc3'),
    right: false,
  },
  {
    desc: t('ins.custom.pwdDesc4'),
    right: false,
  },
])
const loadingNetwork = ref<boolean>(false)
const loadingPkg = ref<boolean>(false)
const loadingSecurityGroup = ref<boolean>(false)
const platformDefaultName = ref<string>('') // 镜像平台默认名称

const pwdFormRef = ref<any>()
const sshFormRef = ref<any>()
const fixedRef = ref<any>()

const showNetworkDefaultDesc = computed(() => {
  if (!store.netConfig.vpcList?.length && !store.netConfig.subnetList?.length) {
    return true
  } else if (store.netConfig.vpcList?.length && !store.netConfig.subnetList?.length) {
    return true
  } else if (store.netConfig.vpcList?.length && store.netConfig.subnetList?.length) {
    return checkPermission(permMap.vpc.CREATE_VPC) ? true : false
  } else {
    return false
  }
})

// 实例名称校验结果
const instanceNameVerifyRes = computed(() => {
  if (store.instanceName) {
    return INS_NAME_REG.test(store.instanceName)
  } else {
    return true
  }
})

// LOGIN_CONFIG_LIST =>镜像选择为 Windows时，不展示 立即关联密码 模块
const loginConfigList = computed(() => {
  return LOGIN_CONFIG_LIST.filter(el => {
    if (store.sysConfig.platformCur.platform === WINDOWS) {
      // 处理当前镜像为Windows，登录方式为2时
      if (store.loginConfig.cur === 2) {
        store.loginConfig.cur = 1
      }
      return el.value !== 2
    } else {
      return el
    }
  })
})

// 安全组入站/出站规则
const securityGroupRules = computed(() => {
  const ids: any[] = []

  for (const el of store.securityGroupConfig.create.checked) {
    ids.push(el)
  }
  const ingressRules = store.securityGroupConfig.create.ingressRules.filter(el => ids.includes(el.cid))
  console.log(`ids===>`, ids, store.securityGroupConfig.create.ingressRules)

  return store.securityGroupConfig.create.tabCur === 1 ? ingressRules : store.securityGroupConfig.create.egressRules
})

const tips = computed(() => [
  {
    main: t('ins.custom.tips'),
  },
])

// 刷新网络
const refreshSubnet = async () => {
  loadingNetwork.value = !loadingNetwork.value
  if (loadingNetwork.value) {
    setTimeout(() => {
      loadingNetwork.value = false
      message.success(t('common.updateSuccess'))
    }, 2000)
  }
  await getQueryVpcPageFn()
  getQuerySubnetPageFn()
}

// 刷新共享流量包
const refreshPkg = async () => {
  loadingPkg.value = !loadingPkg.value
  if (loadingPkg.value) {
    setTimeout(() => {
      loadingPkg.value = false
      message.success(t('common.updateSuccess'))
    }, 2000)
  }
  getShareTrafficPackageListFn()
}

// 刷新安全组
const refreshSecurityGroup = async () => {
  loadingSecurityGroup.value = !loadingSecurityGroup.value
  if (loadingSecurityGroup.value) {
    setTimeout(() => {
      loadingSecurityGroup.value = false
      message.success(t('common.updateSuccess'))
    }, 2000)
  }
  getListSecurityGroupFn()
}

// 下一步
const changeStep = async (value: string) => {
  console.log(`configB changeStep===>`, value)
  if (value === 'a') {
    store.setStep(value)
  } else {
    // vpc
    if (!store.netConfig.vpcCur) {
      // 锚点错误定位
      const el = document.getElementById('network')
      el?.scrollIntoView({ behavior: 'smooth' })
      return message.warning(t('ins.custom.vpcPh'))
    }

    // 子网
    if (!store.netConfig.subnetCur) {
      // 锚点错误定位
      const el = document.getElementById('network')
      el?.scrollIntoView({ behavior: 'smooth' })
      return message.warning(t('ins.custom.subnetPh'))
    }

    // 公网ip
    if (store.publicIpConfig.checked) {
      // 线路类型
      if (!store.publicIpConfig.lineTypeCur) {
        // 锚点错误定位
        const el = document.getElementById('lineType')
        el?.scrollIntoView({ behavior: 'smooth' })
        return message.warning(t('ins.custom.lineTypePh'))
      }

      // 共享流量包
      if (store.publicIpConfig.chargeTypeCur === 3 && !store.publicIpConfig.pkgIdCur) {
        // 锚点错误定位
        const el = document.getElementById('package')
        el?.scrollIntoView({ behavior: 'smooth' })
        return message.warning(t('ins.custom.packagePh'))
      }
    }

    // 新建安全组
    if (store.securityGroupConfig.cur === 1) {
      if (!store.securityGroupConfig.create.checked.length) {
        // 锚点错误定位
        const el = document.getElementById('security-group')
        el?.scrollIntoView({ behavior: 'smooth' })
        return message.warning(t('ins.custom.createSecurityGroupWarning'))
      }
    }

    // 已有安全组
    if (store.securityGroupConfig.cur === 2) {
      if (!store.securityGroupConfig.already.checked.length) {
        // 锚点错误定位
        const el = document.getElementById('security-group')
        el?.scrollIntoView({ behavior: 'smooth' })
        return message.warning(t('ins.custom.checkSecurityGroupWarning'))
      }
    }

    // 实例名称
    if (store.instanceName) {
      if (!instanceNameVerifyRes.value) {
        // 锚点错误定位
        const el = document.getElementById('name')
        el?.scrollIntoView({ behavior: 'smooth' })
        return message.warning(t('ins.custom.insNameError'))
      }
    }

    // 登录方式:设置密码
    if (store.loginConfig.cur === 1) {
      pwdFormRef.value.validate()

      if (!store.loginConfig.form1.password) {
        // 锚点错误定位
        const el = document.getElementById('login')
        el?.scrollIntoView({ behavior: 'smooth' })
        return message.warning(t('ins.custom.pwdWarning'))
      }
      if (!store.loginConfig.form1.confirmPassword) {
        // 锚点错误定位
        const el = document.getElementById('login')
        el?.scrollIntoView({ behavior: 'smooth' })
        return message.warning(t('ins.custom.confirmPwdWarning'))
      }
      if (
        !isValidInsPwd(
          platformDefaultName.value,
          store.loginConfig.form1.password,
          store.sysConfig.platformCur.platform,
        )
      ) {
        // 锚点错误定位
        const el = document.getElementById('login')
        el?.scrollIntoView({ behavior: 'smooth' })
        return message.warning(t('ins.custom.pwdFormatWarning'))
      }
      if (store.loginConfig.form1.password !== store.loginConfig.form1.confirmPassword) {
        // 锚点错误定位
        const el = document.getElementById('login')
        el?.scrollIntoView({ behavior: 'smooth' })
        return message.warning(t('myDomains.samePwdValidate'))
      }
    }

    // 登录方式:立即关联密码
    if (store.loginConfig.cur === 2) {
      sshFormRef.value.validate()

      if (!store.loginConfig.form2.keyNameId) {
        // 锚点错误定位
        const el = document.getElementById('login')
        el?.scrollIntoView({ behavior: 'smooth' })
        return message.warning(t('ins.custom.sshKeyWarning'))
      }
    }

    // 项目
    // if (!store.projectConfig.cur) {
    //   // 锚点错误定位
    //   const el = document.getElementById('project')
    //   el?.scrollIntoView({ behavior: 'smooth' })
    //   return message.warning('请选择项目')
    // }

    // 预检
    const res = await createInstanceDryRunFn()
    if (!res) return

    store.setStep(value)
  }
}

// 切换vpc
const changeVpc = () => {
  getQuerySubnetPageFn()
}

// 跳转共享流量包
const toPackage = () => {
  cvmStore.setAreaSelect(store.region)
  var origin = window.location.origin
  window.open(origin + `/network/flow-packet/list`, '_blank')
}

// 跳转私有网络
const toVpc = () => {
  cvmStore.setAreaSelect(store.region)
  var origin = window.location.origin
  window.open(origin + `/network/private-network/list`, '_blank')
}

// 跳转子网
const toSubnet = () => {
  cvmStore.setAreaSelect(store.region)
  var origin = window.location.origin
  window.open(origin + `/network/subnet/list`, '_blank')
}

// 跳转密钥
const toSshKey = () => {
  cvmStore.setAreaSelect(store.region)
  var origin = window.location.origin
  window.open(origin + `/cvm/ssh-key/list`, '_blank')
}

// 切换ip宽带计费模式
const changeIpChargeType = (raw: any) => {
  console.log(`changeIpChargeType==>`, raw)

  if (store.publicIpConfig.chargeTypeCur !== raw) {
    store.publicIpConfig.chargeTypeCur = raw
    getEipLineTypeFn()
  }
}

// 切换ip线路
const changeIpLine = async (raw: any) => {
  console.log(`changeIpLine==>`, raw)

  if (store.publicIpConfig.lineTypeCur !== raw) {
    store.publicIpConfig.lineTypeCur = raw

    if (store.publicIpConfig.chargeTypeCur === 3) {
      getShareTrafficPackageListFn()
    }
  }
}

// 切换安全组
const changeSecurityGroupConfig = (raw: any) => {
  store.securityGroupConfig.cur = raw.value
}

// 切换登录
const changeLoginConfig = (raw: any) => {
  console.log(`changeLoginConfig==>`, raw)
  store.loginConfig.cur = raw.value
  // 自动生成密码
  if (raw.value === 3) {
    store.loginConfig.form3.password = ''
  }
}

// 查询当前地域下支持的带宽计费模式
const getEipChargeTypeFn = async () => {
  try {
    const res = await getEipChargeType({ regionId: store.region.id })
    console.log(`getEipChargeTypeFn====>`, res)
    if (res.success) {
      const list = res.data?.list || []
      store.publicIpConfig.list = PUBLIC_IP_CONFIG_LIST.filter(el => list.includes(el.value))

      // 实例为按量计费，带宽计费模式不包含按带宽计费
      const ipChargeRes = store.publicIpConfig.list
        .filter(el => el.costType.includes(store.costTypeConfig.cur))
        .find(el => el.value === store.publicIpConfig.chargeTypeCur)

      if (!ipChargeRes) {
        // 默认选中第一个
        const defaultIpCharge = store.publicIpConfig.list.filter(el =>
          el.costType.includes(store.costTypeConfig.cur),
        )[0].value
        store.publicIpConfig.chargeTypeCur = defaultIpCharge
      }
    }
  } catch (error) {
    console.log(error)
  }
}

// 获取镜像详情
const getImageInfo = async () => {
  try {
    const res = await _getImageInfo({
      imageId: store.sysConfig.imageCur,
    })
    console.log(`_getImageInfo===>`, res)
    if (res.success) {
      platformDefaultName.value = res.data.defaultAccount || ''
    }
  } catch (error) {
    console.log(error)
  }
}

// 创建默认VPC
const createVpcFn = async () => {
  const cb = async (res: any) => {
    if (res.success) {
      console.log(`createVpcFn===>`, res)
      message.success(res.msg)
      await getQueryVpcPageFn()
      getQuerySubnetPageFn()
    } else {
      message.warning(res.msg)
    }
  }

  const params = {
    regionId: store.region.id,
    zoneId: store.zoneConfig.cur.id,
  }

  createVpc(params, cb)
}

// 查询VPC列表
const getQueryVpcPageFn = async () => {
  try {
    const res = await getQueryVpcPage({
      regionId: store.region.id,
      pageIndex: 1,
      pageSize: 999,
    })

    console.log(`getQueryVpcPage===>`, res)

    if (res.success) {
      store.netConfig.vpcList = res.data.list || []

      // 处理vpc
      const vpcRes = store.netConfig.vpcList.find(el => el?.id === store.netConfig.vpcCur)

      if (!vpcRes) {
        // 默认选中第一个
        const defaultVpc = store.netConfig.vpcList[0]?.id
        store.netConfig.vpcCur = defaultVpc ? defaultVpc : ''
      }
    }
  } catch (error) {
    console.log(error)
  }
}

// 查询子网列表
const getQuerySubnetPageFn = async () => {
  try {
    const params: any = {
      zoneId: store.zoneConfig.cur.id,
      regionId: store.region.id,
      pageIndex: 1,
      pageSize: 999,
    }

    if (store.netConfig.vpcCur) {
      params.vpcId = store.netConfig.vpcCur // vpcId
    }

    const res = await getQuerySubnetPage(params)

    console.log(`getQuerySubnetPage===>`, res)

    if (res.success) {
      store.netConfig.subnetList = res.data.list || []

      // 处理子网
      const subnetRes = store.netConfig.subnetList.find(el => el?.id === store.netConfig.subnetCur)

      if (!subnetRes) {
        // 默认选中第一个
        const defaultSubnet = store.netConfig.subnetList[0]?.id
        store.netConfig.subnetCur = defaultSubnet ? defaultSubnet : ''
      }
    }
  } catch (error) {
    console.log(error)
  }
}

// 获取安全组列表
const getListSecurityGroupFn = async () => {
  try {
    const res = await getListSecurityGroup({
      regionId: store.region.id,
      pageIndex: 1,
      pageSize: 999,
    })

    console.log(`getListSecurityGroup===>`, res)

    if (res.success) {
      store.securityGroupConfig.already.list = res.data?.list || []

      // 处理安全组
      store.securityGroupConfig.already.checked?.forEach((el, i) => {
        const securityGroupRes = store.securityGroupConfig.already.list.find(item => item.id === el)

        if (!securityGroupRes) {
          store.securityGroupConfig.already.checked?.splice(i, 1)
        }
      })
    }
  } catch (error) {
    console.log(error)
  }
}

// 分页查询秘钥列表
const listSSh = async () => {
  try {
    const res = await _listSSh({
      pageIndex: 1,
      pageSize: 999,
      regionId: store.region.id,
    })

    console.log(`_listSSh===>`, res)

    if (res.success) {
      store.loginConfig.sshList = res.data?.list || []
    }
  } catch (error) {
    console.log(error)
  }
}

// 用户项目列表
const getUserProjectFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      store.projectConfig.list = res.data || []
    }
  }

  getUserProject({}, cb)
}

// 查询地区下支持的EIP线路
const getEipLineTypeFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      store.publicIpConfig.lineTypeList = lineTypeList.filter(el => res.data?.includes(el.value))

      const lineTypeRes = store.publicIpConfig.lineTypeList.find(el => el.value === store.publicIpConfig.lineTypeCur)
      if (!lineTypeRes) {
        // 默认选中第一个
        store.publicIpConfig.lineTypeCur = store.publicIpConfig.lineTypeList?.[0]?.value
      }

      if (store.publicIpConfig.chargeTypeCur === 3) {
        getShareTrafficPackageListFn()
      }
    }
  }

  const params = {
    regionId: store.region.id,
    chargeType: store.publicIpConfig.chargeTypeCur,
  }

  getEipLineType(params, cb)
}

// 查询共享流量包列表
const getShareTrafficPackageListFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      store.publicIpConfig.pkgList = res.data?.list || []

      const pkgIdRes = store.publicIpConfig.pkgList.find(el => el.id === store.publicIpConfig.pkgIdCur)
      if (!pkgIdRes) {
        store.publicIpConfig.pkgIdCur = ''
      }
    }
  }

  const params = {
    regionId: store.region.id,
    state: 1,
    pageSize: 999,
    pageIndex: 1,
    lineType: store.publicIpConfig.lineTypeCur,
  }

  getShareTrafficPackageList(params, cb)
}

// 创建服务器-预检
const createInstanceDryRunFn = async () => {
  const params: any = {
    regionId: store.region.id, // 地域ID
    zoneId: store.zoneConfig.cur.id, // 可用区ID
    specificationId: store.insConfig.rowCur.id, // 服务器实例规格ID
    instanceCount: store.insCountConfig.num, // 购买数量
    imageId: store.sysConfig.imageCur, // 镜像ID
    imageType: store.sysConfig.imageTypeCur, // 镜像类型 1 公共镜像 2 私有镜像 3 市场镜像
    systemDiskType: store.sysDiskForm.diskType, // 系统盘类型
    systemDiskSize: store.sysDiskForm.size, // 系统盘大小
    vpcId: store.netConfig.vpcCur, // VPC ID
    subnetId: store.netConfig.subnetCur, // 子网ID
    instanceChargeType: store.costTypeConfig.cur, // 实例计费类型 1 按量计费 2 包年包月
  }

  // 包年包月需传订购周期
  if (isTimeCost(store.costTypeConfig.cur)) {
    params.periodNum = store.periodNum
  }

  const cb = (res: any) => {
    if (!res.success) {
      message.warning(res.msg)
    }
  }

  return createInstanceDryRun(params, cb)
}

// 监听pwd
watch(
  () => store.loginConfig.form1.password,
  v => {
    if (!v) {
      pwdText.value.forEach(item => (item.right = false))
      return
    }

    console.log(`isValidInsPwdChar`, isValidInsPwdChar(v))

    pwdText.value[0].right = isValidInsPwdLen(v)
    pwdText.value[1].right = isValidInsPwdChar(v)
    pwdText.value[2].right = isValidInsPwdPlatformDefaultName(
      platformDefaultName.value,
      v,
      store.sysConfig.platformCur.platform,
    )
    pwdText.value[3].right = isValidInsPwdFirst(v)
  },
)

onMounted(async () => {
  getListSecurityGroupFn()
  listSSh()
  // getUserProjectFn()
  // 解决购买相同配置入口
  await getEipChargeTypeFn()
  getEipLineTypeFn()
  await getQueryVpcPageFn()
  getQuerySubnetPageFn()
})

onMounted(async () => {
  getImageInfo()
  pwdText.value[2].desc =
    store.sysConfig.platformCur.platform === WINDOWS ? t('ins.custom.windowPwdDesc3') : t('ins.custom.pwdDesc3')
})
</script>

<style lang="scss" scoped>
@use '@/views/cvm/style/common';

.custom-b-v2 {
  // padding-bottom: 156px;
}

.item {
  .key-wrap {
    flex-shrink: 0;
    min-width: 87px;
    margin-right: 16px;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    color: #828b9c;
  }

  .value {
    flex-grow: 1;
  }
}

.network-wrap {
  margin-bottom: 24px;

  .network-default-desc {
    font-size: 14px;
    line-height: 20px;
    color: #828b9c;
  }
}

.ip-wrap {
  margin-bottom: 24px;

  .publicIPDesc {
    font-size: 14px;
    line-height: 22px;
  }
}

.cost-type-wrap {
  margin-bottom: 24px;

  .cost-type {
    min-width: 118px;
    height: 34px;
    padding: 0 10px;
    margin-right: 8px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 34px;
    color: #191c23;
    text-align: center;
    background: #eaebf1;
    border-radius: 0;
  }

  .cost-type-actived {
    color: #fff;
    background: #0063ff;
  }
}

.line-wrap {
  margin-bottom: 24px;

  .line {
    min-width: 118px;
    height: 34px;
    padding: 0 10px;
    margin-right: 8px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 34px;
    color: #191c23;
    text-align: center;
    background: #eaebf1;
    border-radius: 0;
  }

  .line-actived {
    color: #fff;
    background: #0063ff;
  }
}

.package-wrap {
  margin-bottom: 24px;
}

.broadband-wrap {
  margin-bottom: 40px;

  .slider-default {
    :deep(.el-slider__button-wrapper) {
      left: 10px !important;
    }
  }
}

.security-group-wrap {
  margin-bottom: 24px;

  .security-group {
    min-width: 118px;
    height: 34px;
    padding: 0 10px;
    margin-right: 8px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 34px;
    color: #191c23;
    text-align: center;
    background: #eaebf1;
    border-radius: 0;
  }

  .security-group-actived {
    color: #fff;
    background: #0063ff;
  }

  .border-box {
    box-sizing: border-box;
    height: 150px;
    padding: 24px;
    background: #f9fafc;

    // max-width: 1090px;

    .tit {
      font-size: 14px;
      line-height: 22px;
      color: #191c23;
    }
  }

  .see {
    font-size: 14px;
    font-weight: 400;
    color: #0063ff;
  }

  .multiple-select {
    :deep(.el-input--suffix) {
      height: 100% !important;
    }

    :deep(.el-input__wrapper) {
      min-height: var(--input-height) !important;
    }
  }
}

.name-wrap {
  margin-bottom: 24px;

  .nameDesc {
    font-size: 14px;
    line-height: 20px;
    color: #828b9c;
  }

  .is-error {
    :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px var(--el-color-danger) inset;
    }
  }
}

.login-wrap {
  margin-bottom: 24px;

  .login {
    min-width: 118px;
    height: 34px;
    padding: 0 10px;
    margin-right: 8px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 34px;
    color: #191c23;
    text-align: center;
    background: #eaebf1;
    border-radius: 0;
  }

  .login-actived {
    color: #fff;
    background: #0063ff;
  }

  .bg-box {
    box-sizing: border-box;
    padding: 24px;
    background: #f9fafc;

    .ipt {
      /* width: 450px; */
    }

    .login-desc {
      font-size: 14px;
      font-weight: 400;
      line-height: 22px;
      color: #828b9c;
    }

    /* .select-opts {
      width: 450px;
    } */
  }

  .pwd-wrap {
    position: relative;
    display: inline-block;

    .pwd-panel {
      position: absolute;
      top: 37px;
      z-index: 2;

      /* width: 280px; */
      width: 100%;
      padding: 8px 20px 8px 8px;

      // height: 132px;
      background: #fff;
      border-radius: 0;
      box-shadow: 0 0 11px 0 rgb(165 196 239 / 52%);

      .common-text {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 12px;
        font-weight: 400;
        line-height: 17px;
        color: var(--common-text);
      }
    }
  }

  .desc {
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    color: #828b9c;
  }
}

.project-wrap {
  margin-bottom: 24px;
}

.monitor-wrap {
  .desc {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #0063ff;
    text-align: center;
  }
}

.is-reverse {
  transform: rotateZ(90deg);
}

.overflow-x-auto {
  overflow-x: auto;
}

.mb16 {
  margin-bottom: 16px;
}

.w620px {
  width: 620px;
}

.tip-box {
  vertical-align: top;
}

:deep(.custom-b-v2 .key-wrap .tit),
:deep(.custom-b-v2 .title .tit) {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

:deep(.custom-b-v2 .el-select__wrapper),
:deep(.custom-b-v2 .el-input__wrapper) {
  min-height: 34px;
  border-radius: 0;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.custom-b-v2 .el-textarea__inner) {
  border-radius: 0;
}

:deep(.custom-b-v2 .el-checkbox) {
  height: 22px;
  margin-right: 0;
}

:deep(.custom-b-v2 .el-checkbox__label) {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

:deep(.custom-b-v2 .el-checkbox__inner) {
  border-radius: 0;
}

:deep(.custom-b-v2 .el-table) {
  border: 1px solid #e8ecf3;
}

:deep(.custom-b-v2 .el-table th.el-table__cell) {
  height: 46px;
  padding: 0 16px;
  font-size: 12px;
  font-weight: 500;
  color: #191c23;
  background: #f9fafc;
}

:deep(.custom-b-v2 .el-table td.el-table__cell) {
  height: 56px;
  padding: 0 16px;
  font-size: 14px;
  color: #191c23;
}

.tabs {
  margin: 24px 0;
}

:deep(.custom-b-v2 .el-table__inner-wrapper::before) {
  display: none;
}

:deep(.custom-b-v2 .tabs .cat-tabs2__nav),
:deep(.custom-b-v2 .tabs .cat-tabs__nav) {
  border-radius: 0;
}

:deep(.custom-b-v2 .el-input-number) {
  height: 34px;
}

:deep(.custom-b-v2 .el-input-number__decrease),
:deep(.custom-b-v2 .el-input-number__increase) {
  width: 34px;
  color: #50596a;
  background: #fff;
  border-radius: 0;
}

:deep(.custom-b-v2 .el-slider__runway) {
  height: 8px;
  border-radius: 0;
}

:deep(.custom-b-v2 .el-slider__bar) {
  height: 8px;
  border-radius: 0;
}

:deep(.custom-b-v2 .el-slider__button) {
  width: 20px;
  height: 20px;
}
</style>
