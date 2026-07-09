import forge from 'node-forge'
import { KEYUTIL } from 'jsrsasign'
import { getDateDayjs } from '@/utils/format-time'

export const isCertificateValid = (result: string, type: 'content' | any): { state: boolean; expire_at?: string } => {
  let state
  let expire_at
  if (type == 'content') {
    try {
      const certificate = forge.pki.certificateFromPem(result)
      expire_at = getDateDayjs(certificate.validity.notAfter, 'string') as string
      console.log(expire_at, 'expire_at')
      state = true
    } catch (err: any) {
      try {
        KEYUTIL.getKey(result)
        state = true
      } catch (err) {
        state = false
      }
    }
  } else {
    try {
      const privateKey = forge.pki.privateKeyFromPem(result)
      console.log(privateKey, 'privateKey')
      state = true
    } catch (err) {
      try {
        KEYUTIL.getKey(result)
        state = true
      } catch (error) {
        state = false
      }
    }
  }
  return { state, expire_at }
}
