var CACHE_NAME = 'version-1'; // bump this version when you make changes.
// Put all your urls that you want to cache in this array
var urlsToCache = [
    'index.html',
    'assets/pageicon.png'
];

// Install the service worker and open the cache and add files mentioned in array to cache
self.addEventListener('install', function(event) {
    event.waitUntil(
    caches.open(CACHE_NAME)
        .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
        })
    );
});


// keep fetching the requests from the user
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            // Cache hit - return response
            if (response) return response;

            if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
                return fetch('/');
            }

            return fetch(event.request);
        })
    );
});

self.addEventListener('activate', function(event) {
    var cacheWhitelist = []; // add cache names which you do not want to delete
    cacheWhitelist.push(CACHE_NAME);
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
        return Promise.all(
            cacheNames.map(function(cacheName) {
                if (!cacheWhitelist.includes(cacheName)) {
                    return caches.delete(cacheName);
                }
            })
        );
        })
    );
});

// NOTIFICATIONS
// Please go through https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications#push_api to understand this properly
// You can check https://github.com/saurabhdaware/pwainit-node-pushapi for server-side code

// Listens to push events from server.
self.addEventListener('push', function(e) {
    const dataFromServer = e.data.json(); // or your can add e.data.text() and pass text data from server

    var options = {
            body: dataFromServer.body,
            icon: 'assets/generalicon.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                // primaryKey: '2'
            },
            actions:[
                {action: 'github', title: 'Open Github Repo', icon: 'images/checkmark.png'},
                {action: 'close', title: 'Close notification', icon: 'images/xmark.png'},
            ]
    };
    e.waitUntil(
        self.registration.showNotification(dataFromServer.title, options)
    );
});

self.addEventListener('notificationclick', function(e) {
    var notification = e.notification;
    var primaryKey = notification.data.primaryKey;
    var action = e.action;

    if (action === 'close') {
        notification.close();
    }else if(action == 'github'){
        clients.openWindow('https://github.com/saurabhdaware/pwainit')
        notification.close();
    }else {
        console.log('..')
        notification.close();
    }
});
