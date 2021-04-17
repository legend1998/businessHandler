const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const twig = require('twig');

const templates = {};
let style = '';

function loadTemplates() {
    const templatePath = path.resolve('./templates');
    let templateFiles;
    try {
        templateFiles = fs.readdirSync(templatePath);
    } catch (err) {
        fs.mkdirSync(templatePath, { recursive: true });
        templateFiles = fs.readdirSync(templatePath);
    }
    const styleFile = templateFiles.find(f => f.endsWith('.css'));
    if (styleFile) {
        style = fs.readFileSync(path.join(templatePath, styleFile)).toString();
    }
    templateFiles = templateFiles.filter(f => f.endsWith('.twig'));
    templateFiles.forEach(f => templates[f.replace(/\.[a-zA-Z]*$/, '')] = path.join(templatePath, f));
}

loadTemplates();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'soen390erp@gmail.com',
        pass: 'SOEN390erp!'
    }
});

module.exports = {
    sendMail(to, subject, template, variables) {
        return new Promise((resolve, reject) => {
            let templateFile = templates[template];
            if (!templateFile)
                reject(new Error(`Template '${template}' does not exist.`));

            twig.renderFile(templateFile, { ...variables, STYLE: style }, (err, html) => {
                if (err)
                    return reject(err);
                transporter.sendMail({
                    from: 'soen390erp@gmail.com',
                    to,
                    subject,
                    html
                })
                    .then(res => resolve(res))
                    .catch(err => reject(err));
            });
        });
    }
};
