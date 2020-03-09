import { axios } from '@/utils/request'

const api = {
  jobGroupPageList: 'jobgroup',
  jobInfoSelectList: 'jobinfo/selectInfo'
}

export default api

export function jobGroupPageList (parameter) {
  return axios({
    url: api.jobGroupPageList,
    method: 'get',
    params: parameter
  })
}

export function getJobInfoSelectList (parameter) {
  return axios({
    url: api.jobInfoSelectList,
    method: 'get',
    params: parameter
  })
}

export function getServiceList (parameter) {
  return axios({
    url: api.service,
    method: 'get',
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
