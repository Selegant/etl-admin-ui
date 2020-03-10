import { axios } from '@/utils/request'

const api = {
  jobGroupPageList: 'jobgroup',
  jobGroupSave: 'jobgroup/save',
  jobGroupRemove: 'jobgroup/remove',
  jobGroupUpdate: 'jobgroup/update'
}

export default api

export function jobGroupPageList (parameter) {
  return axios({
    url: api.jobGroupPageList,
    method: 'get',
    params: parameter
  })
}

export function jobGroupSave (parameter) {
  return axios({
    url: api.jobGroupSave,
    method: 'post',
    params: parameter
  })
}

export function jobGroupRemove (parameter) {
  return axios({
    url: api.jobGroupRemove,
    method: 'post',
    params: parameter
  })
}

export function jobGroupUpdate (parameter) {
  return axios({
    url: api.jobGroupUpdate,
    method: 'post',
    data: parameter
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
