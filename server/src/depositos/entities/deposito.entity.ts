import { Producto_Por_Deposito } from "src/entities/Producto_Por_Deposito.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Deposito {

    @PrimaryGeneratedColumn("identity")
    id_deposito:number;

    @Column({type:"text"})
    nombre:string;

    @Column({type:"text"})
    direccion:string;


    @Column({type:"bool"})
    activo:boolean

    @OneToMany(()=>Producto_Por_Deposito,(prod_por_deposito)=>prod_por_deposito.deposito)
    productosPorDeposito:Producto_Por_Deposito[]
}
