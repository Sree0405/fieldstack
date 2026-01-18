import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateFieldDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsOptional()
    dbColumn?: string;

    @IsString()
    @IsNotEmpty()
    type!: string;

    @IsBoolean()
    @IsOptional()
    required?: boolean;

    @IsOptional()
    defaultValue?: any;

    @IsString()
    @IsOptional()
    uiComponent?: string;
}

export class UpdateCollectionSchemaDto {
    @IsString()
    @IsOptional()
    displayName?: string;

    @IsArray()
    @IsOptional()
    fields?: CreateFieldDto[];
}
