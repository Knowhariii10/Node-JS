const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose'); // --- NEW DB ---
const app = express();
const PORT = 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// =======================================================
// 0. DATABASE CONNECTION & MODEL
// =======================================================

// --- NEW DB ---
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fileManagerDB')
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- NEW DB ---
// Define a Schema (blueprint) for our file metadata
const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  savedName: { type: String, required: true, unique: true }, // The name on your server
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now }
});

// --- NEW DB ---
// Create the Mongoose Model (the collection in the DB)
const File = mongoose.model('File', fileSchema);


// =======================================================
// 1. MULTER AND STORAGE CONFIGURATION
// =======================================================

// Function to check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|pdf|txt|bmp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only images (jpeg/jpg/png/gif/bmp), PDF, or TXT files allowed!'));
  }
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR);
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, path.basename(file.originalname, extension) + '-' + Date.now() + extension);
  }
});

// Initialize upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('myFile');

// Crucial for serving uploaded files:
app.use('/files', express.static(UPLOAD_DIR));


// =======================================================
// 2. HTML GENERATOR FUNCTION (Fully Integrated)
// =======================================================

// --- MODIFIED ---
// This function now accepts an array of file *names*
// For a more advanced version, you could pass the full DB objects
// and display the originalName, size, and date in the HTML.
function fileManagerHTML(files) {
  const fileListItems = files.map(file => {
    const ext = path.extname(file).toLowerCase();
    
    // We must encode the filename in case it has special characters
    const encodedFile = encodeURIComponent(file);

    return `
      <li id="file-item-${file.replace(/[^a-zA-Z0-9]/g, '-')}" class="file-item" data-ext="${ext}">
          <span class="filename-text">${file}</span>
          <a href="/download/${encodedFile}" class="action-btn">Download</a>
          <a href="/files/${encodedFile}" target="_blank" class="action-btn view-btn">(View)</a>
          
          <form action="/delete/${encodedFile}" method="POST" class="delete-form" style="display:inline;">
              <button type="submit" class="action-btn delete-btn" onclick="return confirm('Are you sure you want to delete ${file}?');">Delete</button>
          </form>
      </li>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Node.js File Manager</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            /* --- 1. CSS Variables for Theming --- */
            :root {
                --bg-color: #ffffff;
                --text-color: #333333;
                --header-color: #1a1a1a;
                --primary-color: #007bff;
                --hover-color: #0056b3;
                --border-color: #eeeeee;
                --upload-bg: #f8f9fa;
                --delete-bg: #dc3545;
                --delete-text: #ffffff;
                --progress-fill: #28a745;
                --drag-zone-border: #ccc;
                --drag-zone-hover: #e9e9e9;
            }

            .dark-mode {
                --bg-color: #2c3e50;
                --text-color: #ecf0f1;
                --header-color: #ffffff;
                --primary-color: #3498db;
                --hover-color: #2980b9;
                --border-color: #34495e;
                --upload-bg: #34495e;
                --delete-bg: #e74c3c;
                --delete-text: #ffffff;
                --progress-fill: #2ecc71;
                --drag-zone-border: #4a637a;
                --drag-zone-hover: #4a637a;
            }
            
            /* --- 2. Base & Responsive Styles --- */
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                padding: 20px; 
                background-color: var(--bg-color);
                color: var(--text-color);
                transition: background-color 0.3s, color 0.3s;
                margin: 0;
            }
            h1, h2 { color: var(--header-color); }
            
            ul { list-style: none; padding: 0; }
            .file-item { 
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px; 
                border-bottom: 1px solid var(--border-color); 
                padding: 10px 0; 
                font-size: 1.1em;
            }
            .filename-text { flex-grow: 1; word-break: break-all; } /* Added word-break */

            .action-btn { 
                margin-left: 15px; 
                text-decoration: none; 
                color: var(--primary-color); 
                padding: 5px 10px;
                border-radius: 4px;
                display: inline-block;
                transition: background-color 0.2s, color 0.2s;
                white-space: nowrap; /* Prevents buttons from wrapping */
            }
            .action-btn:hover { text-decoration: underline; color: var(--hover-color); }
            
            .delete-btn { 
                background-color: var(--delete-bg); 
                color: var(--delete-text); 
                border: none; 
                cursor: pointer; 
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 1em;
            }
            .delete-btn:hover { opacity: 0.9; }

            /* Filter and Search Bar Styling */
            #filterContainer {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                padding: 10px;
                background-color: var(--upload-bg);
                border-radius: 8px;
            }
            #searchBar {
                padding: 8px;
                border: 1px solid var(--border-color);
                border-radius: 4px;
                flex-grow: 1;
                background-color: var(--bg-color);
                color: var(--text-color);
            }

            /* --- Drag and Drop Zone Styling --- */
            #dropZone {
                border: 2px dashed var(--drag-zone-border);
                padding: 30px;
                text-align: center;
                margin-bottom: 20px;
                border-radius: 8px;
                background-color: var(--upload-bg);
                transition: background-color 0.3s, border-color 0.3s;
            }
            #dropZone.dragover {
                background-color: var(--drag-zone-hover);
                border-color: var(--primary-color);
            }
            #dropZone p {
                margin: 0;
                font-weight: bold;
            }
            
            /* Progress Bar, Message, and Theme Toggle */
            #uploadProgressContainer {
                width: 100%; 
                margin-top: 15px;
                background-color: var(--upload-bg);
                padding: 10px;
                border-radius: 8px;
            }
            #uploadProgressBar {
                height: 25px; 
                background-color: var(--border-color); 
                border-radius: 4px; 
                overflow: hidden;
            }
            #progressBarFill {
                height: 100%; 
                width: 0%; 
                background-color: var(--progress-fill); 
                transition: width 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
            }
            #progressText { 
                margin-top: 5px; 
                text-align: center; 
                color: var(--text-color);
                font-size: 0.9em;
            }

            #uploadMessage {
                margin-top: 15px; 
                padding: 15px; 
                border-radius: 8px; 
                font-weight: bold;
                display: none;
            }
            .msg-success { background-color: #d4edda; color: #155724; }
            .msg-error { background-color: #f8d7da; color: #721c24; }
            .dark-mode .msg-success { background-color: #1e6e42; color: #d4edda; }
            .dark-mode .msg-error { background-color: #92222d; color: #f8d7da; }

            #themeToggle {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 15px;
                border: none;
                border-radius: 50px;
                cursor: pointer;
                background-color: var(--primary-color);
                color: white;
                font-weight: bold;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                z-index: 1000;
            }

            @media (max-width: 600px) {
                body { padding: 10px; }
                .file-item { flex-wrap: wrap; }
                .action-btn { margin-left: 0; margin-top: 5px; }
                .filename-text { width: 100%; margin-bottom: 10px; }
            }
        </style>
    </head>
    <body>
        <button id="themeToggle">Switch to Dark Mode</button>
        
        <h1>File Manager & Uploader</h1>
        
        <h2>Upload New File</h2>

        <div id="dropZone">
            <p>Drag & Drop files here, or click to use the traditional uploader:</p>
            <form id="uploadForm" action="/upload" method="POST" enctype="multipart/form-data" style="margin-top: 10px;">
                <input type="file" name="myFile" id="fileInput" required style="display: none;">
                <button type="button" id="browseButton" class="action-btn" style="background-color: var(--primary-color); color: white;">Choose File</button>
                <button type="submit" id="uploadButton" style="display: none;">Upload</button>
            </form>
        </div>

        <div id="uploadProgressContainer" style="display: none;">
            <div id="uploadProgressBar">
                <div id="progressBarFill"></div>
            </div>
            <div id="progressText">0%</div>
        </div>
        
        <div id="uploadMessage" style="display: none;"></div>

        <hr>

        <h2 id="fileCountHeader">Uploaded Files (${files.length})</h2>
        
        <div id="filterContainer">
            <input type="text" id="searchBar" placeholder="Filter files by name or type (.pdf, .jpg...)">
            </div>

        <ul id="fileList">
            ${fileListItems || '<li>No files uploaded yet.</li>'}
        </ul>

        <script>
            // --- Caching DOM Elements ---
            const body = document.body;
            const themeToggle = document.getElementById('themeToggle');
            const uploadForm = document.getElementById('uploadForm');
            const fileInput = document.getElementById('fileInput');
            const browseButton = document.getElementById('browseButton');
            const uploadButton = document.getElementById('uploadButton');
            const progressContainer = document.getElementById('uploadProgressContainer');
            const progressBarFill = document.getElementById('progressBarFill');
            const progressText = document.getElementById('progressText');
            const uploadMessage = document.getElementById('uploadMessage');
            const dropZone = document.getElementById('dropZone');
            const searchBar = document.getElementById('searchBar');
            const fileList = document.getElementById('fileList');

            // --- A. THEME TOGGLE (DARK MODE) LOGIC ---
            const preferredTheme = localStorage.getItem('theme') || 'light';

            // Set initial theme
            if (preferredTheme === 'dark') {
                body.classList.add('dark-mode');
                themeToggle.textContent = 'Switch to Light Mode';
            }

            themeToggle.addEventListener('click', () => {
                body.classList.toggle('dark-mode');
                if (body.classList.contains('dark-mode')) {
                    localStorage.setItem('theme', 'dark');
                    themeToggle.textContent = 'Switch to Light Mode';
                } else {
                    localStorage.setItem('theme', 'light');
                    themeToggle.textContent = 'Switch to Dark Mode';
                }
            });
            
            // --- Helper function for AJAX Upload (used by both methods) ---
            function uploadFile(formData) {
                // 1. Initial UI Setup
                uploadButton.disabled = true;
                browseButton.disabled = true;
                uploadMessage.style.display = 'none';
                uploadMessage.className = '';
                progressContainer.style.display = 'block';
                progressBarFill.style.width = '0%';
                progressBarFill.textContent = '';
                progressText.textContent = 'Starting upload...';


                // 2. Initiate AJAX Upload
                const xhr = new XMLHttpRequest();
                
                // Progress tracking
                xhr.upload.onprogress = function(event) {
                    if (event.lengthComputable) {
                        const percent = Math.round((event.loaded / event.total) * 100);
                        
                        // Update UI
                        progressBarFill.style.width = percent + '%';
                        progressBarFill.textContent = percent + '%';
                        progressText.textContent = \`Uploading: \${percent}%\`;
                    }
                };

                // Handle response
                xhr.onload = function() {
                    uploadButton.disabled = false;
                    browseButton.disabled = false;
                    progressContainer.style.display = 'none';

                    if (xhr.status === 200) {
                        // SUCCESS
                        uploadMessage.classList.add('msg-success');
                        uploadMessage.textContent = 'File uploaded successfully! Refreshing list...';
                        
                        // Wait a moment then reload to show the new file
                        setTimeout(() => window.location.reload(), 1500); 

                    } else if (xhr.status === 400) {
                        // ERROR (Multer or Validation)
                        uploadMessage.classList.add('msg-error');
                        uploadMessage.textContent = 'Upload Failed: ' + (xhr.responseText || 'Check file size/type.');
                    } else {
                         // Other server errors (500)
                        uploadMessage.classList.add('msg-error');
                        uploadMessage.textContent = 'Server Error (' + xhr.status + '): ' + (xhr.responseText || 'An unknown server error occurred.');
                    }
                    uploadMessage.style.display = 'block';
                };

                // Network/Connection errors
                xhr.onerror = function() {
                    uploadButton.disabled = false;
                    browseButton.disabled = false;
                    progressContainer.style.display = 'none';
                    uploadMessage.classList.add('msg-error');
                    uploadMessage.textContent = 'A network error occurred during upload.';
                    uploadMessage.style.display = 'block';
                };

                // Send the request
                xhr.open('POST', '/upload', true);
                xhr.send(formData);
            }

            // --- B. UPLOAD LOGIC (Traditional Button Click) ---
            browseButton.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', () => {
                // If files are selected via browse, submit the form with AJAX
                if (fileInput.files.length > 0) {
                    const formData = new FormData(uploadForm);
                    // --- MODIFIED --- 
                    // Since the input isn't 'multiple', we clear and append
                    // the single file. This is safer for .single()
                    const singleFile = fileInput.files[0];
                    formData.delete('myFile');
                    formData.append('myFile', singleFile);
                    uploadFile(formData);
                }
            });


            // --- C. DRAG AND DROP LOGIC ---

            // Prevent default drag behaviors
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, preventDefaults, false);
                document.body.addEventListener(eventName, preventDefaults, false); // Block drag/drop on entire body
            });

            function preventDefaults (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            // Highlight drop zone when item is dragged over it
            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
            });

            // Handle dropped files
            dropZone.addEventListener('drop', handleDrop, false);

            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;

                if (files.length === 0) return;
                
                // Create a FormData object for the dropped files
                const formData = new FormData();
                // Since our Node.js endpoint is .single('myFile'), we only submit the first file.
                formData.append('myFile', files[0]); 
                
                uploadFile(formData);
            }
            
            // --- D. CLIENT-SIDE FILE FILTERING ---
            searchBar.addEventListener('keyup', function() {
                const searchText = this.value.toLowerCase().trim();
                const items = fileList.getElementsByClassName('file-item');

                Array.from(items).forEach(item => {
                    const filename = item.querySelector('.filename-text').textContent.toLowerCase();
                    const fileExtension = item.getAttribute('data-ext');
                    
                    // Check if the filename or extension includes the search text
                    if (filename.includes(searchText) || fileExtension.includes(searchText)) {
                        item.style.display = 'flex'; // Show the item
                    } else {
                        item.style.display = 'none'; // Hide the item
                    }
                });
            });

        </script>
    </body>
    </html>
  `;
}


// =======================================================
// 3. ROUTES
// =======================================================

// Default root route redirects to the manager page
app.get('/', (req, res) => {
  res.redirect('/manager');
});

// --- NEW DB ---
// Route to list all uploaded files (The main view)
// This is now an 'async' function
app.get('/manager', async (req, res) => {
  try {
    // 1. Fetch all file documents from MongoDB, newest first
    const filesFromDB = await File.find({}).sort({ uploadDate: 'desc' });

    // 2. Extract just the 'savedName' for our existing HTML function
    const fileNames = filesFromDB.map(fileDoc => fileDoc.savedName);

    // 3. Send the HTML, passing in the list of names
    res.send(fileManagerHTML(fileNames));

  } catch (err) {
    console.error('Failed to read files from DB:', err);
    // Check if the uploads directory exists, if not, create it.
    // This handles the first-run case.
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR);
        return res.send(fileManagerHTML([])); // Send empty list
    }
    return res.status(500).send('Unable to list files from database.');
  }
});

