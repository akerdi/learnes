import { call } from '@/lib/callAsync'
import fs from 'fs'


class File {
  openFile(filepath:string, mode="a+") {
    return call<number>(fs.open, filepath, mode)
  }
  async readFile(filed:number, request:{separator?:","|"\n", count?:number}) {
    let contentBuffer:Buffer
    let success = false
    if (request.separator) {
      const separatorSize = 1
      const len = separatorSize
      const separatorValid = [",", "\n"].includes(request.separator)
      if (!separatorValid) throw new Error("请求的separator 不符合规范")
      let totalBuffer = Buffer.alloc(0)
      let breakBuffer = Buffer.from(request.separator)
      try {
        while (true) {
          const readBuffer = Buffer.alloc(separatorSize);
          const [readErr, result] = await call<any>(fs.read, filed, readBuffer, 0, len, null)
          if (readErr) throw readErr
          if (!result.bytesRead) { // EOF
            success = false
            break
          }
          totalBuffer = Buffer.concat([totalBuffer, readBuffer])
          const comareRes = result.buffer.compare(breakBuffer)
          if (comareRes === 0) break // 说明到达break
        }
      } catch (error) {
        throw error
      }
      contentBuffer = totalBuffer
    } else {
      throw new Error("暂不支持")
    }
    return contentBuffer.toString()
  }
}

export default new File
