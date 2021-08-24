[查询重点参考](https://n3xtchen.github.io/n3xtchen/elasticsearch/2017/07/05/elasticsearch-23-useful-query-example)
[参考2](https://blog.csdn.net/abc123lzf/article/details/103034547)


## 注意点

### type为"text"时，使用term搜索

如果name字段是text类型的，原字段经过分词、小写化处理之后，只能匹配到解析之后的单独token，比如使用标准解析器，这个搜索会匹配Accha Baccha、so cute accha baccha或者Accha Baccha Shivam等字段。

也就是term 搜索type 为"text"时，搜索会匹配结巴过的词