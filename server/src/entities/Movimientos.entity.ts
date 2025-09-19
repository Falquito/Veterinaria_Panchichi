import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Movimientos_Por_Producto } from "./Movimientos_Por_Producto.entity";

@Entity("movimientos", { schema: "public" })
export class Movimientos {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id:number;

  @Column("character varying", { name: "tipo", length: 30 })
  tipo: string;

  @Column({type:"text"})
  fecha:string;

  @Column({type:"text", default:""})
  motivo:string;
  @Column({type:"text",default:""})
  observaciones:string;


  @OneToMany(()=> Movimientos_Por_Producto,(mov_por_prod)=> mov_por_prod)
  movimientosPorProducto:Movimientos_Por_Producto[];

}