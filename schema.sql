-- ============================================
-- SURIJOBS DATABASE SCHEMA v2
-- Run this once in MySQL Workbench / CLI
-- ============================================

CREATE DATABASE IF NOT EXISTS surijobs
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE surijobs;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  verified BOOLEAN DEFAULT FALSE,
  verify_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_expires DATETIME,
  active_mode ENUM('individual','business') DEFAULT 'individual',
  has_business BOOLEAN DEFAULT FALSE,
  photo VARCHAR(255),
  mode_switch_token VARCHAR(255) DEFAULT NULL,
  mode_switch_expires DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- PROFILES (individual side)
CREATE TABLE IF NOT EXISTS profiles (
  user_id INT PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone VARCHAR(30),
  age INT,
  district VARCHAR(50),
  bio TEXT,
  branche VARCHAR(50),
  work_type VARCHAR(50),
  experience_level VARCHAR(50),
  school VARCHAR(100),
  education VARCHAR(100),
  start_year INT,
  end_year INT,
  company VARCHAR(100),
  job_title VARCHAR(100),
  work_period VARCHAR(50),
  work_location VARCHAR(100),
  cv_url VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- COMPANIES (business side)
CREATE TABLE IF NOT EXISTS companies (
  user_id INT PRIMARY KEY,
  company_name VARCHAR(150),
  branche VARCHAR(50),
  district VARCHAR(50),
  description TEXT,
  website VARCHAR(255),
  phone VARCHAR(30),
  email VARCHAR(150),
  founded_year INT,
  size VARCHAR(50),
  logo_url VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- SKILLS
CREATE TABLE IF NOT EXISTS skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  skill VARCHAR(100) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- JOBS
CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  posted_by INT,
  company VARCHAR(100) NOT NULL,
  title VARCHAR(150),
  description TEXT,
  branche VARCHAR(50),
  district VARCHAR(50),
  hours VARCHAR(30),
  experience_level VARCHAR(50),
  salary VARCHAR(50),
  image_url VARCHAR(255),
  views INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL
);

-- SERVICES
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  posted_by INT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  branche VARCHAR(50),
  district VARCHAR(50),
  price_range VARCHAR(50),
  image_url VARCHAR(255),
  contact VARCHAR(100),
  views INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL
);

-- MARKET ITEMS
CREATE TABLE IF NOT EXISTS market_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price VARCHAR(50),
  category VARCHAR(50),
  condition_type VARCHAR(30),
  district VARCHAR(50),
  image_url VARCHAR(255),
  views INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- SAVED
CREATE TABLE IF NOT EXISTS saved_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_type ENUM('job','service','market') NOT NULL,
  item_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_save (user_id, item_type, item_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- APPLICATIONS
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  job_id INT NOT NULL,
  status ENUM('pending','viewed','accepted','rejected') DEFAULT 'pending',
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_application (user_id, job_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('job','message','accept','reject','system','important','application') DEFAULT 'system',
  title VARCHAR(150) NOT NULL,
  body TEXT,
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  important BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- SEED DATA
INSERT IGNORE INTO jobs (company, title, description, branche, district, hours, experience_level, salary, image_url) VALUES
('SuriTech', 'Front-End Developer', 'Wij zoeken een enthousiaste front-end developer met ervaring in HTML, CSS en JavaScript. Je werkt aan moderne webapplicaties.', 'ICT', 'Paramaribo', 'Fulltime', 'Medior', 'SRD 15.000', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200'),
('Creative Studio', 'Marketing Designer', 'Marketing designer gezocht voor social media campagnes en branding. Ervaring met Adobe Suite een pre.', 'Marketing', 'Wanica', 'Parttime', 'Junior', 'SRD 8.000', 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200'),
('Tech Solutions', 'ICT Medewerker', 'ICT medewerker gezocht met ervaring in webdevelopment en netwerken.', 'ICT', 'Paramaribo', 'Fulltime', 'Senior', 'SRD 18.000', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200'),
('Bouwbedrijf Vesta', 'Bouwvakker', 'Ervaren bouwvakker gezocht voor renovatieprojecten in Paramaribo en omgeving.', 'Bouw', 'Paramaribo', 'Fulltime', 'Medior', 'SRD 12.000', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200'),
('Restaurant Roopram', 'Kok', 'Wij zoeken een gepassioneerde kok met ervaring in Surinaamse en Indiase keuken.', 'Horeca', 'Paramaribo', 'Fulltime', 'Senior', 'SRD 10.000', 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=1200');

INSERT IGNORE INTO services (name, description, branche, district, price_range, image_url, contact) VALUES
('Naomi Nails', 'Professionele nail artist gespecialiseerd in gel nails, acryl en nail art designs. Werk vanuit huis in Paramaribo.', 'Schoonheid', 'Paramaribo', 'Gemiddeld', 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?q=80&w=1200', '+597 8888888'),
('Mike Photography', 'Professionele fotograaf voor events, weddings, fotoshoots en commerciële opdrachten.', 'Marketing', 'Paramaribo', 'Premium', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200', '+597 7777777'),
('AutoFix Center', 'Auto reparatie en onderhoud. APK keuringen, banden, remmen, motoronderhoud.', 'Reparatie', 'Wanica', 'Gemiddeld', 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?q=80&w=1200', '+597 6666666');
