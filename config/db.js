const oracledb = require('oracledb');
const config = require('./env');

async function connect() {
    try {
        const connection = await oracledb.getConnection({
            user: config.db.user,
            password: config.db.password,
            connectString: config.db.connectString
        });
        console.log('OracleDB connection successful');
        return connection;
    } catch (err) {
        console.error('OracleDB connection error:', err);
        throw err;
    }
}

module.exports = connect;
