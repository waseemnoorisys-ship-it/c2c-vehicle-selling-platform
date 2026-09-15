import { saveFcmToken } from "../api/user.api";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCsjq9b6VT0o0n-iMdHEl7K3Xf1xfzwmiU",
  authDomain: "c2c-vehicle-selling-platform.firebaseapp.com",
  projectId: "c2c-vehicle-selling-platform",
  storageBucket: "c2c-vehicle-selling-platform.firebasestorage.app",
  messagingSenderId: "59507233552",
  appId: "1:59507233552:web:2e4f6f4b9ddefc8d938b95",
};

let isInitializing = false;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export async function requestAndSaveFcmToken() {
  if (isInitializing) return;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    console.log("[FCM] Push notifications not supported on this browser.");
    return;
  }

  isInitializing = true;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("[FCM] Notification permission denied by user.");
      return;
    }

    // Load Firebase compat scripts dynamically
    if (!window.firebase) {
      await loadScript("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
      await loadScript("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");
    }

    if (!window.firebase.apps?.length) {
      window.firebase.initializeApp(FIREBASE_CONFIG);
    }

    const messaging = window.firebase.messaging();

    // Register service worker
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    const token = await messaging.getToken({
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("[FCM] FCM Token generated for device:", token.slice(0, 15) + "...");
      await saveFcmToken(token);
    }
  } catch (err) {
    console.warn("[FCM] FCM initialization / token save warning:", err.message || err);
  } finally {
    isInitializing = false;
  }
}
