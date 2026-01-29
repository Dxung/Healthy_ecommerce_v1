  CREATE TABLE penalty_schema.penalty_tiers (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      level SMALLINT UNIQUE NOT NULL CHECK (level BETWEEN 0 AND 4),
      name VARCHAR(100) NOT NULL,
      min_points INTEGER NOT NULL,
      max_points INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );