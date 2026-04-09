import { useEffect, useState } from "react";
import {
  collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "./firebase";
import { useToast } from "./Toast";

type OrderStatus = "pending"|"confirmed"|"on_the_way"|"delivered"|"collected"|"rejected";

const deliverySteps = ["pending","confirmed","on_the_way","delivered"];
const pickupSteps   = ["pending","confirmed","collected"];

const statusLabels: Record<string,string> = {
  pending:"⏳ بانتظار المراجعة", confirmed:"✅ مؤكد",
  on_the_way:"🚗 في الطريق", delivered:"📦 تم التوصيل",
  collected:"🤝 تم الاستلام", rejected:"❌ مرفوض",
};
const statusColors: Record<string,string> = {
  pending:"#f59e0b", confirmed:"#22c55e", on_the_way:"#3b82f6",
  delivered:"#8b5cf6", collected:"#8b5cf6", rejected:"#ef4444",
};

function Admin() {
  const [orders, setOrders]   = useState<any[]>([]);
  const [filter, setFilter]   = useState("all");
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<"orders"|"stats">("orders");
  const { showToast } = useToast();

  const getOrders = async () => {
    try {
      setLoading(true);
      const q = query(collection(db,"orders"), orderBy("createdAt","desc"));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d=>({id:d.id,...d.data()})));
    } catch { showToast("خطأ في تحميل الطلبات","error"); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ getOrders(); },[]);

  const updateStatus = async (id:string, status:OrderStatus) => {
    try {
      await updateDoc(doc(db,"orders",id),{status});
      setOrders(prev=>prev.map(o=>o.id===id?{...o,status}:o));
      showToast(`تم التحديث: ${statusLabels[status]}`,"success");
    } catch { showToast("فشل التحديث","error"); }
  };

  const deleteOrder = async (id:string) => {
    if (!window.confirm("تأكيد الحذف؟")) return;
    try {
      await deleteDoc(doc(db,"orders",id));
      setOrders(prev=>prev.filter(o=>o.id!==id));
      showToast("تم الحذف","info");
    } catch { showToast("فشل الحذف","error"); }
  };

  const filtered = filter==="all" ? orders : orders.filter(o=>o.status===filter);
  const totalRevenue = orders.filter(o=>o.status!=="rejected").reduce((s,o)=>s+(o.total||0),0);
  const pendingCount = orders.filter(o=>o.status==="pending").length;
  const doneCount    = orders.filter(o=>o.status==="delivered"||o.status==="collected").length;

  return (
    <div style={{minHeight:"100vh",background:"#0B0F1A",direction:"rtl"}}>
      {/* Header */}
      <div style={{background:"#111",borderBottom:"1px solid #222",padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
        <h2 style={{color:"#D4AF37",margin:0,fontSize:"18px"}}>🏪 لوحة إدارة العقيلة</h2>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          {(["orders","stats"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 14px",borderRadius:"10px",border:"1px solid #333",background:tab===t?"#D4AF37":"transparent",color:tab===t?"#000":"#ccc",cursor:"pointer",fontSize:"13px"}}>
              {t==="orders"?"📦 الطلبات":"📊 الإحصائيات"}
            </button>
          ))}
          <button onClick={()=>signOut(auth)} style={{padding:"7px 14px",borderRadius:"10px",border:"1px solid #ef444433",background:"#ef444411",color:"#ef4444",cursor:"pointer",fontSize:"13px"}}>خروج 🚪</button>
        </div>
      </div>

      <div style={{padding:"20px",maxWidth:"1000px",margin:"0 auto"}}>
        {/* Stats */}
        {tab==="stats" && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"14px"}}>
            {[
              {label:"إجمالي الطلبات",val:orders.length,icon:"📋",c:"#3b82f6"},
              {label:"بانتظار المراجعة",val:pendingCount,icon:"⏳",c:"#f59e0b"},
              {label:"تم التسليم",val:doneCount,icon:"✅",c:"#22c55e"},
              {label:"الإيرادات (BD)",val:totalRevenue.toFixed(3),icon:"💰",c:"#D4AF37"},
            ].map(s=>(
              <div key={s.label} style={{background:"#111",border:`1px solid ${s.c}33`,borderRadius:"14px",padding:"18px",textAlign:"center"}}>
                <div style={{fontSize:"28px"}}>{s.icon}</div>
                <div style={{color:s.c,fontSize:"26px",fontWeight:"bold",margin:"6px 0"}}>{s.val}</div>
                <div style={{color:"#888",fontSize:"12px"}}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Orders */}
        {tab==="orders" && (
          <>
            <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"18px"}}>
              {["all","pending","confirmed","on_the_way","delivered","collected","rejected"].map(f=>(
                <button key={f} onClick={()=>setFilter(f)} style={{padding:"6px 12px",borderRadius:"20px",border:"1px solid #333",background:filter===f?"#D4AF37":"transparent",color:filter===f?"#000":"#ccc",cursor:"pointer",fontSize:"12px"}}>
                  {f==="all"?"الكل":statusLabels[f]}
                  {f!=="all" && <span style={{marginRight:"4px",opacity:0.7}}>({orders.filter(o=>o.status===f).length})</span>}
                </button>
              ))}
            </div>

            {loading && <p style={{color:"#888",textAlign:"center"}}>جاري التحميل...</p>}
            {!loading && filtered.length===0 && <p style={{color:"#888",textAlign:"center",marginTop:"60px"}}>لا توجد طلبات 📭</p>}

            {filtered.map(order=>{
              const customer  = order.customer || {};
              const items     = order.items || [];
              const isDelivery = order.deliveryType==="delivery";
              const steps     = isDelivery ? deliverySteps : pickupSteps;
              const curIdx    = steps.indexOf(order.status);

              return (
                <div key={order.id} style={{background:"#111",border:`1px solid ${order.status==="pending"?"#f59e0b44":"#222"}`,borderRadius:"14px",padding:"18px",marginBottom:"14px"}}>
                  {/* Top row */}
                  <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"8px",marginBottom:"12px"}}>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}>
                        <span style={{color:"#D4AF37",fontWeight:"bold"}}>#{order.orderNumber||order.id.slice(-6).toUpperCase()}</span>
                        <span style={{background:statusColors[order.status]+"22",color:statusColors[order.status],padding:"2px 10px",borderRadius:"20px",fontSize:"12px",border:`1px solid ${statusColors[order.status]}44`}}>
                          {statusLabels[order.status]||order.status}
                        </span>
                        {order.status==="pending" && <span style={{background:"#f59e0b22",color:"#f59e0b",padding:"2px 10px",borderRadius:"20px",fontSize:"11px",border:"1px solid #f59e0b44"}}>🔔 يحتاج مراجعة</span>}
                      </div>
                      <p style={{color:"#555",fontSize:"11px",marginTop:"4px"}}>{order.createdAt?.toDate?.()?.toLocaleString("ar-BH")||"—"}</p>
                    </div>
                    <div style={{textAlign:"left"}}>
                      <div style={{color:"#D4AF37",fontWeight:"bold",fontSize:"17px"}}>{(order.total||0).toFixed(3)} BD</div>
                      <div style={{color:"#888",fontSize:"12px"}}>{isDelivery?"🚗 توصيل":"🤝 استلام"}</div>
                    </div>
                  </div>

                  {/* Customer */}
                  <div style={{background:"#0B0F1A",borderRadius:"10px",padding:"10px",marginBottom:"12px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"6px",fontSize:"13px"}}>
                    <span><span style={{color:"#666"}}>👤 </span><span style={{color:"#ddd"}}>{customer.name||"—"}</span></span>
                    <span><span style={{color:"#666"}}>📞 </span><span style={{color:"#ddd"}}>{customer.phone||"—"}</span></span>
                    {customer.address && <span><span style={{color:"#666"}}>📍 </span><span style={{color:"#ddd"}}>{customer.address}</span></span>}
                    <span><span style={{color:"#666"}}>💳 </span><span style={{color:"#ddd"}}>{order.paymentMethod==="benefit"?"بنفت":"كاش"}</span></span>
                  </div>

                  {/* Items */}
                  <div style={{marginBottom:"12px"}}>
                    {items.map((item:any,i:number)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",color:"#bbb",fontSize:"13px",padding:"3px 0",borderBottom:"1px solid #1a1a1a"}}>
                        <span>{item.name}{item.selectedSize&&` (${item.selectedSize})`} × {item.quantity}</span>
                        <span style={{color:"#D4AF37"}}>{(item.price*item.quantity).toFixed(3)} BD</span>
                      </div>
                    ))}
                  </div>

                  {/* Steps */}
                  {order.status!=="rejected" && (
                    <div style={{display:"flex",gap:"4px",marginBottom:"12px",overflowX:"auto"}}>
                      {steps.map((step,idx)=>(
                        <div key={step} onClick={()=>updateStatus(order.id,step as OrderStatus)}
                          style={{flex:1,minWidth:"55px",textAlign:"center",padding:"5px 3px",borderRadius:"8px",
                            background:idx<=curIdx?"#D4AF3722":"#1a1a1a",
                            border:`1px solid ${idx<=curIdx?"#D4AF37":"#333"}`,
                            fontSize:"10px",color:idx<=curIdx?"#D4AF37":"#555",cursor:"pointer",whiteSpace:"nowrap"}}>
                          {statusLabels[step]}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                    {order.status==="pending" && <>
                      <button onClick={()=>updateStatus(order.id,"confirmed")} style={ab("#22c55e")}>✅ قبول</button>
                      <button onClick={()=>updateStatus(order.id,"rejected")}  style={ab("#ef4444")}>❌ رفض</button>
                    </>}
                    {order.status==="confirmed" && isDelivery  && <button onClick={()=>updateStatus(order.id,"on_the_way")} style={ab("#3b82f6")}>🚗 خرج للتوصيل</button>}
                    {order.status==="on_the_way"               && <button onClick={()=>updateStatus(order.id,"delivered")}  style={ab("#8b5cf6")}>📦 تم التوصيل</button>}
                    {order.status==="confirmed" && !isDelivery  && <button onClick={()=>updateStatus(order.id,"collected")}  style={ab("#8b5cf6")}>🤝 تم الاستلام</button>}
                    <button onClick={()=>deleteOrder(order.id)} style={{...ab("#ef4444"),marginRight:"auto"}}>🗑️ حذف</button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

const ab = (c:string):React.CSSProperties=>({padding:"6px 12px",borderRadius:"8px",cursor:"pointer",fontSize:"12px",fontWeight:"bold",background:c+"22",color:c,border:`1px solid ${c}44`});

export default Admin;
