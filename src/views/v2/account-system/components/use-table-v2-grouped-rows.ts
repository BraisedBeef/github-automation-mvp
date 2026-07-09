export type GroupedTableRow<TChild = Record<string, any>, TGroup = Record<string, any>> =
  | (TGroup & {
      id: string
      parentId?: string
      rowType: 'group' | 'child'
      subRows?: Array<TChild & { id: string; parentId: string; rowType: 'child' }>
    })
  | (TChild & {
      id: string
      parentId: string
      rowType: 'child'
    })

export const useTableV2GroupedRows = <TGroup extends Record<string, any>, TChild extends Record<string, any>>(
  sourceRows: Ref<TGroup[]>,
  options?: {
    getChildren?: (row: TGroup) => TChild[] | undefined
  },
) => {
  // Minimal usage:
  // 1. Normalize API data into [{ id, rowType: 'group', subRows: [{ id, parentId, rowType: 'child' }] }]
  // 2. Pass the grouped list into this composable
  // 3. Bind visibleRows / row-class-name / span-method into <TableV2 grouped />
  // 4. Render the first column yourself for arrow + checkbox + label
  const getChildren = options?.getChildren || ((row: TGroup) => (row as any).subRows as TChild[] | undefined)

  const expandedGroupIds = ref<string[]>([])
  const selectedLeafIds = ref<string[]>([])

  const isGroupRow = (row: any) => {
    return Boolean(getChildren(row)?.length)
  }

  const isChildRow = (row: any) => {
    return row?.rowType === 'child'
  }

  const isExpanded = (id: string) => {
    return expandedGroupIds.value.includes(id)
  }

  const visibleRows = computed(() => {
    return sourceRows.value.flatMap((row: any) => {
      if (!isGroupRow(row)) {
        return [row]
      }

      if (!isExpanded(row.id)) {
        return [row]
      }

      return [row, ...(getChildren(row) || [])]
    })
  })

  const allRows = computed(() => {
    return sourceRows.value.flatMap((row: any) => [row, ...(getChildren(row) || [])])
  })

  const allLeafRows = computed(() => {
    return allRows.value.filter(row => isChildRow(row))
  })

  const selectedLeafRows = computed(() => {
    return allLeafRows.value.filter(row => selectedLeafIds.value.includes(row.id))
  })

  const isAllLeafSelected = computed(() => {
    return allLeafRows.value.length > 0 && selectedLeafIds.value.length === allLeafRows.value.length
  })

  const isLeafSelectionIndeterminate = computed(() => {
    return selectedLeafIds.value.length > 0 && selectedLeafIds.value.length < allLeafRows.value.length
  })

  const isRowSelected = (row: any) => {
    if (isChildRow(row)) {
      return selectedLeafIds.value.includes(row.id)
    }

    const childIds = (getChildren(row) || []).map((child: any) => child.id)
    return childIds.length > 0 && childIds.every((id: string) => selectedLeafIds.value.includes(id))
  }

  const isGroupIndeterminate = (row: any) => {
    if (!isGroupRow(row)) return false

    const childIds = (getChildren(row) || []).map((child: any) => child.id)
    const selectedCount = childIds.filter((id: string) => selectedLeafIds.value.includes(id)).length
    return selectedCount > 0 && selectedCount < childIds.length
  }

  const toggleGroup = (row: any) => {
    if (!isGroupRow(row)) return

    expandedGroupIds.value = isExpanded(row.id)
      ? expandedGroupIds.value.filter(id => id !== row.id)
      : [...expandedGroupIds.value, row.id]
  }

  const toggleRowSelected = (row: any, selected: boolean | string | number) => {
    const checked = Boolean(selected)
    const nextIds = new Set(selectedLeafIds.value)

    if (isChildRow(row)) {
      if (checked) {
        nextIds.add(row.id)
      } else {
        nextIds.delete(row.id)
      }
      selectedLeafIds.value = Array.from(nextIds)
      return
    }

    ;(getChildren(row) || []).forEach((child: any) => {
      if (checked) {
        nextIds.add(child.id)
      } else {
        nextIds.delete(child.id)
      }
    })

    selectedLeafIds.value = Array.from(nextIds)
  }

  const toggleSelectAll = (selected: boolean | string | number) => {
    if (!selected) {
      selectedLeafIds.value = []
      return
    }

    selectedLeafIds.value = allLeafRows.value.map((row: any) => row.id)
  }

  const setExpandedGroupIds = (ids: string[]) => {
    expandedGroupIds.value = ids
  }

  const resetSelection = () => {
    selectedLeafIds.value = []
  }

  return {
    expandedGroupIds,
    selectedLeafIds,
    visibleRows,
    allRows,
    allLeafRows,
    selectedLeafRows,
    isAllLeafSelected,
    isLeafSelectionIndeterminate,
    isGroupRow,
    isChildRow,
    isExpanded,
    isRowSelected,
    isGroupIndeterminate,
    toggleGroup,
    toggleRowSelected,
    toggleSelectAll,
    setExpandedGroupIds,
    resetSelection,
  }
}
