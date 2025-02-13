import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from "class-validator";

export class CreateProductDto {

    @IsString()
    @MinLength(1)
    @MaxLength(200)
    title: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    description?: string;
    
    @IsString()
    @IsOptional()
    slug?: string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @IsString({each: true})
    @IsArray()
    sizes: string[];

    @IsString({each: true})
    @IsArray()
    @IsOptional()
    tags: string[];

    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;

    @IsString({each: true})
    @IsArray()
    @IsOptional()
    images?: string[];
};
