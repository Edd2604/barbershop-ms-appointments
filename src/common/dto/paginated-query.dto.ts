import { Transform } from 'class-transformer'
import { IsOptional, IsInt, Min } from 'class-validator'

export class PaginatedQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'El límite debe ser al menos 1' })
  @Transform(({ value }) => (value ? parseInt(value, 10) : 10))
  limit: number = 10

  @IsInt()
  @IsOptional()
  @Min(1, { message: 'La página debe ser al menos 1' })
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1))
  page: number = 1
}
