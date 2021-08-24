import _ from "lodash"
import Events from 'events'
const EventEmitter = Events.EventEmitter

class Parser extends EventEmitter {
  _stop:boolean
  _pause:boolean
  constructor() {
    super()
    this._stop = false
    this._pause = false
  }
  stop() {
    this._stop = true
  }
  pause() {
    this._pause = true
  }
  resume() {
    this._pause = false
  }
  parse(bcpPath:string) {

  }
  // row: content
  // field: [{name:xxx,format:xxx,desc:xxx ...}]
  parseBCPLineData(row:string, fields:any) {
    const colSep = "\t"
    const cols = _.split(row, colSep)
    const item = {}
    for (let i=0; i < cols.length; i++) {
      const x = cols[i]
      const field = fields[i]
      const key = field.name
      item[key] = _.trim(x)
      if (field?.timestamp || field.format.startsWith("n")) {
        if (!(item[key] && Number(item[key]) >= 0)) {
          this.emit("validate_error", {key, value: item[key], format: field.forrmat, row: row})
          item[key] = 0
        }
      }
    }
    this.emit("data", item)
    return item
  }
}

export default Parser
