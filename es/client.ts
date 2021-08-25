import _ from 'lodash'

import connection from './connection'

interface IAggres {
  // 单值分析
  min?: {field: string} // 最小值
  max?: {field: string} // 最大值
  avg?: {field: string} // 平均值
  sum?: {field: string} // 總合
  value_count?: {field: string} // 指定欄位的個數
  cardinality?: {field: string} // 基數值，就是不重複的數值的個數，類似 SQL 的 distinct count
  // 多值分析
  stats?: {field: string}
  extended_stats?: {field: string}
  percentiles?: { field: string}
  percentile_ranks?: {field:string, values: number[]}
  top_hits?: { size: number }
  // 桶聚合
  terms?: {field:string, size?:number} // 按照单词分桶
  range?: { // 按照指定区域分桶
    field: string
    // SURPRICE 下面支持多种ts类型聚合
    ranges?: ({to: number}|{from:number, to:number}|{from: number})[]
  }
  date_range?: { // 按照日期分桶
    field: string,
    ranges: ({to:string}|{from:string})[]
  }
  histogram?: { // 按照指定数值作为区间分桶
    field: string
    interval: number
    min_doc_count: number
  }
  date_histogram?: { // 按照指定时间间隔分桶
    field: string
    interval: string // 1周 = 1w [es官网](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-datehistogram-aggregation.html#calendar_intervals)
  }
  // #parent
  derivative?: { buckets_path: string } // 當分出了第一桶之後，第一桶的結果會被拿去和第二桶的結果計算他們的差值，以此類推
  moving_avg?: { buckets_path: string } //用于平滑化数据(CPU负载、RAM使用量等)
  cumulative_sum?: { buckets_path: string } // 用于不断累加每一桶结果
  bucket_sort?: { sort: {[key:string]: { order: string }}[], size?: number } // 排序分桶的结果
  bucket_script?: { // 对多桶或单通的结果进行计算
    buckets_path: {
      [key:string]: string // k为指定参数，v为parent桶参数 .e.g. "TotalSales: 'sales'"
    }
    script: string // 执行操作 .e.g. "params.TotalSales * 2"
  }
  bucket_selector?: { // 按照依照指定的条件取出特定的桶子
    buckets_path: {
      [key:string]: string // 同bucket_script
    }
    script: string // .e.g. "params.TotalSales > 1000"
  }
  // #Sibling
  avg_bucket?: { buckets_path: string } // 計算同級聚合中指定的指標 (Metric) 的平均值
  max_bucket?: { buckets_path: string } // 取得有最大值的桶子
  aggs?: IAggresAny
}

// SURPRICE 支持IAggresAny 和 IAggres 互相嵌套
interface IAggresAny {
  [key:string]: IAggres
}
export interface ISearch {
  aggs?: { // 聚合
    [key:string]: IAggresAny | IAggres
  }
  scroll?: string // 滚动
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
  static refresh(params:any) {
    return this.getClient().indices.refresh(params)
  }
  static deleteIndex(params:any) {
    return this.getClient().indices.delete(params)
  }
}
