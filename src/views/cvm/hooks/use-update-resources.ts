import { _sendSSE, _closeSSE } from '@/apis/cvm/base'
import { useSSE, ConfigType } from '@/views/cvm/hooks/use-sse'

type ModeType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

interface ResourcesConfigType extends ConfigType {
  resourcesStateType: 'string' | 'number' // state类型
  resourcesId?: string // id字段名
  deleteStateValue?: string | number | string[] | number[] // 删除状态的state值
}

type ModeTypeMapDTO = {
  [key: number | string]: string
}
// modeType字典映射
const modeTypeMapDTO: ModeTypeMapDTO = {
  1: 'insItemDTO',
  2: 'diskItemDTO',
  3: 'imageItemDTO',
  4: 'snapshotItemDTO',
  9: 'eipItemDTO',
}

export function useUpdateResources(config: ResourcesConfigType, list: Ref<any[]>, tatal?: Ref<number>) {
  const { sseData: resourcesData, isConnected, startSSE, closeSSE } = useSSE(config)

  // 通知SSE 1, "云服务器"2, "云硬盘",3, "镜像",4, "快照",5, "安全组",6, "SSH", 7, "VPC",8, "ENI",9, "EIP",
  const notice = (modeType: ModeType): void => {
    // _sendSSE({
    //   modeType,
    // })
  }

  // 开启
  const start = () => {
    end()
    startSSE()
  }

  // 关闭
  const end = () => {
    // console.log('我先执行了end，销毁上一个connet')
    // 前端关闭
    closeSSE()
    // 后端关闭
    // _closeSSE()
  }

  /**
   * @desc sseData => [{resourceId,state,loadingState,...}]
   * @desc loadingState =>当前主任务状态 true则开启loading,false则关闭
   */
  watch(
    resourcesData,
    v => {
      if (v.length && list?.value) {
        for (let index = 0; index < v.length; index++) {
          const resource = v[index]
          const resourceId = resource.resourceId
          // 使用find代替findIndex以确保元素存在
          const item = list.value.find(item => Number(resourceId) === item[config.resourcesId || 'id'])

          if (!item) continue

          const dataDTO = resource[modeTypeMapDTO[config.params?.modeType]] || {}
          let shouldDelete = false

          for (const keyName in dataDTO) {
            if (keyName === 'state') {
              const state = config.resourcesStateType === 'number' ? Number(dataDTO[keyName]) : String(dataDTO[keyName])

              item[keyName] = state

              // 检查是否需要删除
              if (config.deleteStateValue) {
                const deleteValues = Array.isArray(config.deleteStateValue)
                  ? config.deleteStateValue
                  : [config.deleteStateValue]

                if (deleteValues.includes(state)) {
                  shouldDelete = true
                }
              }
            } else {
              item[keyName] = dataDTO[keyName]
            }
          }

          // 在处理完所有属性更新后，统一处理删除操作
          if (shouldDelete) {
            const itemIndex = list.value.findIndex(i => i[config.resourcesId || 'id'] === Number(resourceId))
            if (itemIndex !== -1) {
              list.value.splice(itemIndex, 1)
            }
          }
        }

        if (tatal?.value !== undefined) {
          tatal.value = list.value.length
        }
      }
    },
    { deep: true, flush: 'sync' },
  )

  // onMounted(() => {
  //   if (config.params?.modeType) {
  //     notice(config.params.modeType)
  //   }
  // })

  onUnmounted(() => {
    end()
  })

  return {
    resourcesData,
    isConnected,
    start,
    end,
    notice,
  }
}
