---
name: backend-architecture
description: Enforces backend architectural rules and patterns. Use when writing, reviewing, or modifying backend code including controllers, services, repositories, modules, error handling. Ensures clean architecture with proper dependency injection, interface-based imports, ResultAsync error handling, and layer separation.
---

# Backend Architecture Rules

This skill enforces the architectural patterns and constraints for the NestJS backend. Always follow these rules when writing or reviewing backend code.

---

## 1. Dependency Injection Rules

### Controllers MUST import services through interfaces and tokens

```typescript
// CORRECT
@Controller('example')
export class ExampleController {
  constructor(
    @Inject(EXAMPLE_SERVICE)
    private readonly exampleService: IExampleService,
  ) {}
}

// WRONG - Never inject service class directly
@Controller('example')
export class ExampleController {
  constructor(
    private readonly exampleService: ExampleService, // WRONG!
  ) {}
}
```

### Services MUST import repositories and other services through interfaces and tokens

```typescript
// CORRECT
@Injectable()
export class ExampleService implements IExampleService {
  constructor(
    @Inject(EXAMPLE_REPOSITORY)
    private readonly exampleRepository: IExampleRepository,
    @Inject(OTHER_SERVICE)
    private readonly otherService: IOtherService,
  ) {}
}

// WRONG - Never inject implementation directly
@Injectable()
export class ExampleService {
  constructor(
    private readonly exampleRepository: OrmExampleRepository, // WRONG!
    private readonly otherService: OtherService, // WRONG!
  ) {}
}
```

### Global Modules - No Import Required

The following modules are decorated with `@Global()` and do NOT need to be imported in your module:

| Module | Token | Interface | Usage |
|--------|-------|-----------|-------|
| `CustomLoggerModule` | `CUSTOM_LOG` | `ICustomLoggerService` | ALS-aware logging with request context |

```typescript
// CORRECT - Just inject, no need to import CustomLoggerModule
@Injectable()
export class ExampleService {
  constructor(
    @Inject(CUSTOM_LOG)
    private readonly logger: ICustomLoggerService,
  ) {}

  doSomething(): ResultAsync<void, DomainError> {
    this.logger.warn('Something happened', 'ExampleService');
    // ...
  }
}

// WRONG - Do NOT import CustomLoggerModule (it's global)
@Module({
  imports: [CustomLoggerModule], // WRONG! Not needed
})
export class ExampleModule {}
```

---

## 2. Module Boundary Rules

### Controllers CANNOT call services from other modules directly

Controllers should only inject and use services from their own module. Cross-module communication must go through the service layer.

```typescript
// CORRECT - Controller uses only its own module's service
@Controller('order')
export class OrderController {
  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderService: IOrderService, // Same module - OK
  ) {}
}

// WRONG - Controller importing service from another module
@Controller('order')
export class OrderController {
  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderService: IOrderService,
    @Inject(USER_SERVICE)
    private readonly userService: IUserService, // WRONG! Different module
  ) {}
}
```

**If cross-module data is needed:**
- The controller's own service should handle the cross-module communication
- Services CAN import other module's services through interfaces

---

## 3. Error Handling Rules

### Services and Repositories MUST NOT use `throw` or `new Error()`

All error handling in services and repositories must use `ResultAsync` with `createDomainError`.

```typescript
// CORRECT - In Service/Repository
import { ResultAsync, errAsync } from 'neverthrow';
import { createDomainError } from '@shared/utils/create-domain-error.util';

// Return error via ResultAsync
return errAsync(createDomainError(EXAMPLE_ERRORS.NOT_FOUND, { cause: error }));

// Or wrap promises
return ResultAsync.fromPromise(
  this.repository.findOne({ where: { id } }),
  (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
);

// WRONG - Never throw in service/repository
throw new Error('Something went wrong'); // WRONG!
throw new NotFoundException('Not found'); // WRONG!
if (!user) throw new Error('User not found'); // WRONG!
```

### Only Controllers can throw exceptions (via ErrorHttpMapper)

```typescript
// CORRECT - Controller throws via mapper in match()
return this.exampleService.doSomething().match(
  (result) => new ExampleResponseDto(result),
  (error) => {
    throw ExampleErrorHttpMapper.toHttpException(error, ExceptionSource.CONTROLLER);
  },
);
```

