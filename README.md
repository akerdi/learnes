# LearnES

本项目主要是为捉急与不知何处可以学习elastic search的练手项目。

涉及点: es索引配置、各个字段类型、搜索类型等的配置；文本读取、解析；Typescript 类型实践

- [ ] 代码优化
- [ ] 使用测试用例而非运行方法来描述
- [ ] 总结知识点

## 注意点

### type为"text"时，使用term搜索

如果name字段是text类型的，原字段经过分词、小写化处理之后，只能匹配到解析之后的单独token，比如使用标准解析器，这个搜索会匹配Accha Baccha、so cute accha baccha或者Accha Baccha Shivam等字段。

也就是term 搜索type 为"text"时，搜索会匹配结巴过的词

[查询重点参考](https://n3xtchen.github.io/n3xtchen/elasticsearch/2017/07/05/elasticsearch-23-useful-query-example)

[参考2](https://blog.csdn.net/abc123lzf/article/details/103034547)

[聚合参考1, 棒👍🏻](https://blog.tienyulin.com/elasticsearch-aggregation/)

[聚合参考2](https://blog.csdn.net/ZYC88888/article/details/104292357)

[聚合参考3](https://blog.csdn.net/fanxing1964/article/details/79365281)
