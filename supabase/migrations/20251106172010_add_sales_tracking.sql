/*
  # Add Sales Tracking Table

  1. New Tables
    - `sales`
      - `id` (uuid, primary key)
      - `product_id` (uuid) - Link to products table
      - `quantity` (integer) - Quantity sold
      - `unit_price` (decimal) - Price per unit
      - `total_amount` (decimal) - Total sale amount
      - `date` (date) - Date of sale
      - `notes` (text) - Optional notes
      - `created_at` (timestamptz) - Creation timestamp
      - `created_by` (uuid) - User who created the sale

  2. Indexes
    - Index on product_id for faster queries
    - Index on date for range queries

  3. Security
    - Enable RLS on `sales` table
    - Authenticated users can view all sales
    - Authenticated users can create/update/delete their own sales
*/

CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL CHECK (unit_price > 0),
  total_amount decimal(10,2) NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX idx_sales_product_id ON sales(product_id);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_created_by ON sales(created_by);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sales"
  ON sales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sales"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update sales"
  ON sales FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can delete sales"
  ON sales FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);
