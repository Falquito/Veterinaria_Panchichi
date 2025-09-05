import { Deposito } from "src/depositos/entities/deposito.entity";
import { Lote } from "src/lotes/entities/lote.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class LoteXDeposito {
  @PrimaryGeneratedColumn("identity")
  id: number;

  @ManyToOne(() => Lote, (lote) => lote.idLotexDeposito)
  @JoinColumn({ name: "id_lote" })
  lote: Lote;

  @ManyToOne(() => Deposito, (deposito) => deposito.lotesDeposito)
  @JoinColumn({ name: "id_deposito" })
  deposito: Deposito;

  @Column("int")
  stock: number;
  @Column({ type: 'bool', default: true })
  activo!: boolean;
}