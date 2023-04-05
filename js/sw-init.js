(function() {
  let newWorker;
  let refreshing;

  const url = new URL(window.location.href);
  const debug = Boolean(url.searchParams.get('debug'));

  if(debug) {
    console.log('skipping registering service worker...');
  } else {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').then(reg => {
        reg.addEventListener('updatefound', () => {
          newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if(newWorker.state === 'installed') {
              if(navigator.serviceWorker.controller) {
                window.updateAvailablePrompt(window.runUpdate);
              }
            }
          });
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', function() {
        if(refreshing) return;
        window.location.reload();
        refreshing = true;
      });
    }

    window.runUpdate = function(e) {
      console.log('running update...');
      newWorker.postMessage({ action: 'skipWaiting' });
    }
  }
})();
