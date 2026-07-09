import SparkMD5 from 'spark-md5'
import { requestCd as requestInstance } from '@/request/http/index'
import COS from 'cos-js-sdk-v5'

// 类型定义
interface UploadResponse {
  neededFileList: number[]
  message?: string
}

interface SliceFileResult {
  chunkList: ArrayBuffer[]
  fileHash: string
}

// 文件大小转换方法
function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  // 处理超出TB范围的情况
  if (i >= sizes.length) {
    return (bytes / Math.pow(k, sizes.length - 1)).toFixed(decimals) + ' ' + sizes[sizes.length - 1]
  }

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

/**
 * @name uploadFile 文件上传方法
 * @param {File} file 目标上传文件
 * @param {number} baseChunkSize 上传分块大小，单位Mb
 * @param {string} uploadUrl 上传文件的后端接口地址
 * @param {string} vertifyUrl 验证文件上传的接口地址
 * @param {string} mergeUrl 请求进行文件合并的接口地址
 * @param {Function} progress_cb 更新上传进度的回调函数
 * @returns {Promise}
 */
async function uploadFile(
  file: File,
  baseChunkSize: number,
  uploadUrl: string,
  vertifyUrl: string,
  mergeUrl: string,
  progress_cb: (progress: number) => void,
): Promise<void> {
  const { chunkList, fileHash } = await sliceFile(file, baseChunkSize)
  console.log(chunkList, fileHash)

  //所有分片 ArrayBuffer[]
  const allChunkList = chunkList
  //需要上传的分片序列 number[]
  let neededChunkList: number[] = chunkList.map((_, index) => index + 1)
  //上传进度
  let progress = 0
  //发送请求,获取文件上传状态
  if (vertifyUrl) {
    const { data } = await requestInstance.post<UploadResponse>(vertifyUrl, {
      fileHash,
      totalCount: allChunkList.length,
      extname: '.' + (file.name.split('.').pop() || ''),
    })
    const { neededFileList, message } = data as UploadResponse
    if (message) console.info(message)
    //无待上传文件，秒传
    if (!neededFileList.length) {
      progress_cb(100)
      return
    }

    //部分上传成功，更新unUploadChunkList
    neededChunkList = neededFileList
  }

  //同步上传进度，断点续传情况下
  progress = ((allChunkList.length - neededChunkList.length) / allChunkList.length) * 100
  //上传
  if (allChunkList.length) {
    const requestList = allChunkList.map(async (chunk, index) => {
      if (neededChunkList.includes(index + 1)) {
        const response = await uploadChunk(chunk, index + 1, fileHash, uploadUrl)
        console.log(response, ' response')

        //更新进度
        progress += Math.ceil(100 / allChunkList.length)
        if (progress >= 100) progress = 100
        progress_cb(progress)
        return response
      }
    })
    // Promise.all(requestList).then(() => {
    //   //发送请求，通知后端进行合并
    //   const fileExt = '.' + (file.name.split('.').pop() || '')
    //   requestInstance.post(mergeUrl, { fileHash, extname: fileExt })
    // })
  }
}

/**
 * 将目标文件分片 并 计算文件Hash
 * @param {File} targetFile 目标上传文件
 * @param {number} baseChunkSize 上传分块大小，单位Mb
 * @returns {chunkList:ArrayBuffer,fileHash:string}
 */
async function sliceFile(targetFile: File, baseChunkSize: number = 1): Promise<SliceFileResult> {
  return new Promise((resolve, reject) => {
    //初始化分片方法
    const blobSlice = File.prototype.slice as (start?: number, end?: number, contentType?: string) => Blob
    //分片大小 baseChunkSize Mb
    const chunkSize = baseChunkSize * 1024 * 1024
    //分片数
    const targetChunkCount = Math.ceil(targetFile.size / chunkSize)
    //当前已执行分片数
    let currentChunkCount = 0
    //当前以收集的分片
    const chunkList: ArrayBuffer[] = []
    //创建sparkMD5对象
    const spark = new SparkMD5.ArrayBuffer()
    //创建文件读取对象
    const fileReader = new FileReader()
    let fileHash: string = ''

    //FilerReader onload事件
    fileReader.onload = e => {
      //当前读取的分块结果 ArrayBuffer
      const curChunk = e.target?.result as ArrayBuffer
      //将当前分块追加到spark对象中
      spark.append(curChunk)
      currentChunkCount++
      chunkList.push(curChunk)
      //判断分块是否全部读取成功
      if (currentChunkCount >= targetChunkCount) {
        //全部读取，获取文件hash
        fileHash = spark.end() as string
        resolve({ chunkList, fileHash })
      } else {
        loadNext()
      }
    }

    //FilerReader onerror事件
    fileReader.onerror = () => {
      reject(null)
    }

    //读取下一个分块
    const loadNext = () => {
      //计算分片的起始位置和终止位置
      const start = chunkSize * currentChunkCount
      let end = start + chunkSize
      if (end > targetFile.size) {
        end = targetFile.size
      }
      //读取文件，触发onLoad
      fileReader.readAsArrayBuffer(blobSlice.call(targetFile, start, end))
    }

    loadNext()
  })
}

