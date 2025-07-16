const CACHE_NAME = 'student-search-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './signature.png' // যদি প্রিন্টে ব্যবহার করো
];

// ইনস্টল ইভেন্ট: ক্যাশে ফাইলগুলো যোগ করা
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// ফেচ ইভেন্ট: ক্যাশে ফাইল রিটার্ন বা নেটওয়ার্ক থেকে লোড
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

// আপডেট ইভেন্ট: পুরাতন ক্যাশ ক্লিয়ার করা
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});