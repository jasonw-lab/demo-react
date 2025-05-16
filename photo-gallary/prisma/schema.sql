-- MySQL schema for Photo Gallery application
-- Generated from Prisma schema

-- Create database if it doesn't exist
-- Note: You may need to adjust the database name based on your .env configuration
CREATE DATABASE IF NOT EXISTS lab_front;
USE lab_front;

-- Create Photo table
CREATE TABLE IF NOT EXISTS Photo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  url VARCHAR(255) NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add indexes if needed
-- CREATE INDEX idx_photo_title ON Photo(title);