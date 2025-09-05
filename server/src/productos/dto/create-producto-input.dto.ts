import { Type } from "class-transformer";
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from "class-validator";

export class CreateProductoInputDto {
  @IsString({ message: "el nombre debe ser un string!" })
  @MinLength(3, { message: "el nombre debe ser de longitud mayor a 3" })
  nombre: string;

  @IsString({ message: "la descripcion debe ser un string!" })
  @MinLength(3, { message: "La descripcion debe ser de longitud mayor a 3" })
  descripcion: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  categoriaId: number;

  @IsString()
  imagenUrl?: string;

  @IsDateString()
  fechaelaboracion: string;

  @IsDateString()
  fechaVencimiento: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  IdDeposito: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  cantidad: number;
}
