if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('/sw.js')
      .then(function (registration) {
        console.log('[SesomNod] SW registered:', registration.scope);
      })
      .catch(function (err) {
        console.log('[SesomNod] SW registration failed:', err);
      });
  });
}
