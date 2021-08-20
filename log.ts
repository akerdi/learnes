import os from 'os'
import moment from 'moment'

const levelName: string[] = ['Fatal','Alert','Critical','Error','Warning','Notice','Info','Debug']

interface ILogOption {
  level?:number,
  message?:string,
  label?:string,
  tags?:string[],
  ipAddr?:string,
  processType?:string
}
export default class Logger {
  _ipAddr: string
  _connected: boolean
  constructor () {
    this._connected = false
    this._ipAddr = this.getIpAddr()
  }
  write (level: number, message:string, options:ILogOption) {
    if (!message) return
    if (!options) options = {}
    const timestamp: string = moment().format('YYYY-MM-DD HH:mm:ss:SSS')
    const tags: string = options.label || options.tags && options.tags.join(',') || ' '

    if (level < 7 || process.env.NODE_ENV == 'dev') {
      console.log(`${timestamp} [${tags}] ${levelName[level]}: ${message}`)
    }

    options.level = level
    options.message = message
    !options.ipAddr && (options.ipAddr = this._ipAddr)
    options.label && (options.tags = [options.label])
  }

  debug (message: string, options?: ILogOption) {
    return this.write(7, message, options)
  }
  info (message: string, options?: ILogOption) {
    return this.write(6, message, options)
  }
  notice (message: string, options?: ILogOption) {
    return this.write(5, message, options)
  }
  warn (message: string, options?: ILogOption) {
    return this.write(4, message, options)
  }
  error (message: string, options?: ILogOption) {
    return this.write(3, message, options)
  }
  critical (message: string, options?: ILogOption) {
    return this.write(2, message, options)
  }
  alert (message: string, options?: ILogOption) {
    return this.write(1, message, options)
  }
  fatal (message: string, options?: ILogOption) {
    return this.write(0, message, options)
  }
  getIpAddr () {
    let ipv6 = ""
    const _ref = os.networkInterfaces()
    for (let k in _ref) {
      const addrs = _ref[k]
      const len = addrs.length
      for (let i = 0; i < len; i++) {
        const addr = addrs[i]
        if (addr.mac !== '00:00:00:00:00:00' && !addr.internal) {
          if (addr.family === 'IPv4') return addr.address
          else ipv6 = addr.address
        }
      }
    }
    return ipv6
  }
}

export const logger = new Logger
