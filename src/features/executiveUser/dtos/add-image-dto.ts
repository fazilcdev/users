import { IsNotEmpty, IsString } from 'class-validator';

export class AddImageDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
