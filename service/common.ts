import path from 'path'
import assert from 'assert'
import _ from 'lodash'

import ESClient, { ISearch } from '../es/client'

import ChatInfo from '../parser/schema/chatInfo'
import callAsync from '@/lib/callAsync'
import { logger } from '../log'
import File from './file'
import Utils from '../lib/utils'
import Parser from '@/parser/parser'
import { ESFieldSearchType, IESField, getEsType } from '@/parser/schema'

const testFilePath = path.join(process.cwd(), "parser", "test", "chatInfo.txt")

const logInfo = (info:any) => {
  logger.info(info, { label: "SERVICE_COMMON" })
}
const logError = (error:any) => {
  logger.error(error, { label: "SERVICE_COMMON" })
}

interface IBulkBody {
  id?: string|number
  // the document to update
  doc?: any
  // action description
  delete?: any
  // action description
  update?: any
  // the document to index
  [key:string]: any
}
interface IIndex {
  index:string
  type?:string
  shards?: number // 多少个分片 default 1
  replicas?: number // 多少个副本 default 0
  routing_shards?: number
  refresh_interval?: string // 更新时间 default 30s
}
interface IQuery {
  term?: any
  filtered?: {
    filter?: {
      terms?: any
    }
  }
}



export default new class CommonService {
  async testes() {
    const index = "accountsik"
    const type = "persons"
    // await this.testSearch()
    // await this.testIndices()
    // await this.createIndex({index}, ChatInfo)


    // const items = await this.readBCPDataAndSaveES()
    // await this.bulkCreateElement({index}, items)
    // await this.search({index}, {
    //   query: {
    //     match: {
    //       CONTENT: "你"
    //     }
    //   },
    //   size: 10,
    //   from: 0,
    //   _source: ["CONTENT", "FRIEND_ID"],
    //   highlight: {
    //     pre_tags: ["<strong>"],
    //     post_tags: ["</strong>"],
    //     fields: {
    //       CONTENT: {
    //       }
    //     }
    //   }
    // })
    // await this.search({index}, {
    //   query: {
    //     multi_match: {
    //       query: "你",
    //       fields: ["*"]
    //     },
    //   },
    //   _source: ["CONTENT", "FRIEND_ID"]
    // })
    // await this.search({index}, {
    //   query: {
    //     term: {
    //       CONTENT: {
    //         value: "车"
    //       }
    //     }
    //   },
    //   _source: ["CONTENT"],
    //   highlight: {
    //     fields: {
    //       CONTENT: {}
    //     }
    //   }
    // })
    await this.search({index}, {
      query: {
        bool: {
          must: {
            multi_match: {
              query: "草 金子",
              fields: ["CONTENT", "FRIEND_NICKNAME"]
            }
          },
          filter: {
            range: {
              MAIL_SEND_TIME: {
                gte: 1600340189,
                lte: 1600410382
              }
            }
          }
        }
      }
    })


    ///////////////////////
    // await this.testCreateIndexAccountsTypePerson(index, type, {user: "张三",title: "工程师",desc: "数据库管理"})
    // await this.bulkCreateElement({index, type}, [{user: "aker3", title: "hah3", id: 3}, {user: "aker4", title: "hah4", id: 4}])
    // await this.bulkCreateElement({index, type}, [{user: "aker5", title: "hah3 我爱吃水狗"}, {user: "aker6", title: "hah4 我不太爱吃水狗"}, {user: "aker7", title: "hah4 水狗还行，不要贪杯哦，每天一只水狗"}])
    // await this.bulkUpdateElement({index: index, type}, [{user: "aker3", desc: "111", _id: 3, score: 300}, {user: "aker2", desc: "111", _id: 2, score: 200}, {user: "aker4", desc: "111", _id: 4, score: 400}])
    // await this.bulkDeleteElement(index, type, [2])
    // await this.deleteByQuery({index, type}, { term: { title: "2222" } })
    // await this.count({index}, {})
    // await this.simpleSearch({index}, "user:aker2")
    // await this.simpleSearch({index})
    // await this.search({index}, {query: { match: { desc: "111 数据库管理" } }, size: 10 })
    // await this.search({index, type}, {query: {regexp: {desc: "1*"}}, size: 2})
    // await this.search({index, type}, {query: { range: { score: { gte: 200, lte: 400}}}})
    // await this.search({index, type}, { query: {bool: { must: { term: {desc: "111"}}, should: { term: { user: "aker2"}}}}})
  }
  ////////////////////////////////////////////
  // -
  // search
  async search(index:IIndex, searchBody:ISearch) {
    const params:any = {
      index: index.index,
      body: searchBody
    }
    if (index.type) params.type = index.type
    const [err, result] = await callAsync(ESClient.dslSearch(params))
    if (err) return console.error("search err: ", err)
    console.log("search result: ", JSON.stringify(result))
  }
  async simpleSearch(index:IIndex, q?:string) {
    const params:any = { index: index.index }
    if (q) params.q = q
    const [err, result] = await callAsync(ESClient.search(params))
    if (err) return console.error("simpleSearch err: ", err)
    console.log("simpleSearch result: ", JSON.stringify(result))
  }
  // 读取BCP数据
  async readBCPDataAndSaveES() {
    // 先读取文件，一行行读取
    const filePath = testFilePath
    const [err, fd] = await File.openFile(filePath)
    assert.deepEqual(null, err, err)
    let items = []
    for (let i = 0; i < 40; i++) {
      const [err, result] = await callAsync(File.readFile(fd, {separator: "\n"}))
      if (err) throw err
      const parser = new Parser()
      const item = parser.parseBCPLineData(result, ChatInfo)
      items.push(item)
    }
    return items
  }
  // await this.testIndices()
  async testIndices() {
    const [err, result] = await callAsync(ESClient.getAllIndexName())
    if (err) return logError(err)
    console.log("[common.testIndices] result: ", result)
  }
  // 创建es索引
  // await this.createIndex({index}, ChatInfo)
  async createIndex(index:IIndex, fields:IESField[]) {
    const indexSet = {
      index: index.index,
      body: {
        settings: {
          index: {
            number_of_shards: index.shards || 1,
            number_of_replicas: index.replicas || 0,
            number_of_routing_shards: index.routing_shards || 1,
            refresh_interval: index.refresh_interval || "30s"
          }
        } as any,
        mappings: {
          properties: {} as any
        }
      }
    }
    for (const field of fields) {
      const type = getEsType(field)
      if (!type) throw new Error("无法获取ES字段类型: " + field.format)
      indexSet.body.mappings.properties[field.name] = { type }
      // 是否数据进行索引
      if (field.esIndex === false) indexSet.body.mappings.properties[field.name].index = false
      if (type === "date") indexSet.body.mappings.properties[field.name].format = "epoch_second"
      if (field.aggregate) indexSet.body.mappings.properties[field.name].fields = { keyword: { type: "keyword" } }

      if (field.name === "MAIL_SEND_TIME") {
        indexSet.body.settings.index["sort.field"] = field.name
        indexSet.body.settings.index["sort.order"] = "desc"
      }
      if (field.search_type === ESFieldSearchType.fts) {
        indexSet.body.mappings.properties[field.name].analyzer = "ik_max_word"
        indexSet.body.mappings.properties[field.name].search_analyzer = "ik_smart"
      } else if (field.search_type === ESFieldSearchType.both) {
        indexSet.body.mappings.properties[field.name].analyzer = "ik_max_word"
        indexSet.body.mappings.properties[field.name].search_analyzer = "ik_smart"
        indexSet.body.mappings.properties[field.name].fielddata = true
      }
    }

    const [err, result] = await callAsync(ESClient.createIndex(indexSet))
    if (err) return logError(err)
    console.log("=====", result)
  }
  // create 文档，id required
  // await this.testCreateIndexAccountsTypePerson("accounts", "persons", {user: "张三",title: "工程师",desc: "数据库管理"})
  async testCreateIndexAccountsTypePerson(index:string, type:string, data:any) {
    const params = {
      index, type, id: "1",
      body: data
    }
    const [err, result] = await callAsync(ESClient.create(params))
    if (err) return console.error("testCreateIndexAccountsTypePerson err: ", err)
    console.log("testCreateIndexAccountsTypePerson result: ", result)
  }
  // await this.testSearch()
  async testSearch() {
    const [err, result] = await callAsync(ESClient.search({
      index: "bcp_accountinfo_2019",
      body: {
        query: {
          match: { ACCOUNT_ID: "1764314436" }
        }
      }
    }))
    if (err) return logError(err)
    console.log("=====", result.rows)
  }
  // bulk创建文档
  // await this.bulkCreateElement({index: "accounts", type: "persons"}, [{user: "aker2", id: 2}])
  async bulkCreateElement(index:IIndex, datas:IBulkBody[]) {
    const body = []
    for (const d of datas) {
      const indexData:any = { index: { _index: index.index } }
      if (index.type) indexData.index._type = index.type
      if (d._id) indexData.index._id = d._id
      body.push(indexData)
      body.push(d)
    }

    const [err, result] = await callAsync(ESClient.bulk({body}))
    if (err) console.error("bulkEsElement err: ", err)
    console.info("bulkEsElement result: ", JSON.stringify(result))
  }
  // 更新文档
  // await this.bulkUpdateElement({index: "accounts", type: "persons", id: 3}, [{title: "33333", desc: "desssscccc"}])
  async bulkUpdateElement(index:IIndex, datas:IBulkBody[]) {
    const body = []
    for (const d of datas) {
      const indexData:any = { update: { _index: index.index, _type: index.type, _id: d._id} }
      body.push(indexData)
      body.push({doc: _.omit(d, "_id")})
    }

    const [err, result] = await callAsync(ESClient.bulk({body}))
    if (err) console.error("bulkEsElement err: ", err)
    console.info("bulkEsElement result: ", JSON.stringify(result))
  }
  // 删除文档
  async bulkDeleteElement(index:string, type:string, ids:any[]) {
    const body = []
    for (const id of ids) {
      body.push({ delete: { _index: index, _type: type, _id: id } })
    }
    const [err, result] = await callAsync(ESClient.bulk({body}))
    if (err) console.error("bulkDeleteElement err: ", err)
    console.log("bulkDeleteElement result: ", JSON.stringify(result))
  }
  // 根据查询删除
  // await this.deleteByQuery({index, type}, { term: { title: "2222" } })
  async deleteByQuery(index:IIndex, query:IQuery) {
    const params = {
      index: index.index,
      type: index.type,
      body: {
        query
      }
    }
    const [err, result] = await callAsync(ESClient.deleteByQuery(params))
    if (err) return console.error("deleteByQuery err: ", err)
    console.log("deleteByQuery result: ", JSON.stringify(result))
  }
  // await this.count({index}, {})
  async count(index:IIndex, query) {
    const params:any = {
      index: index.index
    }
    if (!_.isEmpty(query)) params.body = { query }
    const [err, result] = await callAsync(ESClient.count(params))
    if (err) return console.error("count err: ", err)
    console.log("count result: ", JSON.stringify(result))
  }
}
