CREATE TABLE location_schema.wards (
    id VARCHAR(50) PRIMARY KEY,
    district_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    type VARCHAR(20),
    name_with_type VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ward_district
        FOREIGN KEY (district_id)
        REFERENCES location_schema.districts(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_wards_district_id ON location_schema.wards(district_id);
CREATE INDEX idx_wards_name ON location_schema.wards(name);