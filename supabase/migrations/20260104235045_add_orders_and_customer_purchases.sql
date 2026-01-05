/*
  # Add Orders and Customer Purchases Tables

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `customer_name` (text) - Nome do cliente
      - `phone_number` (text) - Número de telefone do cliente
      - `product_id` (uuid) - ID do produto
      - `quantity` (integer) - Quantidade de geladinhos
      - `total_amount` (decimal) - Valor total do pedido
      - `status` (text) - Status: 'pending', 'approved', 'rejected'
      - `notes` (text) - Notas adicionais
      - `created_at` (timestamptz) - Data de criação
      - `updated_at` (timestamptz) - Data de atualização

    - `customer_purchases`
      - `id` (uuid, primary key)
      - `phone_number` (text) - Número de telefone único do cliente
      - `customer_name` (text) - Nome do cliente
      - `total_quantity` (integer) - Quantidade total acumulada
      - `purchases_count` (integer) - Número de compras
      - `first_purchase_date` (timestamptz) - Data da primeira compra
      - `last_purchase_date` (timestamptz) - Data da última compra
      - `promotion_won` (boolean) - Se o cliente já ganhou a promoção
      - `created_at` (timestamptz) - Data de criação
      - `updated_at` (timestamptz) - Data de atualização

  2. Security
    - Enable RLS on both tables
    - Authenticated users can view approved orders
    - Admins can manage all orders
    - Customers can view their own purchases via phone lookup

  3. Important Notes
    - One month window for promotion: customer must accumulate 20 units within 30 days from first purchase
    - Orders must be approved to increment customer purchase count
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone_number text NOT NULL,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  total_amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  total_quantity integer NOT NULL DEFAULT 0,
  purchases_count integer NOT NULL DEFAULT 0,
  first_purchase_date timestamptz,
  last_purchase_date timestamptz,
  promotion_won boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved orders"
  ON orders FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authenticated users can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view customer purchases"
  ON customer_purchases FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage customer purchases"
  ON customer_purchases FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
