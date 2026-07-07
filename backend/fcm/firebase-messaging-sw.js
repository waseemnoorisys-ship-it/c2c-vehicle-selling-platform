importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");

importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({

    apiKey: "AIzaSyCsjq9b6VT0o0n-iMdHEl7K3Xf1xfzwmiU",

    authDomain: "c2c-vehicle-selling-platform.firebaseapp.com",

    projectId: "c2c-vehicle-selling-platform",

    storageBucket: "c2c-vehicle-selling-platform.firebasestorage.app",

    messagingSenderId: "59507233552",

    appId: "1:59507233552:web:2e4f6f4b9ddefc8d938b95"

});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

    console.log("Background Message");

    console.log(payload);

    self.registration.showNotification(

        payload.notification.title,

        {

            body: payload.notification.body,

            icon: "https://firebase.google.com/static/images/brand-guidelines/logo-logomark.png"

        }

    );

});