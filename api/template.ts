import { request } from "@/.cool";

const PREFIX = '/app/template/info'
const CAT_PREFIX = '/app/template/category'

export interface TemplateCategory {
  id: number
  name: string
  value: string
  description: string | null
  sortOrder: number
}

/** 获取启用的模板分类列表 */
export function getCategoryList() {
  return request({
    url: `${CAT_PREFIX}/list`,
    method: 'GET',
    data: { isActive: 1 },
  })
}

export interface TemplateInfo {
  id: number
  title: string
  content: string
  category: string
  tags: string[] | null
  usageTip: string | null
  useCount: number
  collectCount: number
  isAnonymous: number
  sortOrder: number
  isRecommended: number
  isActive: number
  source: number
  auditStatus: number
  createTime: string
  updateTime: string
  isCollected?: boolean
}

export interface TemplateListResult {
  list: TemplateInfo[]
  total: number
  page: number
  size: number
}

export interface TemplateListParams {
  category?: string
  keyword?: string
  sort?: 'hot' | 'new'
  page?: number
  size?: number
}

export function getTemplateList(params: TemplateListParams = {}) {
  return request({
    url: `${PREFIX}/templateList`,
    method: 'GET',
    data: params as Record<string, any>,
  })
}

export function getTemplateDetail(id: number) {
  return request({
    url: `${PREFIX}/${id}`,
    method: 'GET',
  })
}

export function collectTemplate(id: number) {
  return request({
    url: `${PREFIX}/${id}/collect`,
    method: 'POST',
  })
}

export function getCollectedList(page = 1, size = 10) {
  return request({
    url: `${PREFIX}/collected`,
    method: 'GET',
    data: { page, size },
  })
}

export function saveCustomTemplate(data: {
  title?: string
  content: string
  templateId?: number
}) {
  return request({
    url: `${PREFIX}/custom`,
    method: 'POST',
    data,
  })
}