// --- NEW DB ---
// Route to handle the file upload
// The callback is now 'async'
app.post('/upload', (req, res) => {
  upload(req, res, async (err) => { // <-- Note the 'async' here
    if (err instanceof multer.MulterError) {
      return res.status(400).send(`Multer Error: ${err.message}`);
    } else if (err) {
      return res.status(400).send(`Validation Error: ${err.message}`);
    }

    if (!req.file) {
      return res.status(400).send('No file selected.');
    }

    // --- NEW DB LOGIC ---
    try {
      // Create a new document in the 'File' collection
      const newFile = new File({
        originalName: req.file.originalname,
        savedName: req.file.filename,
        size: req.file.size,
        mimeType: req.file.mimetype
      });

      // Save the metadata to MongoDB
      await newFile.save();

      // Send success response
      res.status(200).send('File uploaded and metadata saved successfully.');

    } catch (dbError) {
      console.error('Database save error:', dbError);
      
      // If DB save fails, we should delete the file that just got saved to disk
      // to prevent "orphaned" files.
      fs.unlink(path.join(UPLOAD_DIR, req.file.filename), (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting orphaned file:', unlinkErr);
      });
      
      return res.status(500).send('File uploaded, but failed to save metadata to database.');
    }
    // --- END OF NEW DB LOGIC ---
  });
});

