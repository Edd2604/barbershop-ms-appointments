import { IsOptional, IsString } from 'class-validator'

import { PaginatedQueryDto } from './paginated-query.dto'

export class SearchQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @IsString()
  query?: string = ''
}
