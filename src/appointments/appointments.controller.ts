import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { ValidateId } from 'src/common/pipes/validate-id.pipe'
import { AppointmentStatus } from '@prisma/client'
import { PaginatedQueryDto } from 'src/common/dto/paginated-query.dto'

import { AppointmentsService } from './appointments.service'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'
import { AppointmentQueryDto } from './dto/appointment-query.dto'
import { CreateAppointmentByAdminDto } from './dto/create-appointment-by-admin.dto'

@Controller()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}
  @MessagePattern('create-appointment')
  create(@Payload() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto)
  }

  @MessagePattern('create-appointment-by-admin')
  createByAdmin(@Payload() dto: CreateAppointmentByAdminDto) {
    return this.appointmentsService.createByAdmin(dto)
  }

  @MessagePattern('get-all-appointments')
  findAll(@Payload() params: AppointmentQueryDto) {
    return this.appointmentsService.findAll(params)
  }

  @MessagePattern('get-appointments-by-day')
  findAllAppointementByDate(@Payload('date') date: Date) {
    return this.appointmentsService.findAppointmentsByDay(date)
  }

  @MessagePattern('get-appointments-today')
  findAllAppointmentsToday() {
    return this.appointmentsService.findAppointmentsToday()
  }

  @MessagePattern('get-available-appointments')
  findAvailableAppointments() {
    return this.appointmentsService.findAvailableAppointments()
  }

  @MessagePattern('get-appointments-request')
  findAppointmentsRequest(@Payload() payload: PaginatedQueryDto) {
    return this.appointmentsService.findAppointmentsRequest(payload)
  }

  @MessagePattern('get-appointments-by-barber')
  findAllAppointmentsByBarber(
    @Payload('barberId', ValidateId) barberId: number,
  ) {
    return this.appointmentsService.findAppointmentsByBarber(barberId)
  }

  @MessagePattern('get-appointments-by-customer')
  findAllAppointmentsByCustomer(
    @Payload('customerId', ValidateId) customerId: number,
  ) {
    return this.appointmentsService.findAppointmentsByCustomer(customerId)
  }

  @MessagePattern('get-appointment-by-id')
  findOne(@Payload('id', ValidateId) id: number) {
    return this.appointmentsService.findOne(id)
  }

  @MessagePattern('update-appointment')
  update(@Payload() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(
      updateAppointmentDto.id,
      updateAppointmentDto,
    )
  }

  @MessagePattern('remove-appointment')
  remove(@Payload('id', ValidateId) id: number) {
    return this.appointmentsService.remove(id)
  }

  @MessagePattern('confirm-appointment')
  confirmAppointment(@Payload('id', ValidateId) id: number) {
    return this.appointmentsService.updateStatus(
      id,
      AppointmentStatus.CONFIRMADA,
    )
  }

  @MessagePattern('start-appointment')
  startAppointment(@Payload('id', ValidateId) id: number) {
    return this.appointmentsService.updateStatus(
      id,
      AppointmentStatus.EN_PROCESO,
    )
  }

  @MessagePattern('cancel-appointment')
  cancelAppointment(@Payload('id', ValidateId) id: number) {
    return this.appointmentsService.updateStatus(
      id,
      AppointmentStatus.CANCELADA,
    )
  }

  @MessagePattern('complete-appointment')
  completeAppointment(@Payload('id', ValidateId) id: number) {
    return this.appointmentsService.updateStatus(
      id,
      AppointmentStatus.COMPLETADA,
    )
  }

  @MessagePattern('reject-appointment')
  rejectAppointment(@Payload('id', ValidateId) id: number) {
    return this.appointmentsService.updateStatus(
      id,
      AppointmentStatus.RECHAZADA,
    )
  }

  @MessagePattern('get-top-customers')
  getTopCustomers() {
    return this.appointmentsService.getTopCustomers()
  }

  @MessagePattern('get-top-barbers')
  getTopBarbers() {
    return this.appointmentsService.getTopBarbers()
  }

  @MessagePattern('get-top-services')
  getTopServices() {
    return this.appointmentsService.getTopServices()
  }
}