// Route to download a specific file
app.get('/download/:filename', (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(UPLOAD_DIR, fileName);

  if (fs.existsSync(filePath)) {
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).send('Could not download the file.');
      }
    });
  } else {
    res.status(404).send('File not found.');
  }
});

// --- NEW DB ---
// Route to delete a file
// This is now an 'async' function
app.post('/delete/:filename', async (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(UPLOAD_DIR, fileName);

  try {
    // 1. Delete the metadata record from MongoDB
    const deleteResult = await File.deleteOne({ savedName: fileName });

    if (deleteResult.deletedCount === 0) {
      console.warn(`Metadata for ${fileName} not found in DB. Will still try to delete from disk.`);
    }

    // 2. Delete the actual file from the file system (disk)
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Failed to delete file from disk:', err);
          return res.status(500).send('Error deleting the file from disk.');
        }
        
        // Redirect back to the manager page on successful disk deletion
        res.redirect('/manager');
      });
    } else {
      console.warn(`File ${fileName} not found on disk. DB record was removed.`);
      // File doesn't exist on disk, but DB record (if any) was removed.
      // So we can just redirect.
      res.redirect('/manager');
    }

  } catch (dbError) {
    console.error('Error deleting file metadata from DB:', dbError);
    return res.status(500).send('Error deleting file metadata.');
  }
});


// =======================================================
// 4. START SERVER
// =======================================================

app.listen(PORT, () => {
  console.log(`File Manager Server started on http://localhost:${PORT}`);
});
