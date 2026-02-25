import { useState } from "react";

const C={teal:"#0891B2",tealDk:"#0E7490",tealBg:"#F0FBFF",violet:"#7C3AED",violetLt:"#EDE9FE",coral:"#F43F5E",green:"#059669",orange:"#F97316",yellow:"#D97706",bg:"#EFF9FC",text:"#0C2D3E",textMid:"#3D6273",textLight:"#7BA8B8",border:"#CAE8F0",sh:"0 2px 16px rgba(8,145,178,0.10)"};
const GRAD="linear-gradient(135deg,#0891B2 0%,#7C3AED 100%)";
const GRADSOFT="linear-gradient(135deg,#E0F7FA 0%,#EDE9FE 100%)";
const MAX_TOTAL=78;
const uid=()=>Math.random().toString(36).slice(2,8).toUpperCase();
const fmtDate=iso=>{if(!iso)return"-";return new Date(iso).toLocaleDateString("th-TH",{year:"numeric",month:"short",day:"numeric"});};
const isExpired=c=>{if(!c.expiresAt)return false;return new Date(c.expiresAt)<new Date();};
const codeOk=c=>c.active&&!isExpired(c)&&(c.usageLimit===null||c.usedCount<c.usageLimit);

const INIT={
  doctors:[{id:"D0",firstName:"สมชาย",lastName:"แพทย์ดี",license:"12345",pass:"demo123",status:"approved",method:"demo",createdAt:new Date().toISOString()}],
  pendingDoctors:[{id:"PD0",firstName:"วิภา",lastName:"รักษ์ดี",license:"99999",pass:"test123",status:"pending",method:"approval",createdAt:new Date(Date.now()-86400000).toISOString()}],
  patients:[],assessments:[],
  pdpaText:`วัตถุประสงค์การเก็บข้อมูล\nระบบ ADCS-MCI-ADL (ETM) เก็บรวบรวมข้อมูลส่วนบุคคลของท่านเพื่อ:\n• บันทึกและจัดการข้อมูลการประเมินกิจวัตรประจำวันของผู้ป่วย\n• ระบุตัวตนของแพทย์ผู้ใช้งานระบบ\n• จัดทำรายงานและสถิติทางการแพทย์\n\nข้อมูลที่เก็บรวบรวม\n• ชื่อ นามสกุล และเลขที่ใบประกอบวิชาชีพเวชกรรม (เลข ว.)\n• ข้อมูลผู้ป่วยที่ท่านป้อนเข้าระบบ\n• ประวัติการใช้งานระบบ\n\nการเก็บรักษาและความปลอดภัย\nข้อมูลของท่านถูกจัดเก็บใน Google Sheets ของ Eisai Thailand Marketing (ETM) ซึ่งมีการควบคุมการเข้าถึงอย่างเข้มงวด ข้อมูลจะไม่ถูกเปิดเผยต่อบุคคลภายนอกโดยไม่ได้รับความยินยอม\n\nสิทธิของเจ้าของข้อมูล\nท่านมีสิทธิ์ขอเข้าถึง แก้ไข หรือลบข้อมูลของท่านได้โดยติดต่อผู้ดูแลระบบ ETM\n\nหากมีข้อสงสัย กรุณาติดต่อ: Eisai Thailand Marketing · ผู้ควบคุมข้อมูลส่วนบุคคล`,
  inviteCodes:[
    {id:"IC1",code:"ETM-2024-DEMO",type:"lifelong",expiresAt:null,usageLimit:null,usedCount:2,active:true,createdAt:new Date().toISOString(),note:"Code ทั่วไป Eisai"},
    {id:"IC2",code:"ETM-SIRIRAJ-01",type:"timed",expiresAt:"2026-12-31T23:59:59",usageLimit:10,usedCount:3,active:true,createdAt:new Date().toISOString(),note:"โรงพยาบาลศิริราช"},
    {id:"IC3",code:"ETM-OLD-2023",type:"timed",expiresAt:"2023-12-31T23:59:59",usageLimit:5,usedCount:5,active:true,createdAt:new Date().toISOString(),note:"หมดอายุแล้ว (ตัวอย่าง)"},
  ],
};

const Btn=({children,onClick,v="primary",style={},disabled=false,full=false,sm=false})=>{
  const base={border:"none",borderRadius:10,fontFamily:"inherit",cursor:disabled?"not-allowed":"pointer",fontWeight:700,transition:"all .15s",opacity:disabled?0.45:1,width:full?"100%":undefined,padding:sm?"7px 14px":"11px 22px",fontSize:sm?12:14,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:5,boxSizing:"border-box"};
  const vs={primary:{background:GRAD,color:"#fff",boxShadow:"0 3px 14px rgba(8,145,178,0.25)"},outline:{background:"#fff",color:C.teal,border:`2px solid ${C.teal}`},ghost:{background:"transparent",color:C.textMid},danger:{background:"#FEE2E2",color:"#DC2626"},violet:{background:"linear-gradient(135deg,#7C3AED,#A855F7)",color:"#fff",boxShadow:"0 3px 14px rgba(124,58,237,0.3)"},green:{background:"linear-gradient(135deg,#059669,#10B981)",color:"#fff"},white:{background:"rgba(255,255,255,0.18)",border:"1.5px solid rgba(255,255,255,0.7)",color:"#fff"}};
  return <button onClick={disabled?undefined:onClick} style={{...base,...vs[v],...style}}>{children}</button>;
};
const Inp=({label,value,onChange,type="text",required,hint,placeholder=""})=>(
  <div style={{marginBottom:14}}>
    {label&&<div style={{fontSize:12,fontWeight:600,color:C.textMid,marginBottom:5}}>{label}{required&&<span style={{color:C.coral}}> *</span>}</div>}
    <input value={value} onChange={e=>onChange(e.target.value)} type={type} placeholder={placeholder} style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:9,padding:"9px 13px",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box",background:"#F8FEFF",color:C.text}} onFocus={e=>e.target.style.borderColor=C.teal} onBlur={e=>e.target.style.borderColor=C.border}/>
    {hint&&<div style={{fontSize:11,color:C.textLight,marginTop:3}}>{hint}</div>}
  </div>
);
const Card=({children,style={}})=><div style={{background:"#fff",borderRadius:14,boxShadow:C.sh,padding:22,...style}}>{children}</div>;
const ErrBox=({msg})=>msg?<div style={{color:C.coral,fontSize:12,marginBottom:10,background:"#FEF2F2",padding:"7px 11px",borderRadius:7}}>{msg}</div>:null;
const Badge=({label,color,bg})=><span style={{fontSize:11,background:bg,color,padding:"2px 9px",borderRadius:99,fontWeight:700,whiteSpace:"nowrap"}}>{label}</span>;
const Banner=()=>(
  <div style={{background:"#FFFBEB",border:"1.5px solid #FCD34D",borderRadius:9,padding:"8px 13px",marginBottom:16,fontSize:12,color:"#92400E",lineHeight:1.6}}>
    🧪 <strong>Demo Mode</strong> — ข้อมูลอยู่ใน Memory เท่านั้น<br/>
    👨‍⚕️ Demo login: เลข ว. <strong>12345</strong> / รหัส <strong>demo123</strong> &nbsp;·&nbsp; ⚙️ Admin Code: <strong>ETM2024</strong><br/>
    🔑 Invite Code ทดสอบ: <strong>ETM-2024-DEMO</strong> หรือ <strong>ETM-SIRIRAJ-01</strong>
  </div>
);

