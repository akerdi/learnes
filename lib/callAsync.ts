import util from 'util'

export function callAsync<T, U = any>(promise: Promise<T>): Promise<[U | null, T | null]> {
  return promise
      .then<[null, T]>((data: T) => [null, data])
      .catch<[U, null]>(err => [err, null])
}

export function call<T, U = any>(func: Function, ...args: any[]): Promise<[U | null, T | null]> {
  const promise = util.promisify(func).call(this, ...args)
  // promise is object type
  if (typeof promise !== 'object') {
    return Promise.reject('func should match util.promisify')
  }
  const _promise = promise as Promise<any>
  return callAsync<T, U>(_promise)
}

export default callAsync