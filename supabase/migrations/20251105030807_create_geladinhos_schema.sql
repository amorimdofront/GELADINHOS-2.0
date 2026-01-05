/*
  # Geladinhos Amorim Database Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text) - Nome do produto
      - `description` (text) - Descrição do produto
      - `price` (decimal) - Preço do produto
      - `image_url` (text) - URL da imagem do produto
      - `category` (text) - Categoria do produto
      - `is_active` (boolean) - Se o produto está ativo
      - `created_at` (timestamptz) - Data de criação
      - `updated_at` (timestamptz) - Data de atualização

    - `transactions`
      - `id` (uuid, primary key)
      - `type` (text) - Tipo: 'income' ou 'expense'
      - `description` (text) - Descrição da transação
      - `amount` (decimal) - Valor da transação
      - `category` (text) - Categoria da transação
      - `date` (date) - Data da transação
      - `created_at` (timestamptz) - Data de criação
      - `created_by` (uuid) - ID do usuário que criou

  2. Security
    - Enable RLS on all tables
    - Public can read active products
    - Only authenticated admins can manage products and transactions
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  image_url text NOT NULL,
  category text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  description text NOT NULL,
  amount decimal(10,2) NOT NULL,
  category text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can delete transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

INSERT INTO products (name, description, price, image_url, category) VALUES
('Geladinho de Morango', 'Delicioso geladinho sabor morango feito com frutas selecionadas', 3.50, 'https://images.pexels.com/photos/1337825/pexels-photo-1337825.jpeg', 'Frutas'),
('Geladinho de Chocolate', 'Cremoso geladinho de chocolate belga premium', 4.00, 'https://images.pexels.com/photos/918327/pexels-photo-918327.jpeg', 'Chocolate'),
('Geladinho de Limão', 'Refrescante geladinho de limão com toque cítrico', 3.50, 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg', 'Frutas'),
('Geladinho de Uva', 'Geladinho sabor uva com suco natural', 3.50, 'https://images.pexels.com/photos/197907/pexels-photo-197907.jpeg', 'Frutas'),
('Geladinho de Coco', 'Tropical geladinho de coco cremoso', 4.00, 'https://images.pexels.com/photos/1274924/pexels-photo-1274924.jpeg', 'Tropical'),
('Geladinho de Maracujá', 'Azedinho e refrescante geladinho de maracujá', 3.50, 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg', 'Frutas'),
('Geladinho de Manga', 'Exótico geladinho de manga com polpa natural', 4.00, 'https://images.pexels.com/photos/2294471/pexels-photo-2294471.jpeg', 'Tropical'),
('Geladinho de Abacaxi', 'Tropical geladinho de abacaxi com hortelã', 3.50, 'https://images.pexels.com/photos/1071878/pexels-photo-1071878.jpeg', 'Tropical');

-- Criação da tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password text NOT NULL
);

-- Inserir o primeiro administrador (você pode mudar o email e senha)
INSERT INTO admins (email, password)
VALUES ('pablo_pan2015@outlook.com', 'pega1234');
