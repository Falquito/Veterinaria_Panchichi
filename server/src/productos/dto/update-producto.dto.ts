// import { PartialType } from '@nestjs/mapped-types';
// import { CreateProductoDto } from './create-producto.dto';

// export class UpdateProductoDto extends PartialType(CreateProductoDto) {}


// dto/update-producto.dto.ts
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DepositoStockDto {
  @IsNumber()
  IdDeposito: number;

  @IsNumber()
  cantidad: number;
}

export class UpdateProductoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @Type(() => Number)  
  @IsNumber()
  precio?: number;

  @IsOptional()
  @IsNumber()
  categoriaId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepositoStockDto)
  depositos?: DepositoStockDto[];
}