---

## 4. Controller Simplicity Rules

### Controllers MUST NOT contain business logic

Controllers should only:
1. Receive requests
2. Call service methods
3. Transform results to DTOs
4. Handle errors via mappers

### Controllers MUST NOT do math or calculations

```typescript
// WRONG - Math in controller
@Get('discount')
getDiscount() {
  const price = 100;
  const discount = price * 0.1; // WRONG! Business logic
  return { discount };
}

// CORRECT - Delegate to service
@Get('discount')
getDiscount() {
  return this.pricingService.calculateDiscount().match(
    (result) => new DiscountResponseDto(result),
    (error) => { throw PricingErrorHttpMapper.toHttpException(error, ExceptionSource.CONTROLLER); },
  );
}
```

### Controllers MUST NOT have complex async/await chains

```typescript
// WRONG - Complex async logic in controller
@Post('order')
async createOrder(@Body() dto: CreateOrderDto) {
  const user = await this.userService.findUser(dto.userId); // WRONG!
  const product = await this.productService.findProduct(dto.productId); // WRONG!
  const order = await this.orderService.create(user, product); // WRONG!
  await this.notificationService.notify(user); // WRONG!
  return order;
}

// CORRECT - Single service call, service handles orchestration
@Post('order')
createOrder(@Body() dto: CreateOrderDto) {
  return this.orderService.createOrder(dto).match(
    (result) => new OrderResponseDto(result),
    (error) => { throw OrderErrorHttpMapper.toHttpException(error, ExceptionSource.CONTROLLER); },
  );
}
```

### Controllers MUST use `.match()` pattern, NOT `await` with `if (result.isErr())`

Always use the functional `.match()` pattern to handle `ResultAsync` returns. Do NOT use `await` followed by imperative error checking.

```typescript
// CORRECT - Use .match() pattern (returns Promise directly)
@Get(':id')
getById(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseDto> {
  return this.service.getById(id).match(
    (value) => new ResponseDto(value),
    (error) => {
      throw ErrorHttpMapper.toHttpException(error, ExceptionSource.CONTROLLER);
    },
  );
}

// CORRECT - With query params processing before .match()
@Get()
getAll(@Query('activeOnly') activeOnly?: string): Promise<ResponseDto[]> {
  const isActiveOnly = activeOnly === 'true';

  return this.service.getAll(isActiveOnly).match(
    (items) => ResponseDto.fromList(items),
    (error) => {
      throw ErrorHttpMapper.toHttpException(error, ExceptionSource.CONTROLLER);
    },
  );
}

// WRONG - Do NOT use await with if (result.isErr())
@Get(':id')
async getById(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseDto> {
  const result = await this.service.getById(id);  // WRONG!

  if (result.isErr()) {  // WRONG!
    throw ErrorHttpMapper.toHttpException(result.error, ExceptionSource.CONTROLLER);
  }

  return new ResponseDto(result.value);  // WRONG!
}
```

**Why `.match()` pattern:**
- More functional and declarative
- Removes need for `async` keyword on method
- Forces handling both success and error cases
- Cleaner, more consistent codebase
- No intermediate `result` variable needed

---

## 5. Controller match() Usage Rules

The `.match()` method in controllers should ONLY be used for:

### 1. Converting data to response DTOs (success path)

```typescript
// CORRECT
.match(
  (result) => new UserResponseDto(result), // Convert to DTO
  (error) => { /* error handling */ },
)

// CORRECT - Setting cookies + returning DTO
.match(
  (result) => {
    response.cookie(SESSION_COOKIE_NAME, result.sessionToken, cookieOptions);
    return new LoginResponseDto(result);
  },
  (error) => { /* error handling */ },
)
```

### 2. Throwing exceptions via ErrorHttpMapper (error path)

```typescript
// CORRECT
.match(
  (result) => new ResponseDto(result),
  (error) => {
    throw ModuleErrorHttpMapper.toHttpException(error, ExceptionSource.CONTROLLER);
  },
)
```

### match() MUST NOT contain:

