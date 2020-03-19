import { axios } from '@/utils/request'

const api = {
  dashboardInfo: 'dashboardInfo',
  chartInfo: 'chartInfo',
  monitorJobTypeInfo: 'monitor/monitorJobTypeInfo',
  monitorJobExecInfo: 'monitor/monitorJobExecInfo'
}

export default api

export function dashboardInfo () {
  return axios({
    url: api.dashboardInfo,
    method: 'get'
  })
}

export function monitorJobTypeInfo () {
  return axios({
    url: api.monitorJobTypeInfo,
    method: 'get'
  })
}

export function monitorJobExecInfo () {
  return axios({
    url: api.monitorJobExecInfo,
    method: 'get'
  })
}

export function chartInfo (params) {
  return axios({
    url: api.chartInfo,
    method: 'get',
    params: params
  })
}
