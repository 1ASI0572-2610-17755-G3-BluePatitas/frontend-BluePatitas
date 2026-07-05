importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
// We use the same configuration as our main app.
firebase.initializeApp({
  apiKey: "AIzaSyAXvxStbzvI65fMwuTFsX4wk87n6PIwcqk",
  authDomain: "flowtracknotis.firebaseapp.com",
  projectId: "flowtracknotis",
  storageBucket: "flowtracknotis.firebasestorage.app",
  messagingSenderId: "747649396736",
  appId: "1:747649396736:web:e7237de83e6e5015df28e5",
  measurementId: "G-NH0DMMY729"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  // The system automatically shows a notification if the payload has a 'notification' object.
  // We can customize it here if needed, but the default behavior is usually fine.
});
