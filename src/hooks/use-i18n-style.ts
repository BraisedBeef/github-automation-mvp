import { useBaseStore } from '@/store'

interface ParamType {
  [key: string]: any
}

const baseStore = useBaseStore()

export const useI18nStyle = (params: ParamType) => {
  const lang = baseStore.lang
  return computed(() => params[lang])
}