// ── LANDING ──────────────────────────────────────────────────
const Landing=({go})=>(
  <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
    <div style={{textAlign:"center",marginBottom:32}}>
      <div style={{width:80,height:80,background:GRAD,borderRadius:22,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:38,marginBottom:16,boxShadow:"0 8px 32px rgba(8,145,178,0.3)"}}>🧠</div>
      <h1 style={{margin:0,fontSize:28,fontWeight:900,background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>ADCS-MCI-ADL</h1>
      <p style={{color:C.textMid,margin:"8px 0 2px",fontSize:14}}>ระบบประเมินกิจวัตรประจำวัน สำหรับแพทย์</p>
      <p style={{color:C.textLight,fontSize:11,margin:0}}>Eisai Thailand Marketing (ETM)</p>
      <div style={{marginTop:12,background:"#FFFBEB",border:"1.5px solid #FCD34D",borderRadius:8,padding:"5px 16px",display:"inline-block",fontSize:11,color:"#92400E"}}>🧪 Demo Mode — ข้อมูลใน Memory</div>
    </div>
    <div style={{width:"100%",maxWidth:340,display:"flex",flexDirection:"column",gap:12}}>
      <Btn full onClick={()=>go("login")}>🔑 เข้าสู่ระบบ (แพทย์)</Btn>
      <Btn full v="outline" onClick={()=>go("register")}>📋 ลงทะเบียนแพทย์ใหม่</Btn>
      <Btn full v="ghost" onClick={()=>go("adminLogin")} style={{fontSize:12,color:C.textLight}}>⚙️ Admin Dashboard</Btn>
    </div>
  </div>
);

// ── REGISTER ─────────────────────────────────────────────────
const Register=({go,db,setDb})=>{
  const [step,setStep]=useState(1);
  const [pdpaOk,setPdpaOk]=useState(false);
  const [method,setMethod]=useState(null);
  const [code,setCode]=useState("");
  const [f,setF]=useState({firstName:"",lastName:"",license:"",pass:"",pass2:""});
  const [err,setErr]=useState("");
  const [done,setDone]=useState(null);
  const u=k=>v=>setF(p=>({...p,[k]:v}));

  const submit=()=>{
    setErr("");
    if(!f.firstName||!f.lastName||!f.license||!f.pass)return setErr("กรุณากรอกข้อมูลให้ครบ");
    if(f.pass!==f.pass2)return setErr("รหัสผ่านไม่ตรงกัน");
    if(f.pass.length<6)return setErr("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
    if([...db.doctors,...db.pendingDoctors].find(d=>d.license===f.license.trim()))return setErr("เลข ว. นี้มีในระบบแล้ว");
    if(method==="code"){
      const ic=db.inviteCodes.find(c=>c.code===code.trim().toUpperCase());
      if(!ic)return setErr("ไม่พบ Invite Code นี้ในระบบ");
      if(isExpired(ic))return setErr("Invite Code นี้หมดอายุแล้ว");
      if(!ic.active)return setErr("Invite Code นี้ถูกปิดใช้งาน");
      if(ic.usageLimit!==null&&ic.usedCount>=ic.usageLimit)return setErr("Invite Code นี้ถูกใช้ครบจำนวนแล้ว");
      const doc={id:"D"+uid(),firstName:f.firstName.trim(),lastName:f.lastName.trim(),license:f.license.trim(),pass:f.pass,status:"approved",method:"code",codeUsed:ic.code,createdAt:new Date().toISOString()};
      setDb(p=>({...p,doctors:[...p.doctors,doc],inviteCodes:p.inviteCodes.map(c=>c.id===ic.id?{...c,usedCount:c.usedCount+1}:c)}));
      setDone("code");
    }else{
      const pd={id:"PD"+uid(),firstName:f.firstName.trim(),lastName:f.lastName.trim(),license:f.license.trim(),pass:f.pass,status:"pending",method:"approval",createdAt:new Date().toISOString()};
      setDb(p=>({...p,pendingDoctors:[...p.pendingDoctors,pd]}));
      setDone("approval");
    }
  };

  if(done==="code")return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <Card style={{maxWidth:420,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:56,marginBottom:8}}>✅</div>
        <h2 style={{color:C.green,margin:"0 0 8px"}}>ลงทะเบียนสำเร็จ!</h2>
        <p style={{color:C.textMid,fontSize:14,margin:"0 0 4px"}}>นพ./พญ. {f.firstName} {f.lastName}</p>
        <p style={{color:C.textLight,fontSize:13,marginBottom:24}}>เข้าสู่ระบบด้วยเลข ว. และรหัสผ่านที่ลงทะเบียนไว้</p>
        <Btn full onClick={()=>go("login")}>🔑 ไปหน้าเข้าสู่ระบบ</Btn>
      </Card>
    </div>
  );
  if(done==="approval")return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <Card style={{maxWidth:420,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:56,marginBottom:8}}>⏳</div>
        <h2 style={{color:C.orange,margin:"0 0 8px"}}>รอการอนุมัติ</h2>
        <p style={{color:C.textMid,fontSize:14,margin:"0 0 4px"}}>นพ./พญ. {f.firstName} {f.lastName}</p>
        <p style={{color:C.textLight,fontSize:13,marginBottom:24}}>Admin ETM จะตรวจสอบและอนุมัติภายใน 1-2 วันทำการ</p>
        <Btn full v="outline" onClick={()=>go("landing")}>← กลับหน้าหลัก</Btn>
      </Card>
    </div>
  );

  if(step===1)return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <Card style={{width:"100%",maxWidth:520}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:36}}>🔒</div>
          <h2 style={{margin:"8px 0 3px",color:C.text}}>นโยบายคุ้มครองข้อมูลส่วนบุคคล</h2>
          <p style={{color:C.textLight,fontSize:12,margin:0}}>PDPA — พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562</p>
        </div>
        <div style={{background:"#F8FEFF",border:`1.5px solid ${C.border}`,borderRadius:10,padding:18,marginBottom:18,maxHeight:260,overflowY:"auto",fontSize:13,color:C.textMid,lineHeight:1.9,whiteSpace:"pre-line"}}>{db.pdpaText}</div>
        <div onClick={()=>setPdpaOk(p=>!p)} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 14px",borderRadius:10,border:`2px solid ${pdpaOk?C.teal:C.border}`,background:pdpaOk?C.tealBg:"#fff",cursor:"pointer",marginBottom:18,userSelect:"none"}}>
          <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${pdpaOk?C.teal:C.border}`,background:pdpaOk?C.teal:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
            {pdpaOk&&<span style={{color:"#fff",fontSize:13,fontWeight:900}}>✓</span>}
          </div>
          <div style={{fontSize:13,color:C.text,lineHeight:1.6}}>
            <strong>ข้าพเจ้ายินยอมให้เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคล</strong><br/>
            ตามนโยบายคุ้มครองข้อมูลส่วนบุคคลของ Eisai Thailand Marketing (ETM)
          </div>
        </div>
        <Btn full onClick={()=>pdpaOk&&setStep(2)} disabled={!pdpaOk}>{pdpaOk?"ยอมรับและดำเนินการต่อ →":"กรุณาอ่านและยินยอมก่อน"}</Btn>
        <Btn full v="ghost" onClick={()=>go("landing")} style={{marginTop:8}}>← กลับ</Btn>
      </Card>
    </div>
  );

  if(step===2)return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <Card style={{width:"100%",maxWidth:460}}>
        <div style={{textAlign:"center",marginBottom:22}}>
          <div style={{fontSize:34}}>🏥</div>
          <h2 style={{margin:"8px 0 4px",color:C.text}}>วิธีการเข้าใช้งาน</h2>
          <p style={{color:C.textLight,fontSize:13,margin:0}}>เลือกวิธีการลงทะเบียนที่ท่านมี</p>
        </div>
        {[{key:"code",icon:"🔑",title:"มี Invite Code จาก Eisai",desc:"ใช้รหัสพิเศษที่ได้รับจาก Eisai Thailand Marketing — เข้าใช้งานได้ทันที"},{key:"approval",icon:"📋",title:"ขอรับการอนุมัติจาก Admin",desc:"ส่งคำขอ — Admin ETM จะตรวจสอบและอนุมัติภายใน 1-2 วันทำการ"}].map(opt=>(
          <div key={opt.key} onClick={()=>setMethod(opt.key)} style={{display:"flex",gap:14,padding:"14px 16px",borderRadius:12,border:`2px solid ${method===opt.key?C.teal:C.border}`,background:method===opt.key?C.tealBg:"#fff",cursor:"pointer",marginBottom:12,userSelect:"none",transition:"all .15s"}}>
            <div style={{fontSize:30,flexShrink:0}}>{opt.icon}</div>
            <div><div style={{fontWeight:700,color:C.text,fontSize:14}}>{opt.title}</div><div style={{fontSize:12,color:C.textMid,marginTop:3}}>{opt.desc}</div></div>
          </div>
        ))}
        <Btn full onClick={()=>method&&setStep(3)} disabled={!method} style={{marginTop:4}}>ดำเนินการต่อ →</Btn>
        <Btn full v="ghost" onClick={()=>setStep(1)} style={{marginTop:8}}>← กลับ</Btn>
      </Card>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <Card style={{width:"100%",maxWidth:460}}>
        <div style={{textAlign:"center",marginBottom:18}}>
          <div style={{fontSize:32}}>{method==="code"?"🔑":"📋"}</div>
          <h2 style={{margin:"8px 0 3px",color:C.text}}>ข้อมูลการลงทะเบียน</h2>
          <p style={{color:C.textLight,fontSize:12,margin:0}}>{method==="code"?"ลงทะเบียนด้วย Invite Code":"ขอรับการอนุมัติจาก Admin"}</p>
        </div>
        {method==="code"&&(
          <div style={{background:C.tealBg,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,color:C.textMid,marginBottom:6}}>🔑 Invite Code <span style={{color:C.coral}}>*</span></div>
            <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="เช่น ETM-2024-DEMO" style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:8,padding:"9px 13px",fontSize:15,fontFamily:"inherit",outline:"none",boxSizing:"border-box",background:"#fff",color:C.text,letterSpacing:2,fontWeight:700}} onFocus={e=>e.target.style.borderColor=C.teal} onBlur={e=>e.target.style.borderColor=C.border}/>
            <div style={{fontSize:11,color:C.textLight,marginTop:4}}>ทดสอบใช้: <strong>ETM-2024-DEMO</strong></div>
          </div>
        )}
        <Inp label="ชื่อ" value={f.firstName} onChange={u("firstName")} required/>
        <Inp label="นามสกุล" value={f.lastName} onChange={u("lastName")} required/>
        <Inp label="เลข ว. (ใบประกอบวิชาชีพเวชกรรม)" value={f.license} onChange={u("license")} required hint="ต้องไม่ซ้ำกับที่มีในระบบ"/>
        <Inp label="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)" value={f.pass} onChange={u("pass")} type="password" required/>
        <Inp label="ยืนยันรหัสผ่าน" value={f.pass2} onChange={u("pass2")} type="password" required/>
        <ErrBox msg={err}/>
        <Btn full onClick={submit}>{method==="code"?"✅ ลงทะเบียนทันที":"📨 ส่งคำขอลงทะเบียน"}</Btn>
        <Btn full v="ghost" onClick={()=>setStep(2)} style={{marginTop:8}}>← กลับ</Btn>
      </Card>
    </div>
  );
};

// ── LOGIN ────────────────────────────────────────────────────
const Login=({go,db,setDoctor})=>{
  const [lic,setLic]=useState("");const [pw,setPw]=useState("");const [err,setErr]=useState("");
  const submit=()=>{
    const doc=db.doctors.find(d=>d.license===lic.trim()&&d.pass===pw&&d.status==="approved");
    if(!doc){
      if(db.pendingDoctors.find(d=>d.license===lic.trim()&&d.pass===pw&&d.status==="pending"))return setErr("บัญชีของท่านยังรอการอนุมัติจาก Admin ETM");
      return setErr("เลข ว. หรือรหัสผ่านไม่ถูกต้อง");
    }
    setDoctor(doc);go("dashboard");
  };
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <Card style={{width:"100%",maxWidth:380}}>
        <Banner/>
        <div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:34}}>🔑</div><h2 style={{margin:"8px 0 0",color:C.text}}>เข้าสู่ระบบ</h2></div>
        <Inp label="เลข ว." value={lic} onChange={setLic} required placeholder="12345"/>
        <Inp label="รหัสผ่าน" value={pw} onChange={setPw} type="password" required/>
        <ErrBox msg={err}/>
        <Btn full onClick={submit}>เข้าสู่ระบบ</Btn>
        <Btn full v="ghost" onClick={()=>go("landing")} style={{marginTop:8}}>← กลับ</Btn>
      </Card>
    </div>
  );
};

// ── DASHBOARD ─────────────────────────────────────────────────
const Dashboard=({doctor,go,db,setDoctor,setPatient})=>{
  const [search,setSearch]=useState("");
  const pts=db.patients.filter(p=>p.doctorId===doctor.id);
  const ass=db.assessments.filter(a=>a.doctorId===doctor.id);
  const filtered=pts.filter(p=>`${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()));
  const getLast=pid=>ass.filter(a=>a.patientId===pid).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
  const getInterp=s=>{const pct=(s/MAX_TOTAL)*100;if(pct>=80)return{l:"ความสามารถสูง",c:C.green,bg:"#ECFDF5",i:"🟢"};if(pct>=60)return{l:"ปานกลาง-สูง",c:"#3B82F6",bg:"#EFF6FF",i:"🔵"};if(pct>=40)return{l:"ปานกลาง",c:C.yellow,bg:"#FFFBEB",i:"🟡"};if(pct>=20)return{l:"ต่ำ-ปานกลาง",c:C.orange,bg:"#FFF7ED",i:"🟠"};return{l:"ความสามารถต่ำ",c:C.coral,bg:"#FEF2F2",i:"🔴"};};
  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{background:GRAD,padding:"18px 22px",color:"#fff"}}>
        <div style={{maxWidth:860,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontSize:11,opacity:0.8}}>🧠 ADCS-MCI-ADL · ETM</div>
            <h2 style={{margin:"3px 0 0",fontSize:18}}>สวัสดี, นพ./พญ. {doctor.firstName} {doctor.lastName}</h2>
            <div style={{fontSize:11,opacity:0.75}}>เลข ว. {doctor.license}</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn sm v="white" onClick={()=>go("adminLogin")}>⚙️ Admin</Btn>
            <Btn sm v="white" onClick={()=>{setDoctor(null);go("landing");}}>🚪 ออกจากระบบ</Btn>
          </div>
        </div>
      </div>
      <div style={{maxWidth:860,margin:"0 auto",padding:22}}>
        <Banner/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:22}}>
          {[["👥","ผู้ป่วยทั้งหมด",pts.length,"ราย"],["📝","การประเมิน",ass.length,"ครั้ง"],["☁️","ฐานข้อมูล","Google Sheets",""]].map(([ic,t,v,u])=>(
            <Card key={t} style={{textAlign:"center",padding:16}}>
              <div style={{fontSize:28,marginBottom:4}}>{ic}</div>
              <div style={{fontSize:ic==="☁️"?14:22,fontWeight:900,color:C.teal}}>{v}</div>
              <div style={{fontSize:11,color:C.textLight}}>{t} {u}</div>
            </Card>
          ))}
        </div>
        <div style={{display:"flex",gap:11,marginBottom:18,flexWrap:"wrap"}}>
          <Btn onClick={()=>go("newPatient")}>+ เพิ่มผู้ป่วยใหม่</Btn>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 ค้นหาชื่อผู้ป่วย..." style={{flex:1,minWidth:180,border:`1.5px solid ${C.border}`,borderRadius:9,padding:"9px 13px",fontSize:13,fontFamily:"inherit",outline:"none",background:"#fff"}}/>
        </div>
        {filtered.length===0?(
          <Card style={{textAlign:"center",padding:48}}>
            <div style={{fontSize:48}}>🏥</div>
            <div style={{color:C.textMid,marginTop:12,fontSize:14}}>ยังไม่มีรายชื่อผู้ป่วย</div>
            <Btn sm onClick={()=>go("newPatient")} style={{marginTop:14}}>+ เพิ่มผู้ป่วยใหม่</Btn>
          </Card>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {filtered.map(p=>{const last=getLast(p.id);const it=last?getInterp(last.totalScore):null;return(
              <Card key={p.id} style={{display:"flex",alignItems:"center",gap:14,padding:14,cursor:"pointer"}} onClick={()=>{setPatient(p);go("patientDetail");}}>
                <div style={{width:44,height:44,borderRadius:11,background:GRADSOFT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{p.gender==="ชาย"?"👨":"👩"}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,color:C.text,fontSize:15}}>{p.firstName} {p.lastName}</div>
                  <div style={{color:C.textLight,fontSize:12}}>{p.gender} · อายุ {p.age} ปี · ประเมินแล้ว {ass.filter(a=>a.patientId===p.id).length} ครั้ง</div>
                </div>
                {last&&it&&<div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:900,color:it.c}}>{last.totalScore}<span style={{fontSize:11,color:C.textLight}}>/{MAX_TOTAL}</span></div><Badge label={`${it.i} ${it.l}`} color={it.c} bg={it.bg}/></div>}
                <div style={{color:C.textLight,fontSize:18}}>›</div>
              </Card>
            );})}
          </div>
        )}
      </div>
    </div>
  );
};

