const path = require('path');
const fs = require('fs');
const ini = require('ini');

const env = process.env.SERVER_ENV ? process.env.SERVER_ENV : 'local';

const config = ini.parse(fs.readFileSync(path.join(__dirname, `config_${env}.ini`)).toString());

module.exports = {
    type: env,
    isLocal() {
        return env === 'local';
    },
    isLive() {
        return env === 'live';
    },
    config
};
