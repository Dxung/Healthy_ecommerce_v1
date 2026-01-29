CREATE TABLE location_schema.districts (
    id VARCHAR(50) PRIMARY KEY,
    province_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    type VARCHAR(20),
    name_with_type VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_district_province
        FOREIGN KEY (province_id)
        REFERENCES location_schema.provinces(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_districts_province_id ON location_schema.districts(province_id);
CREATE INDEX idx_districts_name ON location_schema.districts(name);