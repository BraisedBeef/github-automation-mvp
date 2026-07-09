<template>
  <p class="title mb20">手动前往域名解析平台添加一条解析记录（不影响域名使用），证书签发成功后即可删除记录</p>
  <el-table :data="tableData.data" :loading="tableData.loading" class="mb20" style="width: 100%">
    <el-table-column prop="date" label="域名" />
    <el-table-column prop="name" label="主机记录" width="150px">
      <template #default="{ row }">
        <Copy :text="row.name" break />
      </template>
    </el-table-column>
    <el-table-column prop="date" label="记录类型" />
    <el-table-column prop="name" label="记录值" width="150px">
      <template #default="{ row }">
        <Copy :text="row.name" break />
      </template>
    </el-table-column>
  </el-table>
  <TipsBar tips="请注意，证书吊销后才可删除或者更改该解析记录" color="#FE4D4F" background="#FFEBEB" />
  <el-divider style="margin-top: 40px; border-color: #eee" />
  <el-form-item>
    <el-button type="primary" @click="verifyInfoDialog = true"> 查看域名验证状态 </el-button>
    <el-button type="default" @click="router.back"> 取消吊销 </el-button>
  </el-form-item>
  <!-- TODO: 验证成功弹窗弹出条件 -->
  <el-dialog v-model="verifySuccessDialog" width="550">
    <template #header="{ titleId, titleClass }">
      <div class="df ac">
        <SvgIcon name="success" class="mr10" style="font-size: 30px" />
        <h4 :id="titleId" :class="titleClass" style="font-size: 16px; font-weight: bold">域名验证成功</h4>
      </div>
    </template>
    <p style="margin-left: 40px; color: #999">域名验证成功，已检测到您的域名验证记录，现会将记录提交给证书签发机构</p>
    <template #footer>
      <div style="text-align: center">
        <el-button type="primary" @click="verifySuccessDialog = false"> 我知道了 </el-button>
      </div>
    </template>
  </el-dialog>
  <!-- 查看验证信息弹窗 -->
  <el-dialog v-model="verifyInfoDialog" width="760">
    <template #header="{ titleId, titleClass }">
      <div class="df ac">
        <!-- <SvgIcon name="success" class="mr10" style="font-size: 30px" /> -->
        <h4 :id="titleId" :class="titleClass" style="font-size: 16px; font-weight: bold">验证信息</h4>
      </div>
    </template>
    <ul class="verify-infos">
      <li class="info">
        <div class="label">正确的记录值</div>
        <div class="value">
          <Copy text="202411200757nf7hoiqhwu9x9n2uhf91hy8gao.b19uhhs0hiahf29rfh2eqh.trust-provider.vom" break />
        </div>
      </li>
      <li class="info">
        <div class="label">实际的记录值</div>
        <div class="value">
          <Copy text="202411200757nf7hoiqhwu9x9n2uhf91hy8gao.b19uhhs0hiahf29rfh2eqh.trust-provider.vom" break />
        </div>
      </li>
    </ul>
    <template #footer>
      <div style="text-align: center">
        <el-button type="primary" @click="verifyInfoDialog = false"> 我知道了 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import TipsBar from '@/views/ssl-certificate/management/components/tips-bar.vue'
import Copy from '@/views/ssl-certificate/management/components/copy.vue'
import SvgIcon from '@/components/common/svg-icon/index.vue'

const router = useRouter()

/// table
const tableData = reactive<any>({
  data: [],
  loading: false,
})
const getTableList = async () => {
  // TODO: 获取域名解析列表
  tableData.data = [
    {
      date: '2022-01-01',
      name: 'www111111111111111111111111scsd',
    },
    {
      date: '2022-01-01',
      name: 'www',
    },
  ]
}
onMounted(() => {
  getTableList()
})

const onSubmit = () => {
  // TODO: 吊销证书
}
/// 验证成功弹窗
const verifySuccessDialog = ref(true)
/// 查看验证信息弹窗
const verifyInfoDialog = ref(false)
</script>

<style lang="scss" scoped>
.title {
  font-size: 16px;
  line-height: 22px;
  color: #000;
}

.verify-infos {
  border-top: 1px solid #eee;
  border-left: 1px solid #eee;

  .info {
    display: flex;
    align-items: center;

    & > div {
      border-right: 1px solid #eee;
      border-bottom: 1px solid #eee;
    }

    .label {
      width: 165px;
      height: 60px;
      padding: 0 16px;
      line-height: 60px;
    }

    .value {
      flex: 1;
      padding: 8px 16px;
    }
  }
}
</style>
