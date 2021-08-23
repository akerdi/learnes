import _ from 'lodash'

import connection from './connection'
import logger from '../log'
import config from '@/config'

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
  static count(params:any) {
    return this.getClient().count(params)
  }
  static async scrollQuery(dsl:any) {

  }
  static async scrollQueryNext(sq:{scrollId:string, scoll:string}) {

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