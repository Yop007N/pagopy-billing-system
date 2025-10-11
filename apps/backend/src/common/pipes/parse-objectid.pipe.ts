import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    // TODO: Add validation for CUID or UUID if needed
    if (!value || typeof value !== 'string') {
      throw new BadRequestException('Invalid ID format');
    }
    return value;
  }
}