// ── NEW PATIENT ───────────────────────────────────────────────
const NewPatient=({doctor,go,setDb,setPatient})=>{
  const [f,setF]=useState({firstName:"",lastName:"",gender:"ชาย",age:""});const [err,setErr]=useState("");
  const u=k=>v=>setF(p=>({...p,[k]:v}));
  const submit=()=>{
    if(!f.firstName||!f.lastName||!f.age)return setErr("กรุณากรอกข้อมูลให้ครบ");
    const p={id:"P"+uid(),doctorId:doctor.id,firstName:f.firstName,lastName:f.lastName,gender:f.gender,age:parseInt(f.age),createdAt:new Date().toISOString()};
    setDb(prev=>({...prev,patients:[...prev.patients,p]}));setPatient(p);go("assessment");
  };
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <Card style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:32}}>👤</div><h2 style={{margin:"8px 0 0",color:C.text}}>เพิ่มผู้ป่วยใหม่</h2></div>
        <Inp label="ชื่อ" value={f.firstName} onChange={u("firstName")} required/>
        <Inp label="นามสกุล" value={f.lastName} onChange={u("lastName")} required/>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:600,color:C.textMid,marginBottom:5}}>เพศ</div>
          <div style={{display:"flex",gap:8}}>
            {["ชาย","หญิง"].map(g=><button key={g} onClick={()=>u("gender")(g)} style={{flex:1,padding:"9px 0",borderRadius:9,border:`2px solid ${f.gender===g?C.teal:C.border}`,background:f.gender===g?C.tealBg:"#fff",color:f.gender===g?C.teal:C.textMid,fontFamily:"inherit",fontSize:14,fontWeight:600,cursor:"pointer"}}>{g==="ชาย"?"👨 ชาย":"👩 หญิง"}</button>)}
          </div>
        </div>
        <Inp label="อายุ (ปี)" value={f.age} onChange={u("age")} type="number" required placeholder="เช่น 72"/>
        <ErrBox msg={err}/>
        <Btn full onClick={submit}>บันทึกและเริ่มประเมิน →</Btn>
        <Btn full v="ghost" onClick={()=>go("dashboard")} style={{marginTop:8}}>← กลับ</Btn>
      </Card>
    </div>
  );
};

