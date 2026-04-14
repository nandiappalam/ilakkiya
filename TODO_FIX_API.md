# API Fix TODO List

## Step 1: Fix Frontend API Configuration
- [ ] Update frontend/src/config/api.js - Change API_BASE_URL to use relative path '/api'

## Step 2: Verify Server Routes
- [ ] Check all entry routes are registered in server.js
- [ ] Add any missing routes

## Step 3: Fix Report Routes (500 Errors)
- [ ] Add error handling to reports routes
- [ ] Ensure tables exist before querying

## Step 4: Create Missing Database Tables
- [ ] Run schema creation scripts
- [ ] Verify all required tables exist

## Step 5: Test API Endpoints
- [ ] Test health check
- [ ] Test masters API
- [ ] Test entry APIs
- [ ] Test reports API
