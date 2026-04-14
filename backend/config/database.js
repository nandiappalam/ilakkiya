const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const fs = require('fs')

// Determine database path - support both development and production
// In production (Tauri), the app is in the resources folder
let dbDir
if (process.env.NODE_ENV === 'production') {
  dbDir = path.join(process.resourcesPath, 'database')
} else {
  dbDir = path.join(__dirname, '../../database')
}

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const dbPath = path.join(dbDir, 'bvc.db')
console.log('Database path:', dbPath)

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message)
  } else {
    console.log('Connected to SQLite database at:', dbPath)
    db.run('PRAGMA foreign_keys = ON')
  }
})

// Export function to get DB path (useful for Tauri)
module.exports.getDbPath = () => dbPath

module.exports = {
  query: (text, params) => {
    return new Promise((resolve, reject) => {
      db.all(text, params, (err, rows) => {
        if (err) reject(err)
        else resolve({ rows })
      })
    })
  },
  run: (text, params) => {
    return new Promise((resolve, reject) => {
      db.run(text, params, function(err) {
        if (err) reject(err)
        else resolve({ lastID: this.lastID, lastInsertRowid: this.lastID, changes: this.changes })
      })
    })
  },
  pool: {
    connect: () => Promise.resolve({
      query: (text, params) => {
        return new Promise((resolve, reject) => {
          if (text.trim().toUpperCase().startsWith('INSERT') ||
              text.trim().toUpperCase().startsWith('UPDATE') ||
              text.trim().toUpperCase().startsWith('DELETE')) {
            db.run(text, params, function(err) {
              if (err) reject(err)
              else resolve({ rows: [{ id: this.lastID }] })
            })
          } else {
            db.all(text, params, (err, rows) => {
              if (err) reject(err)
              else resolve({ rows })
            })
          }
        })
      },
      release: () => {}
    })
  }
}
