const admin = require("../../config/firebase");
const logger = require("../../config/logger");
// Take an FCM token + notification details → send them to Firebase → Firebase delivers the notification to the user's mobile device.
async function sendPushNotification({ fcmToken, title, body, data }) {
  if (!fcmToken) return;
//EXAMPLE
//   await sendPushNotification({
//     fcmToken:"fcm_abcd123456",
//     title:"Listing Approved",
//     body:"Your BMW listing has been approved.",
//     data:{
//         listingId:"123",
//         type:"listingApproved"
//     }
// })
  try {
    const message = {
      token: fcmToken,
      notification: { title, body },
      data: data
        ? Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, String(v)])
          )
        : {},
    };

    const response = await admin.messaging().send(message);
    logger.info("Push notification sent", { response });
  } catch (err) {
    logger.error("Push notification failed", { fcmToken, err: err.message });
  }
}

module.exports = { sendPushNotification };