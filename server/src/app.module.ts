import { Module } from '@nestjs/common';
import { ProductosModule } from './productos/productos.module';
import { ConfigModule } from '@nestjs/config'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriasModule } from './categorias/categorias.module';
import { LotesModule } from './lotes/lotes.module';
import { DepositosModule } from './depositos/depositos.module';

@Module({
  imports: [ProductosModule,
    ConfigModule.forRoot(),
        //configuro typeORM con un objeto de la ocnfiguracion de la conexion
        TypeOrmModule.forRoot({
          type: 'postgres',
          url:process.env.DB_URL,
          autoLoadEntities:true,//carga automaticamente las entidades
          synchronize:true //los cambios en las tablas se sincronizan
        }),
        CategoriasModule,
        LotesModule,
        DepositosModule 
  ],
  controllers: [],
  providers: [],
})
export class AppModule{}

