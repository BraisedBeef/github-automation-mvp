export interface TableFilterConfigType {
  [key: string]: {
    value: any[]
    opts: any[]
    fieldKey: string
    fieldType?: 'check' | 'select'
  }
}

type IptFilterConfigType = any[]

export const useFilter = (
  defaultTableFilterConfig: TableFilterConfigType,
  defaultIptFilterConfig?: IptFilterConfigType,
) => {
  // ipt实例
  const filterInputRef = ref<any>()
  // table查询
  const tableFilterConfig = reactive<TableFilterConfigType>(defaultTableFilterConfig)
  // ipt查询
  const iptFilterConfig = ref<IptFilterConfigType>(defaultIptFilterConfig || [])

  // 表头单选
  const handleThSelectFn = (val: any, fieldKey: string, fieldName: string) => {
    const index = filterInputRef.value.searchList.findIndex(item => item.fieldKey === fieldKey)
    if (val) {
      if (index >= 0) {
        const filterItem = filterInputRef.value.searchList.find(item => item.fieldKey === fieldKey)

        filterInputRef.value.searchList.splice(index, 1, {
          ...filterItem,
          value: val,
          label: tableFilterConfig[fieldKey].opts.filter(item => val === item.value).map(item => item.label),
        })
      } else {
        filterInputRef.value.searchList.push({
          fieldName,
          fieldKey,
          value: val,
          label: tableFilterConfig[fieldKey].opts.filter(item => val === item.value).map(item => item.label),
        })
      }
    } else {
      if (index < 0) return
      return filterInputRef.value.searchList.splice(index, 1)
    }
  }

  // 表头多选
  const handleThCheckFn = (list: any[], fieldKey: string, fieldName: string) => {
    const index = filterInputRef.value.searchList.findIndex(item => item.fieldKey === fieldKey)
    if (!list.length) {
      if (index < 0) return
      return filterInputRef.value.searchList.splice(index, 1)
    }
    if (index >= 0) {
      const filterItem = filterInputRef.value.searchList.find(item => item.fieldKey === fieldKey)

      filterInputRef.value.searchList.splice(index, 1, {
        ...filterItem,
        value: list,
        label: tableFilterConfig[fieldKey].opts.filter(item => list.indexOf(item.value) >= 0).map(item => item.label),
      })
    } else {
      filterInputRef.value.searchList.push({
        fieldName,
        fieldKey,
        value: list,
        label: tableFilterConfig[fieldKey].opts.filter(item => list.indexOf(item.value) >= 0).map(item => item.label),
      })
    }
  }

  // 重置ipt
  const resetIptFn = () => {
    if (filterInputRef.value) {
      filterInputRef.value.searchList = []
    }
  }

  return {
    handleThSelectFn,
    handleThCheckFn,
    tableFilterConfig,
    filterInputRef,
    iptFilterConfig,
    resetIptFn,
  }
}
