import { IsNumber, IsString } from "class-validator";

export class CreateLoteDto {
    @IsNumber()
    id_producto:number;

    @IsString()
    fecha_elaboracion:string;

    @IsString()
    fecha_vencimiento:string;

    activo?:boolean

}
