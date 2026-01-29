  CREATE TABLE penalty_schema.penalty_tier_effects (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      penalty_tier_level SMALLINT NOT NULL,
      effect_code penalty_schema.penalty_effect_code_enum NOT NULL,
      is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_tier_effect UNIQUE(penalty_tier_level, effect_code),
      CONSTRAINT fk_penalty_tier FOREIGN KEY (penalty_tier_level)
          REFERENCES penalty_schema.penalty_tiers(level)
  );