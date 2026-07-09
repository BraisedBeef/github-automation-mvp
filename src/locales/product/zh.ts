import { appNameMap } from '@/config/base-config'

export default {
  // 概览
  productOverview: {
    cloudServer: '云服务器',
    cloudServerDesc: `云服务器 CVM是基于${appNameMap.zh}多年积累的虚拟化、分布式集群等技术构建的可弹性伸缩云计算服务，同时可搭配镜像、快照、云安全等增值服务，为您提供超高效费比的高性能云服务器。`,
    lightWeightServer: '轻量应用服务器',
    lightWeightServerDesc:
      '轻量应用服务器 （Simple Application Server）是面向中小企业和开发者的新一代开箱即用、适用于轻量应用场景的云服务器。对比云服务器CVM，轻量应用服务器更加简单易用，适合承载轻量业务应用。使用轻量应用服务器，您可以一键轻松完成网站等轻量应用的快速搭建',
    objectStorage: '对象存储',
    objectStorageDesc:
      '对象存储 OSS是一款兼具海量、弹性、安全、稳定特点的公有云产品。为您提供稳定、安全、高效、高可拓展的云存储服务，提供最高可达 99.995 % 的服务可用性。',
    lightWeightObjectStorage: '轻量对象存储',
    lightWeightObjectStorageDesc: `Lighthouse COS 是由${appNameMap.zh}推出的无目录层次结构、无数据格式限制，可容纳海量数据且支持 HTTP/HTTPS 协议访问的分布式存储服务。LighthouseCOS 的存储桶空间无容量上限，无需分区管理，适用于 CDN 数据分发、数据万象处理或大数据计算与分析的数据湖等多种场景。`,
    cloudDemandServer: '云点播',
    cloudDemandServerDesc:
      '云点播 VOD是集视频采集、编辑、上传、媒体资源管理、自动化转码处理（窄带高清TM）、视频审核分析、分发加速于一体的一站式音视频点播解决方案。',
    cdn: '内容分发网络',
    cdnDesc:
      '内容分发网络 CDN（Content Delivery Network）将源站内容分发至遍布全球的加速节点，当用户发起网站资源请求时，请求会被调度至离用户最近的加速节点，由加速节点直接响应用户所需内容，提高用户访问网站资源的响应速度。',
    dns: '云解析DNS',
    dnsDesc:
      '云解析 DNS提供稳定、安全、高效、智能的公网域名解析和内网域名解析服务，将易于管理识别的域名转换为计算机用于互联通信的数字 IP 地址。',
    proviateNetwork: '私有网络',
    proviateNetworkDesc: `私有网络VPC（Virtual Private Cloud）是用户基于${appNameMap.zh}创建的自定义私有网络，不同的专有网络之间二层逻辑隔离，用户可以在自己创建的专有网络内创建和管理云产品实例，比如CVM、负载均衡等。`,
    networkCard: '弹性网卡',
    networkCardDesc:
      '弹性网卡（Elastic Network Interface，ENI）是绑定私有网络内云服务器 的一种弹性网络接口，可在多个云服务器间自由迁移。您可以在云服务器上绑定多个弹性网卡，实现高可用网络方案；也可以在弹性网卡上绑定多个内网 IP，实现单主机多 IP 部署。',
    ip: '弹性公网IP',
    ipDesc:
      '弹性公网 IP（Elastic IP，EIP）是可以独立购买和持有，且在某个地域下固定不变的公网 IP 地址，可以与 CVM、NAT 网关、弹性网卡和高可用虚拟 IP 等云资源绑定，提供访问公网和被公网访问能力；还可与云资源的生命周期解耦合，单独进行操作；同时提供多种计费模式，您可以根据业务特点灵活选择，以降低公网成本。',
    accelerator: `${appNameMap.zh}加速器`,
    acceleratorDesc: '',
    open: '开通服务',
    detail: '了解详情',
    servicesOverview: '服务概览',
    overview: '概览',
    domain: '域名注册',
    domainDesc: `${appNameMap.zh}域名注册是行业领先的域名注册服务提供商, 提供域名注册、域名查询、域名管理为一体的一站式综合服务。服务满足超百万用户的整体需求，为用户提供可靠技术保障全方位护航用户的域名安全。`,
    network: '网络与安全',
    networkDesc:
      '网络与安全是确保云资源高效、安全运行的核心组件。通过灵活的网络配置与精细化的安全控制，基于VPC构建独立的云上网络空间，实现与Internet、云内私网、跨云私网互通。',
    ssl: 'SSL证书',
    sslDesc: `${appNameMap.zh} SSL 证书服务为您提供从申请、管理到部署的全流程支持，助您轻松实现网站 HTTPS 加密，打造安全可靠的在线环境，为您提供高效便捷的一站式安全解决方案。`,
    ossAccountBalanceDesc: '尊敬的用户您好，开通对象存储服务需确保账户余额不少于 {0} 美元，当前余额不足。',
    openOssDesc: '开通时系统会以当前账户余额为准进行可用性确认，各账号首次使用时均需完成开通步骤。',
    goRecharge: '前往充值',
    openFail: '开通失败',
  },
}
