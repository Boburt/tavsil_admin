import { DateTime } from 'luxon'
import { atom } from 'recoil'

export const ordersFilterState = atom({
  key: 'ordersFilterState',
  default: {
    search: '',
    status: '',
    dateFrom: DateTime.now().toFormat('yyyy-MM-dd'),
    dateTo: DateTime.now().toFormat('yyyy-MM-dd'),
    sortBy: 'id',
    sortOrder: 'desc',
  },
})
