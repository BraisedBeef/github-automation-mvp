export const useInsTableRow = () => {
  // 系统盘
  const handleRowSysDiskName = (row: any) => {
    console.log(`handleRowSysDisk===>`, row)

    const res = row.diskInfos?.find(el => el.type === 1)

    return res ? res.diskTypeName : ''
  }

  // 网络
  const handleRowVpcName = (row: any) => {
    console.log(`handleRowVpcName===>`, row)

    const res = row.networkInfos?.find(el => el.primaryType === 1) // 主网卡

    return res ? res.vpcName : ''
  }

  // 带宽
  const handleRowMainPublicBandwidth = (row: any) => {
    console.log(`handleRowIp===>`, row)

    const res = row.networkInfos?.find(el => el.primaryType === 1) // 主网卡

    return res ? res.mainPublicBandwidth : ''
  }

  return {
    handleRowSysDiskName,
    handleRowVpcName,
    handleRowMainPublicBandwidth,
  }
}
