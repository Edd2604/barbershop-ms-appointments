import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { endOfDay, startOfDay } from 'date-fns'
import { AppointmentStatus, PrismaClient } from '@prisma/client'
import { Services } from 'src/config/services'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { catchError, firstValueFrom } from 'rxjs'
import { NotFoundRpcException } from 'src/common/exceptions/not-found.exception'
import { PrismaRpcException } from 'src/common/exceptions/prisma.exception'
import { InternalServerErrorRpcException } from 'src/common/exceptions/internal-error.exception'
import { PaginatedQueryDto } from 'src/common/dto/paginated-query.dto'
import { DateTime } from 'luxon'
import { BadRequestRcpException } from 'src/common/exceptions/bad-request.exception'
import { plainToInstance } from 'class-transformer'

import { AppointmentQueryDto } from './dto/appointment-query.dto'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { CreateAppointmentByAdminDto } from './dto/create-appointment-by-admin.dto'

@Injectable()
export class AppointmentsService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject(Services.USERS_MS) private readonly usersService: ClientProxy,
    @Inject(Services.SERVICES_MS) private readonly servicesService: ClientProxy,
    @Inject(Services.PAYMENTS_MS) private readonly paymentService: ClientProxy,
  ) {
    super()
  }
  async onModuleInit() {
    await this.$connect()
  }
  async create(createAppointmentDto: CreateAppointmentDto) {
    const dto = plainToInstance(CreateAppointmentDto, createAppointmentDto)

    const today = DateTime.now().setZone('America/Lima')

    const scheduled = DateTime.fromJSDate(dto.scheduledAt).setZone(
      'America/Lima',
    )

    const { customerId, barberId, serviceId } = dto
    const { paymentType, ...rest } = dto
    const Service = await firstValueFrom(
      this.servicesService.send('get-service-by-id', { id: serviceId }).pipe(
        catchError((e) => {
          console.warn(e)
          throw new RpcException(e)
        }),
      ),
    )

    const Customer = await firstValueFrom(
      this.usersService.send('get-customer-by-id', { id: customerId }).pipe(
        catchError((e) => {
          throw new RpcException(e)
        }),
      ),
    )

    const Barber = await firstValueFrom(
      this.usersService.send('get-barber-by-id', { id: barberId }).pipe(
        catchError((e) => {
          throw new RpcException(e)
        }),
      ),
    )

    if (!Service.isActive) {
      throw new NotFoundRpcException('El servicio no está habilitado')
    }

    if (!Customer.isActive) {
      throw new NotFoundRpcException('El cliente no está habilitado')
    }

    if (!Barber.isActiveBarber) {
      throw new NotFoundRpcException('El barbero no está habilitado')
    }

    if (scheduled <= today.plus({ hours: 1 })) {
      throw new BadRequestRcpException('La fecha programada no es válida')
    }

    try {
      const newAppointment = await this.appointment.create({
        data: {
          ...rest,
          serviceName: Service.name,
          customerName: `${Customer.name} ${Customer.lastName}`,
          barberName: `${Barber.name} ${Barber.lastName}`,
        },
      })
      if (newAppointment) {
        await firstValueFrom(
          this.paymentService
            .send('create-payment', {
              appointmentId: newAppointment.id,
              customerId: newAppointment.customerId,
              customerName: newAppointment.customerName,
              amount: Service.price,
              type: paymentType,
              status: 'PENDIENTE',
            })
            .pipe(
              catchError((e) => {
                console.warn(e)
                throw new RpcException(e)
              }),
            ),
        )
      }
      return newAppointment
    } catch (e) {
      console.warn(e.message)
      if (e.code) throw new PrismaRpcException(e)
      throw new InternalServerErrorRpcException(
        'Hubo un error al crear la cita',
      )
    }
  }

  async createByAdmin(createAppointmentByAdmin: CreateAppointmentByAdminDto) {
    const dto = plainToInstance(
      CreateAppointmentByAdminDto,
      createAppointmentByAdmin,
    )

    const today = DateTime.now().setZone('America/Lima')

    const scheduled = DateTime.fromJSDate(dto.scheduledAt).setZone(
      'America/Lima',
    )

    const { customerName, barberId, serviceId, paymentType, ...rest } = dto

    const Service = await firstValueFrom(
      this.servicesService.send('get-service-by-id', { id: serviceId }).pipe(
        catchError((e) => {
          console.warn(e)
          throw new RpcException(e)
        }),
      ),
    )

    const Barber = await firstValueFrom(
      this.usersService.send('get-barber-by-id', { id: barberId }).pipe(
        catchError((e) => {
          throw new RpcException(e)
        }),
      ),
    )

    if (!Service.isActive) {
      throw new NotFoundRpcException('El servicio no está habilitado')
    }
    if (!Barber.isActiveBarber) {
      throw new NotFoundRpcException('El barbero no está habilitado')
    }

    if (scheduled <= today.plus({ hours: 1 })) {
      throw new BadRequestRcpException('La fecha programada no es válida')
    }

    try {
      const newAppointment = await this.appointment.create({
        data: {
          ...rest,
          barberId: barberId,
          serviceId: serviceId,
          customerId: 0,
          serviceName: Service.name,
          customerName: customerName,
          barberName: `${Barber.name} ${Barber.lastName}`,
          status: 'CONFIRMADA',
        },
      })
      if (newAppointment) {
        await firstValueFrom(
          this.paymentService
            .send('create-payment', {
              appointmentId: newAppointment.id,
              customerId: newAppointment.customerId,
              customerName: newAppointment.customerName,
              amount: Service.price,
              type: paymentType,
              status: 'PENDIENTE',
            })
            .pipe(
              catchError((e) => {
                console.warn(e)
                throw new RpcException(e)
              }),
            ),
        )
      }
      return newAppointment
    } catch (e) {
      console.warn(e.message)
      if (e.code) throw new PrismaRpcException(e)
      throw new InternalServerErrorRpcException(
        'Hubo un error al crear la cita',
      )
    }
  }

  async findAll({
    limit,
    page,
    from_date,
    status,
    to_date,
  }: AppointmentQueryDto) {
    const pages = page || 1
    const skip = (pages - 1) * limit

    const where = {
      scheduledAt: {
        ...(from_date ? { gte: from_date } : {}),
        ...(to_date ? { lte: to_date } : {}),
      },
      ...(status ? { status: status } : {}),
      isArchived: false,
    }

    const [data, total] = await Promise.all([
      this.appointment.findMany({
        where,
        take: limit,
        skip,
      }),
      this.appointment.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return { data, total, totalPages }
  }

  async findOne(id: number) {
    const appointment = await this.appointment.findFirst({
      where: {
        id,
        isArchived: false,
      },
    })
    if (!appointment) throw new NotFoundRpcException('No se encontro la cita')
    return appointment
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    try {
      const updatedAppointment = await this.appointment.update({
        where: {
          id,
          isArchived: false,
        },
        data: updateAppointmentDto,
      })
      return updatedAppointment
    } catch (error) {
      if (error.code) throw new PrismaRpcException(error)

      throw new InternalServerErrorRpcException(
        `Error al actualizar el administrador`,
      )
    }
  }

  async remove(id: number) {
    try {
      const arhivedAppointment = await this.appointment.update({
        where: {
          id,
        },
        data: {
          isArchived: true,
        },
      })
      if (arhivedAppointment)
        return { message: `La cita con el ID ${id} fue archivada` }
    } catch (e) {
      if (e.code) throw new PrismaRpcException(e)

      throw new InternalServerErrorRpcException(
        `Error al actualizar el administrador`,
      )
    }
  }

  async findAppointmentsByDay(date: Date) {
    const start = startOfDay(date)
    const end = endOfDay(date)
    const appointments = await this.appointment.findMany({
      where: {
        scheduledAt: {
          gte: start,
          lte: end,
        },
        isArchived: false,
      },
    })
    return appointments
  }

  async findAppointmentsRequest({ page, limit }: PaginatedQueryDto) {
    const today = DateTime.now().setZone('America/Lima').startOf('day')

    const pages = page || 1
    const skip = (pages - 1) * limit

    const where = {
      status: AppointmentStatus.PENDIENTE,
      scheduledAt: {
        gte: today.toJSDate(),
      },
      isArchived: false,
    }

    const [data, total] = await Promise.all([
      this.appointment.findMany({
        where,
        take: limit,
        skip: skip,
      }),
      this.appointment.count({ where }),
    ])

    const totalPages = Math.min(total / limit)
    return { data, total, totalPages }
  }

  async findAvailableAppointments() {
    const today = DateTime.now().setZone('America/Lima').startOf('day')
    const appointments = await this.appointment.findMany({
      where: {
        status: {
          in: [
            AppointmentStatus.CONFIRMADA,
            AppointmentStatus.EN_PROCESO,
            AppointmentStatus.CANCELADA,
            AppointmentStatus.COMPLETADA,
          ],
        },
        scheduledAt: {
          gte: today.toJSDate(),
        },
        isArchived: false,
      },
    })
    return appointments
  }

  async findAppointmentsToday() {
    const today = DateTime.now().setZone('America/Lima').startOf('day')

    const tomorrow = today.plus({ days: 1 })

    const appointments = await this.appointment.findMany({
      where: {
        scheduledAt: {
          gte: today.toJSDate(),
          lte: tomorrow.toJSDate(),
        },
        isArchived: false,
      },
    })
    return appointments
  }

  async findAppointmentsByBarber(id: number, date?: Date) {
    const start = date ? startOfDay(date) : null
    const end = date ? endOfDay(date) : null
    const appointments = await this.appointment.findMany({
      where: {
        barberId: id,
        scheduledAt: {
          ...(start ? { gte: start } : {}),
          ...(end ? { lte: end } : {}),
        },
        isArchived: false,
      },
    })

    return appointments
  }

  async findAppointmentsByCustomer(customerId: number, date?: Date) {
    const start = date ? startOfDay(date) : null
    const end = date ? endOfDay(date) : null
    const appointments = await this.appointment.findMany({
      where: {
        customerId: customerId,
        isArchived: false,
        scheduledAt: {
          ...(start ? { gte: start } : {}),
          ...(end ? { lte: end } : {}),
        },
      },
    })

    return appointments
  }

  async updateStatus(id: number, status: AppointmentStatus) {
    try {
      const updatedAppointment = await this.appointment.update({
        where: {
          id,
          isArchived: false,
        },
        data: {
          status,
        },
      })
      const { status: appointmentStatus } = updatedAppointment

      if (appointmentStatus === 'RECHAZADA') {
        await firstValueFrom(
          this.paymentService
            .send('change-payment-status', {
              appointmentId: updatedAppointment.id,
              status: 'CANCELADA',
            })
            .pipe(
              catchError((e) => {
                console.warn(e)
                throw new RpcException(e)
              }),
            ),
        )
      }

      if (appointmentStatus === 'CONFIRMADA') {
        await firstValueFrom(
          this.paymentService
            .send('change-payment-status', {
              appointmentId: updatedAppointment.id,
              status: 'PENDIENTE',
            })
            .pipe(
              catchError((e) => {
                console.warn(e)
                throw new RpcException(e)
              }),
            ),
        )
      }

      if (appointmentStatus === 'CANCELADA') {
        await firstValueFrom(
          this.paymentService
            .send('change-payment-status', {
              appointmentId: updatedAppointment.id,
              status: 'CANCELADO',
            })
            .pipe(
              catchError((e) => {
                console.warn(e)
                throw new RpcException(e)
              }),
            ),
        )
      }
      if (appointmentStatus === 'COMPLETADA') {
        await firstValueFrom(
          this.paymentService
            .send('change-payment-status', {
              appointmentId: updatedAppointment.id,
              status: 'COMPLETADO',
            })
            .pipe(
              catchError((e) => {
                console.warn(e)
                throw new RpcException(e)
              }),
            ),
        )
      }
      return updatedAppointment
    } catch (e) {
      if (e.code) throw new PrismaRpcException(e)

      throw new InternalServerErrorRpcException(
        `Error al actualizar el estado de la cita`,
      )
    }
  }
  async getTopCustomers() {
    return this.appointment.groupBy({
      by: ['customerId'],
      _count: { customerId: true },
      where: { isArchived: false },
      orderBy: { _count: { customerId: 'desc' } },
    })
  }

  async getTopServices() {
    const services = await this.appointment.groupBy({
      by: ['serviceId'],
      _count: { serviceId: true },
      where: { isArchived: false },
      orderBy: { _count: { serviceId: 'desc' } },
    })
    return services
  }

  async getTopBarbers() {
    const barbers = await this.appointment.groupBy({
      by: ['barberId'],
      _count: { barberId: true },
      where: { isArchived: false },
      orderBy: { _count: { barberId: 'desc' } },
    })
    return barbers
  }
}