// ── ASSESSMENT ────────────────────────────────────────────────
const QS=[
  {id:"q1",num:1,title:"การรับประทานอาหาร",en:"Eating",opts:[{v:3,l:"รับประทานได้เอง ไม่ต้องช่วย และใช้มีดได้"},{v:2,l:"ใช้ส้อมหรือช้อน แต่ไม่ใช้มีด"},{v:1,l:"ใช้นิ้วมือหยิบอาหาร"},{v:0,l:"ต้องมีผู้อื่นป้อนให้"}]},
  {id:"q2",num:2,title:"การเดิน/การเคลื่อนที่",en:"Walking",opts:[{v:3,l:"เคลื่อนที่นอกบ้านได้เองโดยไม่ต้องช่วย"},{v:2,l:"เคลื่อนที่ข้ามห้องได้เองโดยไม่ต้องช่วย"},{v:1,l:"ย้ายจากเตียงไปเก้าอี้ได้เอง"},{v:0,l:"ต้องช่วยทางกายในการเดิน"}]},
  {id:"q3",num:3,title:"การขับถ่ายที่ห้องน้ำ",en:"Bowel & Bladder",opts:[{v:3,l:"ทำทุกอย่างได้เองโดยไม่ต้องมีผู้ดูแล"},{v:2,l:"ต้องมีผู้คอยดูแลแต่ไม่ต้องช่วยทางกาย"},{v:1,l:"ต้องช่วยทางกาย และปกติกลั้นได้"},{v:0,l:"ต้องช่วยทางกาย และปกติกลั้นไม่ได้"}]},
  {id:"q4",num:4,title:"การอาบน้ำ",en:"Bathing",opts:[{v:3,l:"อาบน้ำได้เองโดยไม่ต้องเตือน"},{v:2,l:"ต้องมีการกำกับ/เตือนเพื่ออาบน้ำให้ครบ"},{v:1,l:"ต้องช่วยทางกายเล็กน้อย"},{v:0,l:"ต้องมีผู้อื่นอาบน้ำให้ทั้งหมด"}]},
  {id:"q5",num:5,title:"การดูแลความสะอาดส่วนตัว",en:"Grooming",opts:[{v:3,l:"ทำความสะอาดและตัดเล็บได้เองโดยไม่ต้องช่วย"},{v:2,l:"แปรงหรือหวีผมได้เองโดยไม่ต้องช่วย"},{v:1,l:"รักษาความสะอาดใบหน้าและมือได้เอง"},{v:0,l:"ต้องมีคนช่วยในการดูแลทั้งหมด"}]},
  {id:"q6",num:"6B",title:"การแต่งตัว",en:"Dressing",opts:[{v:4,l:"แต่งตัวได้ครบโดยไม่ต้องกำกับหรือช่วยทางกาย"},{v:3,l:"แต่งตัวได้ครบเมื่อมีการกำกับ"},{v:2,l:"ต้องช่วยเฉพาะกระดุม/ตะขอ/เชือกรองเท้า"},{v:1,l:"แต่งตัวได้เองหากเสื้อผ้าไม่มีตะขอ"},{v:0,l:"ต้องช่วยทางกายเสมอ"}]},
];
const calcScore=ans=>QS.reduce((s,q)=>s+(ans[q.id]?.score??0),0);
const getInterp=score=>{const p=(score/MAX_TOTAL)*100;if(p>=80)return{l:"ความสามารถสูง",c:C.green,bg:"#ECFDF5",i:"🟢"};if(p>=60)return{l:"ปานกลาง-สูง",c:"#3B82F6",bg:"#EFF6FF",i:"🔵"};if(p>=40)return{l:"ปานกลาง",c:C.yellow,bg:"#FFFBEB",i:"🟡"};if(p>=20)return{l:"ต่ำ-ปานกลาง",c:C.orange,bg:"#FFF7ED",i:"🟠"};return{l:"ความสามารถต่ำ",c:C.coral,bg:"#FEF2F2",i:"🔴"};};

