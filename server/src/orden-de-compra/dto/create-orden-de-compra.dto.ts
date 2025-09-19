// src/orden-de-compra/dto/create-orden-de-compra.dto.ts
import { IsArray, IsNotEmpty, IsNumber, IsPositive, ValidateNested, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class ProductoOrdenDto {
  @IsNumber()
  @IsPositive()
  productoId: number;

  @IsNumber()
  @IsPositive()
  cantidad: number;
}

export class CreateOrdenDeCompraDto {
  @IsNumber()
  @IsPositive()
  proveedorId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductoOrdenDto)
  @IsNotEmpty()
  productos: ProductoOrdenDto[];

  @IsOptional()
  @IsString()
  nombreEmpresa?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}