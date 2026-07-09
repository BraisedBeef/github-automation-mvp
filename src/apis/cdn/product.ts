import { requestCd as request } from '@/request/http/index'

export const _getAllProducts = () => {
  return request({
    url: '/cdn/consume/fluxPkgs',
    method: 'get',
  })
}

export const _getProductPrice = (params: { pkgId: number; pkgVersion: number; num: number }) => {
  return request({
    url: `/cdn/consume/fluxPkgs/${params.pkgId}/price`,
    method: 'get',
    params,
  })
}
