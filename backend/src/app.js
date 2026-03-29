const express = require("express");
const cors = require("cors");
const app = express();

const departmentRoutes = require("./routes/department.routes");
const employeeRoutes = require("./routes/employee.routes");
const salaryRoutes = require("./routes/salary.routes");
const errorMiddleware = require("./middlewares/error.middleware");

// Global Middleware
app.use(cors());
app.use(express.json());

// ✅ CORRECT BASE PATH
app.use("/api/departments", departmentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/payslip", require("./routes/payslip.routes"));

// health check
app.get("/api/health", (req, res) => {
  res.json({ success: true });
});

// JSON 404 Handler (prevents sending back HTML to frontend if route is wrong)
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "API Route not found" });
});

// Centralized Error Handler
app.use(errorMiddleware);

module.exports = app;
