  CREATE TYPE penalty_schema.violation_code_enum AS ENUM (
      'order_cancelled',
      'order_not_confirmed',
      'wrong_product_name',
      'wrong_category',
      'prohibited_item',
      'counterfeit',
      'fake_orders'
  );

  CREATE TYPE penalty_schema.penalty_effect_code_enum AS ENUM (
      'search_priority_reduced',
      'hidden_from_search',
      'product_edit_blocked',
      'account_frozen'
  );