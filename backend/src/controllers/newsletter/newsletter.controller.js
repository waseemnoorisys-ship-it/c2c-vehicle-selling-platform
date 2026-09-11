const NewsletterSubscriber = require("../../models/newsletterSubscriber/newsletterSubscriber.model");
const { sendEmail } = require("../../services/email/email.service");
const ApiError = require("../../utils/ApiError");

async function subscribe(req, res, next) {
  try {
    const { email } = req.body;

    const existing = await NewsletterSubscriber.findOne({ email });

    if (existing) {
      if (existing.isActive) {
        return next(
          new ApiError(400, "This email address is already subscribed to our newsletter.")
        );
      }

      existing.isActive = true;
      existing.unsubscribedAt = null;
      await existing.save();

      // Send welcome email asynchronously
      sendEmail({
        to: email,
        templateName: "newsletterWelcome",
        data: { email },
      });

      return res.status(200).json({
        success: true,
        message: "Welcome back! Your newsletter subscription has been reactivated.",
      });
    }

    await NewsletterSubscriber.create({ email });

    // Send welcome email asynchronously
    sendEmail({
      to: email,
      templateName: "newsletterWelcome",
      data: { email },
    });

    return res.status(201).json({
      success: true,
      message: "Thank you for subscribing! A welcome email has been sent to your inbox.",
    });
  } catch (err) {
    next(err);
  }
}

async function unsubscribe(req, res, next) {
  try {
    const { email } = req.body;

    const subscriber = await NewsletterSubscriber.findOne({ email });

    if (!subscriber || !subscriber.isActive) {
      return res.status(200).json({
        success: true,
        message: "This email address is not currently subscribed to our newsletter.",
      });
    }

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    return res.status(200).json({
      success: true,
      message: "You have been successfully unsubscribed from our newsletter.",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  subscribe,
  unsubscribe,
};
