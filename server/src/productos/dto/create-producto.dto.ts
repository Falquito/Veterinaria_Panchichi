// // import { IsNumber, IsPositive, IsString, Min, MinLength } from "class-validator";

// // export class CreateProductoDto {
// //     @IsString({message:"el nombre debe ser un string!"})
// //     @MinLength(3,{message:"el nombre debe ser de longitud mayor a 3"})
// //     nombre:string;

// //     @IsString({message:"la descripcion debe ser un string!"})
// //     @MinLength(3,{message:"La descripcion debe ser de longitud mayor a 3"})
// //     descripcion:string;

// //     @IsNumber()
// //     @IsPositive()
// //     precio:number;

// //     @IsNumber()
// //     @IsPositive()
// //     categoriaId:number;

// //     @IsString()
// //     imagenUrl?:string;

// //     @IsString()
// //     fechaelaboracion?:string;

// //     @IsString()
// //     fechaVencimiento?:string;

// //     @IsNumber()
// //     @IsPositive()
// //     IdDeposito?:number;

// //     @IsString()
// //     cantidad?:string;


// // }


// // dto/create-producto.dto.ts
// import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
// import { Type } from 'class-transformer';

// class DepositoStockDto {
//   @IsNumber()
//   IdDeposito: number;

//   @IsNumber()
//   cantidad: number;
// }

// export class CreateProductoDto {
//   @IsString()
//   nombre: string;

//   @IsString()
//   descripcion: string;

//   @IsNumber()
//   precio: number;

//   @IsNumber()
//   categoriaId: number;

//   @IsString()
//   fechaelaboracion: string;

//   @IsString()
//   fechaVencimiento: string;

//   @IsArray()
//   @ValidateNested({ each: true })
  
//   @Type(() => DepositoStockDto)
//   depositos: DepositoStockDto[];
// }

// import { IsNumber, IsPositive, IsString, Min, MinLength } from "class-validator";

// export class CreateProductoDto {
//     @IsString({message:"el nombre debe ser un string!"})
//     @MinLength(3,{message:"el nombre debe ser de longitud mayor a 3"})
//     nombre:string;

//     @IsString({message:"la descripcion debe ser un string!"})
//     @MinLength(3,{message:"La descripcion debe ser de longitud mayor a 3"})
//     descripcion:string;

//     @IsNumber()
//     @IsPositive()
//     precio:number;

//     @IsNumber()
//     @IsPositive()
//     categoriaId:number;

//     @IsString()
//     imagenUrl?:string;

//     @IsString()
//     fechaelaboracion?:string;

//     @IsString()
//     fechaVencimiento?:string;

//     @IsNumber()
//     @IsPositive()
//     IdDeposito?:number;

//     @IsString()
//     cantidad?:string;


// }


// dto/create-producto.dto.ts
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DepositoStockDto {
  @IsNumber()
  IdDeposito: number;

  @IsNumber()
  cantidad: number;
}

export class CreateProductoDto {
  @IsString()
  nombre: string;

  @IsString()
  descripcion: string;

  @Type(() => Number)
  @IsNumber()
  precio: number;

  @Type(() => Number)
  @IsNumber()
  categoriaId: number;

  @IsString()
  fechaelaboracion: string;

  @IsString()
  fechaVencimiento: string;

  @IsOptional()
  // @IsArray()
  // @ValidateNested({ each: true })
  @Type(() => DepositoStockDto)
  depositos: DepositoStockDto[];
}