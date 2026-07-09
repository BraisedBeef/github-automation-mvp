import t from '@/utils/i18n'

export const ipOptions = [
  { label: t('networkCard.automaticAssign'), value: 1 },
  { label: t('networkCard.manualAssign'), value: 2 },
]

export const initForm = {
  name: '',
  regionId: 0,
  zoneId: '',
  vpcId: '',
  subnetId: '',
  securityGroupId: '',
  primaryIp: '',
  primaryIpType: 1,
}

export const ipv4Pattern =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
