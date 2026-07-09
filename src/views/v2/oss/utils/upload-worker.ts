// 专门负责文件解析、树结构构建和上传任务
self.onmessage = async (e: MessageEvent) => {
  const { type, payload, id } = e.data

  switch (type) {
    // 解析上传的文件列表，构建首层目录结构
    case 'PARSE_FILES':
      handleParseFiles(payload, id)
      break
    // 懒加载获取子目录内容
    case 'GET_SUB_FILES':
      handleGetSubFiles(payload, id)
      break
    // 从缓存中删除指定节点（文件/文件夹）
    case 'DELETE_NODE':
      handleDeleteNode(payload, id)
      break
    // 扁平化处理待上传文件列表
    case 'PREPARE_UPLOAD':
      handlePrepareUpload(payload, id)
      break
    // 清理 Worker 内部的文件缓存
    case 'CLEAR_CACHE':
      nodeMap.clear()
      break
  }
}

// 缓存文件映射，用于快速查找子节点
// 格式例如：key: uid, value: { _rawItems: RawItem[], isFolder: boolean, name: string ... }
const nodeMap = new Map<string, any>()

interface RawItem {
  uid: string
  path: string
  name: string
  size: number
}

// 生成唯一ID
const generateUid = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
// 最大上传5G
const maxSize = 5 * 1024 * 1024 * 1024
/**
 * 解析文件列表，构建第一层树结构
 * @param payload.items { uid, path, name, size }[]
 */
function handleParseFiles(payload: { items: RawItem[] }, requestId: string) {
  const { items } = payload
  const folderMap = new Map<string, RawItem[]>()
  const looseFiles: RawItem[] = []

  // 1. 遍历文件，按顶层目录归类
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const { path, name } = item

    // 过滤系统文件
    if (name === 'desktop.ini' || name === '.DS_Store') continue

    // 使用传入的 path
    if (path && path.includes('/')) {
      const rootName = path.split('/')[0]
      let list = folderMap.get(rootName)
      if (!list) {
        list = []
        folderMap.set(rootName, list)
      }
      list.push(item)
    } else {
      looseFiles.push(item)
    }
  }

  const result: any[] = []

  // 2. 处理文件夹节点
  for (const [name, subItems] of folderMap) {
    const totalSize = subItems.reduce((acc, i) => acc + i.size, 0)
    const uid = generateUid()

    const node = {
      name,
      isFolder: true,
      size: totalSize,
      status: 'success',
      hasChildren: true,
      uid,
      _rootId: uid, // 顶层指向自己
      _prefix: name + '/',
    }

    // 缓存节点数据
    nodeMap.set(uid, { ...node, _rawItems: subItems })

    // 返回给主线程的数据
    result.push(node)
  }

  // 3. 处理散文件节点
  for (const item of looseFiles) {
    // 散文件直接使用原始 UID
    const node = {
      name: item.name,
      isFolder: false,
      size: item.size,
      status: item.size > maxSize ? 'error' : 'success',
      uid: item.uid, // 使用原始 UID
      _rootId: item.uid,
    }
    // 散文件也缓存一下
    nodeMap.set(item.uid, { ...node, _rawItem: item })
    result.push(node)
  }

  self.postMessage({
    type: 'PARSE_FILES_RESULT',
    id: requestId,
    payload: result,
  })
}

/**
 * 获取子文件/子文件夹
 * @param payload.uid 父节点 UID
 */
function handleGetSubFiles(payload: { uid: string; _rootId: string; _prefix: string }, requestId: string) {
  const { uid, _rootId, _prefix } = payload

  const rootNode = nodeMap.get(_rootId)
  if (!rootNode || !rootNode._rawItems) {
    self.postMessage({
      type: 'GET_SUB_FILES_RESULT',
      id: requestId,
      payload: [],
    })
    return
  }

  const items: RawItem[] = rootNode._rawItems
  const currentPrefix = _prefix || ''
  const folderMap = new Map<string, RawItem[]>()
  const subFiles: any[] = []

  for (const item of items) {
    const { path, size, uid: itemUid } = item
    if (!path.startsWith(currentPrefix)) continue

    const relativePath = path.slice(currentPrefix.length)
    if (!relativePath) continue

    if (relativePath.includes('/')) {
      // 依然是文件夹
      const subFolderName = relativePath.split('/')[0]
      let list = folderMap.get(subFolderName)
      if (!list) {
        list = []
        folderMap.set(subFolderName, list)
      }
      list.push(item)
    } else {
      // 是当前层级的文件
      const subFileNode = {
        name: relativePath,
        isFolder: false,
        size: size,
        status: size > maxSize ? 'error' : 'success',
        uid: itemUid, // 使用原始 UID
        _parentId: uid,
        _rootId: _rootId,
        _fullPath: path, // 用于删除
      }
      // 缓存子文件节点
      nodeMap.set(itemUid, { ...subFileNode, _rawItem: item })
      subFiles.push(subFileNode)
    }
  }

  const subFolders: any[] = []
  for (const [name, list] of folderMap) {
    const totalSize = list.reduce((acc, i) => acc + i.size, 0)
    const subUid = generateUid()
    const subFolderNode = {
      name,
      isFolder: true,
      size: totalSize,
      status: 'success',
      _prefix: currentPrefix + name + '/',
      hasChildren: true,
      uid: subUid,
      _parentId: uid,
      _rootId: _rootId,
    }
    // 缓存子文件夹节点
    nodeMap.set(subUid, { ...subFolderNode, _rawItems: list })
    subFolders.push(subFolderNode)
  }

  self.postMessage({
    type: 'GET_SUB_FILES_RESULT',
    id: requestId,
    payload: [...subFolders, ...subFiles],
  })
}

