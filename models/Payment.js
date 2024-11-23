const connect = require('../config/db');

class Payments {
    static async createPayment(payment) {
        let connection;
        try {
            connection = await connect(); // Get a connection
            const sql = `
                INSERT INTO payments (USER_ID, PMT_YEAR, PMT_MONTH, AMOUNT, PMT_DATE, TXN_ID, CREATED_BY, CREATION_DATE, PMT_TYPE, PMT_MODE, RECEIPT)
                VALUES (:userId, :pmtYear, :pmtMonth, :amount, TO_DATE(:pmtDate, 'YYYY-MM-DD'), :txnId, :createdBy, SYSDATE, :pmtType, :pmtMode, :receipt)
            `;
            const binds = {
                userId: payment.userId,
                pmtYear: payment.pmtYear,
                pmtMonth: payment.pmtMonth,
                amount: payment.amount,
                pmtDate: payment.pmtDate,
                txnId: payment.txnId,
                createdBy: payment.createdBy,
                pmtType: payment.pmtType,
                pmtMode: payment.pmtMode,
                receipt: payment.receipt || null,
            };

            const options = { autoCommit: true }; // Commit automatically
            const result = await connection.execute(sql, binds, options);
            return result;
        } catch (err) {
            throw err;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (closeErr) {
                    console.error('Error closing OracleDB connection:', closeErr);
                }
            }
        }
    }
}

module.exports = Payments;
