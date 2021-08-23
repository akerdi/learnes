
import callAsync from '@/lib/callAsync'
import _ from 'lodash'
import ESClient from '../es/client'
import { logger } from '../log'

const logInfo = (info:any) => {
  logger.info(info, { label: "SERVICE_COMMON" })
}
const logError = (error:any) => {
  logger.error(error, { label: "SERVICE_COMMON" })
}

interface IBulkBody {
  index?: {
    _index: string
    _type: string
  }
  _id?: string|number
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
  index:string, type:string
}

export default new class CommonService {
  async testes() {
    // await this.testSearch()
    // await this.testIndices()
    // await this.testCreateIndexAccountsTypePerson("accounts", "persons", {user: "张三",title: "工程师",desc: "数据库管理"})

    // await this.bulkCreateElement({index: "accounts", type: "persons", id: 3}, [{user: "aker2", title: "hah"}])
    // await this.bulkUpdateElement({index: "accounts", type: "persons"}, [{user: "aker3", id: 3}])
    // await this.bulkDeleteElement("accounts", "persons", [2])
  }
  ////////////////////////////////////////////
  // -
  // await this.testIndices()
  async testIndices() {
    const [err, result] = await callAsync(ESClient.getAllIndexName())
    if (err) return logError(err)
    console.log("[common.testIndices] result: ", result)
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
      const indexData:any = { index: { _index: index.index, _type: index.type } }
      if (d.id) indexData.index._id = d.id
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
      const indexData:any = { update: { _index: index.index, _type: index.type, _id: d.id} }
      body.push(indexData)
      body.push({doc: _.omit(d, "id")})
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
}