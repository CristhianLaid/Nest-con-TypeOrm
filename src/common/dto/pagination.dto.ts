import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {

    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    limit?: number;
    
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    offset?: number;

    constructor(limit:number = 10, offset:number = 0){
        this.limit = limit;
        this.offset = offset;
    };
}