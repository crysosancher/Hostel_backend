const oracledb = require("oracledb");
const connect = require("../config/db");

// Helper function to convert OracleDB rows to plain objects
// Explicitly extract only the known columns to avoid circular references
function convertToPlainObjects(rows) {
  return rows.map((row) => {
    return {
      PMT_YEAR: row.PMT_YEAR,
      PMT_MONTH: row.PMT_MONTH,
      PMT_DATE: row.PMT_DATE,
      PMT_AMOUNT: row.PMT_AMOUNT,
      PMT_TYPE: row.PMT_TYPE,
      TXN_ID: row.TXN_ID,
      UTR: row.UTR,
      PMT_MODE: row.PMT_MODE,
      BANK: row.BANK,
      // Skip RECEIPT BLOB as it can cause serialization issues
    };
  });
}

class Income {
  static async createIncome(data) {
    let connection;
    try {
      connection = await connect();

      const sql = `
        INSERT INTO INCOME (PMT_YEAR, PMT_MONTH, PMT_DATE, PMT_AMOUNT, PMT_TYPE, TXN_ID, UTR, PMT_MODE, RECEIPT, BANK)
        VALUES (:pmtYear, :pmtMonth, TO_DATE(:pmtDate, 'YYYY-MM-DD'), :pmtAmount, :pmtType, :txnId, :utr, :pmtMode, :receipt, :bank)
      `;

      // Format date as string for Oracle TO_DATE function
      let dateStr = null;
      if (data.pmtDate) {
        const d = new Date(data.pmtDate);
        dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD format
      } else {
        const d = new Date();
        dateStr = d.toISOString().split("T")[0];
      }

      const binds = {
        pmtYear: data.pmtYear,
        pmtMonth: data.pmtMonth,
        pmtDate: dateStr,
        pmtAmount: data.pmtAmount,
        pmtType: data.pmtType,
        txnId: data.txnId,
        utr: data.utr,
        pmtMode: data.pmtMode,
        receipt: data.receipt || null,
        bank: data.bank,
      };

      const options = { autoCommit: true };
      const result = await connection.execute(sql, binds, options);

      return {
        status: 201,
        message: "Income record created successfully",
        rowsAffected: result.rowsAffected,
      };
    } catch (err) {
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeErr) {
          console.error("Error closing OracleDB connection:", closeErr);
        }
      }
    }
  }

  static async getIncomeByTxnId(txnId) {
    let connection;
    try {
      connection = await connect();

      const sql = `SELECT PMT_YEAR, PMT_MONTH, PMT_DATE, PMT_AMOUNT, PMT_TYPE, TXN_ID, UTR, PMT_MODE, BANK FROM INCOME WHERE TXN_ID = :txnId`;

      const binds = { txnId };
      const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
      const result = await connection.execute(sql, binds, options);

      if (result.rows.length === 0) {
        return {
          status: 404,
          message: "Income record not found",
          data: null,
        };
      }

      // Use the same conversion logic for a single row
      const plainRows = convertToPlainObjects(result.rows);
      const plainRow = plainRows[0];

      return {
        status: 200,
        message: "Income record retrieved successfully",
        data: plainRow,
      };
    } catch (err) {
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeErr) {
          console.error("Error closing OracleDB connection:", closeErr);
        }
      }
    }
  }

  static async getAllIncome() {
    let connection;
    try {
      connection = await connect();

      const sql = `SELECT PMT_YEAR, PMT_MONTH, PMT_DATE, PMT_AMOUNT, PMT_TYPE, TXN_ID, UTR, PMT_MODE, BANK FROM INCOME ORDER BY PMT_DATE DESC`;

      const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
      const result = await connection.execute(sql, [], options);

      const plainRows = convertToPlainObjects(result.rows);

      return {
        status: 200,
        message: "Income records retrieved successfully",
        data: plainRows,
      };
    } catch (err) {
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeErr) {
          console.error("Error closing OracleDB connection:", closeErr);
        }
      }
    }
  }

  static async getIncomeByYearMonth(pmtYear, pmtMonth) {
    let connection;
    try {
      connection = await connect();

      const sql = `SELECT PMT_YEAR, PMT_MONTH, PMT_DATE, PMT_AMOUNT, PMT_TYPE, TXN_ID, UTR, PMT_MODE, BANK FROM INCOME WHERE PMT_YEAR = :pmtYear AND PMT_MONTH = :pmtMonth ORDER BY PMT_DATE DESC`;

      const binds = { pmtYear, pmtMonth };
      const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
      const result = await connection.execute(sql, binds, options);

      const plainRows = convertToPlainObjects(result.rows);

      return {
        status: 200,
        message: "Income records retrieved successfully",
        data: plainRows,
      };
    } catch (err) {
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeErr) {
          console.error("Error closing OracleDB connection:", closeErr);
        }
      }
    }
  }

  static async updateIncome(txnId, data) {
    let connection;
    try {
      connection = await connect();

      // First check if record exists
      const checkSql = `SELECT TXN_ID FROM INCOME WHERE TXN_ID = :txnId`;
      const checkBinds = { txnId };
      const checkOptions = { outFormat: oracledb.OUT_FORMAT_OBJECT };
      const checkResult = await connection.execute(
        checkSql,
        checkBinds,
        checkOptions
      );

      if (checkResult.rows.length === 0) {
        return {
          status: 404,
          message: "Income record not found",
        };
      }

      // Format date if provided
      let dateStr = null;
      if (data.pmtDate) {
        const d = new Date(data.pmtDate);
        dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD format
      }

      const sql = `
        UPDATE INCOME 
        SET PMT_YEAR = NVL(:pmtYear, PMT_YEAR),
            PMT_MONTH = NVL(:pmtMonth, PMT_MONTH),
            PMT_DATE = NVL(TO_DATE(:pmtDate, 'YYYY-MM-DD'), PMT_DATE),
            PMT_AMOUNT = NVL(:pmtAmount, PMT_AMOUNT),
            PMT_TYPE = NVL(:pmtType, PMT_TYPE),
            UTR = NVL(:utr, UTR),
            PMT_MODE = NVL(:pmtMode, PMT_MODE),
            RECEIPT = NVL(:receipt, RECEIPT),
            BANK = NVL(:bank, BANK)
        WHERE TXN_ID = :txnId
      `;

      const binds = {
        pmtYear: data.pmtYear || null,
        pmtMonth: data.pmtMonth || null,
        pmtDate: dateStr,
        pmtAmount: data.pmtAmount || null,
        pmtType: data.pmtType || null,
        utr: data.utr || null,
        pmtMode: data.pmtMode || null,
        receipt: data.receipt || null,
        bank: data.bank || null,
        txnId,
      };

      const options = { autoCommit: true };
      const result = await connection.execute(sql, binds, options);

      return {
        status: 200,
        message: "Income record updated successfully",
        rowsAffected: result.rowsAffected,
      };
    } catch (err) {
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeErr) {
          console.error("Error closing OracleDB connection:", closeErr);
        }
      }
    }
  }

  static async deleteIncome(txnId) {
    let connection;
    try {
      connection = await connect();

      const sql = `DELETE FROM INCOME WHERE TXN_ID = :txnId`;

      const binds = { txnId };
      const options = { autoCommit: true };
      const result = await connection.execute(sql, binds, options);

      if (result.rowsAffected === 0) {
        return {
          status: 404,
          message: "Income record not found",
        };
      }

      return {
        status: 200,
        message: "Income record deleted successfully",
        rowsAffected: result.rowsAffected,
      };
    } catch (err) {
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeErr) {
          console.error("Error closing OracleDB connection:", closeErr);
        }
      }
    }
  }

  static async getIncomeByPmtMode(pmtMode) {
    let connection;
    try {
      connection = await connect();

      const sql = `SELECT PMT_YEAR, PMT_MONTH, PMT_DATE, PMT_AMOUNT, PMT_TYPE, TXN_ID, UTR, PMT_MODE, BANK FROM INCOME WHERE PMT_MODE = :pmtMode ORDER BY PMT_DATE DESC`;

      const binds = { pmtMode };
      const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
      const result = await connection.execute(sql, binds, options);

      const plainRows = convertToPlainObjects(result.rows);

      return {
        status: 200,
        message: "Income records retrieved successfully",
        data: plainRows,
      };
    } catch (err) {
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeErr) {
          console.error("Error closing OracleDB connection:", closeErr);
        }
      }
    }
  }

  static async getIncomeStats(pmtYear) {
    let connection;
    try {
      connection = await connect();

      const sql = `
        SELECT 
          PMT_MONTH,
          SUM(PMT_AMOUNT) AS Total_Amount,
          COUNT(*) AS Transaction_Count,
          AVG(PMT_AMOUNT) AS Average_Amount
        FROM INCOME
        WHERE PMT_YEAR = :pmtYear
        GROUP BY PMT_MONTH
        ORDER BY TO_NUMBER(SUBSTR(PMT_MONTH, 1, 2))
      `;

      const binds = { pmtYear };
      const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
      const result = await connection.execute(sql, binds, options);

      const plainRows = convertToPlainObjects(result.rows);

      return {
        status: 200,
        message: "Income statistics retrieved successfully",
        data: plainRows,
      };
    } catch (err) {
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeErr) {
          console.error("Error closing OracleDB connection:", closeErr);
        }
      }
    }
  }

  // Get receipt image by transaction ID
  static async getReceiptByTxnId(txnId) {
    let connection;
    try {
      connection = await connect();

      const sql = `SELECT RECEIPT FROM INCOME WHERE TXN_ID = :txnId`;

      const binds = { txnId };
      const options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: {
          RECEIPT: { type: oracledb.BUFFER },
        },
      };
      const result = await connection.execute(sql, binds, options);
    

      if (result.rows.length === 0) {
        return {
          status: 404,
          message: "Income record not found",
          data: null,
        };
      }

      const receipt = result.rows[0].RECEIPT;

      if (!receipt) {
        return {
          status: 404,
          message: "No receipt image found for this transaction",
          data: null,
        };
      }

      // Return the buffer directly for streaming, or convert to base64
      return {
        status: 200,
        message: "Receipt retrieved successfully",
        data: receipt, // This is a Buffer
      };
    } catch (err) {
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeErr) {
          console.error("Error closing OracleDB connection:", closeErr);
        }
      }
    }
  }

  // Upload/Update receipt image
  static async updateReceipt(txnId, receiptBuffer) {
    let connection;
    try {
      connection = await connect();

      const sql = `UPDATE INCOME SET RECEIPT = :receipt WHERE TXN_ID = :txnId`;

      const binds = {
        receipt: receiptBuffer,
        txnId,
      };

      const options = { autoCommit: true };
      const result = await connection.execute(sql, binds, options);

      if (result.rowsAffected === 0) {
        return {
          status: 404,
          message: "Income record not found",
        };
      }

      return {
        status: 200,
        message: "Receipt updated successfully",
        rowsAffected: result.rowsAffected,
      };
    } catch (err) {
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeErr) {
          console.error("Error closing OracleDB connection:", closeErr);
        }
      }
    }
  }
}

module.exports = Income;
