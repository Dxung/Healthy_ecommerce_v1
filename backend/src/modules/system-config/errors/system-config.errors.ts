export const SYSTEM_CONFIG_ERRORS = {
  CONFIG_NOT_FOUND: {
    code: 'CONFIG_NOT_FOUND',
    message: 'Configuration key not found.',
  },
  INVALID_VALUE: {
    code: 'CONFIG_INVALID_VALUE',
    message: 'Invalid configuration value.',
  },
} as const satisfies Record<string, { code: string; message: string }>;