```typescript
// WRONG - Business logic in match
.match(
  (result) => {
    const processed = result.map(item => item.value * 2); // WRONG! Business logic
    return new ResponseDto(processed);
  },
  (error) => { throw ErrorMapper.toHttpException(error, ExceptionSource.CONTROLLER); },
)

// WRONG - Database calls in match
.match(
  async (result) => {
    await this.repository.save(result); // WRONG! DB operation
    return new ResponseDto(result);
  },
  (error) => { throw ErrorMapper.toHttpException(error, ExceptionSource.CONTROLLER); },
)

// WRONG - Conditional business logic
.match(
  (result) => {
    if (result.status === 'pending') { // WRONG! Business logic
      return new PendingResponseDto(result);
    }
    return new CompletedResponseDto(result);
  },
  (error) => { throw ErrorMapper.toHttpException(error, ExceptionSource.CONTROLLER); },
)
```

---

## 6. File Structure Reference

```
backend/src/
├── modules/
│   └── [module-name]/
│       ├── [module-name].controller.ts     # HTTP layer
│       ├── [module-name].service.ts        # Business logic
│       ├── [module-name].service.interface.ts
│       ├── [module-name].module.ts
│       ├── dto/                            # Request/Response DTOs
│       ├── errors/
│       │   ├── [module]-errors.ts          # Error constants
│       │   └── [module]-errors-http.mapper.ts
│       ├── models/                         # Domain models
│       ├── enums/                          # Domain enums (used by models/services)
│       ├── repository/
│       │   └── [entity].repository.interface.ts
│       └── tokens/
│           └── [module].token.ts           # DI tokens (Symbols)
│
├── database/
│   └── typeorm/
│       ├── entities/                       # ORM entities
│       │   └── [entity-group]/
│       │       ├── orm.[entity].entity.ts
│       │       ├── enums/                  # Entity enums (used by ORM entities)
│       │       │   └── [entity]-status.enum.ts
│       │       └── index.ts
│       ├── repositories/                   # Repository implementations
│       ├── mappers/                        # ORM <-> Domain mappers
│       └── tokens/                         # Repository DI tokens
│
└── shared/
    ├── errors/                             # Shared error definitions
    └── types/                              # Shared types (DomainError, etc.)
```

### Entity Enums Location Rule

Enums used by ORM entities MUST be placed in the database layer:

```typescript
// CORRECT - Enum in database/typeorm/entities/[group]/enums/
// File: database/typeorm/entities/shop/enums/shop-registration-status.enum.ts
export enum ShopRegistrationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Entity imports from same folder
// File: database/typeorm/entities/shop/orm.shop-registration-request.entity.ts
import { ShopRegistrationStatus } from './enums/shop-registration-status.enum';

// WRONG - Entity enum in modules folder
import { ShopRegistrationStatus } from 'src/modules/shop/enums/...'; // WRONG!
```

---

## 7. Quick Reference Checklist

When writing or reviewing backend code, verify:

| Rule | Check |
|------|-------|
| Controller DI | Uses `@Inject(TOKEN)` + interface type |
| Service DI | Uses `@Inject(TOKEN)` + interface type for repos/services |
| Module boundaries | Controller only injects its own module's service |
| Service errors | Uses `ResultAsync` + `createDomainError`, NO `throw`/`new Error` |
| Repository errors | Uses `ResultAsync` + `createDomainError`, NO `throw`/`new Error` |
| Controller logic | No math, no complex async chains, no business logic |
| Controller pattern | Uses `.match()` pattern, NOT `await` + `if (result.isErr())` |
| Controller match() | Only DTO conversion (success) + ErrorHttpMapper (error) |

---

## 8. Common Patterns

### Service method returning ResultAsync

```typescript
doSomething(id: string): ResultAsync<SomethingModel, DomainError> {
  return this.repository
    .findById(id)
    .andThen((entity) => {
      if (!entity) {
        return errAsync(createDomainError(MODULE_ERRORS.NOT_FOUND, { cause: null }));
      }
      return okAsync(entity);
    });
}
```

### Controller endpoint pattern

```typescript
@Get(':id')
getById(@Param('id') id: string) {
  return this.service.findById(id).match(
    (result) => new ResponseDto(result),
    (error) => {
      throw ModuleErrorHttpMapper.toHttpException(error, ExceptionSource.CONTROLLER);
    },
  );
}
```

### Error constant definition

