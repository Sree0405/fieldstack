import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  tableName?: string;

  @IsArray()
  @IsOptional()
  fields?: any[];
}
