'use strict';
const fs=require('fs/promises'), path=require('path');
const FILE=path.join(__dirname,'..','data','audit.json');
async function read(){ try{ return JSON.parse(await fs.readFile(FILE,'utf8')); }catch(e){ if(e.code==='ENOENT') return []; throw e; } }
async function write(a){ await fs.mkdir(path.dirname(FILE),{recursive:true}); await fs.writeFile(FILE, JSON.stringify(a,null,2)); }
async function log(actor,action,entity,entityId,meta){
  const a=await read(); const entry={id: Date.now().toString(36)+Math.random().toString(36).slice(2,6), actor, action, entity, entityId, meta: meta||null, createdAt: new Date().toISOString()};
  a.unshift(entry); if(a.length>500) a.length=500; await write(a); return entry;
}
async function list(){ return read(); }
module.exports={log,list};
