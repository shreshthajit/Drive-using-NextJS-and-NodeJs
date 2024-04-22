const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const multer = require("multer");
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(cors({ origin: "*" }));
mongoose
  .connect(process.env.MONGO_URI)
  .then((res) => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const dashboardRoutes = require("./src/Routes/dashboard.routes");
app.use("/dashboard", dashboardRoutes);

const userRoutes = require("./src/Routes/user.routes");
app.use("/users", userRoutes);

const organizationRoutes = require("./src/Routes/organization.routes");
app.use("/organizations", organizationRoutes);

const logsRoutes = require("./src/Routes/logs.routes");
app.use("/logs", logsRoutes);

const ticketsRoutes = require("./src/Routes/tickets.routes");
app.use("/orders", ticketsRoutes);

const notesRoutes = require("./src/Routes/notes.routes");
app.use("/notes", notesRoutes);

const customerRoutes = require("./src/Routes/customer.routes");
app.use("/customers", customerRoutes);

const contactRoutes = require("./src/Routes/contact.routes");
app.use("/contacts", contactRoutes);

const documentRoutes = require("./src/Routes/document.routes");
app.use("/documents", documentRoutes);

const sheetRoutes = require("./src/Routes/sheet.routes");
app.use("/sheets", sheetRoutes);

const foldersRoutes = require("./src/Routes/folder.routes");
app.use("/folders", foldersRoutes);

const fileRoutes = require("./src/Routes/file.routes");
app.use("/files", fileRoutes);

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
