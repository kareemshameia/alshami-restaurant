export class OrderError extends Error { constructor(message,status=400){super(message);this.status=status;} }
export const transitions={new:['accepted','rejected'],accepted:['preparing','rejected'],preparing:['ready'],ready:['completed'],completed:[],rejected:[]};
export const statusLabels={new:'بانتظار القبول',accepted:'تم قبول الطلب',preparing:'قيد التحضير',ready:'جاهز',completed:'تم التسليم',rejected:'لم يتم قبول الطلب'};
export function validateOrder(body,catalog){
 if(!body||typeof body!=='object')throw new OrderError('بيانات الطلب غير صحيحة');
 if(!/^[0-9]{1,3}$/.test(String(body.tableNumber||''))||Number(body.tableNumber)<1)throw new OrderError('أدخل رقم الطاولة من 1 إلى 999');
 if(typeof body.notes!=='string'||body.notes.length>500)throw new OrderError('الملاحظات يجب ألا تتجاوز 500 حرف');
 if(!Array.isArray(body.items)||!body.items.length||body.items.length>30)throw new OrderError('اختر الأصناف أولًا، بحد أقصى 30 صنفًا');
 if(!/^[a-f0-9-]{36}$/i.test(body.requestKey||'')||!/^[-_a-zA-Z0-9]{32,64}$/.test(body.receiptToken||''))throw new OrderError('أعد فتح السلة وحاول مرة أخرى');
 const merged=new Map(),products=new Map(catalog.map(p=>[p.id,p]));
 for(const item of body.items){
  const p=products.get(item?.id);if(!p||!Number.isInteger(item.qty)||item.qty<1||item.qty>50)throw new OrderError('أحد الأصناف أو الكميات غير صحيح');
  const size=item.size||'';if(typeof size!=='string')throw new OrderError('الحجم غير صحيح');
  const variant=p.sizes?.find(s=>s.label===size);if((p.sizes&&!variant)||(!p.sizes&&size!==''))throw new OrderError('الحجم المطلوب غير متاح');
  const key=p.id+'|'+size;const previous=merged.get(key);const qty=(previous?.qty||0)+item.qty;
  if(qty>50)throw new OrderError('الحد الأقصى 50 قطعة من الحجم الواحد');
  merged.set(key,{id:p.id,name:p.name,size,qty,price:variant?.price??p.price,quoted:p.id==='cake-wedding'});
 }
 const lines=[...merged.values()];const total=lines.reduce((n,l)=>n+l.qty*l.price,0);
 if(!Number.isSafeInteger(total)||total<=0||total>20000)throw new OrderError('قيمة الطلب غير صحيحة أو تتجاوز الحد المسموح');
 return {tableNumber:String(Number(body.tableNumber)),notes:body.notes.trim(),lines,total};
}
export function assertTransition(current,next){if(!transitions[current]?.includes(next))throw new OrderError('حالة الطلب تغيّرت؛ حدّث الصفحة وحاول مجددًا',409);}
export function checkOrigin(request){const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)throw new OrderError('الطلب غير مسموح',403);}
