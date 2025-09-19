// src/proveedores/dto/create-proveedor.dto.ts
import { IsBoolean, IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CreateProveedorDto {

  @IsString()
  @Length(0, 20) 
  nombre?: string;

  @IsString()
  @Length(8, 13) 
  cuit?: string;

  @IsOptional()
  @IsEmail()
  @Length(3, 120)
  email?: string;

  @IsOptional()
  @IsString()
  @Length(0, 30)
  telefono?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  direccion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}