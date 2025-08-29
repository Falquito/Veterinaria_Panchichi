import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Deposito {

    @PrimaryGeneratedColumn("identity")
    id:number;

    @Column({type:"text"})
    nombre:string;

    @Column({type:"text"})
    direccion:string;

}
