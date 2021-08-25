import _ from 'lodash'

import connection from './connection'
import logger from '../log'
import config from '@/config'

export interface ISearch {
  query?: {
    match?: any
    bool?: {
      must?: any // 必须查询的条件
      must_not?: any // 查询条件会被过滤
      should?: any // 文档可以匹配也可以不匹配，匹配的文档评分会更高
      filter?: any // 和must类似，不同的是filter中的条件不会参与评分
    },
    multi_match?: { // match升级版，可用于多个字段搜索
      query?: string // "apple"
      fields?: string[] // 查询字段
      operator?: "or" | "and"
    }
    term?: {
      [key:string]: any
    }
    regexp?: { // 正则搜索
      [key:string]: any
    }
    range?: { // 检索指定范围内的文档
      [key:string]: {
        gte: number
        lte: number
      }
    }
    fuzzy?: { // 检索用于此项的近似检索，例如applx 可以检索出包含apple 的文档
      [key:string]: any
    }
    aggs?: { // 聚合
      [key:string]: any
    }
  }
  from?: number // offset
  size?: number // 搜索大小
  _source?: string[] // 指定返回字段
  highlight?: {
    pre_tags?: string[] // ["<b>"]
    post_tags?: string[] // ["</b>"]
    fields: {
      [key:string]: {
        pre_tags?: string[] // ["<b>"]
        post_tags?: string[] // ["</b>"]
        fragment_size?: number // 150
        number_of_fragments?: number // 1
      }
    }
  }
}


export default class ESClient {
  static getClient() {
    return connection.getClient()
  }
  static getAllIndexName(index="*") {
    return this.getClient().indices.stats({ index })
  }
  static createIndex(params:any) {
    return this.getClient().indices.create(params)
  }
  static get(params:any) {
    return this.getClient().indices.get(params)
  }


  static getById(params:any) {
    return this.getClient().get(params)
  }
  static getByIds(params:any) {
    return this.getClient().mget(params)
  }

  static create(params:{index:string, type:string, id?:string, body:any}) {
    return this.getClient().create(params)
  }
  static bulk(params:any) {
    return this.getClient().bulk(params)
  }
  static delete(params:any) {
    return this.getClient().delete(params)
  }
  static deleteByQuery(params:any) {
    return this.getClient().deleteByQuery(params)
  }
  static updateByQuery(params:any) {
    return this.getClient().updateByQuery(params)
  }
  static async search(params:any) {
    const result = await this.getClient().search(params)
    const rows = []
    for (const hit of result.hits.hits) {
      rows.push(hit._source)
    }
    const ret = {
      count: result.hits.total.valueOf,
      rows: rows,
      aggregations: null as any
    }
    if (result.aggregations) ret.aggregations = result.aggregations
    return ret
  }
  static dslSearch(params:ISearch) {
    return this.getClient().search(params)
  }
  static count(params:any) {
    return this.getClient().count(params)
  }
  static async scrollQueryNext(sq:{scrollId:string, scroll:string}) {
    return this.getClient().scroll(sq)
  }
  static async clearScroll(scrollId:string) {

  }
  static refresh(params:any) {
    return this.getClient().indices.refresh(params)
  }
  static deleteIndex(params:any) {
    return this.getClient().indices.delete(params)
  }

}