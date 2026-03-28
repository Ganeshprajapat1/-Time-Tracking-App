const nodemailer = require("nodemailer");

let transporterPromise = null;

const getTransporter = async () => {
  if (transporterPromise) return transporterPromise;
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : null;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    transporterPromise = Promise.resolve(null);
    return transporterPromise;
  }

  transporterPromise = Promise.resolve(
    nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    })
  );
  return transporterPromise;
};

const sendMail = async ({ to, subject, text, html }) => {
  const transport = await getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!transport) {
    const msg = `[email skipped — configure SMTP] To: ${to}\nSubject: ${subject}\n${text}`;
    console.log(msg);
    return { sent: false };
  }

  await transport.sendMail({ from, to, subject, text, html });
  return { sent: true };
};

module.exports = { sendMail, getTransporter };
