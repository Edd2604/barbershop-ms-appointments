import { PartialType } from '@nestjs/mapped-types'
import { IsInt, IsPositive } from 'class-validator'

import { CreateAppointmentDto } from './create-appointment.dto'

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @IsPositive()
  @IsInt()
  id: number
}