/**
 * 删除节点
 * @param payload
 */
function handleDeleteNode(
  payload: {
    uid: string
    _parentId?: string
    _rootId?: string
    isFolder: boolean
    _prefix?: string
    _fullPath?: string
  },
  requestId: string,
) {
  const { uid, _parentId, _rootId, isFolder, _prefix, _fullPath } = payload

  // 1. 如果是顶层节点，直接删除缓存
  if (!_parentId) {
    nodeMap.delete(uid)
    self.postMessage({
      type: 'DELETE_NODE_RESULT',
      id: requestId,
      payload: { success: true, isRoot: true, uid },
    })
    return
  }

  // 2. 如果是子节点，需要从 rootNode 的 _rawItems 中移除
  const rootNode = nodeMap.get(_rootId!)

  if (rootNode && rootNode._rawItems) {
    if (isFolder) {
      const targetPrefix = _prefix
      if (targetPrefix) {
        rootNode._rawItems = rootNode._rawItems.filter((i: RawItem) => !i.path.startsWith(targetPrefix))
      }
    } else {
      if (_fullPath) {
        rootNode._rawItems = rootNode._rawItems.filter((i: RawItem) => i.path !== _fullPath)
      }
    }

    const newSize = rootNode._rawItems.reduce((acc: number, i: RawItem) => acc + i.size, 0)
    rootNode.size = newSize

    // 清除该根节点下的所有子节点缓存
    for (const [key, val] of nodeMap.entries()) {
      if (val._rootId === _rootId && key !== _rootId) {
        nodeMap.delete(key)
      }
    }

    // 如果删空了
    if (rootNode._rawItems.length === 0) {
      nodeMap.delete(_rootId!)
      self.postMessage({
        type: 'DELETE_NODE_RESULT',
        id: requestId,
        payload: { success: true, isRoot: true, uid: _rootId },
      })
      return
    }

    self.postMessage({
      type: 'DELETE_NODE_RESULT',
      id: requestId,
      payload: { success: true, isRoot: false, rootId: _rootId, newSize },
    })
  } else {
    self.postMessage({
      type: 'DELETE_NODE_RESULT',
      id: requestId,
      payload: { success: false },
    })
  }
}

/**
 * 准备上传列表
 * @param payload.uids 需要上传的节点 UID 列表（可能是文件夹也可能是文件）
 */
function handlePrepareUpload(payload: { uids: string[] }, requestId: string) {
  const { uids } = payload
  const uploadList: any[] = []

  // 构建树形结构
  const buildTree = (items: RawItem[]): any[] => {
    const tree: any[] = []
    const map = new Map<string, any>()

    for (const item of items) {
      const path = item.path
      const parts = path.split('/')
      let currentLevel = tree
      let currentPath = ''

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        currentPath = currentPath ? `${currentPath}/${part}` : part
        const isLast = i === parts.length - 1

        let node = map.get(currentPath)
        if (!node) {
          node = {
            name: part,
            isFolder: !isLast,
            files: [],
            size: 0,
            status: 'success',
            progress: 0,
          }
          if (isLast) {
            // 是文件
            node.isFolder = false
            node.uid = item.uid
            node.size = item.size
            node.status = item.size > maxSize ? 'error' : 'success'
          } else {
            // 是文件夹
            node.isFolder = true
            node.uid = generateUid()
          }
          map.set(currentPath, node)
          currentLevel.push(node)
        }

        if (node.isFolder) {
          currentLevel = node.files
        }
      }
    }

    // 递归计算文件夹大小
    const calculateFolderSize = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.isFolder) {
          calculateFolderSize(node.files)
          node.size = node.files.reduce((sum: number, file: any) => sum + (file.size || 0), 0)
        }
      }
    }
    calculateFolderSize(tree)

    return tree
  }

  for (const uid of uids) {
    const node = nodeMap.get(uid)
    if (!node) continue

    if (node.isFolder && node._rawItems) {
      // 文件夹
      // 计算父路径前缀长度
      const parentPrefixLen = (node._prefix?.length || 0) - node.name.length - 1

      const relativeItems = node._rawItems.map((item: RawItem) => ({
        ...item,
        path: item.path.substring(Math.max(0, parentPrefixLen)),
      }))

      const tree = buildTree(relativeItems)

      if (tree.length > 0) {
        // 修正根节点的 uid 为选中的 uid
        tree[0].uid = uid
        uploadList.push(tree[0])
      }
    } else if (!node.isFolder && node._rawItem) {
      // 文件
      uploadList.push({
        name: node.name,
        isFolder: false,
        size: node.size,
        status: node.status,
        uid: node.uid,
        progress: 0,
        raw: null,
      })
    }
  }

  self.postMessage({
    type: 'PREPARE_UPLOAD_RESULT',
    id: requestId,
    payload: uploadList,
  })
}
