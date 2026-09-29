import { HttpStatus } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'

export class InternalServerErrorRpcException extends RpcException {
  constructor(message: string) {
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR
    let error = 'Internal Server Error'
    super({ message, statusCode, error })
    this.name = 'InternalServerErrorException'
  }
}
