/*
  # Create Library Management System Tables

  1. New Tables
    - `Book`
      - `id` (integer, primary key, auto-increment)
      - `title` (text)
      - `author` (text)
      - `qrData` (text, unique)
      - `status` (text, default 'AVAILABLE')
    - `Member`
      - `id` (integer, primary key, auto-increment)
      - `name` (text)
    - `Loan`
      - `id` (integer, primary key, auto-increment)
      - `loanDate` (timestamp, default now)
      - `dueDate` (timestamp)
      - `returnDate` (timestamp, nullable)
      - `memberId` (integer, foreign key)
      - `bookId` (integer, foreign key)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

CREATE TABLE IF NOT EXISTS "Book" (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  "qrData" TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'AVAILABLE'
);

CREATE TABLE IF NOT EXISTS "Member" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Loan" (
  id SERIAL PRIMARY KEY,
  "loanDate" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "dueDate" TIMESTAMPTZ NOT NULL,
  "returnDate" TIMESTAMPTZ,
  "memberId" INTEGER NOT NULL REFERENCES "Member"(id),
  "bookId" INTEGER NOT NULL REFERENCES "Book"(id)
);

ALTER TABLE "Book" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Member" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Loan" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to Book"
  ON "Book"
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to Member"
  ON "Member"
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to Loan"
  ON "Loan"
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);