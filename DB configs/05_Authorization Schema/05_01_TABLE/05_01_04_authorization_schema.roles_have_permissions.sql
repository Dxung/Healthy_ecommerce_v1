CREATE TABLE authorization_schema.roles_have_permissions (
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
	note VARCHAR(255),
    granted_by UUID,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);
    
    PRIMARY KEY (role_id, permission_id),
    
    CONSTRAINT fk_rhp_role
        FOREIGN KEY (role_id)
        REFERENCES authorization_schema.roles(id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_rhp_permission
        FOREIGN KEY (permission_id)
        REFERENCES authorization_schema.permissions(id)
        ON DELETE CASCADE

	CREATE INDEX idx_rhp_permission_id ON authorization_schema.roles_have_permissions(permission_id);
	