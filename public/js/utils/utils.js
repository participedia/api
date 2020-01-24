function getValueForParam(paramName) {
  const params = window.location.search;
  const newParams = {};

  if (params) {
    params
      .split("?")[1]
      .split("&")
      .map(p => p.split("="))
      .forEach(param => (newParams[param[0]] = param[1]));
  }

  return newParams[paramName];
}

function updateUrlParams(key, value) {
  const params = window.location.search;
  const newParams = {};

  if (params) {
    const paramsArr = params
      .split("?")[1]
      .split("&")
      .map(p => p.split("="));
    paramsArr.forEach(param => (newParams[param[0]] = param[1]));
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

function removeUrlParams(keysToRemove) {
  if (!window.location.search) return;
  const paramsToKeep = {};
  window.location.search
    .split("?")[1]
    .split("&")
    .map(p => p.split("="))
    .forEach(param => {
      if (!keysToRemove.includes(param[0])) {
        paramsToKeep[param[0]] = param[1];
      }
    });

  let newParamsString = "";
  Object.keys(paramsToKeep).forEach(key => {
    newParamsString += `${key}=${paramsToKeep[key]}&`;
  });

  // update url without reloading page
  const basePath = window.location.origin + window.location.pathname;
  history.pushState({}, "", `${basePath}?${newParamsString.slice(0, -1)}`);
}

function xhrReq(action, url, data = {}, successCB = null, errorCB = null) {
  const errorCodes = [500, 400, 401];
  const request = new XMLHttpRequest();
  request.open(action, url, true);
  request.onreadystatechange = () => {
    if (request.readyState === 4 && errorCodes.includes(request.status)) {
      if (errorCB) errorCB(request);
    } else if (request.readyState === 4) {
      if (successCB) successCB(request);
    }
  };
  request.setRequestHeader("Content-Type", "application/json");
  request.send(data);
}

export { removeUrlParams, getValueForParam, updateUrlParams, xhrReq };