const Assessment=({patient,doctor,go,setDb,setAssessment})=>{
  const [ans,setAns]=useState({});const [notes,setNotes]=useState("");const [pg,setPg]=useState(0);
  const pages=[{title:"ส่วนที่ 1 (ข้อ 1-3)",qs:QS.slice(0,3)},{title:"ส่วนที่ 2 (ข้อ 4-6)",qs:QS.slice(3,6)}];
  const cur=pages[pg];const score=calcScore(ans);
  const save=()=>{
    const a={id:"A"+uid(),patientId:patient.id,doctorId:doctor.id,totalScore:score,answers:ans,notes,date:new Date().toISOString()};
    setDb(p=>({...p,assessments:[...p.assessments,a]}));setAssessment(a);go("results");
  };
  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{background:GRAD,padding:"13px 20px",color:"#fff",position:"sticky",top:0,zIndex:10}}>
        <div style={{maxWidth:720,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div><div style={{fontSize:11,opacity:0.8}}>📋 ADCS-MCI-ADL (Demo 6 ข้อ)</div><div style={{fontWeight:700,fontSize:14}}>{patient.firstName} {patient.lastName}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:22,fontWeight:900}}>{score}<span style={{fontSize:11,opacity:0.7}}>/{MAX_TOTAL}</span></div></div>
          </div>
          <div style={{height:5,background:"rgba(255,255,255,0.3)",borderRadius:99}}><div style={{height:"100%",width:`${((pg+1)/pages.length)*100}%`,background:"#fff",borderRadius:99,transition:"width 0.35s"}}/></div>
          <div style={{fontSize:11,opacity:0.7,marginTop:3}}>{cur.title} · {pg+1}/{pages.length}</div>
        </div>
      </div>
      <div style={{maxWidth:720,margin:"0 auto",padding:20}}>
        <div style={{background:"#FFFBEB",border:"1.5px solid #FCD34D",borderRadius:8,padding:"7px 12px",marginBottom:16,fontSize:12,color:"#92400E"}}>🧪 Demo แสดง 6 ข้อแรก จาก 23 ข้อเต็ม</div>
        {cur.qs.map(q=>{const a=ans[q.id]||{};return(
          <div key={q.id} style={{marginBottom:16,padding:16,borderRadius:12,background:"#F8FEFF",border:`1.5px solid ${C.border}`}}>
            <div style={{display:"flex",gap:10,marginBottom:12}}>
              <div style={{background:GRAD,color:"#fff",borderRadius:7,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,flexShrink:0}}>{q.num}</div>
              <div><div style={{fontWeight:700,color:C.text,fontSize:14}}>{q.title}</div><div style={{fontSize:11,color:C.textLight}}>{q.en}</div></div>
            </div>
            {q.opts.map(o=><button key={o.v} onClick={()=>setAns(p=>({...p,[q.id]:{score:o.v}}))} style={{display:"block",width:"100%",marginBottom:6,padding:"9px 12px",borderRadius:9,border:`2px solid ${a.score===o.v?C.teal:C.border}`,textAlign:"left",background:a.score===o.v?C.tealBg:"#fff",color:a.score===o.v?C.teal:C.text,fontFamily:"inherit",fontSize:13,cursor:"pointer",fontWeight:a.score===o.v?700:400}}><span style={{fontWeight:900,marginRight:6,color:a.score===o.v?C.teal:C.tealDk}}>{o.v} =</span>{o.l}</button>)}
          </div>
        );})}
        {pg===pages.length-1&&(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,color:C.textMid,marginBottom:5}}>📝 บันทึกเพิ่มเติม</div>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="บันทึกข้อสังเกต..." style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:9,padding:"9px 12px",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",background:"#F8FEFF",color:C.text,minHeight:70,resize:"vertical"}}/>
          </div>
        )}
        <div style={{display:"flex",gap:10,justifyContent:"space-between"}}>
          <Btn v="outline" onClick={()=>pg>0?setPg(pg-1):go("patientDetail")}>{pg===0?"← ยกเลิก":"← ก่อนหน้า"}</Btn>
          {pg<pages.length-1?<Btn onClick={()=>setPg(pg+1)}>ถัดไป →</Btn>:<Btn v="green" onClick={save}>✅ บันทึกผลการประเมิน</Btn>}
        </div>
      </div>
    </div>
  );
};

