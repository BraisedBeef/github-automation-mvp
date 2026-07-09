export const componentsShow = {
  menu: [
    {
      label: '步骤器',
      value: 'step',
      title: 'Step步骤器',
      script:
        '<template> \n  <CatStep v-model="active" :steps="steps" :v-change="false"  @change="null"/> \n</template>\n' +
        '<script setup lang="ts">\n' +
        "     const active = ref('e');\n" +
        '     const steps = [\n' +
        '         { label: "步骤一", value: "a" },\n' +
        '         { label: "步骤二", value: "b" },\n' +
        '         { label: "这个步骤名字太长显示不下只能hover了", value: "c"},\n' +
        '         { label: "步骤四", value: "e" }\n' +
        '     ];' +
        '\n</script>',
    },
    {
      label: '标签页',
      value: 'tab',
      title: 'Tabs标签页',
      script:
        '<template> \n' +
        '<CatTabs v-model="active" :tabs="tabs"  @change="null">\n' +
        '     <CatTabPane :value="1">标签一的content</CatTabPane>\n' +
        '     <CatTabPane :value="2">标签二的content</CatTabPane>\n' +
        '</CatTabs>\n' +
        '\n</template>\n' +
        '<script setup lang="ts">\n' +
        '     const active = ref(2);\n' +
        '     const tabs = [\n' +
        '             { label: "标签一", value: 1 },\n' +
        '             { label: "标签二", value: 2 },\n' +
        '         ];\n' +
        '</script>',
    },
    {
      label: '标签盒',
      value: 'tab_box',
      title: 'TabsBox标签盒',
      script:
        '<template> \n' +
        '   <CatTabsBox v-model="active" :list="list" @change="null"/>\n' +
        '</template>\n' +
        '<script setup lang="ts">\n' +
        "     const active = ref('green');\n" +
        '     const list = [\n' +
        '           { label: "红", value: "red" },\n' +
        '           { label: "黄", value: "yellow" },\n' +
        '           { label: "绿", value: "green" },\n' +
        '         ];\n' +
        '</script>',
    },
    {
      label: '模态框',
      value: 'dialog',
      title: 'Dialog模态框',
      script:
        '<template> \n' +
        '   <CatDialog\n' +
        '       v-model:dialog="dialog"\n' +
        '       title="标题"\n' +
        '       icon="file-failed"\n' +
        '       :loading="loading"\n' +
        '       :disabled="disabled"\n' +
        '       cancel-text="cancelText"\n' +
        '       width="666"\n' +
        '       @confirm="dialogConfirm"\n' +
        '       >\n' +
        '       内容区域\n' +
        '   </CatDialog>\n' +
        '</template>\n' +
        '<script setup lang="ts">\n' +
        '   const dialog = ref(false) \n' +
        '   const loading = ref(false) \n' +
        '   const disabled = ref(false) \n' +
        "   const cancelText = ref('原始人') \n" +
        '   const dialogConfirm = () => { \n' +
        '       loading = true; \n' +
        '       setTimeout(() => { \n' +
        '           loading.value = false; \n' +
        '           dialog.value = false; \n' +
        '       }, 2000); \n' +
        '</script>',
    },
    {
      label: '分页器',
      value: 'pager',
      title: 'Pagination分页器',
      script:
        '<template> \n' +
        ' <CatPagination v-model:pagination="pager" :total="999" @change="null"/>\n' +
        '</template>\n' +
        '<script setup lang="ts">\n' +
        '   const pager = ref({\n' +
        '       page: 1,\n' +
        '       pageSize: 10,\n' +
        '   });\n' +
        '</script>',
    },
    {
      label: '下拉框',
      value: 'select',
      title: 'Select下拉框',
      script:
        '<template> \n' +
        '<CatSelect v-model="selectValue" :list="selectList" placeholder="随便写的" @change="changeEvent"/>\n' +
        '\n' +
        '<CatSelect v-model="selectValue" :list="selectList" placeholder="随便写的">\n' +
        '   <template #start>\n' +
        '       <el-option label="从开始单独加" value="sb1" />\n' +
        '   </template>\n' +
        '   <template #end>\n' +
        '       <el-option label="从最后单独加" value="sb2" />\n' +
        '   </template>\n' +
        '</CatSelect>\n' +
        '</template>\n' +
        '\n' +
        '<script setup lang="ts">\n' +
        "const selectValue = ref('');\n" +
        "const selectList = ref([{ label: 'label1', value: 0, disabled: false }, { label: 'label2', value: 1, disabled: true }])\n" +
        '</script>',
    },
    {
      label: '提示',
      value: 'tip',
      title: 'Tip提示',
      script:
        '<template> \n' +
        '<CatTip type="primary">提示</CatTip>\n' +
        '<!-- type取值  primary, warning, success, danger,  对应var(--el-color-xxx颜色) --> \n' +
        '</template>',
    },
    {
      label: '表格',
      value: 'table',
      title: 'Table表格',
      script:
        ' <CatTable :columns="columns" :table-data="tableData" :selection="40"  v-model:sort="sortData" @select-change="null" @update:sort="null">\n' +
        '   <template #b-header> 自定义头部内容也是可以的 </template>\n' +
        '   <template #a="{ row }">{{ row.a }}</template>\n' +
        '   <template #handle="{ row, rowIndex }">\n' +
        '       <el-button>{{ "这里是操作" + "-" + row.b + "-" + rowIndex }}</el-button>\n' +
        '   </template>\n' +
        '</CatTable>\n' +
        '<script setup lang="ts">\n' +
        'const columns: TableColumn[] = [\n' +
        "   { prop: 'a', label: '好听就是响头' },\n" +
        "   { prop: 'b', label: '啊数据库戴纳肯几十年单手打哪三大年卡手机打' },\n" +
        "   { prop: 'handle', label: '操作', fixed: 'right', width: 200 },\n" +
        ']\n' +
        'const tableData: any[] = [\n' +
        "   { id: 1, a: 'a1', b: 'b1' },\n" +
        '   {\n' +
        '     id: 2,\n' +
        "     a: '文本超出了应该是会自动tooltip的！多写点文字方便触发, 新的一年即将来临祝你万事如意心想事成笑口常开',\n" +
        "     b: 'b2',\n" +
        '   },\n' +
        "   { id: 3, a: 'a3', b: 'b3' },\n" +
        ']\n' +
        'const sortData = ref({\n' +
        "  a: '', // '' | 'up' | 'down' -> 对应排序的三种状态: 空字符串(未排序) 'up'(由低到高) 'down'(由高到低) \n" +
        '})\n' +
        '描述:\n' +
        'selection: 开启表格多选功能, selection的值代表多选框的长度(px), 开启后会抛出select-change事件, 用于获取当前已被选择的行.\n' +
        "v-model:srot='sortData': 开启排序功能, 需要自行在setup里定义sortData, 对象的key对应表格列的prop, 规定哪些列需要开启排序, 点击排序图标会抛出 update:sort 事件, 返回点击列的prop和sort的状态 \n" +
        '</script>',
    },
    {
      label: '输入框',
      value: 'input',
      title: 'Input输入框',
      script:
        '<CatInput  />\n' +
        '<CatInput just-number  /> \n' +
        "<CatInput v-model='input3' :verify-empty='{ message: '校验提示信息', trigger: 'change' }'/>\n" +
        "<CatInput v-model='input4' error-tooltip='right' :verify-empty='{ message: '校验提示信息', trigger: 'change' }' /> \n" +
        "<CatInput v-model='input5' error-tooltip='bottom' :rules='rules'/>\n" +
        ' \n' +
        '<script setup lang="ts">\n' +
        "   const input3 = ref('')\n" +
        "   const input4 = ref('')\n" +
        "   const input5 = ref('')\n" +
        '</script>\n' +
        '//自定义校验代码格式参照element-plus的el-form自定义校验\n' +
        'const customCheck = (rule, value: string, callback) => {\n' +
        '  if (!value) {\n' +
        "    callback(new Error('不能为空！'))\n" +
        '  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,16}$/.test(value)) { \n' +
        "    callback(new Error('请输入6 ~ 16个字符，必须包含大写字母，小写字母，数字')) \n" +
        '  } else {\n' +
        '    callback();\n' +
        '  }\n' +
        '};\n' +
        'const rules: InputValidate[] = [\n' +
        '  {\n' +
        '    validator: customCheck,\n' +
        "    trigger: 'blur',\n" +
        '  },\n' +
        '];\n',
    },
    {
      label: 'More',
      value: 'more',
      title: '更多组件正在生成...',
    },
  ],
}
