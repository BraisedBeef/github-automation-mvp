import { appNameMap } from '@/config/base-config'

export default {
  // 概览
  productOverview: {
    cloudServer: 'Cloud Server',
    cloudServerDesc: `Cloud Server CVM is a scalable cloud computing service built on the virtualization and distributed cluster technologies accumulated by ${appNameMap.en} over the years. It can also be equipped with value-added services such as images, snapshots, and cloud security to provide you with high-performance cloud servers with high cost performance.`,
    lightWeightServer: 'Lightweight Application Server',
    lightWeightServerDesc:
      'Lightweight Application Server (Simple Application Server) is a new generation of out-of-the-box cloud server for small and medium-sized enterprises and developers, suitable for lightweight application scenarios. Compared with cloud server CVM, the Lightweight Application Server is simpler and easier to use, suitable for carrying lightweight business applications. Using the Lightweight Application Server, you can easily set up lightweight applications such as websites with one click.',
    objectStorage: 'Object Storage',
    objectStorageDesc:
      'Object Storage OSS is a public cloud product with massive, elastic, safe, and stable characteristics. It provides you with stable, secure, efficient, and highly scalable cloud storage services, with a service availability of up to 99.995%.',
    lightWeightObjectStorage: 'Lightweight Object Storage',
    lightWeightObjectStorageDesc: `Lighthouse COS is a distributed storage service launched by ${appNameMap.en}, featuring no directory hierarchy, no data format restrictions, capable of accommodating massive amounts of data, and supporting HTTP/HTTPS protocol access. The storage bucket space of Lighthouse COS has no capacity limit and requires no partition management. It is suitable for various scenarios such as CDN data distribution, data processing, or big data computing and analysis data lakes.`,
    cloudDemandServer: 'Cloud on-Demand',
    cloudDemandServerDesc:
      'Cloud on-Demand VOD is an all-in-one audio and video on-demand solution that integrates video collection, editing, uploading, media resource management, automated transcoding (Narrowband HD™), video review analysis, and distribution acceleration.',
    cdn: 'Content Delivery Network',
    cdnDesc:
      'Content Delivery Network (CDN) distributes origin content to acceleration nodes around the world. When a user initiates a website resource request, the request is routed to the nearest acceleration node to the user, and the acceleration node directly responds with the content required by the user, improving the response speed for user access to website resources.',
    dns: 'Cloud DNS',
    dnsDesc:
      'Cloud DNS provides stable, secure, efficient, and intelligent public domain name resolution and private domain name resolution services, converting easy-to-manage and recognizable domain names into digital IP addresses used for intercommunication between computers.',
    proviateNetwork: 'Private Network',
    proviateNetworkDesc: `Private Network VPC (Virtual Private Cloud) is a custom private network created by users based on ${appNameMap.en}. Different private networks are logically isolated at the second layer. Users can create and manage cloud product instances such as CVM and load balancing within their created private networks.`,
    networkCard: 'Elastic Network Card',
    networkCardDesc:
      'An elastic network interface (ENI) is an elastic network interface that is bound to a cloud server in a private network and can be freely migrated between multiple cloud servers. You can bind multiple elastic network interfaces to a cloud server to implement a high-availability network solution; you can also bind multiple intranet IP addresses to an elastic network interface to implement multi-IP deployment on a single host.',
    ip: 'Elastic Public IP',
    ipDesc:
      'Elastic IP (EIP) is a public IP address that can be purchased and held independently and is fixed in a certain region. It can be bound to cloud resources such as CVM, NAT gateway, elastic network card and high-availability virtual IP to provide the ability to access and be accessed by the public network. It can also be decoupled from the life cycle of cloud resources and operated independently. At the same time, it provides multiple billing modes, and you can flexibly choose according to business characteristics to reduce public network costs.',
    accelerator: `${appNameMap.en} Accelerator`,
    acceleratorDesc: '',
    open: 'Activate Service',
    detail: 'Learn More',
    servicesOverview: 'Services Overview',
    overview: 'Overview',
    domain: 'Domain Registration',
    domainDesc: `${appNameMap.en} Domain Registration is an industry-leading domain registration service provider, offering an all-in-one comprehensive service for domain registration, domain query, and domain management. The service meets the overall needs of millions of users, providing reliable technical support to ensure domain security comprehensively.`,
    network: 'Network and Security',
    networkDesc:
      'Network and security are core components for ensuring the efficient and secure operation of cloud resources. Through flexible network configurations and fine-grained security controls, independent cloud network spaces are built based on VPC, enabling interconnection with the Internet, internal private networks, and cross-cloud private networks.',
    ssl: 'SSL Certificate',
    sslDesc: `${appNameMap.en} SSL certificate service provides you with full-process support from application, management to deployment. It helps you easily implement HTTPS encryption for your website, creating a secure and reliable online environment, and provides you with an efficient and convenient one-stop security solution.`,
    ossAccountBalanceDesc:
      'Dear user, to activate the Object Storage Service, please ensure your account balance is no less than {0} USD. Your current balance is insufficient.',
    openOssDesc:
      'During activation, the system will verify availability based on your current account balance. Each account must complete the activation process before first use.',
    goRecharge: 'Go to Recharge',
    openFail: 'Activation Failed',
  },
}
