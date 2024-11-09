const connect = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    static async findByUsername(username) {
        const conn = await connect();
        const result = await conn.execute(
            `SELECT USER_ID, USERNAME, PASSWORD, ROLE_IND, ACTIVE FROM AARYA.LOGIN WHERE USERNAME = :username`,
            [username]
        );
        await conn.close();
        return result.rows[0];
    }

    static async createUser(username, hashedPassword, role_ind = 'USER') {
        const conn = await connect();
        const result = await conn.execute(
            `INSERT INTO AARYA.LOGIN (USER_ID, USERNAME, PASSWORD, ACTIVE, ROLE_IND)
             VALUES (AARYA.LOGIN_SEQ.NEXTVAL, :username, :password, 'Y', :role_ind)`,
            [username, hashedPassword, role_ind],
            { autoCommit: true }
        );
        await conn.close();
        return result;
    }
}

module.exports = User;
