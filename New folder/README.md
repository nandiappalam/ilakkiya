# BVC Purchase Management System

A full-stack web application for managing purchase orders, returns, grains processing, and flour out operations for BVC Exports Pvt Ltd.

## Features

- **Purchase Management**: Create and manage purchase orders with automatic calculations
- **Purchase Returns**: Handle return transactions with detailed tracking
- **Grains Processing**: Manage input and output items for grinding operations
- **Flour Out Management**: Track flour distribution to papad companies
- **Dashboard**: Overview of all operations with charts and statistics
- **Database Integration**: PostgreSQL database with proper schema
- **Desktop App**: Tauri integration for Windows .msi and .exe builds
- **Print & Export**: PDF and Excel export functionality
- **Responsive UI**: Modern Material-UI interface

## Tech Stack

### Frontend
- React.js with Vite
- Material-UI (MUI) for components
- Axios for API calls
- Chart.js for data visualization
- jsPDF and XLSX for exports

### Backend
- Node.js with Express.js
- PostgreSQL database
- JWT for authentication
- Puppeteer for PDF generation

### Desktop
- Tauri for cross-platform desktop builds

## Project Structure

```
bvc-purchase-management/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Node.js backend
│   ├── routes/              # API routes
│   ├── server.js            # Main server file
│   └── package.json
├── database/                # Database schema
│   └── schema.sql
├── tauri/                   # Tauri configuration
│   └── tauri.conf.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
# Set up PostgreSQL database and update connection string in server.js
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
```bash
# Create PostgreSQL database
createdb bvc_purchases

# Run schema
psql -d bvc_purchases -f database/schema.sql
```

### Tauri Setup (for desktop builds)
```bash
# Install Tauri CLI
npm install -g @tauri-apps/cli

# Build desktop app
cd tauri
npm run tauri build
```

## API Endpoints

### Purchases
- `GET /api/purchases` - Get all purchases
- `POST /api/purchases` - Create new purchase
- `GET /api/purchases/:id` - Get purchase by ID
- `PUT /api/purchases/:id` - Update purchase
- `DELETE /api/purchases/:id` - Delete purchase

### Purchase Returns
- `GET /api/purchase-returns` - Get all returns
- `POST /api/purchase-returns` - Create new return

### Flour Out
- `GET /api/flour-out` - Get all flour out records
- `POST /api/flour-out` - Create new flour out record

## Usage

1. Start the backend server
2. Start the frontend development server
3. Navigate to `http://localhost:3000`
4. Use the navigation menu to access different modules
5. Create purchase orders, manage returns, process grains, and track flour distribution

## Building for Production

### Web Deployment
```bash
# Build frontend
cd frontend
npm run build

# Deploy to web server (Vercel, Netlify, etc.)
```

### Desktop Build
```bash
# Build with Tauri
cd tauri
npm run tauri build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test
4. Submit a pull request

## License

This project is proprietary software for BVC Exports Pvt Ltd.

## Support

For support, contact the development team or refer to the documentation.
