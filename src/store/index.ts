import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persistedstate'

// 统一导出
import useBaseStore from './base'
import useTempStore from './temp'
import useUserStore from './user'
import useSubUserCreateStore from './sub-user-create'
import useLoginStore from './login'
import useCvmStore from './cvm'
import useCvmInsCreateStore from './cvm-ins-create'
import useNetworkStore from './network'
import useCvmInsFastCreateStore from './cvm-ins-fast-create'
import usePermissionStore from './permission'
import useOssStore from './oss'

const store = createPinia()
store.use(piniaPersist)

export {
  useBaseStore,
  useTempStore,
  useUserStore,
  useSubUserCreateStore,
  useLoginStore,
  useCvmStore,
  useCvmInsCreateStore,
  useNetworkStore,
  useCvmInsFastCreateStore,
  usePermissionStore,
  useOssStore,
}
export default store
