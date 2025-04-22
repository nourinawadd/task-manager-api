const sgMail = require("@sendgrid/mail");

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("Environment variable SENDGRID_API_KEY not found");
  process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports.getWelcomeTemplateOpts = (email, name, confirmUrl) => {
  const welcomeMsg = `Thanks for joining in, ${name}.`;
  const confirmMsg = "Confirm your account";
  const paragraph = "Let me know how to get along with the app.";
  const regards = "Best regards,";
  const serviceName = process.env.APP_NAME || "Support Service";

  const body = `<html><body>${welcomeMsg}<br/><br/>${confirmMsg} <a href="${confirmUrl}">here</a><br/><br/>${paragraph}<br/><br/>${regards}<br/>${serviceName}</body></html>`;
  const text = `${welcomeMsg}\n\n${confirmMsg}: ${confirmUrl}\n\n${paragraph}\n\n${regards}\n${serviceName}`;
  return {
    to: email,
    subject: `Welcome ${name}!`,
    text,
    body,
  };
};

module.exports.getCancelationTemplateOpts = (email, name) => {
  const paragraph = `Goodbye, ${name}. I hope to see you back sometime soon.`;
  const regards = "Best regards,";
  const serviceName = process.env.APP_NAME || "Support Service";

  const body = `<html><body>${paragraph}<br/><br/>${regards}<br/>${serviceName}</body></html>`;
  const text = `${paragraph}\n\n${regards}\n${serviceName}`;
  return {
    to: email,
    subject: "Sorry to see you go!",
    text,
    body,
  };
};

module.exports.strigTags = (body) =>
  `${body || ""}`.replace(/(<([^>]+)>)/gi, "");

module.exports.sendMail = ({
  from = process.env.EMAIL_FROM,
  to,
  subject,
  body,
  text,
}) => {
  const msg = {
    to,
    from, // Use the email address or domain you verified above
    subject,
    text,
    html: body,
  };
  return sgMail.send(msg).then(
    (response) => {
      return response;
    },
    (error) => {
      throw error;
    }
  );
};
