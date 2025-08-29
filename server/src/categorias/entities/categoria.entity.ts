import { Producto } from "src/productos/entities/producto.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Categoria {

    @PrimaryGeneratedColumn("identity")
    id:number;

    @Column({type:"text"})
    nombre:string;

    @OneToMany(()=> Producto,(producto)=>producto.categoria)
    productos:Producto[];

    // (1,N) por parte de categoria
}
