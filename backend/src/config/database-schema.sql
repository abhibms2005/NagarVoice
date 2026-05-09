-- NagarVoice Database Schema for Supabase PostgreSQL

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    phone VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    ward VARCHAR(100),
    zone VARCHAR(50),
    area VARCHAR(100),
    address VARCHAR(255),
    pincode VARCHAR(6),
    avatar VARCHAR(10),
    avatar_color VARCHAR(7),
    civic_score INT DEFAULT 0,
    tier VARCHAR(20) DEFAULT 'New',
    points INT DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE,
    bio VARCHAR(500),
    issues_reported INT DEFAULT 0,
    issues_resolved INT DEFAULT 0,
    total_upvotes_received INT DEFAULT 0,
    joined_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Issues table
CREATE TABLE IF NOT EXISTS issues (
    issue_id TEXT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    ward VARCHAR(100),
    zone VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address VARCHAR(500),
    status VARCHAR(50) DEFAULT 'reported',
    priority VARCHAR(20) DEFAULT 'medium',
    reported_by TEXT NOT NULL,
    reporter_name VARCHAR(100),
    anonymous BOOLEAN DEFAULT FALSE,
    upvotes INT DEFAULT 0,
    assigned_to VARCHAR(255),
    photo_url VARCHAR(500),
    after_photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (reported_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create Comments table
CREATE TABLE IF NOT EXISTS comments (
    comment_id TEXT PRIMARY KEY,
    issue_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name VARCHAR(100),
    text VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (issue_id) REFERENCES issues(issue_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create Issue Timeline table
CREATE TABLE IF NOT EXISTS issue_timeline (
    timeline_id TEXT PRIMARY KEY,
    issue_id TEXT NOT NULL,
    status VARCHAR(50),
    note VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (issue_id) REFERENCES issues(issue_id) ON DELETE CASCADE
);

-- Create Upvotes table
CREATE TABLE IF NOT EXISTS upvotes (
    upvote_id TEXT PRIMARY KEY,
    issue_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(issue_id, user_id),
    FOREIGN KEY (issue_id) REFERENCES issues(issue_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type VARCHAR(50),
    title VARCHAR(200),
    message VARCHAR(500),
    issue_id TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (issue_id) REFERENCES issues(issue_id) ON DELETE SET NULL
);

-- Create Badges table
CREATE TABLE IF NOT EXISTS user_badges (
    badge_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    badge_name VARCHAR(100),
    earned_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_issues_ward ON issues(ward);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_reported_by ON issues(reported_by);
CREATE INDEX IF NOT EXISTS idx_issues_created ON issues(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_issue ON comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_issue ON upvotes(issue_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
