import _ from 'lodash'
import elasticsearch from 'elasticsearch'
import deleteByQuery from './deleteByQuery'

import callAsync from '../lib/callAsync'
import { logger } from "../log"

const logInfo = (info:any) => {
  logger.info(info, { label: "ES" })
}
const logError = (error:any) => {
  logger.error(error, { label: "ES" })
}

let defaultClient:elasticsearch.Client = null
const sleep = (ms=10*1000) => {
  return new Promise((resolve) => {
    setTimeout(()=> {
      resolve(true)
    }, ms)
  })
}

class Connection {
  static async createClient(esConf:{host:string, port:string|number, username:string, password:string, requestTimeout?:number, log:any}):Promise<elasticsearch.Client> {
    logInfo(`链接ES数据库: ${esConf.host}:${esConf.port}`)
    const hosts = []
    const esHostSplitArray = esConf.host.split(",")
    for (const item of esHostSplitArray) {
      hosts.push({host: item, port: esConf.port, auth: `${esConf.username}:${esConf.password}`})
    }
    const client = new elasticsearch.Client({
      hosts: hosts,
      sniffOnStart: hosts.length > 1,
      requestTimeout: esConf.requestTimeout || 60*1000,
      log: esConf.log,
      plugins: [deleteByQuery],
      keepAlive: true
    })
    while (true) {
      const [err] = await callAsync(client.ping({}))
      if (!err) break

      logInfo("10s后尝试重连...")
      await sleep(10*1000)
    }
    const body = {
      persistent: {
        "cluster.max_shards_per_node": 5000
      }
    }
    await client.cluster.putSettings({body})
    logInfo("链接ES数据库成功")
    return client
  }
  static async connect(esConf) {
    defaultClient = await Connection.createClient(esConf)
    return defaultClient
  }
  static disconnect() {
    logInfo("断开es链接")
    if (!defaultClient) return
    defaultClient.close()
    defaultClient = null
  }
  static getClient() {
    if (!defaultClient) logError("请在调用connect之后再调用")
    return defaultClient
  }
  static indexPrefix() {
    return "bcp_"
  }
}

export default Connection
