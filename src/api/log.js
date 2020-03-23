import { axios } from '@/utils/request'

const api = {
  jobLogPageList: 'joblog/pageList',
  jobInfoSelectList: 'jobinfo/selectInfo',
  jobLogDetailCat: 'joblog/logDetailCat',
  getUnReadCount: 'joblog/getUnReadCount',
  readLog: 'joblog/readLog',
  readBatchLog: 'joblog/readBatchLog'
}

export default api

export function getJobLogPageList (parameter) {
  return axios({
    url: api.jobLogPageList,
    method: 'get',
    params: parameter
  })
}

export function readBatchLog (parameter) {
  return axios({
    url: api.readBatchLog,
    method: 'post',
    params: parameter
  })
}

export function readLog (parameter) {
  return axios({
    url: api.readLog,
    method: 'put',
    params: parameter
  })
}

export function getUnReadCount () {
  return axios({
    url: api.getUnReadCount,
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

export function jobLogDetailCat (parameter) {
  return axios({
    url: api.jobLogDetailCat,
    method: 'post',
    params: parameter
  })
}

export function getPermissions (parameter) {
  return axios({
    url: api.permissionNoPager,
    method: 'get',
    params: parameter
  })
}

export function getOrgTree (parameter) {
  return axios({
    url: api.orgTree,
    method: 'get',
    params: parameter
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
