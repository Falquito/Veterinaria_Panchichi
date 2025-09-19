// src/proveedores/entities/proveedor.entity.ts
import { OrdenDeCompra } from 'src/orden-de-compra/entities/orden-de-compra.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Proveedor {
  @PrimaryGeneratedColumn('identity')
  id_proveedor: number;

  //nombre del proveedor
  @Column({ type: 'text' })
  nombre: string;

  //dni o cuit
  @Column({ type: 'text', nullable: true })
  cuit: string;

  @Column({ type: 'text', nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  telefono: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  // Estado del proveedor
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @OneToMany(() => OrdenDeCompra, orden => orden.proveedor)
  ordenes: OrdenDeCompra[];
}