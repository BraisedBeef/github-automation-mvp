import { ElTable, ElTableColumn, ElCheckbox } from 'element-plus/es'
import './style.scss'

type DataSourceType = {
  title: string
  dataIndex?: string
  key?: string
  disabled?: boolean
}

export default defineComponent({
  name: 'TransferTable',
  props: {
    dataSource: {
      type: Array as PropType<object[]>,
      default: () => [],
    },
    columns: {
      type: Array as PropType<DataSourceType[]>,
      default: () => [
        {
          title: '证书名称',
          dataIndex: 'certName',
          key: 'certName',
        },
        {
          title: '证书类型',
          dataIndex: 'certType',
          key: 'certType',
        },
        {
          title: '过期时间',
          dataIndex: 'expireTime',
          key: 'expireTime',
        },
      ],
    },
    placeholder: {
      type: String,
      // default: '请输入筛选条件',
    },
    filterable: {
      type: Boolean,
      default: false,
    },
    height: {
      type: String,
      default: '330px',
    },
  },
  setup(props, { slots }) {
    const { dataSource, columns, placeholder, filterable, height } = props
    const certListStore = reactive({})

    // 计算右侧表格高度
    const rightHeight = ref(330)
    const leftRef = ref<HTMLElement>()
    const rightTipsRef = ref<HTMLElement>()
    onMounted(() => {
      nextTick(() => {
        // 计算右侧表格高度
        if (leftRef.value) {
          console.log('leftRef.value.clientHeight', leftRef.value.clientHeight)
          // console.log('rightTipsRef.value.clientHeight', rightTipsRef.value.clientHeight)

          rightHeight.value = leftRef.value?.clientHeight
          if (rightTipsRef.value) rightHeight.value -= rightTipsRef.value.clientHeight + 10
        }
      })
    })

    return () => (
      <div class='transfer-table__container'>
        <div ref={leftRef} class='transfer-table__left'>
          {slots.left_tips && <div class='transfer-table__left-tips'>{slots.left_tips?.()}</div>}
          {filterable && <input class='transfer-table__input' placeholder={placeholder} />}
          <ElTable
            data={props.dataSource}
            v-loading='certListStore.loading'
            show-overflow-tooltip
            max-height={height}
            table-layout='auto'
            style={{ height: height, border: '1px solid #dddddd' }}
          >
            <ElTableColumn prop='check' width='55'>
              {{
                header: () => <ElCheckbox />,
                default: () => <ElCheckbox />,
              }}
            </ElTableColumn>
            {columns.map(item => (
              <ElTableColumn key={item.key} prop={item.dataIndex} label={item.title} />
            ))}
          </ElTable>
        </div>
        <div class='transfer-table__right'>
          {slots.right_tips && (
            <div ref={rightTipsRef} class='transfer-table__right-tips'>
              {slots.right_tips?.()}
            </div>
          )}
          <ElTable
            data={props.dataSource}
            v-loading='certListStore.loading'
            show-overflow-tooltip
            max-height={rightHeight.value}
            table-layout='auto'
            style={{ height: `${rightHeight.value}px`, border: '1px solid #dddddd' }}
          >
            <ElTableColumn prop='check' width='55'>
              {{
                header: () => <ElCheckbox />,
                default: () => <ElCheckbox />,
              }}
            </ElTableColumn>
            {columns.map(item => (
              <ElTableColumn key={item.key} prop={item.dataIndex} label={item.title} />
            ))}
          </ElTable>
        </div>
      </div>
    )
  },
})
