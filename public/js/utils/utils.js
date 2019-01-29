function updateUrlParams(key, value) {
  const params = window.location.search;
  const paramsObj = {};

  if (params) {
    const paramsArr = params.split("?")[1].split("&").map(p => p.split("="));
    paramsArr.forEach(param => paramsObj[param[0]] = param[1]);
  }

  // add/update param
  paramsObj[key] = value;

  let newParamsString = "";
  Object.keys(paramsObj).forEach(key => {
    newParamsString += `${key}=${paramsObj[key]}&`;
  });

  // update url without reloading page
  const basePath = window.location.origin + window.location.pathname;
  history.pushState({}, "", `${basePath}?${newParamsString.slice(0, -1)}`);
}

export {
  updateUrlParams,
}
