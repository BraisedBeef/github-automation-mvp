export type DetailTableMainRow<TMain = Record<string, any>> = TMain & {
  id: string | number
  rowType?: 'main'
}

export type DetailTableDetailRow<TMain = Record<string, any>> = {
  id: string
  parentId: string | number
  rowType: 'detail'
  parentRow: TMain
}

export type DetailTableVisibleRow<TMain = Record<string, any>> =
  | (TMain & { id: string | number; rowType?: 'main' })
  | DetailTableDetailRow<TMain>

export const useTableV2DetailRows = <TMain extends Record<string, any>>(
  sourceRows: Ref<DetailTableMainRow<TMain>[]>,
) => {
  const expandedRowIds = ref<Array<string | number>>([])

  const isExpanded = (id: string | number) => {
    return expandedRowIds.value.includes(id)
  }

  const isDetailRow = (row: DetailTableVisibleRow<TMain>) => {
    return row?.rowType === 'detail'
  }

  const visibleRows = computed<DetailTableVisibleRow<TMain>[]>(() => {
    return sourceRows.value.flatMap((row: DetailTableMainRow<TMain>) => {
      if (!isExpanded(row.id)) {
        return [row]
      }

      return [
        row,
        {
          id: `${row.id}__detail`,
          parentId: row.id,
          rowType: 'detail',
          parentRow: row,
        },
      ]
    })
  })

  const toggleRowExpanded = (row: DetailTableMainRow<TMain>) => {
    expandedRowIds.value = isExpanded(row.id)
      ? expandedRowIds.value.filter(id => id !== row.id)
      : [...expandedRowIds.value, row.id]
  }

  const setExpandedRowIds = (ids: Array<string | number>) => {
    expandedRowIds.value = ids
  }

  return {
    expandedRowIds,
    visibleRows,
    isExpanded,
    isDetailRow,
    toggleRowExpanded,
    setExpandedRowIds,
  }
}
