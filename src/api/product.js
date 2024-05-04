import request from '@/utils/request'

const baseURL = '/product'
// 新增类别
export function createCategory(data) {
  return request({
    url: `${baseURL}/category`,
    method: 'post',
    data: data
  })
}

// 删除类别
export function deleteCategory(categoryId) {
  return request({
    url: `${baseURL}/category/${categoryId}`,
    method: 'delete'
  })
}
// 修改类别
export function updateCategory(data) {
  return request({
    url: `${baseURL}/category`,
    method: 'put',
    data: data
  })
}
// 查询类别列表
export function listCategory(query) {
  return request({
    url: `${baseURL}/category/list`,
    method: 'get',
    params: query
  })
}
// 标签新增
export function createTag(data) {
  return request({
    url: `${baseURL}/tag`,
    method: 'post',
    data: data
  })
}
// 删除标签
export function deleteTag(data) {
  return request({
    url: `${baseURL}/tag`,
    method: 'delete',
    data
  })
}
// 修改标签
export function updateTag(data) {
  return request({
    url: `${baseURL}/tag`,
    method: 'put',
    data: data
  })
}
// 查询标签列表
export function listTag(query) {
  return request({
    url: `${baseURL}/tag/list`,
    method: 'get',
    params: query
  })
}
