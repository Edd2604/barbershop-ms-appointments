import { AppointmentStatus } from '@prisma/client'
import { Transform } from 'class-transformer'
import { IsEnum, IsOptional } from 'class-validator'
import { isValid, parse } from 'date-fns'
import { PaginatedQueryDto } from 'src/common/dto/paginated-query.dto'
import { BadRequestRcpException } from 'src/common/exceptions/bad-request.exception'

export class AppointmentQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return null
    if (value instanceof Date) return value
    const date = parse(value, 'yyyy-MM-dd', new Date())

    if (!isValid(date)) {
      throw new BadRequestRcpException(
        `El parámetro from_date no es una fecha válida. Usa el formato yyyy-MM-dd.`,
      )
    }

    return date
  })
  from_date?: Date | null = null

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return null
    if (value instanceof Date) return value
    const date = parse(value, 'yyyy-MM-dd', new Date())

    if (!isValid(date)) {
      throw new BadRequestRcpException(
        `El parámetro to_date no es una fecha válida. Usa el formato yyyy-MM-dd.`,
      )
    }

    return date
  })
  to_date?: Date | null = null

  @IsOptional()
  @IsEnum(AppointmentStatus, {
    message:
      'el parámetro status debe ser uno de los siguientes valores : PENDIENTE,CONFIRMADA, EN_PROCESO, COMPLETADA O CANCELADA',
  })
  status?: AppointmentStatus | null = null
}
