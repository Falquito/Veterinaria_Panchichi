// src/depositos/entities/deposito.entity.ts
import { LoteXDeposito } from "src/entities/LoteXDeposito.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('deposito') // opcional, pero explicita el nombre de tabla
export class Deposito {

  @PrimaryGeneratedColumn('identity')
  id_deposito: number;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'text' })
  direccion: string;

  @OneToMany(() => LoteXDeposito, (lxd) => lxd.deposito, { eager: false })
  lotesDeposito: LoteXDeposito[];


  @Column({ type: 'bool', default: true })
  activo: boolean;
}
