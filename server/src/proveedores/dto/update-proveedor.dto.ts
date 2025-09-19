// src/proveedores/dto/update-proveedor.dto.ts
import { IsBoolean, IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class UpdateProveedorDto {

  @IsString()
  @Length(0, 20)
  nombre?: string;

  @IsString()
  @Length(8, 13)
  dni?: string;

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