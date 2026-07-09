import { USER_HABIT } from '@/config/constant-config'
import { _s_getItem } from '@/utils/storage'

export const getHabit = () => _s_getItem(USER_HABIT) || {}
