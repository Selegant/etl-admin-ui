import { axios } from '@/utils/request'

const api = {
  dashboardInfo: 'dashboardInfo',
  chartInfo: 'chartInfo',
  monitorJobTypeInfo: 'monitor/monitorJobTypeInfo',
  monitorJobExecInfo: 'monitor/monitorJobExecInfo',
  monitorTaskExecInfo: 'monitor/monitorTaskExecInfo',
  monitorJobStatusInfo: 'monitor/monitorJobStatusInfo'
}

export default api

export function dashboardInfo () {
  return axios({
    url: api.dashboardInfo,
    method: 'get'
  })
}

export function monitorJobStatusInfo () {
  return axios({
    url: api.monitorJobStatusInfo,
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

export function monitorTaskExecInfo (params) {
  return axios({
    url: api.monitorTaskExecInfo,
    method: 'get',
    params: params
  })
}

export function chartInfo (params) {
  return axios({
    url: api.chartInfo,
    method: 'get',
    params: params
  })
}
