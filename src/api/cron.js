import { axios } from '@/utils/request'

const api = {
  getCron: 'cron/getCron'
}

export default api

export function getCron () {
  return axios({
    url: api.getCron,
    method: 'get'
  })
}
