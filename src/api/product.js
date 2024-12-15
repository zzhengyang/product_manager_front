import request from "@/utils/request";
import config from "@/config";

const baseURL = config.baseAPI;

// 获取产品列表
export function getProductList(tableId) {
  return request({
    url: `${baseURL}/products/list?tableId=${tableId}`,
    method: "get",
  });
}

export function updateArticle(data) {
  return request({
    url: "/vue-element-admin/article/update",
    method: "post",
    data,
  });
}

// 导入产品数据
export function importProducts(data) {
  return request({
    url: `${baseURL}/products/import`,
    method: "post",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// 获取菜单列表
export function getMenuItem() {
  return request({
    url: `${baseURL}/sidebar`,
    method: "get",
  });
}

// 添加菜单项
export function addMenuItem(data) {
  return request({
    url: `${baseURL}/sidebar`,
    method: "post",
    data: {
      id: data.id,
      title: data.title,
      sort: data.sort || 1,
    },
  });
}

// 更新产品信息
export function updateProduct(id, data) {
  return request({
    url: `${baseURL}/products/${id}`,
    method: "put",
    data,
  });
}
