import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
export class CreateProductDto {
  @IsOptional() @IsString() id?: string;
  @IsOptional() @IsString() slug?: string;
  @IsString() title: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() badge?: string;
  @IsOptional() @IsNumber() rating?: number;
  @IsNumber() price: number;
  @IsOptional() @IsNumber() compareAt?: number;
  @IsOptional() @IsArray() images?: string[];
  @IsOptional() @IsArray() sizes?: string[] | null;
  @IsOptional() @IsNumber() stock?: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() reorderLevel?: number;
}
