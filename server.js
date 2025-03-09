const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Database connection
const dbPath = path.join(__dirname, 'db/resume.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, '/')));

// API Routes
app.get('/api/profile', (req, res) => {
  db.get('SELECT * FROM profile WHERE id = 1', (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

app.get('/api/experience', (req, res) => {
  db.all('SELECT * FROM experience ORDER BY id DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Parse JSON responsibilities
    rows.forEach(row => {
      if (row.responsibilities) {
        try {
          row.responsibilities = JSON.parse(row.responsibilities);
        } catch (e) {
          console.error('Error parsing responsibilities:', e);
          row.responsibilities = [];
        }
      }
    });
    
    res.json(rows);
  });
});

app.get('/api/education', (req, res) => {
  db.all('SELECT * FROM education ORDER BY end_date DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/skills', (req, res) => {
  db.all('SELECT * FROM skills ORDER BY category, name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Group skills by category
    const groupedSkills = {};
    rows.forEach(skill => {
      if (!groupedSkills[skill.category]) {
        groupedSkills[skill.category] = [];
      }
      groupedSkills[skill.category].push(skill);
    });
    
    res.json(groupedSkills);
  });
});

app.get('/api/projects', (req, res) => {
  db.all('SELECT * FROM projects', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 