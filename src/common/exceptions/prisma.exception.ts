import { HttpStatus } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'

interface PrismaConflictException {
  code: string
  meta: {
    target: string[]
    modelName: string
  }
}

export class PrismaRpcException extends RpcException {
  constructor(e: PrismaConflictException) {
    let message = 'Ocurrió un error inesperado.'
    let statusCode = HttpStatus.BAD_REQUEST
    let error = 'Bad Request'
    switch (e.code) {
      case 'P2002':
        message = `Ya existe un registro con el campo único: ${e.meta?.target?.join(', ')}`
        break
      case 'P2025':
        message = `El registro que intentas actualizar/archivar no existe.`
        break
      default:
        message = `Error de base de datos: código ${e.code}`
    }

    super({ message, statusCode, error })
    this.name = 'PrismaRpcException'
  }
}
