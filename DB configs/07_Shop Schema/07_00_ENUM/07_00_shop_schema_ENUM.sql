CREATE TYPE shop_schema.shop_status_enum AS ENUM ('active', 'inactive', 'suspended', 'banned');
  CREATE TYPE shop_schema.badge_code_enum AS ENUM ('preferred', 'approved', 'official');
  CREATE TYPE shop_schema.badge_status_enum AS ENUM ('active', 'disabled');
  CREATE TYPE shop_schema.document_status_enum AS ENUM ('pending', 'approved', 'rejected', 'expired');
  CREATE TYPE shop_schema.badge_request_status_enum AS ENUM ('pending', 'approved', 'rejected', 'auto_rejected');
  CREATE TYPE shop_schema.brand_status_enum AS ENUM ('pending', 'active', 'expired');
  CREATE TYPE shop_schema.comparison_operator_enum AS ENUM ('gt', 'gte', 'lt', 'lte', 'eq');
  CREATE TYPE shop_schema.shop_registration_status_enum AS ENUM ('pending', 'approved', 'rejected');
  CREATE TYPE shop_schema.requirement_type_enum AS ENUM ('document', 'attribute');  -- ADD THIS
  CREATE TYPE shop_schema.shop_attribute_code_enum AS ENUM (
      'average_rating',
      'order_success_rate',
      'total_orders_30d',
      'response_time_hours',
      'return_rate',
      'penalty_points',
      'penalty_tier'
  );