import { LoteXDeposito } from "src/entities/LoteXDeposito.entity";
import { Producto } from "src/productos/entities/producto.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("lote_pkey", ["idLote"], { unique: true })
@Entity("lote", { schema: "public" })
export class Lote {
  @PrimaryGeneratedColumn({ type: "integer", name: "id_lote" })
  idLote: number;

  @Column("character varying", {
    name: "fecha_elaboracion",
    nullable: true,
    length: 100,
  })
  fechaElaboracion: string | null;

  @Column("character varying", {
    name: "fecha_vencimiento",
    nullable: true,
    length: 100,
  })
  fechaVencimiento: string | null;

  @Column("boolean", { name: "activo", default: () => "true" })
  activo: boolean;

  @ManyToOne(() => Producto, (producto) => producto.lotes,{ eager: true })
  @JoinColumn([{ name: "id_producto"}])
  idProducto: Producto;

  @OneToMany(()=>LoteXDeposito,(lotexdeposito)=>lotexdeposito.lote)
  idLotexDeposito:LoteXDeposito[];
}
