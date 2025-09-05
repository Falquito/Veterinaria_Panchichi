import { IsArray, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DepositoAjusteDto {
  @IsInt()
  IdDeposito!: number;

  @IsNumber()
  cantidad!: number;
}

export class UpdateProductoDto {
  @IsOptional() @IsString()
  nombre?: string;

  @IsOptional() @IsString()
  descripcion?: string;

  @IsOptional() @IsNumber() @Min(0)
  precio?: number;

  @IsOptional() @IsInt()
  categoriaId?: number;

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => DepositoAjusteDto)
  depositos?: DepositoAjusteDto[];

  // 👇 importantísimo
  @IsOptional() @IsArray() @IsInt({ each: true })
  removeDepositos?: number[];
}
