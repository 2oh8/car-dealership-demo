const nodemailer = require('nodemailer')
const SSL = require("ssl-root-cas")

const sendEmail = function (toaddress, subject, html, token) {

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport(process.env.EMAIL);

  // // setup email data with unicode symbols
  let mailOptions = {
      from: process.env.MAILOPTIONS.from,
      cc: process.env.MAILOPTIONS.to,
      to: toaddress,
      subject: subject,
      html: html
  };
  // // /////////////////////////////////////////////////////////////////////////
  // // GMAIL FOR TESTING
  // let transporter = nodemailer.createTransport({
  //   host: "smtp.gmail.com",
  //   port: 587,
  //   secure: false, // secure:true for port 465, secure:false for port 587
  //   auth: {
  //     user: "mattyoung6655@gmail.com",
  //     pass: "Alpine1101"
  //   }
  // });

  // setup email data with unicode symbols
  // let mailOptions = {
  //   from: "mattyoung6655@gmail.com",
  //   to: toaddress,
  //   subject: subject,
  //   html: html
  // };
  // /////////////////////////////////////////////////////////////////////////

  // send mail with defined transport object
  // transporter.sendMail(mailOptions, (error, info) => {
  //   SSL.inject();
  //   if (error) {
  //     return console.log(error);
  //   }
  //   console.log("Message %s sent: %s", info.messageId, info.response);
  // });
}


module.exports = sendEmail