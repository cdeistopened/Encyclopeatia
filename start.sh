#!/bin/bash

# Change to frontend directory
cd frontend

# Install dependencies
npm install

# Build the application
npm run build:full

# Start the application
npm start