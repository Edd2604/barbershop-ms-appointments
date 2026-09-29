import { PipeTransform, Injectable } from '@nestjs/common'

import { BadRequestRcpException } from '../exceptions/bad-request.exception'

@Injectable()
export class ValidateId implements PipeTransform {
  transform(value: string) {
    if (!/^\d+$/.test(value))
      throw new BadRequestRcpException(
        'El ID debe contener solo números enteros',
      )

    const id = parseInt(value, 10)

    if (isNaN(id) || id <= 0)
      throw new BadRequestRcpException('El ID debe ser un número positivo')

    return id
  }
}
