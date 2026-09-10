import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { SpotlightService } from './spotlight.service';

@Controller('api/spotlight')
export class SpotlightController {
  constructor(private spotlight: SpotlightService) {}

  @Post('visual-search')
  async visualSearch(@Body() body: any) {
    const imageName = body.imageName || body.filename || 'upload.jpg';
    const categoryHint = body.categoryHint;
    return this.spotlight.visualSearch(imageName, categoryHint);
  }

  @Get('stylist')
  async stylist(@Query('anchorId') anchorId: string, @Query('style') style: string) {
    return this.spotlight.stylistBundle(anchorId, style);
  }

  @Get('provenance/:productId')
  async provenance(@Param('productId') productId: string) {
    return this.spotlight.provenance(productId);
  }

  @Post('voice')
  async voice(@Body() body: any) {
    return this.spotlight.voiceIntent(body.transcript || '');
  }

  @Get('courier/:orderId')
  async courier(@Param('orderId') orderId: string) {
    return this.spotlight.getCourierLocation(orderId);
  }

  @Post('bnpl/calc')
  async bnpl(@Body() body: any) {
    return this.spotlight.bnpl(Number(body.amount) || 0, Number(body.months) || 3);
  }
}
