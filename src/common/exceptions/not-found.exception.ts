import { HttpStatus } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'

export class NotFoundRpcException extends RpcException {
  constructor(message: string) {
    let statusCode = HttpStatus.NOT_FOUND
    let error = 'Not Found'
    super({ message, statusCode, error })
    this.name = 'NotFoundRpcException'
  }
}
