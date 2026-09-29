import 'dotenv/config'
import * as joi from 'joi'

interface EnvVariables {
  PORT: number
  DATABASE_URL: string
  USERS_MS_HOST: string
  USERS_MS_PORT: number
  SERVICES_MS_HOST: string
  SERVICES_MS_PORT: number
  PAYMENTS_MS_PORT: number
  PAYMENTS_MS_HOST: string
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
    USERS_MS_HOST: joi.string().required(),
    USERS_MS_PORT: joi.number().required(),
    SERVICES_MS_HOST: joi.string().required(),
    SERVICES_MS_PORT: joi.number().required(),
    PAYMENTS_MS_HOST: joi.string().required(),
    PAYMENTS_MS_PORT: joi.number().required(),
  })
  .unknown(true)

const { error, value } = envSchema.validate(process.env)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}
const envVariables: EnvVariables = value

export const envs = {
  port: envVariables.PORT,
  databaseUrl: envVariables.DATABASE_URL,
  usersMsHost: envVariables.USERS_MS_HOST,
  usersMsPort: envVariables.USERS_MS_PORT,
  servicesMsHost: envVariables.SERVICES_MS_HOST,
  servicesMsPort: envVariables.SERVICES_MS_PORT,
  paymentsMsPort: envVariables.PAYMENTS_MS_PORT,
  paymentsMsHost: envVariables.PAYMENTS_MS_HOST,
}
