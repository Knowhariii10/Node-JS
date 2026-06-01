# 📁 Intelligent File Upload Manager & Analytics Engine

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)](https://mongoosejs.com)

A high-performance file management system and transactional analytics engine. This project features a robust **Node.js/Express backend**, local storage handlers using **Multer**, secure metadata tracking via **MongoDB (Mongoose)**, and a dynamic **Real-Time Data Analytics Engine** running complex database aggregation pipelines.

---

## 📊 Database & Data Analytics Architecture

This project is tailored to demonstrate strong database management, schema optimization, and analytical query writing.

### 1. Schema Optimization & Indexing (Data Engineering)
To support rapid searches, filtering, and reporting under high volumes of file transactions, the database is optimized with compound and single-field indexing:
```javascript
const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  savedName: { type: String, required: true, unique: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now }
});

// Indexing on query-heavy and aggregation fields (Data Best Practice)
fileSchema.index({ mimeType: 1 });
fileSchema.index({ uploadDate: -1 });
```

### 2. Real-Time Analytics Pipeline (`/api/analytics`)
The backend exposes a highly optimized REST API endpoint which utilizes **MongoDB Aggregation Framework** to perform complex, multi-stage analytics on all files stored in the database:

* **Stage 1: Storage Summary Stats**: Summarizes total file counts and cumulative storage size in Megabytes.
* **Stage 2: Distribution Analysis (by MIME Type)**: Evaluates file categories to show which formats (e.g. `application/pdf`, `image/jpeg`) consume the most storage space.
* **Stage 3: 30-Day Upload Trends**: Groups uploads by date to analyze user activity patterns and trends over the last 30 days.

#### Example API Analytics Output:
```json
{
  "summary": {
    "totalFiles": 147,
    "totalSizeBytes": 38481921,
    "totalSizeMB": "36.70"
  },
  "mimeBreakdown": [
    {
      "mimeType": "application/pdf",
      "count": 68,
      "sizeBytes": 22481920,
      "sizeMB": "21.44"
    },
    {
      "mimeType": "image/jpeg",
      "count": 52,
      "sizeBytes": 12000000,
      "sizeMB": "11.44"
    }
  ],
  "last30DaysTrends": [
    { "_id": "2026-05-15", "count": 12 },
    { "_id": "2026-05-16", "count": 8 }
  ]
}
```

---

## ✨ Features

* **Multi-Format Uploading**: Securely uploads and validates image formats, PDFs, and TXT files.
* **Drag-and-Drop Zone**: Responsive HTML5/JS drag-and-drop file interface.
* **Dual Theme Layout**: Sleek, client-side toggled Dark Mode and Light Mode with theme persistence.
* **Dynamic Search & Filtering**: Instant, client-side filtering of files by name or file extensions.
* **Advanced Error Isolation**: Automatic file cleanup (disk unlinking) if metadata database operations fail to prevent orphaned files.

---

## 🛠️ Tech Stack

* **Backend Engine**: Node.js, Express.js
* **Storage Middleware**: Multer
* **Database Object Modeling**: MongoDB, Mongoose
* **Frontend Web Clients**: React.js components, HTML5, CSS3, JavaScript (AJAX/XHR)
* **Optimization**: Mongoose Indexing, Aggregation Framework

---

## 🚀 Installation & Quick Start

### 1. Prerequisites
Ensure you have **Node.js** and **MongoDB** installed and running on your computer.

### 2. Clone and Setup
```bash
# Install dependencies
npm install

# Start local MongoDB instance if not running
# Configure connection string in server.js if different: mongodb://localhost:27017/fileManagerDB
```

### 3. Run the Server
```bash
# Start the Node.js server
node server.js
```
Open **`http://localhost:3000`** in your browser to interact with the file manager!

### 4. Fetch Analytical Data
Query **`http://localhost:3000/api/analytics`** using any API client or browser to see real-time database aggregation metrics.