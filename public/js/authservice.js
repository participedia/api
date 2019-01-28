// app.js

window.addEventListener('load', function() {
  let idToken;
  let accessToken;
  let expiresAt;
  if (!location.href.split('#')[0].endsWith('/redirect')){
    localStorage.destURL = location.href;
  }
  var webAuth = new auth0.WebAuth({
    domain: 'participedia.auth0.com',
    clientID: 'lORPmEONgX2K71SX7fk35X5PNZOCaSfU',
    responseType: 'token id_token',
    scope: 'openid profile email picture user_metadata',
    redirectUri: location.origin + "/redirect"
  });

  var loginBtns = document.querySelectorAll('.js-login-button');

  for (let i = 0; i < loginBtns.length; i++){
    loginBtns[i].addEventListener('click', function(e) {
      e.preventDefault();
      webAuth.authorize();
    });
  }

  function logObject(obj){
    Object.keys(obj).forEach( key => console.log('%s: %o', key, obj[key]));
  }

  function handleAuthentication() {
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
          'Error: ' + err.error + '. Check the console for further details.'
        );
      }
    });
  }

  function localLogin(authResult) {
    // Set isLoggedIn flag in localStorage
    localStorage.setItem('isLoggedIn', 'true');
    // Set the time that the access token will expire at
    expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    accessToken = authResult.accessToken;
    idToken = authResult.idToken;
  }

  function renewTokens() {
    webAuth.checkSession({}, (err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        localLogin(authResult);
      } else if (err) {
        alert(
            'Could not get a new token '  + err.error + ':' + err.error_description + '.'
        );
        logout();
      }
      // displayButtons();
    });
  }

  function logout() {
    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem('isLoggedIn');
    // Remove tokens and expiry time
    accessToken = '';
    idToken = '';
    expiresAt = 0;
    document.cookie = 'token=';
    localStorage.destURL = '';
    location.replace('/');
  }

  window.logout = logout;

  function isAuthenticated() {
    // Check whether the current time is past the
    // Access Token's expiry time
    var expiration = parseInt(expiresAt) || 0;
    return localStorage.getItem('isLoggedIn') === 'true' && new Date().getTime() < expiration
  }
  window.isAuthenticated = isAuthenticated;

  if (localStorage.getItem('isLoggedIn') === 'true') {
    renewTokens();
  } else {
    handleAuthentication();
  }
});
