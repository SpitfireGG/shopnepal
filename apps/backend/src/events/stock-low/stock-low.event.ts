export class StockLowEvent {
  constructor(public readonly productId: string, public readonly stock: number) {}
}
