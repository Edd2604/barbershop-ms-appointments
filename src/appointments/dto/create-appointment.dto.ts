import { Type } from 'class-transformer'
import { IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator'
import { AppointmentStatus } from '@prisma/client'

import { PaymentType } from '../interfaces/payment-status.enum'

export class CreateAppointmentDto {
  @Type(() => Date)
  @IsDate()
  scheduledAt: Date

  @Type(() => Number)
  @IsInt()
  customerId: number

  @Type(() => Number)
  @IsInt()
  barberId: number

  @Type(() => Number)
  @IsInt()
  serviceId: number

  @IsEnum(AppointmentStatus)
  status: AppointmentStatus

  @IsEnum(PaymentType)
  paymentType: PaymentType

  @IsOptional()
  @IsString()
  notes: string
}
