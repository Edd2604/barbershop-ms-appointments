import { HttpStatus } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'

export class BadRequestRcpException extends RpcException {
  constructor(message: string) {
    let statusCode = HttpStatus.BAD_REQUEST
    let error = 'Bad Request'
    super({ message, statusCode, error })
    this.name = 'BadRequestException'
  }
}
