
export default class Utils {
  /**
   * 延迟 ms 毫秒
   * @date 2021-02-22
   * @param {any} ms number
   * @returns void | Promise<null>
   */
   static sleep(ms:number):Promise<null>;
   static sleep(ms=1000, cb?:any):any {
     if (cb) return setTimeout(() => {
       cb(null)
     }, ms)
     return new Promise((resolve) => {
       setTimeout(() => {
         resolve(true)
       }, ms)
     })
   }
}
