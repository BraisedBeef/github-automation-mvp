import t from '@/utils/i18n'
import COS from 'cos-js-sdk-v5'

interface BucketInfo {
  bucketName: string
  region: string
}

interface ExtendedCOS extends COS {
  bucket: BucketInfo
}

let cosInstance: ExtendedCOS | null = null

// 初始化 COS 实例
async function getCosInstance(
  bucketName: string,
  region: string,
  fn: (params: { bucketName: string; region: string }) => Promise<{ code: number; data: any }>,
): Promise<ExtendedCOS> {
  // if (cosInstance) return cosInstance

  const tokenRes = await fn({ bucketName, region })
  if (tokenRes.code !== 200) {
    throw new Error(t('oss.fileList.getUploadCredentialsFailed'))
  }

  const { tmpSecretId, tmpSecretKey, sessionToken, bucketName: _bucketName, region: _region } = tokenRes.data
  cosInstance = new COS({
    SecretId: tmpSecretId,
    SecretKey: tmpSecretKey,
    SecurityToken: sessionToken,
  }) as ExtendedCOS
  const bucket = { bucketName: _bucketName, region: _region }
  // 给 bucket 绑定到 cos 实例上
  cosInstance.bucket = bucket
  return cosInstance
}

export { getCosInstance }
