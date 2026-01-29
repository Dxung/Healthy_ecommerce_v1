CREATE TABLE authorization_schema.users_have_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assigned_by UUID,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expire_at TIMESTAMP,
    
    PRIMARY KEY (user_id, role_id),
    
    CONSTRAINT fk_uhr_role
        FOREIGN KEY (role_id)
        REFERENCES authorization_schema.roles(id)
        ON DELETE CASCADE,

	CONSTRAINT fk_uhr_user
        FOREIGN KEY (user_id)
        REFERENCES users_schema.user_core(id)
        ON DELETE CASCADE

	CREATE INDEX idx_uhr_role_id ON authorization_schema.users_have_roles(role_id);
);