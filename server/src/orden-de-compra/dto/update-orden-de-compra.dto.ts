import { PartialType } from '@nestjs/mapped-types';
import { CreateOrdenDeCompraDto } from './create-orden-de-compra.dto';

export class UpdateOrdenDeCompraDto extends PartialType(CreateOrdenDeCompraDto) {}