import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("movimientosxlotexdep", { schema: "public" })
export class MovimientosxLotexDeposito {
  @PrimaryGeneratedColumn({ type: "integer", name: "id_mov_lote_dep" })
  idMovLoteDep: number;

  @Column("character varying", { name: "tipo", length: 30 })
  tipo: string;

  @Column("numeric")
  cantidad:string;

  @Column("int")
  id_producto:number;

  @Column("int")
  id_lote:number;

  @Column("int")
  id_deposito:number;

}
