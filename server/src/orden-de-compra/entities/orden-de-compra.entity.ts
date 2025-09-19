import { OrdenDeCompraPorProducto } from "src/entities/Orden_de_compra_Por_Producto.entity";
import { Proveedor } from "src/proveedores/entities/proveedor.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class OrdenDeCompra {
    @PrimaryGeneratedColumn("identity")
    id_oc:number;

    @Column({type:"text"})
    fecha: string;

    @Column('decimal', { default: 0 })
    total: number;

    @OneToMany(() => OrdenDeCompraPorProducto, o => o.ordenDeCompra, { cascade: true , eager:true})
    productos: OrdenDeCompraPorProducto[];

    @ManyToOne(() => Proveedor, proveedor => proveedor.ordenes, { eager: true })
    proveedor: Proveedor;

}