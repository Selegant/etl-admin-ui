import { axios } from '@/utils/request'

const api = {
  kettleJobPageList: 'kettle/job/pageList',
  kettleTransPageList: 'kettle/trans/pageList',
  kettleSyncJob: 'kettle/job/syncJob',
  kettleSyncTrans: 'kettle/trans/syncTrans',
  kettleTruncateJob: 'kettle/job/truncateJob',
  kettleTruncateTrans: 'kettle/trans/truncateTrans',
  kettleJobAndTransDelete: 'kettle/deleteBatchResource',
  kettleJobGenerateParams: 'kettle/job/generateParams',
  collectTimePageList: 'collectTime/pageList',
  repositoryPageList: 'repository/pageList',
  repositoryTestConnection: 'repository/testConnection',
  saveRepository: 'repository/save',
  checkRepository: 'repository/check',
  deleteRepository: 'repository/delete',
  getKettleResourceList: 'kettle/getKettleResourceList',
  syncJobAndTrans: 'kettle/syncJobAndTrans'
}

export default api

export function kettleJobPageList (parameter) {
  return axios({
    url: api.kettleJobPageList,
    method: 'post',
    params: parameter
  })
}

export function collectTimePageList (parameter) {
  return axios({
    url: api.collectTimePageList,
    method: 'post',
    params: parameter
  })
}

export function repositoryPageList (parameter) {
  return axios({
    url: api.repositoryPageList,
    method: 'post',
    params: parameter
  })
}

export function saveRepository (parameter) {
  return axios({
    url: api.saveRepository,
    method: 'post',
    params: parameter
  })
}

export function checkRepository (parameter) {
  return axios({
    url: api.checkRepository,
    method: 'post',
    params: parameter
  })
}

export function deleteRepository (parameter) {
  return axios({
    url: api.deleteRepository,
    method: 'delete',
    params: parameter
  })
}

export function repositoryTestConnection (parameter) {
  return axios({
    url: api.repositoryTestConnection,
    method: 'post',
    params: parameter
  })
}

export function kettleTransPageList (parameter) {
  return axios({
    url: api.kettleTransPageList,
    method: 'post',
    params: parameter
  })
}

export function kettleSyncJob () {
  return axios({
    url: api.kettleSyncJob,
    method: 'post'
  })
}

export function kettleSyncTrans () {
  return axios({
    url: api.kettleSyncTrans,
    method: 'post'
  })
}

export function kettleTruncateJob () {
  return axios({
    url: api.kettleTruncateJob,
    method: 'post'
  })
}

export function kettleTruncateTrans () {
  return axios({
    url: api.kettleTruncateTrans,
    method: 'post'
  })
}

export function kettleJobAndTransDelete (parameter) {
  return axios({
    url: api.kettleJobAndTransDelete,
    method: 'delete',
    params: parameter
  })
}

export function kettleJobGenerateParams (parameter) {
  return axios({
    url: api.kettleJobGenerateParams,
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

export function getKettleResourceList (parameter) {
  return axios({
    url: api.getKettleResourceList + '/' + parameter,
    method: 'get'
  })
}

export function syncJobAndTrans (parameter) {
  return axios({
    url: api.syncJobAndTrans,
    method: 'post',
    data: parameter
  })
}
