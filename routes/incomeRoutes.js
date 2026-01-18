const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const incomeController = require("../controllers/incomeController");
const router = express.Router();

// Configure multer for memory storage (to get buffer)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

router.post(
  "/create",
  authMiddleware,
  upload.single("receipt"),
  incomeController.createIncome
);
router.get(
  "/getByTxnId/:txnId",
  authMiddleware,
  incomeController.getIncomeByTxnId
);
router.get("/getAll", authMiddleware, incomeController.getAllIncome);
router.get(
  "/getByYearMonth",
  authMiddleware,
  incomeController.getIncomeByYearMonth
);
router.get(
  "/getByPmtMode",
  authMiddleware,
  incomeController.getIncomeByPmtMode
);
router.get("/getStats", authMiddleware, incomeController.getIncomeStats);
router.put("/update/:txnId", authMiddleware, incomeController.updateIncome);
router.delete("/delete/:txnId", authMiddleware, incomeController.deleteIncome);

// Receipt image endpoints
router.get("/receipt/:txnId", authMiddleware, incomeController.getReceipt); // Returns image binary
router.get(
  "/receipt/:txnId/base64",
  authMiddleware,
  incomeController.getReceiptBase64
); // Returns base64 in JSON
router.post(
  "/receipt/:txnId",
  authMiddleware,
  upload.single("receipt"),
  incomeController.uploadReceipt
); // Upload receipt

module.exports = router;