/**
 * 上传单个分片
 * @param {ArrayBuffer} chunk 分片数据
 * @param {number} index 分片序号
 * @param {string} fileHash 文件hash
 * @param {string} uploadUrl 上传接口地址
 * @returns {Promise}
 */
async function uploadChunk(chunk: ArrayBuffer, index: number, fileHash: string, uploadUrl: string): Promise<any> {
  const blob = new Blob([chunk])

  return requestInstance.put(uploadUrl, blob, {
    headers: {
      // 明确告知后端这是二进制流
      'Content-Type': 'application/octet-stream',
    },
  })
}

/**
 * URL 安全的 Base64 编码
 * @param {string} str 待编码的字符串
 * @returns {string} URL 安全的 Base64 编码结果
 */
function encodeToSafeBase64(str: string): string {
  // 先使用 btoa 进行标准 Base64 编码（将字符串转为 Base64）
  // 但需要先处理 UTF-8 字符
  const utf8Str = unescape(encodeURIComponent(str))
  const base64Str = btoa(utf8Str)
  // 将标准 Base64 转为 URL 安全 Base64：替换 + / = 为 - _
  return base64Str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * URL 安全 Base64 解码
 * @param {string} str URL 安全的 Base64 编码字符串
 * @returns {string} 解码后的原始字符串
 */
function decodeFromSafeBase64(str: string): string {
  // 将 URL 安全 Base64 恢复为标准 Base64
  let base64Str = str.replace(/-/g, '+').replace(/_/g, '/')
  // 补齐末尾的 = 符号
  const padding = 4 - (base64Str.length % 4)
  if (padding !== 4) {
    base64Str += '='.repeat(padding)
  }
  // 使用 atob 解码
  const utf8Str = atob(base64Str)
  // 处理 UTF-8 字符
  return decodeURIComponent(escape(utf8Str))
}

/**
 * 使用 cos-js-sdk-v5 的 sliceUploadFile 上传单个文件（支持断点续传）
 * @param file File 要上传的文件
 * @param sts 临时凭证对象，支持多种字段结构（data / Credentials / tmpSecretId 等）
 * @param bucket string 存储桶名称（格式应与后端一致）
 * @param region string 地域
 * @param key string 上传到 COS 的对象键（Key）
 * @param onProgress (percent:number)=>void 进度回调（0-100）
 * @returns Promise<any>
 */
async function sliceUploadToCOS(
  file: File,
  sts: any,
  bucket: string,
  region: string,
  key: string,
  onProgress: (percent: number) => void,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const getCred = () => {
      // 兼容不同后端返回结构
      if (!sts) return null
      const cred = sts.Credentials ?? sts.credentials ?? sts
      // 取出三要素
      const TmpSecretId = cred.TmpSecretId ?? cred.tmpSecretId ?? cred.TmpId ?? cred.AccessKeyId ?? cred.AccessKey
      const TmpSecretKey = cred.TmpSecretKey ?? cred.tmpSecretKey ?? cred.SecretAccessKey ?? cred.SecretKey
      const SecurityToken = cred.SecurityToken ?? cred.Token ?? cred.sessionToken ?? cred.session ?? cred.securityToken
      // 兼容可能的起始/过期时间字段（保持原样返回，SDK 接受数值/字符串）
      const StartTime = cred.StartTime ?? cred.startTime ?? cred.StartAt ?? cred.start_at
      const ExpiredTime = cred.ExpiredTime ?? cred.expiredTime ?? cred.ExpiredAt ?? cred.expireTime ?? cred.Expired
      return { TmpSecretId, TmpSecretKey, SecurityToken, StartTime, ExpiredTime }
    }

    const cred = getCred()
    if (!cred || !cred.TmpSecretId || !cred.TmpSecretKey) {
      reject(new Error('无效的临时凭证'))
      return
    }

    const cos = new COS({
      getAuthorization: function (options, callback) {
        // SDK 要求回调提供临时密钥对象，包含可选的 StartTime/ExpiredTime
        const auth: any = {
          TmpSecretId: cred.TmpSecretId,
          TmpSecretKey: cred.TmpSecretKey,
          SecurityToken: cred.SecurityToken,
        }
        if (typeof cred.StartTime !== 'undefined') auth.StartTime = cred.StartTime
        if (typeof cred.ExpiredTime !== 'undefined') auth.ExpiredTime = cred.ExpiredTime
        callback(auth)
      },
    })

    cos.sliceUploadFile(
      {
        Bucket: bucket,
        Region: region,
        Key: key,
        Body: file,
        ChunkSize: 8 * 1024 * 1024, // 切片大小 8MB（可调整）
        onTaskReady: function (taskId) {
          // taskId 可用于后续暂停/恢复
          console.log('onTaskReady taskId=', taskId)
        },
        onProgress: function (info) {
          // info.loaded / info.total
          let percent = 0
          if (typeof info.percent === 'number') {
            percent = Math.min(100, Math.floor(info.percent * 100))
          } else if (info.total) {
            percent = Math.min(100, Math.floor((info.loaded / info.total) * 100))
          }
          onProgress(percent)
        },
      },
      function (err: any, data: any) {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      },
    )
  })
}

export { formatFileSize, uploadFile, encodeToSafeBase64, decodeFromSafeBase64, sliceUploadToCOS }
