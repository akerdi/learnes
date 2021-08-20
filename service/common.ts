
import callAsync from '@/lib/callAsync'
import ESClient from '../es/client'
import { logger } from '../log'

const logInfo = (info:any) => {
  logger.info(info, { label: "SERVICE_COMMON" })
}
const logError = (error:any) => {
  logger.error(error, { label: "SERVICE_COMMON" })
}

export default new class CommonService {
  async testes() {
    await this.testIndices()
    await this.testCreateIndexAccountsTypePerson("accounts", "persons", {
      user: "张三",
      title: "工程师",
      desc: "数据库管理"
    })
    await this.testSearch()
  }
  async testIndices() {
    const [err, result] = await callAsync(ESClient.getAllIndexName())
    if (err) return logError(err)
    logInfo(result)
  }
  async testCreateIndexAccountsTypePerson(index:string, type:string, data:any) {
    const params = {
      index: { _index: index, type },
      body: data
    }
    const [err, result] = await callAsync(ESClient.create(params))
    if (err) return logError(err)
    logInfo(result)
  }
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
}