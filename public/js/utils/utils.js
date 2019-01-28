function updateUrlParams(key, value) {
  const params = window.location.search;
  const newParams = {};

  if (params) {
    const paramsArr = params.split("?")[1].split("&").map(p => p.split("="));
    paramsArr.forEach(param => newParams[param[0]] = param[1]);
  }

  // add/update param
  newParams[key] = value;

  let newParamsString = "";
  Object.keys(newParams).forEach(key => {
    newParamsString += `${key}=${newParams[key]}&`;
  });

  // update url without reloading page
  const basePath = window.location.origin + window.location.pathname;
  history.pushState({}, "", `${basePath}?${newParamsString.slice(0, -1)}`);
}

export {
  updateUrlParams,
}
