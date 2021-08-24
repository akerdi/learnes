const config = {
  es: {
    host: "",
    port: 9200,
    username: "elastic",
    password: "123456",
    // host: "172.16.60.132",
    // password: "xP4eJ7AEWkyd",
    log: "error",
    replicas: 0,
    split: 'yearly' // 根据采集时间进行索引分隔，可选值为 yearly(年度)，quarterly(季度)，half-year(半年度)。一旦首次部署确定后不能改变。
  }
}

export default config
