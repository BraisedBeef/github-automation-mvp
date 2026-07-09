import t from '@/utils/i18n'
export const columns: TableColumn[] = [
  {
    prop: 'domain',
    label: t('columns.domain'),
    minWidth: '15%',
    tooltip: true,
  },
  {
    prop: 'port',
    label: t('columns.port'),
    minWidth: '8%',
    tooltip: false,
  },
  {
    prop: 'protocol',
    label: t('columns.monitorMethod'),
    minWidth: '10%',
    tooltip: false,
  },
  {
    prop: 'monitorType',
    label: t('columns.monitorType'),
    minWidth: '10%',
    tooltip: false,
  },
  {
    prop: 'reportTrigger',
    label: t('columns.alarmRules'),
    minWidth: '14%',
    tooltip: true,
  },
  {
    prop: 'status',
    label: t('columns.status'),
    minWidth: '10%',
    tooltip: false,
  },
  // {
  //   prop: "notice_way",
  //   label: t("columns.noticeMethod"),
  //   minWidth: '16%',
  //   tooltip: true
  // },
  {
    prop: 'handle',
    label: t('columns.operation'),
    // minWidth: '17%',
    width: 250,
    fixed: 'right',
    tooltip: false,
  },
]
