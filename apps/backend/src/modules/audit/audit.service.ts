import { Injectable } from '@nestjs/common';
import { AppDataSource } from '../../core/database/data-source';
import { AuditLog } from './audit.entity';
@Injectable()
export class AuditService {
  log(actor: string, action: string, entity: string, entityId: string, meta?: any) {
    const r = AppDataSource.getRepository(AuditLog);
    return r.save(r.create({ actor, action, entity, entityId, meta }));
  }
  list() { return AppDataSource.getRepository(AuditLog).find({ order: { createdAt: 'DESC' }, take: 200 }); }
}