// ── PATIENT DETAIL ────────────────────────────────────────────
const PatientDetail=({patient,go,db,setAssessment})=>{
  const ass=db.assessments.filter(a=>a.patientId===patient.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{background:GRAD,padding:"18px 22px",color:"#fff"}}>
        <div style={{maxWidth:720,margin:"0 auto"}}>
          <button onClick={()=>go("dashboard")} style={{background:"rgba(255,255,255,0.18)",border:"none",color:"#fff",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:13,marginBottom:9,fontFamily:"inherit"}}>← กลับ</button>
          <div style={{display:"flex",alignItems:"center",gap:13}}>
            <div style={{width:48,height:48,borderRadius:12,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{patient.gender==="ชาย"?"👨":"👩"}</div>
            <div><h2 style={{margin:0}}>{patient.firstName} {patient.lastName}</h2><div style={{fontSize:12,opacity:0.8}}>{patient.gender} · อายุ {patient.age} ปี</div></div>
          </div>
        </div>
      </div>
      <div style={{maxWidth:720,margin:"0 auto",padding:22}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h3 style={{margin:0,color:C.text}}>ประวัติการประเมิน ({ass.length} ครั้ง)</h3>
          <Btn sm onClick={()=>go("assessment")}>+ ประเมินใหม่</Btn>
        </div>
        {ass.length===0?(
          <Card style={{textAlign:"center",padding:44}}><div style={{fontSize:44}}>📋</div><div style={{color:C.textMid,marginTop:10}}>ยังไม่มีประวัติ</div><Btn sm onClick={()=>go("assessment")} style={{marginTop:14}}>+ เริ่มประเมิน</Btn></Card>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {ass.map((a,i)=>{const it=getInterp(a.totalScore);return(
              <Card key={a.id} style={{display:"flex",alignItems:"center",gap:14,padding:14,cursor:"pointer"}} onClick={()=>{setAssessment(a);go("results");}}>
                <div style={{flex:1}}><div style={{fontWeight:700,color:C.text}}>{fmtDate(a.date)}</div><div style={{fontSize:11,color:C.textLight}}>ครั้งที่ {ass.length-i}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:900,color:it.c}}>{a.totalScore}<span style={{fontSize:11,color:C.textLight}}>/{MAX_TOTAL}</span></div><Badge label={`${it.i} ${it.l}`} color={it.c} bg={it.bg}/></div>
                <div style={{color:C.textLight,fontSize:18}}>›</div>
              </Card>
            );})}
          </div>
        )}
      </div>
    </div>
  );
};

// ── RESULTS ───────────────────────────────────────────────────
const Results=({assessment,patient,go})=>{
  const it=getInterp(assessment.totalScore);
  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{background:GRAD,padding:"18px 22px",color:"#fff"}}>
        <div style={{maxWidth:720,margin:"0 auto"}}>
          <button onClick={()=>go("patientDetail")} style={{background:"rgba(255,255,255,0.18)",border:"none",color:"#fff",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:13,marginBottom:9,fontFamily:"inherit"}}>← กลับ</button>
          <h2 style={{margin:0}}>ผลการประเมิน ADCS-MCI-ADL</h2>
          <div style={{fontSize:12,opacity:0.8}}>{patient.firstName} {patient.lastName}</div>
        </div>
      </div>
      <div style={{maxWidth:720,margin:"0 auto",padding:22}}>
        <Card style={{textAlign:"center",padding:32,marginBottom:18}}>
          <div style={{fontSize:64,fontWeight:900,background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>{assessment.totalScore}</div>
          <div style={{color:C.textLight,fontSize:14,marginTop:4}}>จาก {MAX_TOTAL} คะแนน</div>
          <div style={{display:"inline-block",background:it.bg,color:it.c,borderRadius:99,padding:"8px 22px",fontWeight:700,fontSize:15,marginTop:12}}>{it.i} {it.l}</div>
        </Card>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <Btn onClick={()=>go("assessment")}>+ ประเมินครั้งใหม่</Btn>
          <Btn v="outline" onClick={()=>go("patientDetail")}>← กลับ</Btn>
        </div>
      </div>
    </div>
  );
};

// ── ADMIN LOGIN ───────────────────────────────────────────────
const AdminLogin=({go,setAdmin})=>{
  const [code,setCode]=useState("");const [err,setErr]=useState("");
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <Card style={{width:"100%",maxWidth:340}}>
        <Banner/>
        <div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:32}}>⚙️</div><h2 style={{margin:"8px 0 4px",color:C.text}}>Admin Access</h2><p style={{color:C.textLight,fontSize:13,margin:0}}>ETM Admin Dashboard</p></div>
        <Inp label="Admin Code" value={code} onChange={setCode} type="password" required placeholder="ETM2024"/>
        <ErrBox msg={err}/>
        <Btn full v="violet" onClick={()=>{if(code==="ETM2024"){setAdmin(true);go("admin");}else setErr("Code ไม่ถูกต้อง — ใช้ ETM2024");}}>เข้าสู่ Admin Dashboard</Btn>
        <Btn full v="ghost" onClick={()=>go("landing")} style={{marginTop:8}}>← กลับ</Btn>
      </Card>
    </div>
  );
};

