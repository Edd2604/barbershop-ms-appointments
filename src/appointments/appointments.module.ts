import { Module, OnModuleInit } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { Services } from 'src/config/services'
import { envs } from 'src/config/envs'

import { AppointmentsService } from './appointments.service'
import { AppointmentsController } from './appointments.controller'

@Module({
  imports: [
    ClientsModule.register([
      {
        name: Services.USERS_MS,
        transport: Transport.TCP,
        options: { host: envs.usersMsHost, port: envs.usersMsPort },
      },
      {
        name: Services.SERVICES_MS,
        transport: Transport.TCP,
        options: { host: envs.servicesMsHost, port: envs.servicesMsPort },
      },
      {
        name: Services.PAYMENTS_MS,
        transport: Transport.TCP,
        options: { host: envs.paymentsMsHost, port: envs.paymentsMsPort },
      },
    ]),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule implements OnModuleInit {
  onModuleInit() {
    console.warn('Microservice config:', envs)
  }
}
