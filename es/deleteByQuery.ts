import _ from 'lodash'

const ca = require("elasticsearch/src/lib/client_action").makeFactoryWithModifier((spec) => {
  return _.merge(spec, {
    params: {
      filterPath: {
        type: "list",
        name: "filter_path"
      }
    }
  })
})

function deleteByQuery(Client:any, config:any, components:any) {
  Client.deleteByQuery = ca({
    params: {
      analyzer: { type: 'string' },
      consistency: {
        type: 'enum',
        options: [
          'one',
          'quorum',
          'all'
        ]
      },
      defaultOperator: {
        type: 'enum',
        'default': 'OR',
        options: [
          'AND',
          'OR'
        ],
        name: 'default_operator'
      },
      df: { type: 'string' },
      ignoreUnavailable: {
        type: 'boolean',
        name: 'ignore_unavailable'
      },
      allowNoIndices: {
        type: 'boolean',
        name: 'allow_no_indices'
      },
      expandWildcards: {
        type: 'enum',
        'default': 'open',
        options: [
          'open',
          'closed',
          'none',
          'all'
        ],
        name: 'expand_wildcards'
      },
      replication: {
        type: 'enum',
        'default': 'sync',
        options: [
          'sync',
          'async'
        ]
      },
      q: { type: 'string' },
      routing: { type: 'string' },
      timeout: { type: 'time' }
    },
    urls: [
      {
        fmt: '/<%=index%>/<%=type%>/_delete_by_query',
        req: {
          index: { type: 'list' },
          type: { type: 'list' }
        }
      },
      {
        fmt: '/<%=index%>/_delete_by_query',
        req: { index: { type: 'list' } }
      }
    ],
    method: 'POST'
  })
}

export default deleteByQuery