import { Type } from 'class-transformer'
import { IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator'

import { PaymentType } from '../interfaces/payment-status.enum'

export class CreateAppointmentByAdminDto {
  @Type(() => Date)
  @IsDate()
  scheduledAt: Date

  @IsString()
  customerName: string

  @Type(() => Number)
  @IsInt()
  barberId: number

  @IsEnum(PaymentType)
  paymentType: PaymentType

  @Type(() => Number)
  @IsInt()
  serviceId: number

  @IsOptional()
  @IsString()
  notes: string
}
