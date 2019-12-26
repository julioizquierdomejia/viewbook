(function (window) {
  window.__env = window.__env || {};
  window.__env.apiUrl = '../../apibeta/public';
  window.__env.baseUrl = '/';
  window.__env.enableDebug = true;
  window.__env.mode = 'dev';
  window.__env.version = '0.8.5';
  window.__env.version_to_url = (window.__env.enableDebug) ? '?version=' + new Date().getTime() : '?v=' + window.__env.version + '.' + new Date().getTime();
}(this));