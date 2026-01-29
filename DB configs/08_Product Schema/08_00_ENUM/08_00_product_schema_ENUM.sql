CREATE TYPE product_schema.product_status_enum AS ENUM ('draft', 'active', 'inactive', 'suspended', 'deleted');
CREATE TYPE product_schema.unit_category_enum AS ENUM ('measurement', 'selling');
CREATE TYPE product_schema.unit_type_enum AS ENUM ('weight', 'volume', 'quantity');