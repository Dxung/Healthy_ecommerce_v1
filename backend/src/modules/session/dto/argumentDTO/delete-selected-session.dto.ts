import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

/**
 * DTO for deleting a selected session
 * Used when user wants to delete a specific session (e.g., logout from a specific device)
 */
export class DeleteSelectedSessionDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  selectedSessionId: string;
}
