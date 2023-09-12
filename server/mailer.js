import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function ssendEmail(toEmail, name) {
  // Create a transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ionos.it", // Replace with your SMTP server
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "no_reply@qpsilon.com",
      pass: "Qwerty2020!",
    },
  });

  // Read the HTML file
  const emailTemplate = fs.readFileSync(
    path.join(__dirname, "emailTemplate.html"),
    "utf8"
  );

  const emailTemplateWithUserName = emailTemplate.replace('[Name]', name);

  // Send the email
  let info = await transporter.sendMail({
    from: '"qpSILON" no_reply@qpsilon.com', // sender address
    to: toEmail, // list of receivers
    subject: `Welcome to Our Service ${name}`, // Subject line
    html: emailTemplateWithUserName, // html body
  });

  console.log("Message sent:", info.messageId);
}
