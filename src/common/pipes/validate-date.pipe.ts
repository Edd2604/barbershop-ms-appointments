import { PipeTransform, Injectable } from '@nestjs/common'
import { isValid, parse } from 'date-fns'

import { BadRequestRcpException } from '../exceptions/bad-request.exception'

@Injectable()
export class ValidateDate implements PipeTransform {
  transform(value: string) {
    const date = parse(value, 'yyyy-MM-dd', new Date())
    if (!isValid(date)) {
      throw new BadRequestRcpException(
        `La fecha "${value}" no es válida. Usa el formato yyyy-MM-dd`,
      )
    }

    return date
  }
}
