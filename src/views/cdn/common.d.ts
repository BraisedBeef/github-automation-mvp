
export interface Item {
  label: string | number,
  value: string | number,
}

export interface Form {
  area?: number,
  dataAreaType?: number,
  workGroup?: number,
  speedType?: number,
  domain?: number[],
  particle?: number,
  time?: number,
  timeArr1?: [string, string],
  timeArr2?: [string, string],
  http?: number,
  ip?: number,
  operate?: number,
  countArea?: number,
  [x: string]: any,
}

//源站配置表格项及表单项
export interface FromTableData {
  type: number,
  address: string,
  http_port: number,
  https_port: number,
  host: string,
  priority: number,
  weight: number
}
export interface HttpsTableData {
  checked?: boolean,
  id?: string,
  from?: number,
  name: string,
  domain: string,
  timeout: string,
  state?: number
}





export interface CacheRule {
  type: number
  content: any
  priority: number | string
  url_params_status: number
  url_params: any
  cache_status: number
  ttl: number
  ttl_unit: number
}
export type BrowserCacheRule = Omit<CacheRule, 'url_params_status' | 'url_params'>;
export interface HttpStatusRule {
  id: number
  http_status: number
  ttl: number
  ttl_unit: number
}
export interface ZIPconfig {
  status: boolean|number
  algorithm?: number
  file_types?: any
}
export interface AddDomainConfig {
  cache_rules: CacheRule[]
  browser_cache_rules: BrowserCacheRule[]
  back_source_range: {
    status: number
  }
  back_source_follow: {
    status: number
  }
  smart_compress: ZIPconfig
  https_conf: {
    status: number
    certificate_id?: number | string
    new_certificate?: {
      name: string
      content: string
      private_key: string
    }
  }
  ip_freq_limit: {
    status: number
    freq: number
  }
}





export interface RefererConfig {
  status: boolean | number
  type: number
  referer_list: any
  allow_empty: boolean | number
}
export interface IPconfig {
  status: boolean | number
  rule: {
    ip_type: number
    ip_list: any
  }
}
export interface IPfreqConfig {
  status: boolean | number
  freq: number
}
export interface AuthConfig {
  status: boolean | number
  auth_type: number
  auth_range: number
  file_suffix: any
  auth_key: string
  auth_key_backup: string
  auth_parameter: string
  encrypt_manager: number
  valid_time: number
  time_format: number
}
export interface AuthCalcConfig {
  domain_name: string
  auth_type: number
  auth_range: number
  path: string
  auth_key: string
  auth_key_backup: string
  auth_parameter: string
  encrypt_manager: number
  start_time: any
  time_format: number
  valid_time: number
}
export interface AgentConfig {
  status: boolean | number
  rule: {
    type: number,
    agent_list: any
  }
}
export interface RemoteConfig {
  status: boolean | number
  auth_url: string
  req_method: number
  file_type: number
  file_suffix: any
  timeout_duration: number
  timeout_action: number
}
export interface DomainAccessConfig {
  referer_conf: RefererConfig,
  ip_filter_conf: IPconfig,
  ip_frequency_conf: IPfreqConfig,
  auth_conf: AuthConfig,
  user_agent_conf: AgentConfig,
  remote_auth_conf: RemoteConfig
}




export interface StatusCodeRule {
  http_status: number,
  ttl: number|string,
  ttl_unit: number,
  id?: number
}

export interface HttpHead {
  id?: number
  operation: number
  header_name: string
  header_custom?: string
  header_value: string
}

export interface BackRewrite {
  mate_type: number
  source_url: string
  target_url: string
  priority: number
}

export interface URLrewriteItem {
  mate_type: number
  source_url: string
  target_url: string
  priority: number | string |any
}

export interface BackSNIConfig {
  status: boolean | number,
  sni: string
}

export interface CertTableItem {
  cert_id:any
  domain_id: number
  name: string
  domain: string
  dns_names: string[]
  expire_at: number
  create_time: number
  id: number
  cert_name: string
  status: boolean
  create_from: number
  uploadType: number
}

export interface Certificate {
  name: string
  content: string
  private_key: string
}

export type CertificateUpload = {
  domain_id: number | string,
  create_from: number,
  cert_name: string,
  uploadType: number,
  content: string,
  private_key: string,
}






export interface ForceRedirect {
  status: number | boolean
  redirect_type: number
  redriect_code: number
}

export interface HSTSconfig {
  status: number | boolean
  ttl: number
  include_sub_domain_name: number
}

export interface TLSconfig {
  v10: boolean
  v11: boolean
  v12: boolean
  v13: boolean
}

export interface ErrorTableItem {
  id?: number
  error_code: number|''
  redirect_code: number
  redirect_to: string
}