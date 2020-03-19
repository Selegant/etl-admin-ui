import { axios } from '@/utils/request'

const api = {
  jobInfoPageList: 'jobinfo/pageList',
  jobInfoSelectList: 'jobinfo/selectInfo',
  jobInfoUpdate: 'jobinfo/update',
  jobStart: 'jobinfo/start',
  jobInfoAdd: 'jobinfo/add',
  jobDelete: 'jobinfo/remove',
  jobStop: 'jobinfo/stop',
  jobTrigger: 'jobinfo/trigger',
  jobNextTriggerTime: 'jobinfo/nextTriggerTime',
  jobList: 'jobinfo/list'
}

export default api

export function getJobInfoPageList (parameter) {
  return axios({
    url: api.jobInfoPageList,
    method: 'post',
    params: parameter
  })
}

export function jobList () {
  return axios({
    url: api.jobList,
    method: 'get'
  })
}

export function getJobInfoSelectList (parameter) {
  return axios({
    url: api.jobInfoSelectList,
    method: 'get',
    params: parameter
  })
}

export function jobInfoUpdate (parameter) {
  return axios({
    url: api.jobInfoUpdate,
    method: 'post',
    data: parameter
  })
}

export function jobStart (parameter) {
  return axios({
    url: api.jobStart,
    method: 'post',
    params: parameter
  })
}

export function jobTrigger (parameter) {
  return axios({
    url: api.jobTrigger,
    method: 'post',
    params: parameter
  })
}

export function jobStop (parameter) {
  return axios({
    url: api.jobStop,
    method: 'post',
    params: parameter
  })
}

export function jobDelete (parameter) {
  return axios({
    url: api.jobDelete,
    method: 'post',
    params: parameter
  })
}

export function jobNextTriggerTime (parameter) {
  return axios({
    url: api.jobNextTriggerTime,
    method: 'post',
    params: parameter
  })
}

export function jobInfoAdd (parameter) {
  return axios({
    url: api.jobInfoAdd,
    method: 'post',
    data: parameter
  })
}

// id == 0 add     post
// id != 0 update  put
export function saveService (parameter) {
  return axios({
    url: api.service,
    method: parameter.id === 0 ? 'post' : 'put',
    data: parameter
  })
}
