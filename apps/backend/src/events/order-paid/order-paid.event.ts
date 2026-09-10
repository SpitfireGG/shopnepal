export class OrderPaidEvent {
  constructor(public readonly orderId: string, public readonly totalAmount: number) {}
}
