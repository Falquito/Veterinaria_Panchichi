
import { Producto } from "src/productos/entities/producto.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn,CreateDateColumn, UpdateDateColumn  } from "typeorm";

@Entity()
export class Categoria {

    @PrimaryGeneratedColumn("identity")
    id:number;

    @Column({type:"text"})
    nombre:string;

     @Column({ type: "text", nullable: true })
    descripcion?: string;

    @CreateDateColumn()
    createdat: Date;

    @UpdateDateColumn()
    updatedat: Date;

    @OneToMany(()=> Producto,(producto)=>producto.categoria,{eager:false})
    productos:Producto[];

    // (1,N) por parte de categoria


    @Column({type:"bool"})
    activo:boolean
}