```typescript
export const MODULE_ERRORS = {
  NOT_FOUND: {
    code: 'MODULE_NOT_FOUND',
    message: 'The requested resource was not found.',
  },
  INVALID_INPUT: {
    code: 'MODULE_INVALID_INPUT',
    message: 'The provided input is invalid.',
  },
} as const satisfies Record<string, { code: string; message: string }>;
```

### Repository PostgreSQL Error Handling Pattern

When handling database errors in repositories, follow this exact pattern to properly detect and handle PostgreSQL-specific errors:

```typescript
import { isQueryFailedPostgresError } from '../../guards/type-guard.database';
import { PG_UNIQUE_VIOLATION } from 'src/database/constant/postgresql-error.constant';
import { sanitizePostgresError } from '../../guards/sanitize-postgres-error.util';

return ResultAsync.fromPromise(repo.save(ormEntity), (error) => {
  // Step 1: Check if it's a PostgreSQL QueryFailedError using type guard
  if (isQueryFailedPostgresError(error)) {
    // Step 2: Sanitize the error to remove sensitive database information
    const safeError = sanitizePostgresError(error.driverError);

    // Step 3: Check if it's a unique constraint violation
    if (error.driverError.code === PG_UNIQUE_VIOLATION) {
      // Step 4: Check the specific constraint name to determine which field caused it
      if (error.driverError.constraint === 'table_column_key') {
        return createDomainError(MODULE_ERRORS.FIELD_ALREADY_EXISTS, {
          cause: safeError,
        });
      }
      if (error.driverError.constraint === 'idx_partial_unique_constraint') {
        return createDomainError(MODULE_ERRORS.DUPLICATE_ENTRY, {
          cause: safeError,
        });
      }
    }
  }

  // Step 5: For other database errors, return generic DB_ERROR
  return createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error });
});
```

**Key utilities:**
- `isQueryFailedPostgresError(error)` - Type guard to check if error is PostgreSQL QueryFailedError
- `sanitizePostgresError(error.driverError)` - Removes sensitive info (table, schema, details) from error
- `PG_UNIQUE_VIOLATION` - Constant for PostgreSQL unique violation code ('23505')
- `error.driverError.constraint` - The constraint name that caused the violation

**Important:** Always sanitize the error before using it as `cause` to prevent leaking database schema information.

### Getting Current User ID from ALS in Services

When a service method requires the current user ID (set by AuthGuard), follow this pattern:

```typescript
@WithPosition()
someMethod(): ResultAsync<SomeType, DomainError> {
  // Step 1: Get current user ID from ALS (set by AuthGuard)
  const store = this.als.getStore();
  const userId = store?.userId;

  // If no userId in ALS, return error (shouldn't happen if AuthGuard is used)
  if (!userId) {
    return errAsync(
      createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
        cause: SHARED_ERRORS.SYSTEM_ERROR.message,
      }),
    );
  }

  // Continue with business logic using userId...
  return this.repository.findByUserId(userId);
}
```

**Key points:**
- Extract `userId` first: `const userId = store?.userId;`
- Check separately: `if (!userId)`
- Use `SYSTEM_ERROR` (not `UNAUTHORIZED`) - missing userId is a bug/system issue, not auth failure
- Comment: "shouldn't happen if AuthGuard is used"

### UUID v7 Generation Pattern

When generating UUIDs in domain models (factory methods), always use UUID v7 from the `uuid` package:

```typescript
// CORRECT - Import v7 as uuidv7 from 'uuid' package
import { v7 as uuidv7 } from 'uuid';

export class SomeModel {
  static createNew(data: CreateData): SomeModel {
    const id = uuidv7();  // Generates time-sortable UUID
    const now = new Date();

    return new SomeModel(
      id,
      data.someField,
      now,
      now,
    );
  }
}

// WRONG - Do not use 'uuidv7' package (doesn't exist in this project)
import { uuidv7 } from 'uuidv7';  // WRONG! Package not installed

// WRONG - Do not use v4 for entity IDs (not time-sortable)
import { v4 as uuidv4 } from 'uuid';
const id = uuidv4();  // WRONG for entity IDs! Use v7 instead
```

**Why UUID v7:**
- Time-sortable: UUIDs sort chronologically by creation time
- Better database indexing performance than v4
- Maintains uniqueness guarantees

