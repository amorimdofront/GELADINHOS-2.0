/*
  # Add Sales to Transactions Sync

  1. New Function
    - `sync_sale_to_transaction` - Automatically creates income transaction when sale is created

  2. New Trigger
    - Trigger on sales INSERT to call the sync function
    - Links sales to financial transactions with category "Venda de Produto"

  3. Changes
    - When a sale is registered, it automatically creates an income transaction
    - Transaction references the sale and includes product name
    - All sales data is now reflected in financial overview
*/

CREATE OR REPLACE FUNCTION sync_sale_to_transaction()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO transactions (
    type,
    description,
    amount,
    category,
    date,
    created_by
  )
  VALUES (
    'income',
    'Venda: ' || (SELECT name FROM products WHERE id = NEW.product_id LIMIT 1),
    NEW.total_amount,
    'Venda de Produto',
    NEW.date,
    NEW.created_by
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_sale_to_transaction ON sales;

CREATE TRIGGER trigger_sync_sale_to_transaction
AFTER INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION sync_sale_to_transaction();
