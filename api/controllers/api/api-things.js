const parseAPIGetParams = function(req) {
    let params = Object.fromEntries(new URLSearchParams(req.url.split('?')[1]));
    params = {
        ...params,
        skip: params.skip || 0,
        limit: Number(params.limit) ?  Number(params.limit) : 50,
        error: Number(params.limit)  > 200 ? 'Maximum limit is 200`' : null,
        locale: 'en',
        sortKey: params.sort ? params.sort.startsWith('-') ? params.sort.slice(1) : params.sort : null,
        sortOrder: params.sort ? params.sort.startsWith('-') ? 'desc' : 'asc' : null,
    };
    return params;
  };

  module.exports = {
    parseAPIGetParams,
  }