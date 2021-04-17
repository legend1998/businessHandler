const colors = require('colors');
const statusCodes = require('./status-codes.json');

const { getRequestIP } = require('./utils');

colors.setTheme({
    object: ['magenta', 'bold'],
    string: ['yellow', 'bold'],
    number: ['brightMagenta', 'bold'],
    array: ['cyan', 'bold'],
    boolean: ['brightRed', 'bold'],
    '200': ['brightGreen', 'bold'],
    '300': ['brightYellow', 'bold'],
    '400': ['brightRed', 'bold'],
    '500': ['brightRed', 'bold'],
    method: ['brightMagenta', 'bold']
});

module.exports = (req, res, next) => {
    res.on('finish', () => {
        const code = statusCodes.find(c => c.code === String(res.statusCode));
        console.log(`${colors['method'](req.method)} - ${req.originalUrl} (${getRequestIP(req)}) -> ${colors[String(res.statusCode - (res.statusCode % 100))](`${res.statusCode} - ${code.phrase}`)}`);

        if (req.method === 'GET' || req.method === 'DELETE') {
            console.log();
            return;
        }

        let body = '';
        if (!req.body || Object.entries(req.body).length === 0)
            body = 'Empty';
        else {
            body += '{\n';
            for (let key of Object.keys(req.body)) {
                let type = Array.isArray(req.body[key]) ? 'array' : typeof req.body[key];
                body += `    ${key}: `;

                if(req.body[key] === null || req.body[key] === undefined) {
                    body += colors.grey(`${req.body[key]}\n`);
                    continue;
                }

                switch (type) {
                    case 'array':
                        body += colors[type](`[${type}] (${req.body[key].length})\n`);
                        break;
                    case 'object':
                        body += colors[type](`[${type}] { ${Object.keys(req.body[key]).join(', ')} }\n`);
                        break;
                    default:
                        if(req.body[key].length > 50)
                            body += colors[type](`[${type}] (${req.body[key].length})\n`);
                        else
                            body += colors[type](`${req.body[key]}\n`);
                        break;
                }
            }
            body += '}';
        }

        console.log(body);
        console.log();

    });

    next();
};
