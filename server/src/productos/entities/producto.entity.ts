import { Categoria } from "src/categorias/entities/categoria.entity";
import { Movimientos_Por_Producto } from "src/entities/Movimientos_Por_Producto.entity";
import { OrdenDeCompraPorProducto } from "src/entities/Orden_de_compra_Por_Producto.entity";
import { Producto_Por_Deposito } from "src/entities/Producto_Por_Deposito.entity";
import { Column, Entity, Generated, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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

    @OneToMany(()=>Producto_Por_Deposito,(prod_por_deposito)=>prod_por_deposito.producto)
    productosPorDeposito: Producto_Por_Deposito[];

    @Column({type:"text"})
    fecha_vencimiento: string;
    
    @Column()
    @Generated("increment")
    nro_lote: number;

    @OneToMany(()=>Movimientos_Por_Producto,(mov_por_prod)=>mov_por_prod.productos)
    movimientosPorProducto: Movimientos_Por_Producto[];

    @Column({ type: 'jsonb', default: () => "'[]'" })
    proveedoresId: { idProveedor: number }[];

    @OneToMany(() => OrdenDeCompraPorProducto, o => o.producto)
    ordenesPorProducto: OrdenDeCompraPorProducto[];

    
}