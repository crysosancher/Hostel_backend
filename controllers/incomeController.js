const Income = require("../models/Income");

async function createIncome(req, res) {
  try {
    const paymentData = {
      pmtYear: req.body.pmtYear,
      pmtMonth: req.body.pmtMonth,
      pmtDate: req.body.pmtDate,
      pmtAmount: req.body.pmtAmount,
      pmtType: req.body.pmtType,
      txnId: req.body.txnId,
      utr: req.body.utr,
      pmtMode: req.body.pmtMode,
      receipt: req.file ? req.file.buffer : null, // Handle uploaded file
      bank: req.body.bank,
    };

    const response = await Income.createIncome(paymentData);
    res.status(response.status).json(response);
  } catch (error) {
    console.error("Create income error:", error);
    res.status(500).json({
      message: "Failed to create income record",
      error: error.message || "Internal Server Error",
    });
  }
}

async function getIncomeByTxnId(req, res) {
  try {
    const txnId = req.params.txnId;
    const response = await Income.getIncomeByTxnId(txnId);
    res.status(response.status).json(response);
  } catch (error) {
    console.error("Get income by txn ID error:", error);
    res.status(500).json({
      message: "Failed to get income record",
      error: error.message || "Internal Server Error",
    });
  }
}

async function getAllIncome(req, res) {
  try {
    const response = await Income.getAllIncome();
    res.status(response.status).json(response);
  } catch (error) {
    console.error("Get all income error:", error);
    res.status(500).json({
      message: "Failed to get income records",
      error: error.message || "Internal Server Error",
    });
  }
}

async function getIncomeByYearMonth(req, res) {
  try {
    const pmtYear = req.query.year;
    const pmtMonth = req.query.month;

    if (!pmtYear || !pmtMonth) {
      return res.status(400).json({
        message: "Missing required parameters: year and month",
      });
    }

    const response = await Income.getIncomeByYearMonth(pmtYear, pmtMonth);
    res.status(response.status).json(response);
  } catch (error) {
    console.error("Get income by year-month error:", error);
    res.status(500).json({
      message: "Failed to get income records",
      error: error.message || "Internal Server Error",
    });
  }
}

async function updateIncome(req, res) {
  try {
    const txnId = req.params.txnId;
    const updateData = {
      pmtYear: req.body.pmtYear,
      pmtMonth: req.body.pmtMonth,
      pmtDate: req.body.pmtDate,
      pmtAmount: req.body.pmtAmount,
      pmtType: req.body.pmtType,
      utr: req.body.utr,
      pmtMode: req.body.pmtMode,
      receipt: req.body.receipt,
      bank: req.body.bank,
    };

    const response = await Income.updateIncome(txnId, updateData);
    res.status(response.status).json(response);
  } catch (error) {
    console.error("Update income error:", error);
    res.status(500).json({
      message: "Failed to update income record",
      error: error.message || "Internal Server Error",
    });
  }
}

async function deleteIncome(req, res) {
  try {
    const txnId = req.params.txnId;
    const response = await Income.deleteIncome(txnId);
    res.status(response.status).json(response);
  } catch (error) {
    console.error("Delete income error:", error);
    res.status(500).json({
      message: "Failed to delete income record",
      error: error.message || "Internal Server Error",
    });
  }
}

async function getIncomeByPmtMode(req, res) {
  try {
    const pmtMode = req.query.mode;

    if (!pmtMode) {
      return res.status(400).json({
        message: "Missing required parameter: mode",
      });
    }

    const response = await Income.getIncomeByPmtMode(pmtMode);
    res.status(response.status).json(response);
  } catch (error) {
    console.error("Get income by payment mode error:", error);
    res.status(500).json({
      message: "Failed to get income records",
      error: error.message || "Internal Server Error",
    });
  }
}

async function getIncomeStats(req, res) {
  try {
    const pmtYear = req.query.year;

    if (!pmtYear) {
      return res.status(400).json({
        message: "Missing required parameter: year",
      });
    }

    const response = await Income.getIncomeStats(pmtYear);
    res.status(response.status).json(response);
  } catch (error) {
    console.error("Get income statistics error:", error);
    res.status(500).json({
      message: "Failed to get income statistics",
      error: error.message || "Internal Server Error",
    });
  }
}

// Get receipt image - returns as image binary
async function getReceipt(req, res) {
  try {
    const txnId = req.params.txnId;
    const response = await Income.getReceiptByTxnId(txnId);

    if (response.status !== 200 || !response.data) {
      return res.status(response.status).json({
        message: response.message,
      });
    }

    // Set appropriate headers for image
    res.set({
      "Content-Type": "image/jpeg", // Adjust based on your image type (jpeg, png, etc.)
      "Content-Length": response.data.length,
      "Content-Disposition": `inline; filename="receipt_${txnId}.jpg"`,
    });

    // Send the image buffer directly
    res.send(response.data);
  } catch (error) {
    console.error("Get receipt error:", error);
    res.status(500).json({
      message: "Failed to get receipt",
      error: error.message || "Internal Server Error",
    });
  }
}

// Get receipt as Base64 (for JSON response)
async function getReceiptBase64(req, res) {
  try {
    const txnId = req.params.txnId;
    const response = await Income.getReceiptByTxnId(txnId);

    if (response.status !== 200 || !response.data) {
      return res.status(response.status).json({
        message: response.message,
      });
    }

    // Convert buffer to base64
    const base64Image = response.data.toString("base64");

    res.status(200).json({
      message: "Receipt retrieved successfully",
      data: {
        txnId: txnId,
        receipt: base64Image,
        mimeType: "image/jpeg", // Adjust based on your image type
      },
    });
  } catch (error) {
    console.error("Get receipt base64 error:", error);
    res.status(500).json({
      message: "Failed to get receipt",
      error: error.message || "Internal Server Error",
    });
  }
}

// Upload receipt image
async function uploadReceipt(req, res) {
  try {
    const txnId = req.params.txnId;

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const receiptBuffer = req.file.buffer;
    const response = await Income.updateReceipt(txnId, receiptBuffer);
    res.status(response.status).json(response);
  } catch (error) {
    console.error("Upload receipt error:", error);
    res.status(500).json({
      message: "Failed to upload receipt",
      error: error.message || "Internal Server Error",
    });
  }
}

module.exports = {
  createIncome,
  getIncomeByTxnId,
  getAllIncome,
  getIncomeByYearMonth,
  updateIncome,
  deleteIncome,
  getIncomeByPmtMode,
  getIncomeStats,
  getReceipt,
  getReceiptBase64,
  uploadReceipt,
};
