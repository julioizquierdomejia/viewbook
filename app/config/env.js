(function (window) {
  window.__env = window.__env || {};
  window.__env.apiUrl = '../../apibeta/public';
  window.__env.baseUrl = '/';
  window.__env.enableDebug = true;
  window.__env.version = '0.8.1';
	window.__env.version_to_url = (window.__env.enableDebug) ? '?version=' + new Date().getTime() : '?version=' + window.__env.version; 
}(this));
