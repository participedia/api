// app.js

window.addEventListener('load', function() {
  let idToken = localStorage['auth0-idToken'];
  let accessToken = localStorage['auth0-accessToken'];
  let expiresAt = localStorage['auth0-expiresAt']

  if (!location.href.split('#')[0].endsWith('/redirect')) {
    localStorage.destURL = location.href;
  }else{
    localStorage.removeItem('isLoggedIn');
  }

  var webAuth = new auth0.WebAuth({
    domain: 'participedia.auth0.com',
    clientID: 'lORPmEONgX2K71SX7fk35X5PNZOCaSfU',
    responseType: 'token id_token',
    scope: 'openid email name',
    redirectUri: location.origin + "/redirect"
  });

  var loginBtns = document.querySelectorAll('.loginButton');

  for (let i = 0; i < loginBtns.length; i++) {
    loginBtns[i].addEventListener('click', function(e) {
      e.preventDefault();
      webAuth.authorize();
    });
  }

  function logObject(obj) {
    if (!obj){
      console.log(obj);
      return;
    }
    Object.keys(obj)
      .forEach(key => console.log('%s: %o', key, obj[key]));
  }

  function handleAuthentication() {
    console.log('handleAuthentication()');
    webAuth.parseHash(function(err, authResult) {
      if (authResult && authResult.accessToken && authResult.idToken) {
        logObject(authResult);
        document.cookie = 'token=' + authResult.idToken;
        window.location.hash = '';
        localLogin(authResult);
        location.replace(localStorage.destURL);
      } else if (err) {
        window.location.hash = '';
        console.log(err);
        logout();
        alert(
          'Error: ' + err.error + '.'
        );
      }
    });
  }

  function localLogin(authResult) {
    console.log('localLogin()');
    logObject(authResult);
    // Set isLoggedIn flag in localStorage
    localStorage.setItem('isLoggedIn', 'true');
    // Set the time that the access token will expire at
    expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date()
      .getTime()
    );
    localStorage['auth0-expiresAt'] = expiresAt;
    accessToken = authResult.accessToken;
    localStorage['auth0-accessToken'] = accessToken;
    idToken = authResult.idToken;
    localStorage['auth0-idToken'] = idToken;
  }

  function renewTokens() {
    console.log('renewTokens()');
    webAuth.checkSession({}, (err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        console.log('checkSession success');
        localLogin(authResult);
      } else if (err) {
        console.error(
          'Could not get a new token ' + err.error + ':' + err.error_description + '.'
        );
//        logout();
     }else{
       console.error('renewTokens failing silently');
     }
      // displayButtons();
    });
  }

  function logout() {
    console.log('logout()');
    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem('isLoggedIn');
    // Remove tokens and expiry time
    accessToken = '';
    idToken = '';
    expiresAt = 0;
    document.cookie = 'token=;expires=0';
    localStorage.destURL = '';
    localStorage.removeItem('auth0-accessToken');
    localStorage.removeItem('auth0-idToken');
    localStorage.removeItem('auth0-expiresAt');
    location.replace('/');
  }

  window.logout = logout;

  function isAuthenticated() {
    console.log('isAuthenticated()');
    // Check whether the current time is past the
    // Access Token's expiry time
    var expiration = parseInt(expiresAt || 0);
    return localStorage.getItem('isLoggedIn') === 'true' && new Date()
      .getTime() < expiration
  }
  window.isAuthenticated = isAuthenticated;

  if (localStorage.getItem('isLoggedIn') === 'true') {
    renewTokens();
  } else {
    handleAuthentication();
  }
});
