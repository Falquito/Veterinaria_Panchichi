
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
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(()=> Producto,(producto)=>producto.categoria)
    productos:Producto[];

    // (1,N) por parte de categoria
}
