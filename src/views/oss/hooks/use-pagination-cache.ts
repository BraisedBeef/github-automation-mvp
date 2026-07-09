interface PaginationOptions {
  page: number
  pageSize: number
  total?: number
  isTruncated?: boolean
}

interface CacheEntry {
  data: any[]
  isTruncated: boolean
  nextMarker?: string
}

export function usePaginationCache(
  api: (marker?: string, delimiter?: string) => Promise<{ data: any; isTruncated: boolean; nextMarker?: string }>,
  options: Ref<PaginationOptions>,
  search: Ref<any>,
) {
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 优化：只存储索引引用，而非完整数据
  const indexedData = ref<Map<string, any>>(new Map()) // key -> data item
  const pageIndex = ref<string[]>([]) // 页面顺序索引
  const currentMarker = ref<string>('')

  // API 分页缓存：避免重复请求
  const pageCache = new Map<string, CacheEntry>()

  // 搜索结果缓存（搜索后的 key 列表）
  const searchResultKeys = ref<Set<string>>(new Set())
  const isSearchMode = ref(false)

  // 标记是否正在加载数据（用于自动加载逻辑）
  const isAutoLoading = ref(false)

  // 只负责调用 API 并返回单页数据（不修改数据索引）
  const fetchPage = async (marker?: string, delimiter?: string, searchKey?: string, isLoading?: boolean) => {
    // 检查缓存：包含 marker、delimiter 和搜索条件
    const cacheKey = `${marker || 'init'}_${delimiter || ''}_${searchKey || 'default'}`
    // if (pageCache.has(cacheKey)) {
    //   return pageCache.get(cacheKey)!
    // }

    // 设置加载状态（仅由外层控制，这里不改动 loading）
    !isLoading && (loading.value = true)

    try {
      error.value = null
      const response = await api(marker, delimiter)

      // 缓存此页面
      pageCache.set(cacheKey, response)

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch data'
      throw err
    } finally {
      !isLoading && (loading.value = false)
    }
  }

  // 用于正常分页场景：调用 fetchPage 并将数据写入索引
  const fetchData = async (marker?: string, delimiter?: string) => {
    const response = await fetchPage(marker, delimiter)
    const { data, isTruncated, nextMarker } = response

    if (!marker) {
      // 首次加载，清空索引
      indexedData.value.clear()
      pageIndex.value = []
    }

    // 添加数据到索引，避免重复
    data.forEach((item: any) => {
      if (!indexedData.value.has(item.key)) {
        indexedData.value.set(item.key, item)
        pageIndex.value.push(item.key)
      }
    })

    currentMarker.value = nextMarker || ''
    options.value.isTruncated = isTruncated
    options.value.total = indexedData.value.size

    // 数据量少于 1000 时排序
    if (options.value.total < 1000) {
      await sortFiles()
    }

    return data
  }

  // 获取当前页数据（使用索引查询，减少内存占用）
  const getCurrentPageData = computed(() => {
    const start = (options.value.page - 1) * options.value.pageSize
    const end = start + options.value.pageSize

    // 如果在搜索模式，使用搜索结果的 key 列表
    const dataSource = isSearchMode.value ? Array.from(searchResultKeys.value) : pageIndex.value

    return dataSource
      .slice(start, end)
      .map(key => indexedData.value.get(key))
      .filter(Boolean)
  })

  // 计算总页数
  const totalPages = computed(() => {
    const dataLength = isSearchMode.value ? searchResultKeys.value.size : pageIndex.value.length
    return Math.ceil(dataLength / options.value.pageSize)
  })

  // 监听页码变化，判断是否需要加载下一批数据
  const handlePageChange = async (page: number) => {
    const isLastPage = page === totalPages.value
    if (
      isLastPage &&
      options.value.isTruncated &&
      currentMarker.value &&
      !loading.value &&
      !isSearchMode.value // 搜索模式不自动加载
    ) {
      isAutoLoading.value = true
      try {
        await fetchData(currentMarker.value)
      } finally {
        isAutoLoading.value = false
      }
    }
  }

  watch(() => options.value.page, handlePageChange)

  // 初始加载数据
  const init = async () => {
    options.value.page = 1
    isSearchMode.value = false
    searchResultKeys.value.clear()
    await fetchData()
  }

  // 搜索文件列表（流式处理，避免临时数组）
  const searchFiles = async () => {
    options.value.page = 1
    isSearchMode.value = true
    searchResultKeys.value.clear()
    currentMarker.value = '' // 重置 marker

    // 清空与该搜索条件相关的缓存，确保新搜索重新请求
    const searchCachePrefix = `_${search.value.searchType === 'fuzzy' && search.value.search !== '' ? '' : '/'}_search_${search.value.search}`
    for (const key of pageCache.keys()) {
      if (key.includes(searchCachePrefix) || !key.includes('_search_')) {
        // 只清除相关的搜索缓存，保留其他缓存
      }
    }

    const delimiter = search.value.searchType === 'fuzzy' && search.value.search !== '' ? '' : '/'
    let marker = ''
    let lastResponse: any = { data: [], isTruncated: false, nextMarker: '' }
    let isTruncated = false

    // 生成搜索缓存 key 用于区分不同搜索
    const searchCacheKey = `search_${search.value.searchType}_${search.value.search}`

    loading.value = true

    try {
      do {
        lastResponse = await fetchPage(marker, delimiter, searchCacheKey, true)
        isTruncated = lastResponse.isTruncated

        // 流式处理数据：直接过滤和索引，不创建临时数组
        lastResponse.data.forEach((item: any) => {
          // 添加到全局索引
          if (!indexedData.value.has(item.key)) {
            indexedData.value.set(item.key, item)
          }

          // 模糊搜索则前端过滤
          if (search.value.searchType === 'fuzzy' && search.value.search !== '') {
            if (item.key.toLowerCase().includes(search.value.search.toLowerCase())) {
              searchResultKeys.value.add(item.key)
            }
          } else {
            searchResultKeys.value.add(item.key)
          }
        })

        marker = lastResponse.nextMarker || ''
      } while (isTruncated && marker)

      options.value.total = searchResultKeys.value.size
      options.value.isTruncated = isTruncated
      currentMarker.value = lastResponse.nextMarker || ''

      // 数据量少于 1000 时排序
      if (options.value.total < 1000) {
        await sortFiles()
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Search failed'
    } finally {
      loading.value = false
    }
  }

  // 给文件按条件排序（只排序搜索结果的 key，而非完整数据）
  const sortFiles = async () => {
    const dataSource = isSearchMode.value ? searchResultKeys.value : pageIndex.value
    const keysToSort: string[] = Array.from(dataSource)

    keysToSort.sort((keyA, keyB) => {
      const a = indexedData.value.get(keyA)
      const b = indexedData.value.get(keyB)

      // 优先处理 undefined 值
      if (a.size === undefined && b.size === undefined) {
        if (a.lastModified === undefined && b.lastModified === undefined) return 0
        if (a.lastModified === undefined) return -1
        if (b.lastModified === undefined) return 1
      }
      if (a.size === undefined) return -1
      if (b.size === undefined) return 1

      // 根据排序字段进行排序
      if (search.value.sortField === 'size') {
        return search.value.sortOrder === 'asc' ? a.size - b.size : b.size - a.size
      } else if (search.value.sortField === 'lastModified') {
        const aTime = new Date(a.lastModified).getTime()
        const bTime = new Date(b.lastModified).getTime()
        return search.value.sortOrder === 'asc' ? aTime - bTime : bTime - aTime
      }
      return a.key.localeCompare(b.key)
    })

    if (isSearchMode.value) {
      searchResultKeys.value = new Set(keysToSort)
    } else {
      pageIndex.value = keysToSort
    }

    options.value.page = 1
    await nextTick()
  }

  // 清除 API 缓存（可选，用于内存管理）
  const clearCache = () => {
    pageCache.clear()
  }

  return {
    loading,
    error,
    getCurrentPageData,
    totalPages,
    init,
    fetchData,
    fetchPage,
    sortFiles,
    searchFiles,
    handlePageChange,
    clearCache,
  }
}
