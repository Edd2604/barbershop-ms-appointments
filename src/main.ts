import { NestFactory } from '@nestjs/core'
import { Transport, MicroserviceOptions } from '@nestjs/microservices'
import { Logger } from '@nestjs/common'

import { AppModule } from './app.module'
import { envs } from './config/envs'

async function bootstrap() {
  const logger = new Logger()
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port: envs.port,
      },
    },
  )
  await app.listen()
  logger.log(`Appointments microservice running on port ${envs.port}`)
}
bootstrap()
