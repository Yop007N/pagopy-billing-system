import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('bancard')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async bancardWebhook(@Body() payload: any, @Headers() headers: any) {
    // TODO: Implement Bancard webhook handler
    return { message: 'Bancard webhook - To be implemented' };
  }

  @Post('sipap')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async sipapWebhook(@Body() payload: any, @Headers() headers: any) {
    // TODO: Implement SIPAP webhook handler
    return { message: 'SIPAP webhook - To be implemented' };
  }

  @Post('set')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async setWebhook(@Body() payload: any, @Headers() headers: any) {
    // TODO: Implement SET e-Kuatia webhook handler
    return { message: 'SET webhook - To be implemented' };
  }
}
