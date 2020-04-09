import { axios } from '@/utils/request'

const api = {
  dataXDatasourcePageList: 'dataX/datasource/pageList',
  testDataSource: 'dataX/testDataSource',
  updateDataSource: 'dataX/updateDataSource',
  saveDataSource: 'dataX/saveDataSource',
  deleteDataSource: 'dataX/deleteDataSource',
  dataXDatasourceList: 'dataX/datasource/list',
  getTables: 'dataX/getTables',
  getColumns: 'dataX/getColumns',
  generateDataXJson: 'dataX/generateDataXJson'
}

export default api

export function dataXDatasourcePageList (parameter) {
  return axios({
    url: api.dataXDatasourcePageList,
    method: 'post',
    params: parameter
  })
}

export function dataXDatasourceList (parameter) {
  return axios({
    url: api.dataXDatasourceList,
    method: 'get',
    params: parameter
  })
}

export function getTables (parameter) {
  return axios({
    url: api.getTables,
    method: 'get',
    params: parameter
  })
}

export function getColumns (parameter) {
  return axios({
    url: api.getColumns,
    method: 'get',
    params: parameter
  })
}

export function generateDataXJson (parameter) {
  return axios({
    url: api.generateDataXJson,
    method: 'post',
    data: parameter
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
