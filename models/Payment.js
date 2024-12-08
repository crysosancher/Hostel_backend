const oracledb = require('oracledb');

const connect = require('../config/db');
const crypto = require('crypto'); // For generating unique IDs

class Payments {
    static async createPayment(payment) {
        let connection;
        try {
            connection = await connect(); // Get a connection

            // Generate PMT_ID using a timestamp-based UUID
            const uuid = crypto.randomUUID();
						const pmtId = Buffer.from(uuid).toString('base64').substring(0, 8);

            const sql = `
                INSERT INTO payments (PMT_ID, USER_ID, PMT_YEAR, PMT_MONTH, AMOUNT, PMT_DATE, TXN_ID, CREATED_BY, CREATION_DATE, PMT_TYPE, PMT_MODE, RECEIPT)
                VALUES (:pmtId, :userId, :pmtYear, :pmtMonth, :amount, TO_DATE(:pmtDate, 'YYYY-MM-DD'), :txnId, :createdBy, SYSDATE, :pmtType, :pmtMode, :receipt)
            `;

            const binds = {
                pmtId: pmtId, // Pass the generated PMT_ID
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
		static async getPaymentsByUserId(userId) {
			let connection;
			try {
					connection = await connect(); // Get a connection

					const sql = `
							SELECT USER_ID, PMT_YEAR, PMT_MONTH, AMOUNT, PMT_DATE, TXN_ID, CREATED_BY, LAST_UPDATED, LAST_UPDATED_BY, CREATION_DATE, PMT_TYPE, PMT_MODE, PMT_ID FROM payments WHERE USER_ID = :userId ORDER BY PMT_DATE DESC
					`;

					const binds = { userId };

					const options = { outFormat: oracledb.OBJECT }; // Return results as an array of objects
					const result = await connection.execute(sql, binds, options);
					return result.rows; // Return the result rows
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
    static async getAllTransactions(){
        let connection;
        try {
            connection = await connect(); // Get a connection

            const sql = `
                SELECT PMT_TYPE,PMT_MODE,TXN_ID,PMT_MONTH,PMT_YEAR,AMOUNT,PMT_DATE FROM PAYMENTS
            `;

            const options = { outFormat: oracledb.OBJECT }; // Return results as an array of objects
            const result = await connection.execute(sql, [], options);
            return result.rows; // Return the result rows
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
