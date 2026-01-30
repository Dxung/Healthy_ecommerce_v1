import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import { RequirementType } from 'src/database/typeorm/entities/shop/enums/requirement-type.enum';
import { ShopAttributeCode } from 'src/database/typeorm/entities/shop/enums/shop-attribute-code.enum';
import { ComparisonOperator } from 'src/database/typeorm/entities/shop/enums/comparison-operator.enum';

/**
 * DTO for adding a requirement to a badge.
 */
export class AddRequirementArgumentDto {
  @ApiProperty({
    enum: RequirementType,
    description: 'Type of requirement (document or attribute)',
  })
  @IsNotEmpty()
  @IsEnum(RequirementType)
  requirementType: RequirementType;

  // Document requirement fields (required if requirementType === 'document')
  @ApiPropertyOptional({
    description: 'Document type ID (required for document requirements)',
  })
  @ValidateIf((o) => o.requirementType === RequirementType.DOCUMENT)
  @IsNotEmpty()
  @IsString()
  documentTypeId?: string;

  // Attribute requirement fields (required if requirementType === 'attribute')
  @ApiPropertyOptional({
    enum: ShopAttributeCode,
    description: 'Attribute code (required for attribute requirements)',
  })
  @ValidateIf((o) => o.requirementType === RequirementType.ATTRIBUTE)
  @IsNotEmpty()
  @IsEnum(ShopAttributeCode)
  attributeCode?: ShopAttributeCode;

  @ApiPropertyOptional({
    enum: ComparisonOperator,
    description: 'Comparison operator (required for attribute requirements)',
  })
  @ValidateIf((o) => o.requirementType === RequirementType.ATTRIBUTE)
  @IsNotEmpty()
  @IsEnum(ComparisonOperator)
  operator?: ComparisonOperator;

  @ApiPropertyOptional({
    description: 'Attribute value (required for attribute requirements)',
    example: 4.5,
  })
  @ValidateIf((o) => o.requirementType === RequirementType.ATTRIBUTE)
  @IsNotEmpty()
  @IsNumber()
  attributeValue?: number;
}
