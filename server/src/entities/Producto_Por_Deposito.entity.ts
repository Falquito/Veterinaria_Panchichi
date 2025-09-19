import { Deposito } from "src/depositos/entities/deposito.entity";
import { Producto } from "src/productos/entities/producto.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Producto_Por_Deposito {
  @PrimaryGeneratedColumn("identity")
  id: number;

  @ManyToOne(() => Producto, (producto) => producto.productosPorDeposito)
  @JoinColumn({ name: "id_prod" })
  producto:Producto;

  @ManyToOne(() => Deposito, (deposito) => deposito.productosPorDeposito,{nullable:false})
  @JoinColumn({ name: "id_deposito" })
  deposito: Deposito;

  @Column("int",{nullable:false})
  stock: number;
}