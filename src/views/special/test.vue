<template>
  <div class="test">
    <DnsLine v-model:id="lineValue" />
    <div class="content-wrap">
      <EnvComponent :fixed="false" :close="false" :reload="false" class="box" />
      <EnvProductUrl class="box" />
      <div class="box">
        <el-button type="success" @click="getEnvAccount"> 获取测试账号 </el-button>
      </div>
      <div class="box norm">
        <a
          href="https://lanhuapp.com/web/#/item/project/detailDetach?pid=378f00d9-81b5-4864-aade-24520d1af80f&project_id=378f00d9-81b5-4864-aade-24520d1af80f&image_id=00eba4a4-69f7-451f-9a33-39f84d81564a&fromEditor=true"
          target="_blank"
          >设计规范</a
        >
      </div>
      <SvgShow style="margin-bottom: 20px" />
      <ComponentShow />
    </div>
  </div>
</template>

<script setup lang="ts">
import EnvComponent from '@/components/env/env-component-test/index.vue'
import EnvProductUrl from '@/components/env/env-product-url/index.vue'
import SvgShow from '@/components/common/svg-show/index.vue'
import ComponentShow from '@/components/common/component-show/index.vue'
import DnsLine from '@/components/dns/dns-line/index.vue'
import { getEnvAccount } from '@/utils/env-utils'
const lineValue = ref('aefedeb8e9743766f108437ed40d460d')
const request = (t: 1 | 2) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (t === 1) {
        resolve(1)
      } else {
        reject(2)
      }
    }, 3000)
  })
}

onMounted(async () => {})
</script>

<style scoped lang="scss">
.test {
  .content-wrap {
    padding: 24px;

    .box {
      display: inline-block;
      padding: 24px;
      margin-right: 20px;
      margin-bottom: 20px;
      background-color: #fff;
      border-radius: 5px;
      box-shadow: 0 0 4px #ccc;
    }
  }
}

// 设计规范
.norm {
  font-size: 18px;
  color: var(--warning-color);
  text-decoration: underline;

  a {
    color: var(--warning-color);
  }
}
</style>