// ── ADMIN DASHBOARD ───────────────────────────────────────────
const AdminDash=({go,db,setDb,setAdmin})=>{
  const [tab,setTab]=useState("overview");
  const [pdpaEdit,setPdpaEdit]=useState(db.pdpaText);
  const [pdpaSaved,setPdpaSaved]=useState(false);
  const [nc,setNc]=useState({code:"",type:"lifelong",expiresAt:"",usageLimit:"",note:""});
  const [ncErr,setNcErr]=useState("");const [ncOk,setNcOk]=useState(false);

  const savePdpa=()=>{setDb(p=>({...p,pdpaText:pdpaEdit}));setPdpaSaved(true);setTimeout(()=>setPdpaSaved(false),2500);};
  const addCode=()=>{
    setNcErr("");
    if(!nc.code.trim())return setNcErr("กรุณากรอก Code");
    if(db.inviteCodes.find(c=>c.code===nc.code.trim().toUpperCase()))return setNcErr("Code นี้มีในระบบแล้ว");
    if(nc.type==="timed"&&!nc.expiresAt)return setNcErr("กรุณาเลือกวันหมดอายุ");
    const ic={id:"IC"+uid(),code:nc.code.trim().toUpperCase(),type:nc.type,expiresAt:nc.type==="timed"?new Date(nc.expiresAt).toISOString():null,usageLimit:nc.usageLimit?parseInt(nc.usageLimit):null,usedCount:0,active:true,createdAt:new Date().toISOString(),note:nc.note};
    setDb(p=>({...p,inviteCodes:[ic,...p.inviteCodes]}));
    setNc({code:"",type:"lifelong",expiresAt:"",usageLimit:"",note:""});
    setNcOk(true);setTimeout(()=>setNcOk(false),2500);
  };
  const toggleCode=id=>setDb(p=>({...p,inviteCodes:p.inviteCodes.map(c=>c.id===id?{...c,active:!c.active}:c)}));
  const approveDoc=id=>{const pd=db.pendingDoctors.find(d=>d.id===id);if(!pd)return;setDb(p=>({...p,doctors:[...p.doctors,{...pd,status:"approved"}],pendingDoctors:p.pendingDoctors.filter(d=>d.id!==id)}));};
  const rejectDoc=id=>setDb(p=>({...p,pendingDoctors:p.pendingDoctors.map(d=>d.id===id?{...d,status:"rejected"}:d)}));
  const pending=db.pendingDoctors.filter(d=>d.status==="pending");

  const Tab=({id,label,badge=0})=>(
    <button onClick={()=>setTab(id)} style={{padding:"8px 16px",borderRadius:9,border:"none",background:tab===id?GRAD:"#fff",color:tab===id?"#fff":C.textMid,fontFamily:"inherit",fontSize:13,fontWeight:600,cursor:"pointer",boxShadow:tab===id?"0 2px 10px rgba(8,145,178,0.3)":C.sh,position:"relative",whiteSpace:"nowrap"}}>
      {label}{badge>0&&<span style={{position:"absolute",top:-5,right:-5,background:C.coral,color:"#fff",borderRadius:99,fontSize:10,fontWeight:900,padding:"1px 6px"}}>{badge}</span>}
    </button>
  );

  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{background:"linear-gradient(135deg,#4F46E5,#7C3AED)",padding:"18px 22px",color:"#fff"}}>
        <div style={{maxWidth:1000,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div><div style={{fontSize:11,opacity:0.8}}>⚙️ Admin · Eisai Thailand Marketing</div><h2 style={{margin:"3px 0 0"}}>Admin Dashboard</h2></div>
          <Btn sm v="white" onClick={()=>{setAdmin(false);go("landing");}}>← ออกจาก Admin</Btn>
        </div>
      </div>
      <div style={{maxWidth:1000,margin:"0 auto",padding:22}}>
        <Banner/>
        <div style={{display:"flex",gap:8,marginBottom:22,flexWrap:"wrap"}}>
          <Tab id="overview" label="📊 ภาพรวม"/>
          <Tab id="codes" label="🔑 Invite Codes"/>
          <Tab id="pending" label="👥 รออนุมัติ" badge={pending.length}/>
          <Tab id="pdpa" label="🔒 แก้ไข PDPA"/>
          <Tab id="doctors" label="👨‍⚕️ แพทย์ทั้งหมด"/>
        </div>

        {tab==="overview"&&<>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:20}}>
            {[{ic:"👨‍⚕️",t:"แพทย์ Approved",v:db.doctors.length,c:"#7C3AED"},{ic:"⏳",t:"รออนุมัติ",v:pending.length,c:C.orange},{ic:"🔑",t:"Invite Codes ที่ใช้ได้",v:db.inviteCodes.filter(c=>codeOk(c)).length,c:C.teal},{ic:"👥",t:"ผู้ป่วยทั้งหมด",v:db.patients.length,c:C.green}].map(x=>(
              <Card key={x.t} style={{display:"flex",alignItems:"center",gap:14,borderLeft:`4px solid ${x.c}`,padding:16}}>
                <div style={{fontSize:28}}>{x.ic}</div>
                <div><div style={{fontSize:26,fontWeight:900,color:x.c}}>{x.v}</div><div style={{fontSize:12,color:C.textLight}}>{x.t}</div></div>
              </Card>
            ))}
          </div>
          {pending.length>0&&<Card style={{background:"#FFFBEB",border:"1.5px solid #FCD34D",marginBottom:16}}>
            <div style={{fontWeight:700,color:"#92400E",marginBottom:12}}>⚠️ มีแพทย์รออนุมัติ {pending.length} ราย</div>
            {pending.map(d=><div key={d.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #FDE68A",flexWrap:"wrap"}}>
              <div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>นพ./พญ. {d.firstName} {d.lastName}</div><div style={{fontSize:11,color:"#92400E"}}>เลข ว. {d.license} · ยื่นเมื่อ {fmtDate(d.createdAt)}</div></div>
              <div style={{display:"flex",gap:7}}><Btn sm v="green" onClick={()=>approveDoc(d.id)}>✅ Approve</Btn><Btn sm v="danger" onClick={()=>rejectDoc(d.id)}>❌ Reject</Btn></div>
            </div>)}
          </Card>}
        </>}

        {tab==="codes"&&<>
          <Card style={{marginBottom:16}}>
            <h3 style={{margin:"0 0 16px",color:C.text}}>➕ สร้าง Invite Code ใหม่</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:C.textMid,marginBottom:5}}>Code <span style={{color:C.coral}}>*</span></div>
                <input value={nc.code} onChange={e=>setNc({...nc,code:e.target.value.toUpperCase()})} placeholder="เช่น ETM-2025-XXXX" style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:8,padding:"9px 12px",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box",background:"#F8FEFF",letterSpacing:1.5,fontWeight:700}}/>
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:C.textMid,marginBottom:5}}>หมายเหตุ</div>
                <input value={nc.note} onChange={e=>setNc({...nc,note:e.target.value})} placeholder="เช่น โรงพยาบาล X" style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:8,padding:"9px 12px",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box",background:"#F8FEFF"}}/>
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:600,color:C.textMid,marginBottom:7}}>ประเภท Code</div>
              <div style={{display:"flex",gap:8}}>
                {[["lifelong","♾️ Lifelong","ไม่มีวันหมดอายุ ใช้ได้ตลอด"],["timed","⏱️ Timed","กำหนดวันที่ Code หมดอายุ"]].map(([v,l,d])=>(
                  <div key={v} onClick={()=>setNc({...nc,type:v})} style={{flex:1,padding:"12px 14px",borderRadius:10,border:`2px solid ${nc.type===v?C.violet:C.border}`,background:nc.type===v?C.violetLt:"#fff",cursor:"pointer",userSelect:"none"}}>
                    <div style={{fontWeight:700,fontSize:13,color:nc.type===v?C.violet:C.text}}>{l}</div>
                    <div style={{fontSize:11,color:C.textLight,marginTop:2}}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              {nc.type==="timed"&&<div>
                <div style={{fontSize:12,fontWeight:600,color:C.textMid,marginBottom:5}}>วันหมดอายุ <span style={{color:C.coral}}>*</span></div>
                <input type="date" value={nc.expiresAt} onChange={e=>setNc({...nc,expiresAt:e.target.value})} style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:8,padding:"9px 12px",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",background:"#F8FEFF"}}/>
              </div>}
              <div>
                <div style={{fontSize:12,fontWeight:600,color:C.textMid,marginBottom:5}}>จำนวนสูงสุด <span style={{color:C.textLight}}>(ว่าง = ไม่จำกัด)</span></div>
                <input type="number" value={nc.usageLimit} onChange={e=>setNc({...nc,usageLimit:e.target.value})} placeholder="ไม่จำกัด" style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:8,padding:"9px 12px",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",background:"#F8FEFF"}}/>
              </div>
            </div>
            {ncErr&&<div style={{color:C.coral,fontSize:12,marginBottom:8}}>{ncErr}</div>}
            {ncOk&&<div style={{color:C.green,fontSize:12,fontWeight:700,marginBottom:8}}>✅ สร้าง Code สำเร็จ!</div>}
            <Btn onClick={addCode}>➕ สร้าง Invite Code</Btn>
          </Card>
          <Card>
            <h3 style={{margin:"0 0 14px",color:C.text}}>📋 Invite Codes ทั้งหมด ({db.inviteCodes.length})</h3>
            {db.inviteCodes.map(c=>{
              const exp=isExpired(c);const full=c.usageLimit!==null&&c.usedCount>=c.usageLimit;
              const st=!c.active?"🔴 ปิดใช้":exp?"⏰ หมดอายุ":full?"🈵 ครบจำนวน":"🟢 ใช้ได้";
              const stc=!c.active?C.textLight:exp||full?C.coral:C.green;
              return(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 0",borderBottom:`1px solid ${C.border}`,flexWrap:"wrap"}}>
                  <div style={{flex:1,minWidth:180}}>
                    <div style={{fontWeight:800,fontSize:14,letterSpacing:1,color:C.text,fontFamily:"monospace"}}>{c.code}</div>
                    <div style={{fontSize:11,color:C.textLight,marginTop:3,display:"flex",gap:10,flexWrap:"wrap"}}>
                      {c.note&&<span>📝 {c.note}</span>}
                      <span>{c.type==="lifelong"?"♾️ Lifelong":`⏱️ หมด ${fmtDate(c.expiresAt)}`}</span>
                      <span>ใช้แล้ว {c.usedCount}{c.usageLimit?`/${c.usageLimit}`:""} ครั้ง</span>
                    </div>
                  </div>
                  <Badge label={st} color={stc} bg={stc+"18"}/>
                  <Btn sm v={c.active?"danger":"outline"} onClick={()=>toggleCode(c.id)}>{c.active?"🔴 ปิด Code":"🟢 เปิด Code"}</Btn>
                </div>
              );
            })}
          </Card>
        </>}

        {tab==="pending"&&<Card>
          <h3 style={{margin:"0 0 16px",color:C.text}}>👥 แพทย์รออนุมัติ ({pending.length} ราย)</h3>
          {pending.length===0?<div style={{textAlign:"center",padding:40,color:C.textLight,fontSize:14}}>✅ ไม่มีคำขอที่รออนุมัติ</div>:pending.map(d=>(
            <div key={d.id} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 0",borderBottom:`1px solid ${C.border}`,flexWrap:"wrap"}}>
              <div style={{width:44,height:44,borderRadius:10,background:GRADSOFT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>👨‍⚕️</div>
              <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15}}>นพ./พญ. {d.firstName} {d.lastName}</div><div style={{fontSize:12,color:C.textLight}}>เลข ว. {d.license} · ยื่นเมื่อ {fmtDate(d.createdAt)}</div></div>
              <Badge label="⏳ รออนุมัติ" color={C.orange} bg="#FFF7ED"/>
              <div style={{display:"flex",gap:8}}><Btn sm v="green" onClick={()=>approveDoc(d.id)}>✅ Approve</Btn><Btn sm v="danger" onClick={()=>rejectDoc(d.id)}>❌ Reject</Btn></div>
            </div>
          ))}
          {db.pendingDoctors.filter(d=>d.status==="rejected").length>0&&<div style={{marginTop:16}}>
            <div style={{fontSize:12,fontWeight:600,color:C.textLight,marginBottom:8}}>รายการที่ Reject แล้ว</div>
            {db.pendingDoctors.filter(d=>d.status==="rejected").map(d=><div key={d.id} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}`,opacity:0.5}}>
              <div style={{flex:1,fontSize:13}}>นพ./พญ. {d.firstName} {d.lastName} · เลข ว. {d.license}</div>
              <Badge label="❌ Rejected" color={C.coral} bg="#FEF2F2"/>
            </div>)}
          </div>}
        </Card>}

        {tab==="pdpa"&&<Card>
          <h3 style={{margin:"0 0 4px",color:C.text}}>🔒 แก้ไขข้อความ PDPA Consent</h3>
          <p style={{color:C.textLight,fontSize:13,marginBottom:16}}>ข้อความนี้แสดงในหน้า PDPA ตอนแพทย์ลงทะเบียน — แก้แล้วบันทึก แพทย์คนถัดไปเห็นทันที</p>
          <textarea value={pdpaEdit} onChange={e=>setPdpaEdit(e.target.value)} style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:10,padding:"13px 14px",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",background:"#F8FEFF",color:C.text,minHeight:320,resize:"vertical",lineHeight:1.9}}/>
          <div style={{display:"flex",gap:10,marginTop:14,alignItems:"center"}}>
            <Btn v="violet" onClick={savePdpa}>💾 บันทึก PDPA</Btn>
            <Btn v="ghost" onClick={()=>setPdpaEdit(db.pdpaText)}>↩️ ยกเลิก</Btn>
            {pdpaSaved&&<span style={{color:C.green,fontSize:13,fontWeight:700}}>✅ บันทึกสำเร็จ!</span>}
          </div>
          <div style={{marginTop:20,padding:16,background:"#F8FEFF",borderRadius:10,border:`1.5px solid ${C.border}`}}>
            <div style={{fontSize:12,fontWeight:600,color:C.textMid,marginBottom:8}}>👁️ Preview — ที่แพทย์จะเห็นตอน Register</div>
            <div style={{fontSize:12,color:C.textMid,lineHeight:1.9,whiteSpace:"pre-line"}}>{pdpaEdit}</div>
          </div>
        </Card>}

        {tab==="doctors"&&<Card>
          <h3 style={{margin:"0 0 14px",color:C.text}}>👨‍⚕️ แพทย์ที่ Approved ({db.doctors.length} ราย)</h3>
          {db.doctors.map(d=><div key={d.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
            <div style={{fontSize:22}}>👨‍⚕️</div>
            <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>นพ./พญ. {d.firstName} {d.lastName}</div><div style={{fontSize:11,color:C.textLight}}>เลข ว. {d.license} · {fmtDate(d.createdAt)} {d.method==="code"?`· 🔑 Code: ${d.codeUsed}`:d.method==="approval"?"· ✅ Admin Approved":""}</div></div>
            <Badge label="✅ Active" color={C.green} bg="#ECFDF5"/>
          </div>)}
        </Card>}
      </div>
    </div>
  );
};

// ── APP ROOT ──────────────────────────────────────────────────
export default function App(){
  const [db,setDb]=useState(INIT);
  const [screen,setScreen]=useState("landing");
  const [doctor,setDoctor]=useState(null);
  const [patient,setPatient]=useState(null);
  const [assessment,setAssessment]=useState(null);
  const [isAdmin,setAdmin]=useState(false);
  const go=s=>setScreen(s);

  if(screen==="landing")return <Landing go={go}/>;
  if(screen==="register")return <Register go={go} db={db} setDb={setDb}/>;
  if(screen==="login")return <Login go={go} db={db} setDoctor={setDoctor}/>;
  if(screen==="adminLogin")return <AdminLogin go={go} setAdmin={setAdmin}/>;
  if(screen==="admin")return <AdminDash go={go} db={db} setDb={setDb} setAdmin={setAdmin}/>;
  if(!doctor)return <Login go={go} db={db} setDoctor={setDoctor}/>;
  if(screen==="dashboard")return <Dashboard doctor={doctor} go={go} db={db} setDoctor={setDoctor} setPatient={setPatient}/>;
  if(screen==="newPatient")return <NewPatient doctor={doctor} go={go} db={db} setDb={setDb} setPatient={setPatient}/>;
  if(screen==="patientDetail"&&patient)return <PatientDetail patient={patient} doctor={doctor} go={go} db={db} setAssessment={setAssessment}/>;
  if(screen==="assessment"&&patient)return <Assessment patient={patient} doctor={doctor} go={go} setDb={setDb} setAssessment={setAssessment}/>;
  if(screen==="results"&&assessment)return <Results assessment={assessment} patient={patient} go={go}/>;
  return <Dashboard doctor={doctor} go={go} db={db} setDoctor={setDoctor} setPatient={setPatient}/>;
}
