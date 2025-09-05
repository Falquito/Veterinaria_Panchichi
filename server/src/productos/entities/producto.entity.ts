import { Categoria } from "src/categorias/entities/categoria.entity";
import { Lote } from "src/lotes/entities/lote.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Producto {

    @PrimaryGeneratedColumn("identity")
    id:number;

    @Column({type:"text"})
    nombre:string;

    @Column({type:"text"})
    descripcion:string;

    @Column({type:"float"})
    precio:number;

    @Column({type:"boolean",default:true})
    activo:boolean;

    @Column({type:"text",default:""})
    ImagenURL:string;

    @ManyToOne(() => Categoria, (categoria) => categoria.productos, { eager: true })
    categoria: Categoria;


    //(N,1) para lotes
    @OneToMany(() => Lote, (lote) => lote.idProducto,{eager:false})
    lotes: Lote[];
    

    
}