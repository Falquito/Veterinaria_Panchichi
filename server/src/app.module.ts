import { Module } from '@nestjs/common';
import { ProductosModule } from './productos/productos.module';
import { ConfigModule } from '@nestjs/config'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriasModule } from './categorias/categorias.module';
import { LotesModule } from './lotes/lotes.module';
import { DepositosModule } from './depositos/depositos.module';
import { LoteXDeposito } from './entities/LoteXDeposito.entity';

@Module({
  imports: [ProductosModule,
    ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
          type: 'postgres',
          url:process.env.DB_URL,
          autoLoadEntities:true,
          synchronize:false, 
          entities:[
            __dirname + '/**/*.entity{.ts,.js}'
          ]
        }),
        CategoriasModule,
        LotesModule,
        DepositosModule,
        
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
