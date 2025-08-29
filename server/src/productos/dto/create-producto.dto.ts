import { IsNumber, IsPositive, IsString, Min, MinLength } from "class-validator";
import { Type } from 'class-transformer';

export class CreateProductoDto {
    @IsString({message:"el nombre debe ser un string!"})
    @MinLength(3,{message:"el nombre debe ser de longitud mayor a 3"})
    nombre:string;

    @IsString({message:"la descripcion debe ser un string!"})
    @MinLength(3,{message:"La descripcion debe ser de longitud mayor a 3"})
    descripcion:string;

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    precio:number;

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    categoriaId:number;

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    stock:number;

    imagenUrl?:string;


}
