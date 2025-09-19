import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Movimientos } from "./Movimientos.entity";
import { Producto } from "src/productos/entities/producto.entity";

@Entity()
export class Movimientos_Por_Producto{
    @PrimaryGeneratedColumn("identity")
    id:number;

    @Column({type:"int"})
    cantidad:number;

    @ManyToOne(()=> Movimientos,(movimientos)=> movimientos.movimientosPorProducto)
    movimientos:Movimientos;

    @ManyToOne(()=> Producto,(producto)=>producto.movimientosPorProducto)
    productos:Producto;

    @Column({type:"int"})
    id_deposito:number;


}