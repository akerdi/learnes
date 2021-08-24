
import config from './config'
import es from './es/connection'
import { logger } from "./log"
import CommonService from './service/common'

console.log("server start.......")

const logInfo = (info:any) => {
  logger.info(info, {label: "APP"})
}
const logError = (error:any) => {
  logger.error(error, {label:"APP"})
}

async function connectES() {
  await es.connect(config.es)
}

async function main() {
  await connectES()
  logInfo("server start...")
  await CommonService.testes()
}

main()
  .catch(e => {
    logError(e.message)
    if (e.code === "ERR_ASSERTION") {
      process.exit(1)
    }
  })