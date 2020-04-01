import { axios } from '@/utils/request'

const api = {
  dataXDatasourcePageList: 'dataX/datasource/pageList',
  testDataSource: 'dataX/testDataSource',
  updateDataSource: 'dataX/updateDataSource',
  saveDataSource: 'dataX/saveDataSource',
  deleteDataSource: 'dataX/deleteDataSource'
}

export default api

export function dataXDatasourcePageList (parameter) {
  return axios({
    url: api.dataXDatasourcePageList,
    method: 'post',
    params: parameter
  })
}

export function testDataSource (parameter) {
  return axios({
    url: api.testDataSource,
    method: 'post',
    data: parameter
  })
}

export function updateDataSource (parameter) {
  return axios({
    url: api.updateDataSource,
    method: 'post',
    data: parameter
  })
}

export function saveDataSource (parameter) {
  return axios({
    url: api.saveDataSource,
    method: 'post',
    data: parameter
  })
}

export function deleteDataSource (parameter) {
  return axios({
    url: api.deleteDataSource,
    method: 'delete',
    params: parameter
  })
}