**When to use v4 vs v7:**
| Use Case | UUID Version |
|----------|--------------|
| Entity IDs (models) | v7 - `import { v7 as uuidv7 } from 'uuid';` |
| Temporary tokens | v4 - `import { v4 as uuidv4 } from 'uuid';` |
| Session tokens | v4 - `import { v4 as uuidv4 } from 'uuid';` |

---

## 9. Controller Authentication & Authorization Patterns

### No Global Guard - Authentication is Opt-In

The backend does NOT use a global AuthGuard. Controllers must explicitly apply guards when authentication is required.

### Protected Routes (Requires Auth + Permissions)

Use `@UseGuards(AuthGuard, PermissionsGuard)` at class level + `@Permissions(...)` per route:

```typescript
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';

@Controller('admin/categories')
@UseGuards(AuthGuard, PermissionsGuard)  // Class-level guards
export class AdminCategoryController {
  @Get()
  @Permissions('category:read')  // Route-level permission
  getAllCategories() { /* ... */ }

  @Post()
  @Permissions('category:create')
  createCategory() { /* ... */ }
}
```

### Auth-Only Routes (Auth Required, No Specific Permission)

Use `@UseGuards(AuthGuard)` only:

```typescript
@Get('my-shop')
@UseGuards(AuthGuard)  // Just needs to be logged in
async getMyShop() { /* ... */ }
```

### Public Routes (No Auth Required)

Simply don't use any guards - routes are public by default:

```typescript
@Controller('categories')
export class PublicCategoryController {
  // No @UseGuards = public endpoint
  @Get()
  getCategories() { /* ... */ }

  @Get('hierarchy')
  getCategoryHierarchy() { /* ... */ }
}
```

### Import Paths Reference

| Import | Path |
|--------|------|
| `AuthGuard` | `'../auth/guards/auth.guard'` |
| `PermissionsGuard` | `'../authorization/guards/permissions.guard'` |
| `Permissions` | `'../authorization/decorators/permissions.decorator'` |

### WRONG Patterns

```typescript
// WRONG - @Public() decorator is not needed (no global guard)
@Controller('products')
@Public()  // WRONG! Not needed
export class PublicProductController { }

// WRONG - Importing from wrong path
import { Permissions } from 'src/modules/auth/decorators/permissions.decorator';  // WRONG!
// CORRECT:
import { Permissions } from '../authorization/decorators/permissions.decorator';

// WRONG - Using PermissionsGuard without AuthGuard
@UseGuards(PermissionsGuard)  // WRONG! AuthGuard must come first
```

---

## 10. Database Schema Reference Rule

### ALWAYS check for database schema files before creating/modifying entities

When working on anything related to **entities**, **repositories**, **ORM entities**, or **domain models**, ALWAYS check if there's a corresponding schema file in the `DB configs/` folder first.

**Schema files location:**
```
DB configs/
├── 01_User Schema/
├── 02_Auth Schema/
├── 03_Location Schema/
├── 04_Session Schema/
├── 05_Authorization Schema/
├── 06_Shop Schema/
│   ├── 06_00_ENUM/
│   │   └── 06_00_shop_schema_ENUM.sql
│   └── 06_01_TABLE/
│       ├── 06_01_01_shop_schema.shops.sql
│       ├── 06_01_02_shop_schema.shop_badges.sql
│       └── ...
├── 07_Product Schema/
└── ...
```

**Before creating or modifying:**
1. Check if the schema folder exists: `DB configs/XX_[Schema Name]/`
2. Read the relevant `.sql` files to understand:
   - Exact column names (e.g., `owner_id` vs `user_id`)
   - Column types and constraints
   - Enum values
   - Foreign key relationships
   - Index definitions

**If no schema file exists:**
- ASK the user to provide the database schema before proceeding
- Do NOT guess or assume the schema based on code patterns

**Example workflow:**
```
User: Create an entity for the products table

Claude: Let me check if there's a schema file for products...
[Reads: DB configs/07_Product Schema/07_01_TABLE/...]

// If found: Proceed with the actual schema
// If not found: "I don't see a schema file for products. Could you provide the database schema?"
```

**Why this matters:**
- ORM entities MUST match the actual database schema exactly
- Column name mismatches cause runtime errors (e.g., `badge_type` vs `badge_code`)
- Missing columns or wrong types cause data integrity issues
