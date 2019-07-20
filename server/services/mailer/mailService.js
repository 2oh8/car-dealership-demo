const Handlebars = require('handlebars')
var mailer = require('./mailer.js')

var fs = require('fs');

const mailService = function (toAddress, subject, templateName, templatePayload) {
    let parent = this
    fs.readFile(`./services/mailer/resources/${templateName}.html`, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            let testEmail = data.toString();
            var template = Handlebars.compile(testEmail);
            let email = template(templatePayload)
            mailer(toAddress, subject, email)
        }
    });
}

module.exports = mailService