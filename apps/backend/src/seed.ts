import 'reflect-metadata';
import * as dotenv from 'dotenv'; dotenv.config();
import { AppDataSource } from './core/database/data-source';
import { seedCommand } from './commands/seed.command';
async function run(){
  if(!AppDataSource.isInitialized) await AppDataSource.initialize();
  await seedCommand();
  await AppDataSource.destroy();
  console.log('seed done');
}
run().catch(e=>{ console.error(e); process.exit(1); });
