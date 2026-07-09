import { Form } from './type'
import t from '@/utils/i18n'
export const btnsGroupList = [
  {
    label: t('networkCard.bindExistingNetworkCard'),
    value: 1,
  },
  {
    label: t('networkCard.addAndBindNetworkCard'),
    value: 2,
  },
]

export const initCreateForm: Form = {
  regionId: NaN,
  zoneId: NaN,
  name: '',
  vpcId: '',
  subnetId: '',
  securityGroupId: '',
  primaryIpType: 1,
  primaryIp: '',
}
