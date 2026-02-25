import { useState, useEffect, useRef } from "react";

// ============================================================
// ⚙️ CONFIG — ใส่ URL จาก Google Apps Script Deploy ที่นี่
// ============================================================
const GAS_URL = "YOUR_GAS_WEB_APP_URL_HERE";
// ตัวอย่าง: "https://script.google.com/macros/s/AKfycb.../exec"

// ============================================================
// THEME
// ============================================================
const C = {
  teal:"#0891B2", tealDk:"#0E7490", tealLt:"#BAE6FD", tealBg:"#F0FBFF",
  violet:"#7C3AED", violetLt:"#EDE9FE",
  coral:"#F43F5E", orange:"#F97316", green:"#059669",
  yellow:"#D97706", sky:"#38BDF8",
  white:"#FFFFFF", bg:"#EFF9FC",
  text:"#0C2D3E", textMid:"#3D6273", textLight:"#7BA8B8",
  border:"#CAE8F0", card:"#FFFFFF",
  sh:"0 2px 16px rgba(8,145,178,0.10)", shLg:"0 8px 40px rgba(8,145,178,0.18)",
};
const GRAD = "linear-gradient(135deg,#0891B2 0%,#7C3AED 100%)";
const GRADSOFT = "linear-gradient(135deg,#E0F7FA 0%,#EDE9FE 100%)";
const MAX_TOTAL = 78;

// ============================================================
// API — เรียก Google Apps Script
// ============================================================
const api = {
  async call(action, data = null) {
    let url = `${GAS_URL}?action=${action}`;
    if (data) {
      Object.keys(data).forEach(k => {
        url += `&${k}=${encodeURIComponent(typeof data[k]==="object"?JSON.stringify(data[k]):data[k])}`;
      });
    }
    const res = await fetch(url, { redirect: "follow" });
    return await res.json();
  },
  getDoctors: ()    => api.call("getDoctors"),
  saveDoctor: (doc) => api.call("saveDoctor", { data: doc }),
  getPatients: (doctorId) => api.call("getPatients", { doctorId }),
  savePatient: (pat) => api.call("savePatient", { data: pat }),
  getAssessments: (patientId, doctorId) => api.call("getAssessments", { patientId, doctorId }),
  saveAssessment: (a) => api.call("saveAssessment", { data: a }),
  getAllData: () => api.call("getAllData"),
};

// ============================================================
// QUESTIONS — แก้ไขตามที่รีวิว: ไมล์→กม., เวิร์กช็อป→งานฝีมือ
// ============================================================
const Q = [
  {id:"q1",num:1,title:"การรับประทานอาหาร",en:"Regarding eating",always:true,max:3,
   desc:"ในช่วง 4 สัปดาห์ที่ผ่านมา ข้อใดอธิบายการทำได้ตามปกติของผู้ถูกประเมินได้ดีที่สุด:",
   opts:[{v:3,l:"รับประทานได้เอง ไม่ต้องช่วยทางกาย และใช้มีดได้"},{v:2,l:"ใช้ส้อมหรือช้อน แต่ไม่ใช้มีด"},{v:1,l:"ใช้นิ้วมือหยิบอาหาร"},{v:0,l:"โดยปกติหรือเสมอต้องมีผู้อื่นป้อนให้"}]},
  {id:"q2",num:2,title:"การเดิน/การเคลื่อนที่",en:"Regarding walking / getting around in a wheelchair",always:true,max:3,
   desc:"ในช่วง 4 สัปดาห์ที่ผ่านมา ข้อใดอธิบายระดับความสามารถสูงสุดได้ดีที่สุด:",
   opts:[{v:3,l:"เคลื่อนที่ออกนอกบ้านได้เองโดยไม่ต้องมีการช่วยเหลือ"},{v:2,l:"เคลื่อนที่ข้ามห้องได้เองโดยไม่ต้องช่วยเหลือ"},{v:1,l:"ย้ายจากเตียงไปเก้าอี้ได้โดยไม่ต้องช่วย"},{v:0,l:"ต้องช่วยเหลือในการเดินหรือย้ายตัว"}]},
  {id:"q3",num:3,title:"การขับถ่ายที่ห้องน้ำ",en:"Regarding bowel and bladder function at the toilet",always:true,max:3,
   desc:"ในช่วง 4 สัปดาห์ที่ผ่านมา ข้อใดอธิบายการทำได้ตามปกติได้ดีที่สุด:",
   opts:[{v:3,l:"ทำทุกอย่างที่จำเป็นได้เอง โดยไม่ต้องมีผู้ดูแลหรือช่วย"},{v:2,l:"ต้องมีผู้คอยดูแล/กำกับ แต่ไม่ต้องช่วยทางกาย"},{v:1,l:"ต้องช่วยทางกาย และโดยปกติกลั้นการขับถ่ายได้"},{v:0,l:"ต้องช่วยทางกาย และโดยปกติกลั้นการขับถ่ายไม่ได้"}]},
  {id:"q4",num:4,title:"การอาบน้ำ",en:"Regarding bathing",always:true,max:3,
   desc:"ในช่วง 4 สัปดาห์ที่ผ่านมา ข้อใดอธิบายการทำได้ตามปกติได้ดีที่สุด:",
   opts:[{v:3,l:"อาบน้ำได้เองโดยไม่ต้องเตือน/กำกับ และไม่ต้องช่วยทางกาย"},{v:2,l:"ไม่ต้องช่วยทางกาย แต่ต้องมีการกำกับ/เตือนเพื่อให้อาบน้ำและทำได้ครบถ้วน"},{v:1,l:"ต้องช่วยทางกายเล็กน้อย (เช่น ช่วยสระผม) เตือนเพื่อให้อาบน้ำและทำได้ครบถ้วน"},{v:0,l:"ต้องมีผู้อื่นอาบน้ำให้ทั้งหมด"}]},
  {id:"q5",num:5,title:"การดูแลความสะอาด/แต่งตัวส่วนตัว",en:"Regarding grooming",always:true,max:3,
   desc:"ในช่วง 4 สัปดาห์ที่ผ่านมา ข้อใดอธิบายการทำได้ตามปกติได้ดีที่สุด เลือกคำอธิบายที่ตรงกับความสามารถสูงสุด:",
   opts:[{v:3,l:"ทำความสะอาดและตัดเล็บมือได้เองโดยไม่ต้องช่วย"},{v:2,l:"แปรงหรือหวีผมได้เองโดยไม่ต้องช่วย"},{v:1,l:"รักษาความสะอาดใบหน้าและมือได้เองโดยไม่ต้องช่วย"},{v:0,l:"ต้องมีคนช่วยในการดูแลผม ใบหน้า มือ และเล็บมือ"}]},
  {id:"q6a",num:"6A",title:"การแต่งตัว (A) เลือกเสื้อผ้า",en:"Dressing-Choice",hasYN:true,
   ynLabel:"ผู้ถูกประเมินเลือกเสื้อผ้าชุดแรกของวันเองหรือไม่?",max:3,
   opts:[{v:3,l:"เลือกได้เอง โดยไม่ต้องกำกับหรือช่วย"},{v:2,l:"เลือกได้เมื่อมีการกำกับ"},{v:1,l:"เลือกได้เมื่อมีการช่วยทางกาย"}]},
  {id:"q6b",num:"6B",title:"การแต่งตัว (B) สวมใส่เสื้อผ้า",en:"Dressing-Ability",always:true,max:4,
   opts:[{v:4,l:"แต่งตัวได้ครบถ้วน โดยไม่ต้องกำกับหรือช่วยทางกาย"},{v:3,l:"แต่งตัวได้ครบถ้วนเมื่อมีการกำกับ แต่ไม่ต้องช่วยทางกาย"},{v:2,l:"ต้องช่วยทางกายเฉพาะกับกระดุม/ตะขอ/เชือกรองเท้า"},{v:1,l:"แต่งตัวได้เอง หากเสื้อผ้าไม่ต้องติดตะขอ/กระดุม"},{v:0,l:"ต้องช่วยทางกายเสมอ ไม่ว่าเสื้อผ้าประเภทใด"}]},
  {id:"q7",num:7,title:"การใช้โทรศัพท์",en:"Telephone",hasYN:true,
   ynLabel:"ผู้ถูกประเมินใช้โทรศัพท์หรือไม่?",max:5,
   opts:[{v:5,l:"โทรออกได้หลังค้นหมายเลขจากสมุดโทรศัพท์/ไดเรกทอรี"},{v:4,l:"โทรออกได้เฉพาะหมายเลขที่คุ้นเคย โดยไม่ต้องเปิดดู"},{v:3,l:"โทรออกได้เฉพาะหมายเลขที่คุ้นเคย โดยใช้สมุดรายชื่อช่วย"},{v:2,l:"รับสายได้ แต่ไม่โทรออก"},{v:1,l:"ไม่รับสาย แต่พูดได้เมื่อมีคนต่อสายให้"},{v:0,l:"ไม่ใช้โทรศัพท์เลย (ตอบ 'ไม่ใช่')"}]},
  {id:"q8",num:8,title:"การดูโทรทัศน์",en:"Television",hasYN:true,
   ynLabel:"ผู้ถูกประเมินดูโทรทัศน์หรือไม่?",max:3,type:"subs",
   subs:[{id:"q8a",l:"โดยปกติ เลือก/ขอรายการที่ต่างกันหรือรายการโปรดหรือไม่?"},{id:"q8b",l:"โดยปกติ พูดถึงเนื้อหาระหว่างที่กำลังดูหรือไม่?"},{id:"q8c",l:"ภายใน 24 ชั่วโมงหลังดู ยังพูดถึงเนื้อหารายการนั้นหรือไม่?"}]},
  {id:"q9",num:9,title:"การสนทนา (สามารถจดจ่อ ≥ 5 นาที)",en:"Conversation",hasYN:true,
   ynLabel:"ผู้ถูกประเมินสามารถสนทนาและจดจ่อในบทสนทนา ≥ 5 นาทีได้หรือไม่?",max:3,
   opts:[{v:3,l:"โดยมากพูดสิ่งที่เกี่ยวข้องกับหัวข้อ"},{v:2,l:"โดยมากพูดสิ่งที่ไม่เกี่ยวข้องกับหัวข้อ"},{v:1,l:"พูดน้อยมากหรือแทบไม่พูด"}]},
  {id:"q10",num:10,title:"เก็บจานจากโต๊ะหลังอาหาร",en:"Clear Dishes",hasYN:true,
   ynLabel:"ผู้ถูกประเมินเก็บจานจากโต๊ะหลังอาหาร/ของว่างหรือไม่?",max:3,
   opts:[{v:3,l:"ได้เอง"},{v:2,l:"ต้องกำกับ"},{v:1,l:"ต้องช่วยทางกาย"}]},
  {id:"q11",num:11,title:"หา/จัดการของใช้ส่วนตัวในบ้าน",en:"Find Belongings",hasYN:true,
   ynLabel:"ผู้ถูกประเมินสามารถหา/จัดการของใช้ส่วนตัวในบ้านได้หรือไม่?",max:3,
   opts:[{v:3,l:"ได้เอง"},{v:2,l:"ต้องกำกับ"},{v:1,l:"ต้องช่วยทางกาย"}]},
  {id:"q12",num:12,title:"เตรียมเครื่องดื่มร้อนหรือเย็น",en:"Beverage",hasYN:true,
   ynLabel:"ผู้ถูกประเมินสามารถเตรียมเครื่องดื่มได้หรือไม่? (รวมน้ำเปล่า)",max:3,
   opts:[{v:3,l:"ชงเครื่องดื่มร้อนได้เอง โดยมากไม่ต้องช่วยทางกาย"},{v:2,l:"ชงเครื่องดื่มร้อนได้ หากมีผู้อื่นช่วยต้มน้ำ"},{v:1,l:"เตรียมเครื่องดื่มเย็นได้เอง โดยมากไม่ต้องช่วยทางกาย"}]},
  {id:"q13",num:13,title:"ทำอาหาร/ของว่างเองที่บ้าน",en:"Make Meal",hasYN:true,
   ynLabel:"ผู้ถูกประเมินทำอาหาร/ของว่างเองที่บ้านหรือไม่?",max:4,
   opts:[{v:4,l:"ปรุง/อุ่นอาหารด้วยเตา/ไมโครเวฟ โดยแทบไม่ต้องช่วย"},{v:3,l:"ปรุง/อุ่นอาหารได้ แต่ต้องช่วยอย่างมาก"},{v:2,l:"ผสม/ประกอบอาหารง่ายๆ โดยไม่ต้องปรุง (เช่น ทำแซนด์วิช)"},{v:1,l:"หาอาหารรับประทานเองได้ โดยไม่ต้องผสม/ปรุง"}]},
  {id:"q14",num:14,title:"ทิ้งขยะให้ถูกที่ในบ้าน",en:"Dispose Garbage",hasYN:true,
   ynLabel:"ผู้ถูกประเมินทิ้งขยะให้ถูกที่ในบ้านหรือไม่?",max:3,
   opts:[{v:3,l:"ได้เอง"},{v:2,l:"ต้องกำกับ"},{v:1,l:"ต้องช่วยทางกาย"}]},

  // ✅ แก้ไขแล้ว: ไมล์ → กิโลเมตร
  {id:"q15",num:15,title:"ออกนอกบ้าน/เดินทาง",en:"Get Around Outside",hasYN:true,
   ynLabel:"ผู้ถูกประเมินออกนอกบ้านหรือเดินทางหรือไม่?",max:4,
   opts:[{v:4,l:"ออกไปได้เองอย่างน้อย 1.5 กิโลเมตรจากบ้าน"},{v:3,l:"ออกไปได้เอง แต่ยังอยู่ในรัศมีไม่เกิน 1.5 กิโลเมตร"},{v:2,l:"ออกไปได้เมื่อมีผู้ติดตามและกำกับ"},{v:1,l:"ออกไปได้เมื่อมีการช่วยทางกาย"}]},

  {id:"q16a",num:"16A",title:"การซื้อของ (A) เลือกสินค้า",en:"Shopping-Selection",hasYN:true,
   ynLabel:"ผู้ถูกประเมินไปซื้อของหรือไม่?",max:3,
   opts:[{v:3,l:"เลือกสินค้าเองได้"},{v:2,l:"ต้องช่วย/กำกับบ้าง"},{v:1,l:"ไม่เลือก/เลือกแบบสุ่มหรือไม่เหมาะ"}]},
  {id:"q16b",num:"16B",title:"การซื้อของ (B) ชำระเงิน",en:"Shopping-Payment",always:true,max:1,type:"binary",
   label:"โดยปกติสามารถชำระเงินค่าสินค้าได้โดยไม่ต้องช่วยหรือไม่?",
   opts:[{v:1,l:"ได้"},{v:0,l:"ไม่ได้"}]},
  {id:"q17",num:17,title:"การนัดหมาย/การจำล่วงหน้า",en:"Appointments",hasYN:true,
   ynLabel:"ผู้ถูกประเมินมีการนัดหมายหรือไม่?",max:3,
   opts:[{v:3,l:"โดยมากจำได้เอง อาจต้องใช้บันทึก/สมุดนัด/ปฏิทินช่วย"},{v:2,l:"จำได้เมื่อมีการเตือนด้วยวาจาในวันนัด"},{v:1,l:"โดยมากจำไม่ได้ แม้มีการเตือนด้วยวาจาในวันนัด"}]},
  {id:"q18",num:18,title:"ถูกปล่อยให้อยู่ตามลำพัง",en:"Left Alone",hasYN:true,
   ynLabel:"ผู้ถูกประเมินเคยถูกปล่อยให้อยู่ตามลำพังหรือไม่?",max:3,type:"subs",
   subs:[{id:"q18a",l:"นอกบ้าน ≥ 15 นาที ในเวลากลางวัน"},{id:"q18b",l:"อยู่ที่บ้าน ≥ 1 ชั่วโมง ในเวลากลางวัน"},{id:"q18c",l:"อยู่ที่บ้าน < 1 ชั่วโมง ในเวลากลางวัน"}]},
  {id:"q19",num:19,title:"พูดถึงเหตุการณ์ปัจจุบัน",en:"Talk About Events",hasYN:true,
   ynLabel:"ผู้ถูกประเมินพูดถึงเหตุการณ์ปัจจุบันหรือไม่?",max:3,type:"subs",
   subs:[{id:"q19a",l:"เรื่องที่ได้ยิน/อ่าน/เห็นจากทีวี แต่ไม่ได้มีส่วนร่วม"},{id:"q19b",l:"เรื่องที่ตนมีส่วนร่วมภายนอกบ้าน (ครอบครัว/เพื่อน/เพื่อนบ้าน)"},{id:"q19c",l:"เรื่องที่เกิดขึ้นในบ้าน และตนมีส่วนร่วม/เฝ้าดู"}]},
  {id:"q20",num:20,title:"อ่านหนังสือ/นิตยสาร/หนังสือพิมพ์ > 5 นาที",en:"Reading",hasYN:true,
   ynLabel:"ผู้ถูกประเมินอ่านหนังสือ/นิตยสาร/หนังสือพิมพ์ > 5 นาทีหรือไม่?",max:2,type:"subs",
   subs:[{id:"q20a",l:"โดยมากพูดถึงรายละเอียดที่อ่าน ระหว่างอ่านหรือภายใน < 1 ชม. หลังอ่าน"},{id:"q20b",l:"โดยมากยังพูดถึงสิ่งที่อ่าน หลังผ่านไป ≥ 1 ชม."}]},
  {id:"q21",num:21,title:"การเขียน",en:"Writing",hasYN:true,
   ynLabel:"ผู้ถูกประเมินเขียนสิ่งต่างๆ หรือไม่? (รวมกรณีที่เขียนได้หลังการกระตุ้น)",max:3,
   opts:[{v:3,l:"จดหมายหรือบันทึกยาว ที่ผู้อื่นอ่านเข้าใจ"},{v:2,l:"โน้ตหรือข้อความสั้น ที่ผู้อื่นอ่านเข้าใจ"},{v:1,l:"ลายเซ็นหรือชื่อของตนเอง"}]},
  {id:"q22",num:22,title:"งานอดิเรก/กิจกรรมยามว่าง/เกม",en:"Hobbies",hasYN:true,
   ynLabel:"ผู้ถูกประเมินมีงานอดิเรก/กิจกรรมยามว่าง/เกมหรือไม่?",max:3,
   note:"หมายเหตุ: ไพ่/กระดาน, บิงโก, ปริศนาอักษรไขว้, เครื่องดนตรี, ถักไหมพรม, เย็บผ้า, อ่านหนังสือ, ทำสวน, กอล์ฟ, เทนนิส, งานฝีมือ/ช่างซ่อม, ตกปลา — 'การเดิน' อย่างเดียว ไม่นับ", // ✅ แก้ เวิร์กช็อป → งานฝีมือ/ช่างซ่อม
   opts:[{v:3,l:"ได้เอง"},{v:2,l:"ต้องกำกับ"},{v:1,l:"ต้องช่วย"}]},
  {id:"q23",num:23,title:"ใช้เครื่องใช้ไฟฟ้าในบ้านเพื่อทำงานบ้าน",en:"Household Appliances",hasYN:true,
   ynLabel:"ผู้ถูกประเมินใช้เครื่องใช้ไฟฟ้าในบ้านหรือไม่?",max:4,
   opts:[{v:4,l:"ใช้ได้เอง รวมถึงควบคุมปุ่มมากกว่าเปิด-ปิด หากจำเป็น"},{v:3,l:"ใช้ได้เอง แต่ควบคุมเฉพาะปุ่มเปิด-ปิด"},{v:2,l:"ใช้ได้เมื่อมีการกำกับ แต่ไม่ต้องช่วยทางกาย"},{v:1,l:"ใช้ได้เมื่อมีการช่วยทางกาย"}]},
];

// ============================================================
// HELPERS
// ============================================================
const uid = () => Math.random().toString(36).slice(2,10);
const fmtDate = (iso) => {
  if(!iso) return "-";
  return new Date(iso).toLocaleDateString("th-TH",{year:"numeric",month:"short",day:"numeric"});
};
const getInterp = (score) => {
  const p = (score/MAX_TOTAL)*100;
  if(p>=80) return {label:"ความสามารถสูง",color:"#059669",bg:"#ECFDF5",icon:"🟢"};
  if(p>=60) return {label:"ความสามารถปานกลาง-สูง",color:"#3B82F6",bg:"#EFF6FF",icon:"🔵"};
  if(p>=40) return {label:"ความสามารถปานกลาง",color:"#D97706",bg:"#FFFBEB",icon:"🟡"};
  if(p>=20) return {label:"ความสามารถต่ำ-ปานกลาง",color:"#F97316",bg:"#FFF7ED",icon:"🟠"};
  return {label:"ความสามารถต่ำ / ต้องการความช่วยเหลือมาก",color:"#EF4444",bg:"#FEF2F2",icon:"🔴"};
};
const getQScore = (a,q) => {
  const ans = a.answers?.[q.id];
  if(!ans) return 0;
  if(q.hasYN && ans.yn !== "ใช่") return 0;
  if(q.type==="subs") return Math.min((q.subs||[]).filter(s=>ans[s.id]==="ใช่").length, q.max);
  if(q.type==="binary") return ans.score ?? 0;
  return ans.score ?? 0;
};

// ============================================================
// PDF EXPORT — เปิด window ใหม่แล้ว print (ทำงานได้ทุก browser)
// ============================================================
const exportPDF = (assessment, patient, doctor, prevAssessment) => {
  const interp = getInterp(assessment.totalScore);
  const diff = prevAssessment ? assessment.totalScore - prevAssessment.totalScore : null;

  const rows = Q.map(q => {
    const sc = getQScore(assessment, q);
    const prevSc = prevAssessment ? getQScore(prevAssessment, q) : null;
    const d = prevSc !== null ? sc - prevSc : null;
    const ans = assessment.answers?.[q.id] || {};
    return `<tr>
      <td style="color:#0891B2;font-weight:700;text-align:center">${q.num}</td>
      <td>${q.title}</td>
      <td style="text-align:center;font-weight:700;color:${sc===q.max?"#059669":sc===0?"#EF4444":"#333"}">${sc}</td>
      <td style="text-align:center;color:#999">${q.max}</td>
      ${prevAssessment ? `<td style="text-align:center;color:${d>0?"#059669":d<0?"#EF4444":"#999"};font-weight:${d!==0?"700":"400"}">${prevSc}${d!==0?` (${d>0?"+":""}${d})`:""}</td>` : ""}
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>ADCS-MCI-ADL — ${patient.firstName} ${patient.lastName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;600;700;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Noto Sans Thai',sans-serif;font-size:13px;color:#0C2D3E;padding:32px 40px;background:#fff}
  h1{font-size:20px;font-weight:900;color:#0891B2;margin-bottom:4px}
  .subtitle{color:#7BA8B8;font-size:13px;margin-bottom:24px}
  .info-box{background:#F0FBFF;border-radius:10px;padding:16px 20px;margin-bottom:20px;display:flex;gap:32px}
  .info-item label{font-size:11px;color:#7BA8B8;display:block}
  .info-item span{font-size:15px;font-weight:700;color:#0C2D3E}
  .score-box{background:linear-gradient(135deg,#0891B2,#7C3AED);border-radius:10px;padding:16px 24px;color:#fff;margin-bottom:20px;display:flex;align-items:center;gap:24px}
  .score-num{font-size:48px;font-weight:900;line-height:1}
  .score-label{font-size:13px;opacity:0.8}
  .interp{background:rgba(255,255,255,0.2);border-radius:8px;padding:6px 14px;font-weight:700;font-size:14px;margin-top:8px;display:inline-block}
  ${prevAssessment ? `.compare{background:#F8FEFF;border:1.5px solid #CAE8F0;border-radius:10px;padding:14px 20px;margin-bottom:20px}
  .compare-row{display:flex;gap:16px;margin-top:10px}
  .compare-item{flex:1;text-align:center;padding:10px;border-radius:8px;background:#fff}
  .compare-item .val{font-size:24px;font-weight:900}
  .compare-item .lbl{font-size:11px;color:#7BA8B8}` : ""}
  table{width:100%;border-collapse:collapse;margin-bottom:20px}
  th{background:#0891B2;color:#fff;padding:8px 10px;text-align:left;font-size:12px}
  td{padding:7px 10px;border-bottom:1px solid #EFF9FC;font-size:12px}
  tr:nth-child(even) td{background:#F8FEFF}
  tfoot td{background:#F0FBFF;font-weight:700;border-top:2px solid #0891B2}
  .notes{background:#FFFBEB;border-radius:8px;padding:12px 16px;margin-bottom:20px}
  .footer{text-align:center;color:#7BA8B8;font-size:11px;margin-top:24px;padding-top:16px;border-top:1px solid #EFF9FC}
  @media print{body{padding:20px 24px}.no-print{display:none!important}}
</style>
</head><body>

<div class="no-print" style="margin-bottom:20px;text-align:right">
  <button onclick="window.print()" style="background:linear-gradient(135deg,#0891B2,#7C3AED);color:#fff;border:none;
    border-radius:8px;padding:10px 24px;font-size:14px;cursor:pointer;font-family:inherit">🖨️ พิมพ์ / บันทึก PDF</button>
</div>

<h1>🧠 ADCS-MCI-ADL Assessment Report</h1>
<div class="subtitle">Alzheimer's Disease Cooperative Study · MCI Activities of Daily Living · ETM</div>

<div class="info-box">
  <div class="info-item"><label>ผู้ป่วย</label><span>${patient.firstName} ${patient.lastName}</span></div>
  <div class="info-item"><label>เพศ / อายุ</label><span>${patient.gender} / ${patient.age} ปี</span></div>
  <div class="info-item"><label>วันที่ประเมิน</label><span>${fmtDate(assessment.date)}</span></div>
  <div class="info-item"><label>แพทย์ผู้ประเมิน</label><span>นพ./พญ. ${doctor?.firstName||""} ${doctor?.lastName||""}</span></div>
</div>

<div class="score-box">
  <div>
    <div class="score-label">คะแนนรวม ADCS-MCI-ADL</div>
    <div><span class="score-num">${assessment.totalScore}</span><span style="font-size:20px;opacity:0.7"> / ${MAX_TOTAL}</span></div>
    <div class="interp">${interp.icon} ${interp.label}</div>
  </div>
  <div style="flex:1;text-align:right;font-size:12px;opacity:0.8">
    คะแนนสูง = ความสามารถในการทำกิจวัตรดีกว่า<br>
    ช่วงเวลาที่ประเมิน: 4 สัปดาห์ที่ผ่านมา
  </div>
</div>

${prevAssessment ? `
<div class="compare">
  <strong>🔄 เปรียบเทียบกับครั้งก่อน (${fmtDate(prevAssessment.date)})</strong>
  <div class="compare-row">
    <div class="compare-item">
      <div class="lbl">ครั้งก่อน</div>
      <div class="val" style="color:#7BA8B8">${prevAssessment.totalScore}</div>
    </div>
    <div style="display:flex;align-items:center;font-size:20px">→</div>
    <div class="compare-item">
      <div class="lbl">ครั้งนี้</div>
      <div class="val" style="color:#0891B2">${assessment.totalScore}</div>
    </div>
    <div class="compare-item" style="background:${diff>=0?"#ECFDF5":"#FEF2F2"}">
      <div class="lbl">การเปลี่ยนแปลง</div>
      <div class="val" style="color:${diff>=0?"#059669":"#EF4444"}">${diff>=0?"+":""}${diff}</div>
      <div style="font-size:11px;color:${diff>=0?"#059669":"#EF4444"};font-weight:700">${diff>0?"ดีขึ้น ↑":diff<0?"แย่ลง ↓":"คงเดิม"}</div>
    </div>
  </div>
</div>` : ""}

<table>
  <thead>
    <tr>
      <th style="width:50px;text-align:center">ข้อ</th>
      <th>หัวข้อ</th>
      <th style="width:70px;text-align:center">คะแนน</th>
      <th style="width:60px;text-align:center">สูงสุด</th>
      ${prevAssessment ? '<th style="width:100px;text-align:center">ครั้งก่อน</th>' : ""}
    </tr>
  </thead>
  <tbody>${rows}</tbody>
  <tfoot>
    <tr>
      <td colspan="2">คะแนนรวม</td>
      <td style="text-align:center;color:${interp.color};font-size:15px">${assessment.totalScore}</td>
      <td style="text-align:center">${MAX_TOTAL}</td>
      ${prevAssessment ? `<td style="text-align:center;color:${diff>=0?"#059669":"#EF4444"}">${prevAssessment.totalScore} (${diff>=0?"+":""}${diff})</td>` : ""}
    </tr>
  </tfoot>
</table>

${assessment.notes ? `<div class="notes"><strong>📝 บันทึกเพิ่มเติม:</strong><br>${assessment.notes}</div>` : ""}

<div class="footer">
  พิมพ์โดย ADCS-MCI-ADL System · ETM (Eisai Thailand Marketing) · ${new Date().toLocaleDateString("th-TH")}
</div>

<script>window.onload = () => { setTimeout(()=>window.print(), 800); }</script>
</body></html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  win.document.write(html);
  win.document.close();
};

// ============================================================
// UI COMPONENTS
// ============================================================
const Btn = ({children,onClick,variant="primary",style={},disabled=false,full=false,sm=false})=>{
  const base={border:"none",borderRadius:12,fontFamily:"inherit",cursor:disabled?"not-allowed":"pointer",
    fontWeight:700,transition:"all .18s",outline:"none",opacity:disabled?0.5:1,
    width:full?"100%":undefined, padding:sm?"8px 18px":"12px 24px",fontSize:sm?13:15};
  const vars={
    primary:{background:GRAD,color:"#fff",boxShadow:"0 4px 18px rgba(8,145,178,0.30)"},
    outline:{background:"#fff",color:C.teal,border:`2px solid ${C.teal}`},
    ghost:{background:"transparent",color:C.textMid},
    danger:{background:"#FEE2E2",color:"#DC2626"},
    violet:{background:"linear-gradient(135deg,#7C3AED,#A855F7)",color:"#fff",boxShadow:"0 4px 18px rgba(124,58,237,0.25)"},
    green:{background:"linear-gradient(135deg,#059669,#10B981)",color:"#fff"},
  };
  return <button onClick={disabled?undefined:onClick} style={{...base,...vars[variant],...style}}>{children}</button>;
};
const Input = ({label,value,onChange,type="text",placeholder="",required=false,hint=""})=>(
  <div style={{marginBottom:16}}>
    {label&&<div style={{fontSize:13,fontWeight:600,color:C.textMid,marginBottom:6}}>{label}{required&&<span style={{color:C.coral}}> *</span>}</div>}
    <input value={value} onChange={e=>onChange(e.target.value)} type={type} placeholder={placeholder}
      style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:10,padding:"10px 14px",fontSize:15,
        fontFamily:"inherit",outline:"none",boxSizing:"border-box",background:"#F8FEFF",color:C.text}}
      onFocus={e=>e.target.style.borderColor=C.teal} onBlur={e=>e.target.style.borderColor=C.border}/>
    {hint&&<div style={{fontSize:12,color:C.textLight,marginTop:4}}>{hint}</div>}
  </div>
);
const Select = ({label,value,onChange,options,required=false})=>(
  <div style={{marginBottom:16}}>
    {label&&<div style={{fontSize:13,fontWeight:600,color:C.textMid,marginBottom:6}}>{label}{required&&<span style={{color:C.coral}}> *</span>}</div>}
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:10,padding:"10px 14px",fontSize:15,
        fontFamily:"inherit",outline:"none",boxSizing:"border-box",background:"#F8FEFF",color:C.text}}>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);
const Card = ({children,style={}})=>(<div style={{background:C.card,borderRadius:16,boxShadow:C.sh,padding:24,...style}}>{children}</div>);
const Ring = ({pct,size=80,stroke=8,color=C.teal})=>{
  const r=size/2-stroke/2; const circ=2*Math.PI*r; const off=circ*(1-pct/100);
  return <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={stroke}/>
    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
      strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" style={{transition:"stroke-dashoffset 0.6s ease"}}/>
  </svg>;
};
const Loader = ({text="กำลังโหลด..."})=>(
  <div style={{textAlign:"center",padding:48,color:C.textMid}}>
    <div style={{fontSize:32,marginBottom:12}}>⏳</div>{text}
  </div>
);
const ErrBox = ({msg})=>msg?<div style={{color:C.coral,fontSize:13,marginBottom:12,background:"#FEF2F2",padding:"8px 12px",borderRadius:8}}>{msg}</div>:null;

// ============================================================
// SCREEN: Landing
// ============================================================
const Landing = ({onLogin,onRegister,onAdmin})=>(
  <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
    <div style={{textAlign:"center",marginBottom:48}}>
      <div style={{width:88,height:88,background:GRAD,borderRadius:24,display:"inline-flex",
        alignItems:"center",justifyContent:"center",fontSize:40,marginBottom:16,boxShadow:C.shLg}}>🧠</div>
      <h1 style={{margin:0,fontSize:30,fontWeight:900,background:GRAD,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
        ADCS-MCI-ADL
      </h1>
      <p style={{color:C.textMid,marginTop:8,fontSize:16}}>ระบบประเมินกิจวัตรประจำวัน สำหรับแพทย์ผู้เชี่ยวชาญ</p>
      <p style={{color:C.textLight,fontSize:12,marginTop:4}}>Alzheimer's Disease Cooperative Study · MCI Activities of Daily Living · ETM</p>
    </div>
    <div style={{width:"100%",maxWidth:400,display:"flex",flexDirection:"column",gap:12}}>
      <Btn full onClick={onLogin}>🔑 เข้าสู่ระบบ (แพทย์)</Btn>
      <Btn full variant="outline" onClick={onRegister}>📋 ลงทะเบียนแพทย์ใหม่</Btn>
      <Btn full variant="ghost" onClick={onAdmin} style={{fontSize:13,color:C.textLight}}>⚙️ Admin Dashboard</Btn>
    </div>
    <div style={{marginTop:48,display:"flex",gap:32,flexWrap:"wrap",justifyContent:"center"}}>
      {[["🏥","ใช้งานง่าย","ออกแบบสำหรับแพทย์"],["📊","ติดตามผล","เปรียบเทียบข้ามครั้ง"],["📄","Export PDF","รายงานมาตรฐาน"],["☁️","Cloud Storage","เก็บข้อมูลใน Google Drive"]].map(([ic,t,s])=>
        <div key={t} style={{textAlign:"center",color:C.textMid}}>
          <div style={{fontSize:24}}>{ic}</div>
          <div style={{fontWeight:700,fontSize:13,marginTop:4}}>{t}</div>
          <div style={{fontSize:11,color:C.textLight}}>{s}</div>
        </div>
      )}
    </div>
  </div>
);

// ============================================================
// SCREEN: Register
// ============================================================
const Register = ({onBack,onSuccess})=>{
  const [f,setF]=useState({firstName:"",lastName:"",license:"",pass:"",pass2:""});
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);
  const update=k=>v=>setF({...f,[k]:v});
  const submit=async()=>{
    if(!f.firstName||!f.lastName||!f.license||!f.pass) return setErr("กรุณากรอกข้อมูลให้ครบ");
    if(f.pass!==f.pass2) return setErr("รหัสผ่านไม่ตรงกัน");
    if(f.pass.length<6) return setErr("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
    setLoading(true); setErr("");
    try {
      const {data:docs=[]} = await api.getDoctors();
      if(docs.find(d=>String(d.license).trim()===String(f.license).trim())) {
        setErr("เลข ว. นี้มีในระบบแล้ว"); setLoading(false); return;
      }
      const doc={id:uid(),firstName:f.firstName.trim(),lastName:f.lastName.trim(),
        license:f.license.trim(),pass:f.pass,role:"doctor",createdAt:new Date().toISOString()};
      await api.saveDoctor(doc);
      setDone(true);
    } catch(e){ setErr("เชื่อมต่อ server ไม่ได้ — ตรวจสอบ GAS_URL"); }
    setLoading(false);
  };
  if(done) return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <Card style={{width:"100%",maxWidth:460,textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:12}}>✅</div>
        <h2 style={{color:"#059669",margin:"0 0 8px"}}>ลงทะเบียนสำเร็จ!</h2>
        <p style={{color:C.textMid,fontSize:14,marginBottom:8}}>นพ./พญ. {f.firstName} {f.lastName}</p>
        <p style={{color:C.textLight,fontSize:13,marginBottom:24}}>กรุณาเข้าสู่ระบบด้วยเลข ว. และรหัสผ่านที่ลงทะเบียนไว้</p>
        <Btn full onClick={onSuccess}>🔑 ไปหน้าเข้าสู่ระบบ</Btn>
      </Card>
    </div>
  );
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <Card style={{width:"100%",maxWidth:460}}>
        <div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:36}}>📋</div><h2 style={{margin:"8px 0 0",color:C.text}}>ลงทะเบียนแพทย์</h2></div>
        <Input label="ชื่อ" value={f.firstName} onChange={update("firstName")} required/>
        <Input label="นามสกุล" value={f.lastName} onChange={update("lastName")} required/>
        <Input label="เลข ว. (ใบประกอบวิชาชีพเวชกรรม)" value={f.license} onChange={update("license")} required hint="เช่น 12345"/>
        <Input label="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)" value={f.pass} onChange={update("pass")} type="password" required/>
        <Input label="ยืนยันรหัสผ่าน" value={f.pass2} onChange={update("pass2")} type="password" required/>
        <ErrBox msg={err}/>
        <Btn full onClick={submit} disabled={loading}>{loading?"⏳ กำลังบันทึก...":"ลงทะเบียน"}</Btn>
        <Btn full variant="ghost" onClick={onBack} style={{marginTop:8}}>← กลับ</Btn>
      </Card>
    </div>
  );
};

// ============================================================
// SCREEN: Login
// ============================================================
const Login = ({onBack,onSuccess})=>{
  const [license,setLicense]=useState(""); const [pass,setPass]=useState("");
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const submit=async()=>{
    setLoading(true); setErr("");
    try {
      const {data:docs=[]} = await api.getDoctors();
      const doc=docs.find(d=>d.license===license&&d.pass===pass);
      if(!doc) { setErr("เลข ว. หรือรหัสผ่านไม่ถูกต้อง"); setLoading(false); return; }
      onSuccess(doc);
    } catch(e){ setErr("เชื่อมต่อ server ไม่ได้ — ตรวจสอบ GAS_URL"); }
    setLoading(false);
  };
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <Card style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:36}}>🔑</div><h2 style={{margin:"8px 0 0",color:C.text}}>เข้าสู่ระบบ</h2></div>
        <Input label="เลข ว." value={license} onChange={setLicense} required/>
        <Input label="รหัสผ่าน" value={pass} onChange={setPass} type="password" required/>
        <ErrBox msg={err}/>
        <Btn full onClick={submit} disabled={loading}>{loading?"⏳ กำลังตรวจสอบ...":"เข้าสู่ระบบ"}</Btn>
        <Btn full variant="ghost" onClick={onBack} style={{marginTop:8}}>← กลับ</Btn>
      </Card>
    </div>
  );
};

// Admin Login
const AdminLogin = ({onBack,onSuccess})=>{
  const [code,setCode]=useState(""); const [err,setErr]=useState("");
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <Card style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:36}}>⚙️</div>
          <h2 style={{margin:"8px 0 4px",color:C.text}}>Admin Access</h2>
          <p style={{color:C.textLight,fontSize:13,margin:0}}>กรอก Admin Code เพื่อเข้าใช้งาน</p>
        </div>
        <Input label="Admin Code" value={code} onChange={setCode} type="password" required/>
        <ErrBox msg={err}/>
        <Btn full variant="violet" onClick={()=>{ if(code==="ETM2024") onSuccess(); else setErr("Code ไม่ถูกต้อง"); }}>เข้าสู่ Admin</Btn>
        <Btn full variant="ghost" onClick={onBack} style={{marginTop:8}}>← กลับ</Btn>
      </Card>
    </div>
  );
};

// ============================================================
// SCREEN: Dashboard
// ============================================================
const Dashboard = ({doctor,onLogout,onNewPatient,onSelectPatient,onAdmin})=>{
  const [patients,setPatients]=useState([]);
  const [assessments,setAssessments]=useState([]);
  const [search,setSearch]=useState("");
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    (async()=>{
      const [pr,ar]=await Promise.all([api.getPatients(doctor.id),api.getAssessments(null,doctor.id)]);
      setPatients(pr.data||[]); setAssessments(ar.data||[]); setLoading(false);
    })();
  },[]);
  const filtered=patients.filter(p=>`${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()));
  const getLastScore=pid=>{ const a=(assessments||[]).filter(a=>a.patientId===pid).sort((a,b)=>new Date(b.date)-new Date(a.date)); return a[0]||null; };
  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{background:GRAD,padding:"20px 24px",color:"#fff"}}>
        <div style={{maxWidth:900,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:12,opacity:0.8}}>🧠 ADCS-MCI-ADL · ETM</div>
            <h2 style={{margin:0,fontSize:20}}>สวัสดี, นพ./พญ. {doctor.firstName} {doctor.lastName}</h2>
            <div style={{fontSize:12,opacity:0.75}}>เลข ว. {doctor.license}</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn sm variant="outline" style={{color:"#fff",border:"1.5px solid rgba(255,255,255,0.5)"}} onClick={onAdmin}>⚙️ Admin</Btn>
            <Btn sm variant="outline" style={{color:"#fff",border:"1.5px solid rgba(255,255,255,0.5)"}} onClick={onLogout}>ออกจากระบบ</Btn>
          </div>
        </div>
      </div>
      <div style={{maxWidth:900,margin:"0 auto",padding:24}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}}>
          {[["👥","ผู้ป่วยทั้งหมด",patients.length,"ราย"],["📝","การประเมินทั้งหมด",(assessments||[]).length,"ครั้ง"],["☁️","ฐานข้อมูล","Google","Sheets"]].map(([ic,t,v,u])=>
            <Card key={t} style={{textAlign:"center",padding:16}}>
              <div style={{fontSize:28}}>{ic}</div>
              <div style={{fontSize:12,color:C.textLight,marginTop:4}}>{t}</div>
              <div style={{fontSize:24,fontWeight:900,color:C.teal}}>{v}</div>
              <div style={{fontSize:12,color:C.textMid}}>{u}</div>
            </Card>
          )}
        </div>
        <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          <Btn onClick={onNewPatient}>+ เพิ่มผู้ป่วยใหม่</Btn>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 ค้นหาชื่อผู้ป่วย..."
            style={{flex:1,minWidth:180,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"10px 14px",
              fontSize:14,fontFamily:"inherit",outline:"none",background:"#fff"}}/>
        </div>
        {loading ? <Loader/> : filtered.length===0?(
          <Card style={{textAlign:"center",padding:48}}>
            <div style={{fontSize:48}}>🏥</div>
            <div style={{color:C.textMid,marginTop:12}}>ยังไม่มีรายชื่อผู้ป่วย</div>
            <Btn sm onClick={onNewPatient} style={{marginTop:16}}>+ เพิ่มผู้ป่วยใหม่</Btn>
          </Card>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {filtered.map(p=>{
              const last=getLastScore(p.id);
              const interp=last?getInterp(last.totalScore):null;
              return(
                <Card key={p.id} style={{display:"flex",alignItems:"center",gap:16,padding:16,cursor:"pointer"}}
                  onClick={()=>onSelectPatient(p)}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow=C.shLg}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow=C.sh}>
                  <div style={{width:48,height:48,borderRadius:12,background:GRADSOFT,display:"flex",
                    alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{p.gender==="ชาย"?"👨":"👩"}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,color:C.text,fontSize:16}}>{p.firstName} {p.lastName}</div>
                    <div style={{color:C.textLight,fontSize:13}}>{p.gender} · อายุ {p.age} ปี · ประเมินแล้ว {(assessments||[]).filter(a=>a.patientId===p.id).length} ครั้ง</div>
                  </div>
                  {last&&interp&&(<div style={{textAlign:"right"}}>
                    <div style={{fontSize:22,fontWeight:900,color:interp.color}}>{last.totalScore}<span style={{fontSize:12,color:C.textLight}}>/{MAX_TOTAL}</span></div>
                    <div style={{fontSize:11,background:interp.bg,color:interp.color,padding:"2px 8px",borderRadius:99}}>{interp.icon} {interp.label}</div>
                  </div>)}
                  <div style={{color:C.textLight}}>›</div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// SCREEN: New Patient
// ============================================================
const NewPatient = ({doctor,onBack,onSuccess})=>{
  const [f,setF]=useState({firstName:"",lastName:"",gender:"ชาย",age:""});
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const update=k=>v=>setF({...f,[k]:v});
  const submit=async()=>{
    if(!f.firstName||!f.lastName||!f.age) return setErr("กรุณากรอกข้อมูลให้ครบ");
    setLoading(true);
    try {
      const p={id:uid(),doctorId:doctor.id,firstName:f.firstName,lastName:f.lastName,gender:f.gender,age:parseInt(f.age),createdAt:new Date().toISOString()};
      await api.savePatient(p); onSuccess(p);
    } catch{ setErr("บันทึกไม่สำเร็จ"); }
    setLoading(false);
  };
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <Card style={{width:"100%",maxWidth:460}}>
        <div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:36}}>👤</div><h2 style={{margin:"8px 0 0",color:C.text}}>เพิ่มผู้ป่วยใหม่</h2></div>
        <Input label="ชื่อ" value={f.firstName} onChange={update("firstName")} required/>
        <Input label="นามสกุล" value={f.lastName} onChange={update("lastName")} required/>
        <Select label="เพศ" value={f.gender} onChange={update("gender")} options={[{value:"ชาย",label:"ชาย"},{value:"หญิง",label:"หญิง"}]}/>
        <Input label="อายุ (ปี)" value={f.age} onChange={update("age")} type="number" required placeholder="เช่น 72"/>
        <ErrBox msg={err}/>
        <Btn full onClick={submit} disabled={loading}>{loading?"⏳ กำลังบันทึก...":"บันทึกและเริ่มประเมิน"}</Btn>
        <Btn full variant="ghost" onClick={onBack} style={{marginTop:8}}>← กลับ</Btn>
      </Card>
    </div>
  );
};

// ============================================================
// SCREEN: Patient Detail
// ============================================================
const PatientDetail = ({patient,doctor,onBack,onNewAssessment,onViewAssessment})=>{
  const [assessments,setAssessments]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    (async()=>{
      const {data=[]}=await api.getAssessments(patient.id);
      setAssessments((data||[]).sort((a,b)=>new Date(b.date)-new Date(a.date)));
      setLoading(false);
    })();
  },[]);
  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{background:GRAD,padding:"20px 24px",color:"#fff"}}>
        <div style={{maxWidth:800,margin:"0 auto"}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:14,marginBottom:12}}>← กลับ</button>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:56,height:56,borderRadius:16,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{patient.gender==="ชาย"?"👨":"👩"}</div>
            <div>
              <h2 style={{margin:0,fontSize:22}}>{patient.firstName} {patient.lastName}</h2>
              <div style={{opacity:0.8,fontSize:14}}>{patient.gender} · อายุ {patient.age} ปี · ประเมินแล้ว {assessments.length} ครั้ง</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{maxWidth:800,margin:"0 auto",padding:24}}>
        {loading ? <Loader/> : (
          <>
            {assessments.length>=2&&(
              <Card style={{marginBottom:20}}>
                <h3 style={{margin:"0 0 16px",color:C.text,fontSize:16}}>📈 แนวโน้มคะแนน</h3>
                <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,alignItems:"flex-end"}}>
                  {[...assessments].reverse().map((a,i)=>{
                    const interp=getInterp(a.totalScore); const pct=(a.totalScore/MAX_TOTAL)*100;
                    return(<div key={a.id} style={{textAlign:"center",minWidth:72}}>
                      <div style={{height:80,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
                        <div style={{width:40,background:interp.color,borderRadius:"6px 6px 0 0",height:`${Math.max(pct,5)}%`}}/>
                      </div>
                      <div style={{fontSize:13,fontWeight:700,color:interp.color,marginTop:4}}>{a.totalScore}</div>
                      <div style={{fontSize:10,color:C.textLight}}>{fmtDate(a.date).slice(0,8)}</div>
                    </div>);
                  })}
                </div>
              </Card>
            )}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{margin:0,color:C.text}}>ประวัติการประเมิน</h3>
              <Btn sm onClick={onNewAssessment}>+ ประเมินใหม่</Btn>
            </div>
            {assessments.length===0?(
              <Card style={{textAlign:"center",padding:40}}>
                <div style={{fontSize:40}}>📝</div>
                <div style={{color:C.textMid,marginTop:12}}>ยังไม่มีการประเมิน</div>
                <Btn sm onClick={onNewAssessment} style={{marginTop:16}}>เริ่มประเมินครั้งแรก</Btn>
              </Card>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {assessments.map((a,i)=>{
                  const interp=getInterp(a.totalScore); const pct=Math.round((a.totalScore/MAX_TOTAL)*100);
                  return(<Card key={a.id} style={{cursor:"pointer",padding:16}} onClick={()=>onViewAssessment(a,assessments[i+1]||null)}
                    onMouseEnter={e=>e.currentTarget.style.boxShadow=C.shLg}
                    onMouseLeave={e=>e.currentTarget.style.boxShadow=C.sh}>
                    <div style={{display:"flex",alignItems:"center",gap:16}}>
                      <div style={{position:"relative",width:60,height:60,flexShrink:0}}>
                        <Ring pct={pct} size={60} stroke={6} color={interp.color}/>
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:interp.color}}>{a.totalScore}</div>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontWeight:700,color:C.text}}>ครั้งที่ {assessments.length-i}</span>
                          {i===0&&<span style={{background:C.tealLt,color:C.tealDk,fontSize:11,padding:"2px 8px",borderRadius:99,fontWeight:700}}>ล่าสุด</span>}
                        </div>
                        <div style={{color:C.textLight,fontSize:13}}>{fmtDate(a.date)}</div>
                        <div style={{background:interp.bg,color:interp.color,fontSize:12,padding:"2px 10px",borderRadius:99,marginTop:4,display:"inline-block",fontWeight:600}}>{interp.icon} {interp.label}</div>
                      </div>
                      <div style={{color:C.textLight}}>›</div>
                    </div>
                  </Card>);
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================
// SCREEN: Assessment Form (5 หน้า)
// ============================================================
const AssessmentForm = ({patient,doctor,onBack,onSave})=>{
  const [answers,setAnswers]=useState({});
  const [notes,setNotes]=useState("");
  const [step,setStep]=useState(0);
  const [saving,setSaving]=useState(false);
  const pages=[
    {title:"🍽️ กิจวัตรพื้นฐาน",qs:Q.filter(q=>["q1","q2","q3","q4","q5"].includes(q.id))},
    {title:"👔 การแต่งตัว & สื่อสาร",qs:Q.filter(q=>["q6a","q6b","q7","q8","q9"].includes(q.id))},
    {title:"🏠 กิจกรรมในบ้าน",qs:Q.filter(q=>["q10","q11","q12","q13","q14"].includes(q.id))},
    {title:"🌍 นอกบ้าน & สังคม",qs:Q.filter(q=>["q15","q16a","q16b","q17","q18","q19"].includes(q.id))},
    {title:"📚 อ่าน เขียน งานอดิเรก",qs:Q.filter(q=>["q20","q21","q22","q23"].includes(q.id))},
  ];
  const setAnswer=(qid,key,val)=>setAnswers(prev=>({...prev,[qid]:{...prev[qid],[key]:val}}));
  const calcScore=()=>{ let t=0; Q.forEach(q=>{ const a=answers[q.id]; if(!a)return; if(q.hasYN&&a.yn!=="ใช่")return; if(q.type==="subs"){t+=Math.min((q.subs||[]).filter(s=>a[s.id]==="ใช่").length,q.max);}else if(q.type==="binary"){t+=a.score??0;}else{if(a.score!==undefined)t+=a.score;} }); return t; };
  const save=async()=>{
    setSaving(true);
    try {
      const rec={id:uid(),patientId:patient.id,doctorId:doctor.id,date:new Date().toISOString(),answers,totalScore:calcScore(),notes};
      await api.saveAssessment(rec); onSave(rec);
    } catch { alert("บันทึกไม่สำเร็จ กรุณาลองใหม่"); }
    setSaving(false);
  };
  const pg=pages[step]; const isLast=step===pages.length-1;
  const renderQ=(q)=>{
    const a=answers[q.id]||{}; const yn=a.yn;
    return(<div key={q.id} style={{marginBottom:20,borderRadius:14,border:`1.5px solid ${C.border}`,overflow:"hidden"}}>
      <div style={{background:"linear-gradient(90deg,#EFF9FC,#F5F0FF)",padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:32,height:32,borderRadius:8,background:GRAD,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{q.num}</div>
        <div style={{flex:1}}><div style={{fontWeight:700,color:C.text,fontSize:14}}>{q.title}</div><div style={{fontSize:11,color:C.textLight}}>{q.en}</div></div>
        <div style={{fontSize:11,color:C.teal,fontWeight:600}}>max {q.max} pts</div>
      </div>
      <div style={{padding:16}}>
        {q.desc&&(<div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:8,padding:"8px 12px",marginBottom:14,fontSize:13,color:"#1E40AF",lineHeight:1.6}}>{q.desc}</div>)}
        {q.hasYN&&(<div style={{marginBottom:yn==="ใช่"?16:0}}>
          <div style={{fontSize:14,color:C.textMid,marginBottom:10}}>{q.ynLabel}</div>
          <div style={{display:"flex",gap:8}}>
            {["ใช่","ไม่ใช่","ไม่ทราบ"].map(v=>(<button key={v} onClick={()=>setAnswer(q.id,"yn",v)}
              style={{flex:1,padding:"8px 4px",borderRadius:8,border:`1.5px solid ${yn===v?C.teal:C.border}`,
                background:yn===v?C.tealBg:"#fff",color:yn===v?C.tealDk:C.textMid,cursor:"pointer",fontFamily:"inherit",fontWeight:yn===v?700:400,fontSize:14}}>{v}</button>))}
          </div>
          {yn&&yn!=="ใช่"&&<div style={{fontSize:13,color:C.textLight,marginTop:8,background:"#F8FEFF",padding:"6px 10px",borderRadius:8}}>{yn==="ไม่ใช่"?"→ บันทึก 0 คะแนน":"→ บันทึกว่าไม่ทราบ"}</div>}
        </div>)}
        {(!q.hasYN||yn==="ใช่")&&(<>
          {q.note&&<div style={{fontSize:12,color:C.textLight,marginBottom:10,background:"#FFFBEB",padding:"6px 10px",borderRadius:6}}>{q.note}</div>}
          {q.type==="subs"&&q.subs&&(<div>{q.subs.map(s=>(<div key={s.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,padding:"10px 14px",borderRadius:10,background:"#F8FEFF",border:`1px solid ${C.border}`}}>
            <div style={{flex:1,fontSize:14,color:C.text}}>{s.l}</div>
            <div style={{display:"flex",gap:6}}>
              {["ใช่","ไม่ใช่"].map(v=>(<button key={v} onClick={()=>setAnswer(q.id,s.id,v)}
                style={{padding:"4px 12px",borderRadius:6,border:`1.5px solid ${a[s.id]===v?C.teal:C.border}`,
                  background:a[s.id]===v?C.tealBg:"#fff",color:a[s.id]===v?C.tealDk:C.textMid,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>{v}</button>))}
            </div>
          </div>))}<div style={{fontSize:12,color:C.textLight}}>คะแนน: {(q.subs||[]).filter(s=>a[s.id]==="ใช่").length} / {q.max}</div></div>)}
          {q.type==="binary"&&(<div>
            <div style={{fontSize:14,color:C.textMid,marginBottom:10}}>{q.label}</div>
            <div style={{display:"flex",gap:8}}>{q.opts.map(o=>(<button key={o.v} onClick={()=>setAnswer(q.id,"score",o.v)}
              style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${a.score===o.v?C.teal:C.border}`,
                background:a.score===o.v?C.tealBg:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:700,color:a.score===o.v?C.tealDk:C.textMid}}>{o.l}</button>))}</div>
          </div>)}
          {!q.type&&q.opts&&(<div>{q.opts.map(o=>(<div key={o.v} onClick={()=>setAnswer(q.id,"score",o.v)}
            style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:10,marginBottom:8,cursor:"pointer",
              border:`1.5px solid ${a.score===o.v?C.teal:C.border}`,background:a.score===o.v?C.tealBg:"#fff"}}>
            <div style={{width:28,height:28,borderRadius:7,background:a.score===o.v?C.teal:C.border,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,flexShrink:0}}>{o.v}</div>
            <div style={{fontSize:14,color:a.score===o.v?C.tealDk:C.text,flex:1}}>{o.l}</div>
            {a.score===o.v&&<div style={{color:C.teal}}>✓</div>}
          </div>))}</div>)}
        </>)}
      </div>
    </div>);
  };
  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{background:GRAD,padding:"16px 24px",color:"#fff",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:800,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <button onClick={onBack} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:13}}>← กลับ</button>
            <div style={{flex:1}}><div style={{fontSize:12,opacity:0.8}}>ประเมิน: {patient.firstName} {patient.lastName}</div><div style={{fontWeight:700}}>{pg.title}</div></div>
            <div style={{fontWeight:700}}>{step+1}/{pages.length}</div>
          </div>
          <div style={{height:6,borderRadius:99,background:"rgba(255,255,255,0.25)"}}>
            <div style={{height:"100%",borderRadius:99,background:"#fff",width:`${((step+1)/pages.length)*100}%`,transition:"width .3s"}}/>
          </div>
        </div>
      </div>
      <div style={{maxWidth:800,margin:"0 auto",padding:24}}>
        <div style={{marginBottom:20,background:"#fff",borderRadius:12,padding:"12px 16px",border:`1.5px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
          <div style={{position:"relative",width:40,height:40}}>
            <Ring pct={Math.round((calcScore()/MAX_TOTAL)*100)} size={40} stroke={5}/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.teal}}>{calcScore()}</div>
          </div>
          <div><div style={{fontSize:12,color:C.textMid}}>คะแนนสะสมปัจจุบัน</div><div style={{fontWeight:700,color:C.text}}>{calcScore()} / {MAX_TOTAL} คะแนน</div></div>
        </div>
        {pg.qs.map(renderQ)}
        {isLast&&(<div style={{marginBottom:24}}>
          <div style={{fontSize:14,fontWeight:600,color:C.textMid,marginBottom:8}}>📝 บันทึกเพิ่มเติม</div>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="บันทึกสังเกตการณ์ ข้อมูลเพิ่มเติม..."
            style={{width:"100%",minHeight:80,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"10px 14px",fontSize:14,fontFamily:"inherit",boxSizing:"border-box",resize:"vertical",outline:"none"}}/>
        </div>)}
        <div style={{display:"flex",gap:12}}>
          {step>0&&<Btn variant="outline" onClick={()=>{setStep(s=>s-1);window.scrollTo(0,0);}}>← หน้าก่อน</Btn>}
          <div style={{flex:1}}/>
          {!isLast?<Btn onClick={()=>{setStep(s=>s+1);window.scrollTo(0,0);}}>หน้าต่อไป →</Btn>
            :<Btn variant="green" onClick={save} disabled={saving}>{saving?"⏳ กำลังบันทึก...":"✅ บันทึกผลการประเมิน"}</Btn>}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// SCREEN: Results
// ============================================================
const Results = ({assessment,prevAssessment,patient,doctor,onBack})=>{
  const interp=getInterp(assessment.totalScore);
  const pct=Math.round((assessment.totalScore/MAX_TOTAL)*100);
  const diff=prevAssessment?assessment.totalScore-prevAssessment.totalScore:null;
  const prevInterp=prevAssessment?getInterp(prevAssessment.totalScore):null;
  const domainColors=[C.teal,C.violet,C.orange,C.green,C.coral];
  const domains=[
    {label:"กิจวัตรพื้นฐาน",qs:Q.slice(0,5),c:C.teal},
    {label:"แต่งตัว & สื่อสาร",qs:Q.slice(5,9),c:C.violet},
    {label:"กิจกรรมในบ้าน",qs:Q.slice(9,14),c:C.orange},
    {label:"นอกบ้าน & สังคม",qs:Q.slice(14,19),c:C.green},
    {label:"อ่าน เขียน งานอดิเรก",qs:Q.slice(19,23),c:C.coral},
  ];
  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{background:GRAD,padding:"16px 24px",color:"#fff"}}>
        <div style={{maxWidth:900,margin:"0 auto",display:"flex",alignItems:"center",gap:12}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:13}}>← กลับ</button>
          <div style={{flex:1,fontWeight:700}}>ผลการประเมิน ADCS-MCI-ADL</div>
          <Btn sm variant="outline" style={{color:"#fff",border:"1.5px solid rgba(255,255,255,0.5)"}}
            onClick={()=>exportPDF(assessment,patient,doctor,prevAssessment)}>
            📄 Export PDF
          </Btn>
        </div>
      </div>
      <div style={{maxWidth:900,margin:"0 auto",padding:24}}>
        {/* Patient info + score */}
        <Card style={{marginBottom:20,background:"linear-gradient(135deg,#F0FBFF,#F5F0FF)"}}>
          <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
            <div style={{fontSize:48}}>{patient.gender==="ชาย"?"👨":"👩"}</div>
            <div style={{flex:1}}>
              <h2 style={{margin:0,color:C.text}}>{patient.firstName} {patient.lastName}</h2>
              <div style={{color:C.textMid}}>{patient.gender} · อายุ {patient.age} ปี</div>
              <div style={{color:C.textLight,fontSize:13}}>วันที่ประเมิน: {fmtDate(assessment.date)}</div>
              <div style={{color:C.textLight,fontSize:13}}>แพทย์: นพ./พญ. {doctor?.firstName} {doctor?.lastName} (เลข ว. {doctor?.license})</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{position:"relative",width:100,height:100,margin:"0 auto"}}>
                <Ring pct={pct} size={100} stroke={10} color={interp.color}/>
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <div style={{fontSize:26,fontWeight:900,color:interp.color,lineHeight:1}}>{assessment.totalScore}</div>
                  <div style={{fontSize:11,color:C.textLight}}>/{MAX_TOTAL}</div>
                </div>
              </div>
              <div style={{marginTop:8,background:interp.bg,color:interp.color,padding:"4px 12px",borderRadius:99,fontSize:12,fontWeight:700,display:"inline-block"}}>{interp.icon} {interp.label}</div>
            </div>
          </div>
        </Card>
        {/* Comparison */}
        {prevAssessment&&prevInterp&&(
          <Card style={{marginBottom:20,border:`2px solid ${diff>=0?C.green:C.coral}`}}>
            <h3 style={{margin:"0 0 16px",fontSize:15,color:C.text}}>🔄 เปรียบเทียบกับครั้งก่อน ({fmtDate(prevAssessment.date)})</h3>
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              {[{l:"ครั้งก่อน",v:prevAssessment.totalScore,c:prevInterp.color,bg:"#F8FEFF"},
                {l:"ครั้งนี้",v:assessment.totalScore,c:interp.color,bg:"#F8FEFF"},
                {l:"การเปลี่ยนแปลง",v:`${diff>=0?"+":""}${diff}`,sub:diff>0?"ดีขึ้น ↑":diff<0?"แย่ลง ↓":"คงเดิม",c:diff>=0?C.green:C.coral,bg:diff>=0?"#ECFDF5":"#FEF2F2"}].map(item=>(
                <div key={item.l} style={{flex:1,textAlign:"center",padding:14,borderRadius:10,background:item.bg,minWidth:90}}>
                  <div style={{fontSize:11,color:C.textLight}}>{item.l}</div>
                  <div style={{fontSize:28,fontWeight:900,color:item.c}}>{item.v}</div>
                  {item.sub&&<div style={{fontSize:12,color:item.c,fontWeight:700}}>{item.sub}</div>}
                </div>
              ))}
            </div>
          </Card>
        )}
        {/* Domain scores */}
        <Card style={{marginBottom:20}}>
          <h3 style={{margin:"0 0 16px",fontSize:15,color:C.text}}>📊 คะแนนรายด้าน</h3>
          {domains.map(d=>{
            const earned=d.qs.reduce((s,q)=>s+getQScore(assessment,q),0);
            const mx=d.qs.reduce((s,q)=>s+q.max,0);
            const pct=mx>0?(earned/mx)*100:0;
            return(<div key={d.label} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4,color:C.textMid}}>
                <span>{d.label}</span><span style={{fontWeight:700,color:d.c}}>{earned}/{mx}</span>
              </div>
              <div style={{height:8,borderRadius:99,background:C.tealBg}}>
                <div style={{height:"100%",width:`${pct}%`,background:d.c,borderRadius:99,transition:"width .6s"}}/>
              </div>
            </div>);
          })}
        </Card>
        {/* Detail table */}
        <Card style={{marginBottom:20}}>
          <h3 style={{margin:"0 0 16px",fontSize:15,color:C.text}}>📋 คะแนนดิบรายข้อ</h3>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:"#F0FBFF"}}>
                  <th style={{padding:"8px 10px",textAlign:"left",borderBottom:`1px solid ${C.border}`,color:C.textMid}}>ข้อ</th>
                  <th style={{padding:"8px 10px",textAlign:"left",borderBottom:`1px solid ${C.border}`,color:C.textMid}}>หัวข้อ</th>
                  <th style={{padding:"8px 10px",textAlign:"center",borderBottom:`1px solid ${C.border}`,color:C.textMid}}>คะแนน</th>
                  <th style={{padding:"8px 10px",textAlign:"center",borderBottom:`1px solid ${C.border}`,color:C.textMid}}>max</th>
                  {prevAssessment&&<th style={{padding:"8px 10px",textAlign:"center",borderBottom:`1px solid ${C.border}`,color:C.textMid}}>ครั้งก่อน</th>}
                </tr>
              </thead>
              <tbody>
                {Q.map((q,i)=>{
                  const sc=getQScore(assessment,q); const prevSc=prevAssessment?getQScore(prevAssessment,q):null; const d=prevSc!==null?sc-prevSc:null;
                  return(<tr key={q.id} style={{background:i%2===0?"#fff":"#F8FEFF"}}>
                    <td style={{padding:"7px 10px",fontWeight:700,color:C.teal,textAlign:"center"}}>{q.num}</td>
                    <td style={{padding:"7px 10px",color:C.text}}>{q.title}</td>
                    <td style={{padding:"7px 10px",textAlign:"center",fontWeight:700,color:sc===q.max?C.green:sc===0?C.coral:C.text}}>{sc}</td>
                    <td style={{padding:"7px 10px",textAlign:"center",color:C.textLight}}>{q.max}</td>
                    {prevAssessment&&<td style={{padding:"7px 10px",textAlign:"center",color:d>0?C.green:d<0?C.coral:C.textLight,fontWeight:d!==0?700:400}}>{prevSc}{d!==null&&d!==0?` (${d>0?"+":""}${d})`:""}</td>}
                  </tr>);
                })}
                <tr style={{background:"#F0FBFF"}}>
                  <td colSpan={2} style={{padding:"10px",fontWeight:700,color:C.text}}>รวม</td>
                  <td style={{padding:"10px",textAlign:"center",fontWeight:900,fontSize:16,color:interp.color}}>{assessment.totalScore}</td>
                  <td style={{padding:"10px",textAlign:"center",fontWeight:700}}>{MAX_TOTAL}</td>
                  {prevAssessment&&<td style={{padding:"10px",textAlign:"center",fontWeight:700,color:diff>=0?C.green:C.coral}}>{prevAssessment.totalScore} ({diff>=0?"+":""}{diff})</td>}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
        {assessment.notes&&<Card><h3 style={{margin:"0 0 8px",fontSize:14,color:C.textMid}}>📝 บันทึกเพิ่มเติม</h3><p style={{margin:0,color:C.text,fontSize:14,lineHeight:1.7}}>{assessment.notes}</p></Card>}
      </div>
    </div>
  );
};

// ============================================================
// SCREEN: Admin Dashboard
// ============================================================
const AdminDash = ({onBack})=>{
  const [allData,setAllData]=useState(null);
  const [tab,setTab]=useState("overview");
  const [selA,setSelA]=useState(null);
  useEffect(()=>{ (async()=>{ const {data}=await api.getAllData(); setAllData(data); })(); },[]);
  if(!allData) return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><Loader text="กำลังโหลดข้อมูลจาก Google Sheets..."/></div>;
  const {doctors=[],patients=[],assessments=[]}=allData;
  const getDoc=id=>doctors.find(d=>d.id===id)||{firstName:"?",lastName:""};
  const getPat=id=>patients.find(p=>p.id===id)||{firstName:"?",lastName:"",gender:"-",age:"-"};
  const scoreGroups=[
    {label:"สูง (≥63)",min:63,max:78,color:C.green},{label:"ปานกลาง-สูง (47-62)",min:47,max:62,color:"#3B82F6"},
    {label:"ปานกลาง (31-46)",min:31,max:46,color:C.yellow},{label:"ต่ำ (≤30)",min:0,max:30,color:C.coral},
  ];
  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{background:"linear-gradient(135deg,#7C3AED,#4F46E5)",padding:"20px 24px",color:"#fff"}}>
        <div style={{maxWidth:1000,margin:"0 auto",display:"flex",alignItems:"center",gap:12}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:13}}>← กลับ</button>
          <div><div style={{fontSize:12,opacity:0.8}}>⚙️ Admin · ETM</div><h2 style={{margin:0}}>Dashboard ภาพรวม</h2></div>
          <div style={{marginLeft:"auto",fontSize:13,opacity:0.8}}>☁️ Google Sheets</div>
        </div>
      </div>
      <div style={{maxWidth:1000,margin:"0 auto",padding:24}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
          {[{ic:"👨‍⚕️",t:"แพทย์",v:doctors.filter(d=>d.role!=="admin").length,c:C.violet},
            {ic:"👥",t:"ผู้ป่วย",v:patients.length,c:C.teal},{ic:"📝",t:"การประเมิน",v:assessments.length,c:C.orange},
            {ic:"📊",t:"คะแนนเฉลี่ย",v:assessments.length>0?Math.round(assessments.reduce((s,a)=>s+(Number(a.totalScore)||0),0)/assessments.length):"-",c:C.green}].map(s=>(
            <Card key={s.t} style={{textAlign:"center",padding:16,borderTop:`4px solid ${s.c}`}}>
              <div style={{fontSize:28}}>{s.ic}</div>
              <div style={{fontSize:22,fontWeight:900,color:s.c}}>{s.v}</div>
              <div style={{fontSize:12,color:C.textLight}}>{s.t}</div>
            </Card>
          ))}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
          {["overview","doctors","patients","assessments"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 18px",borderRadius:99,border:"none",cursor:"pointer",
              fontSize:13,fontWeight:600,fontFamily:"inherit",background:tab===t?C.violet:"#fff",
              color:tab===t?"#fff":C.textMid,boxShadow:C.sh}}>
              {t==="overview"?"ภาพรวม":t==="doctors"?"แพทย์":t==="patients"?"ผู้ป่วย":"การประเมิน"}
            </button>
          ))}
        </div>
        {tab==="overview"&&(<>
          <Card style={{marginBottom:20}}>
            <h3 style={{margin:"0 0 16px",color:C.text}}>การกระจายคะแนน</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {scoreGroups.map(g=>{
                const cnt=assessments.filter(a=>Number(a.totalScore)>=g.min&&Number(a.totalScore)<=g.max).length;
                const p=assessments.length>0?Math.round((cnt/assessments.length)*100):0;
                return(<div key={g.label} style={{padding:14,borderRadius:10,background:"#F8FEFF",border:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:12,color:C.textMid}}>{g.label}</span>
                    <span style={{fontWeight:700,color:g.color}}>{cnt} ราย</span>
                  </div>
                  <div style={{height:8,borderRadius:99,background:C.border}}>
                    <div style={{height:"100%",width:`${p}%`,background:g.color,borderRadius:99}}/>
                  </div>
                  <div style={{fontSize:11,color:C.textLight,marginTop:4}}>{p}%</div>
                </div>);
              })}
            </div>
          </Card>
          <Card>
            <h3 style={{margin:"0 0 16px",color:C.text}}>คะแนนเฉลี่ยรายข้อ</h3>
            {Q.map(q=>{
              const avg=assessments.length>0?assessments.reduce((s,a)=>s+getQScore(a,q),0)/assessments.length:0;
              const p=(avg/q.max)*100;
              return(<div key={q.id} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                  <span style={{color:C.textMid}}>{q.num}. {q.title.slice(0,28)}</span>
                  <span style={{fontWeight:700,color:p>=80?C.green:p>=50?C.teal:C.coral}}>{avg.toFixed(1)}/{q.max}</span>
                </div>
                <div style={{height:5,borderRadius:99,background:C.tealBg}}>
                  <div style={{height:"100%",width:`${p}%`,background:p>=80?C.green:p>=50?C.teal:C.coral,borderRadius:99}}/>
                </div>
              </div>);
            })}
          </Card>
        </>)}
        {tab==="doctors"&&(<Card>
          <h3 style={{margin:"0 0 16px",color:C.text}}>รายชื่อแพทย์ ({doctors.filter(d=>d.role!=="admin").length} คน)</h3>
          {doctors.filter(d=>d.role!=="admin").map(d=>(<div key={d.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,background:"#F8FEFF",marginBottom:8,border:`1px solid ${C.border}`}}>
            <div style={{width:38,height:38,borderRadius:10,background:GRAD,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700}}>{d.firstName?.[0]}</div>
            <div style={{flex:1}}><div style={{fontWeight:700,color:C.text}}>นพ./พญ. {d.firstName} {d.lastName}</div>
              <div style={{fontSize:12,color:C.textLight}}>เลข ว. {d.license} · {fmtDate(d.createdAt)}</div></div>
            <div style={{textAlign:"right",fontSize:13}}><div style={{color:C.teal,fontWeight:700}}>{patients.filter(p=>p.doctorId===d.id).length} ผู้ป่วย</div>
              <div style={{color:C.textLight}}>{assessments.filter(a=>a.doctorId===d.id).length} การประเมิน</div></div>
          </div>))}
        </Card>)}
        {tab==="patients"&&(<Card>
          <h3 style={{margin:"0 0 16px",color:C.text}}>รายชื่อผู้ป่วย ({patients.length} ราย)</h3>
          {patients.map(p=>{
            const lastA=assessments.filter(a=>a.patientId===p.id).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
            const doc=getDoc(p.doctorId);
            return(<div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,background:"#F8FEFF",marginBottom:8,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:24}}>{p.gender==="ชาย"?"👨":"👩"}</div>
              <div style={{flex:1}}><div style={{fontWeight:700,color:C.text}}>{p.firstName} {p.lastName}</div>
                <div style={{fontSize:12,color:C.textLight}}>{p.gender} · {p.age} ปี · แพทย์: {doc.firstName} {doc.lastName}</div>
                <div style={{fontSize:12,color:C.textLight}}>ประเมิน {assessments.filter(a=>a.patientId===p.id).length} ครั้ง{lastA?` · ล่าสุด: ${fmtDate(lastA.date)}`:""}</div></div>
              {lastA&&(<div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:900,color:getInterp(Number(lastA.totalScore)).color}}>{lastA.totalScore}</div><div style={{fontSize:11,color:C.textLight}}>/{MAX_TOTAL}</div></div>)}
            </div>);
          })}
        </Card>)}
        {tab==="assessments"&&(selA?(<div>
          <Btn sm variant="outline" onClick={()=>setSelA(null)} style={{marginBottom:16}}>← กลับรายการ</Btn>
          <Card>
            {(()=>{
              const p=getPat(selA.patientId); const d=getDoc(selA.doctorId); const interp=getInterp(Number(selA.totalScore));
              return(<>
                <div style={{background:"#F0FBFF",borderRadius:10,padding:14,marginBottom:16,fontSize:14}}>
                  <div><b>ผู้ป่วย:</b> {p.firstName} {p.lastName} ({p.gender}, {p.age} ปี)</div>
                  <div><b>แพทย์:</b> {d.firstName} {d.lastName} (เลข ว. {d.license})</div>
                  <div><b>วันที่:</b> {fmtDate(selA.date)}</div>
                  <div><b>คะแนนรวม:</b> <span style={{color:interp.color,fontWeight:700}}>{selA.totalScore}/{MAX_TOTAL}</span> — {interp.label}</div>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{background:"#F0FBFF"}}><th style={{padding:"8px 10px"}}>ข้อ</th><th style={{padding:"8px 10px"}}>หัวข้อ</th><th style={{padding:"8px 10px",textAlign:"center"}}>คะแนน</th><th style={{padding:"8px 10px",textAlign:"center"}}>max</th></tr></thead>
                  <tbody>
                    {Q.map((q,i)=>{
                      const sc=getQScore(selA,q);
                      return(<tr key={q.id} style={{background:i%2===0?"#fff":"#F8FEFF"}}>
                        <td style={{padding:"7px 10px",color:C.teal,fontWeight:700,textAlign:"center"}}>{q.num}</td>
                        <td style={{padding:"7px 10px"}}>{q.title}</td>
                        <td style={{padding:"7px 10px",textAlign:"center",fontWeight:700,color:sc===q.max?C.green:sc===0?C.coral:C.text}}>{sc}</td>
                        <td style={{padding:"7px 10px",textAlign:"center",color:C.textLight}}>{q.max}</td>
                      </tr>);
                    })}
                    <tr style={{background:"#F0FBFF",fontWeight:700}}>
                      <td colSpan={2} style={{padding:"10px"}}>รวม</td>
                      <td style={{padding:"10px",textAlign:"center",color:interp.color,fontSize:15}}>{selA.totalScore}</td>
                      <td style={{padding:"10px",textAlign:"center"}}>{MAX_TOTAL}</td>
                    </tr>
                  </tbody>
                </table>
                {selA.notes&&<div style={{marginTop:12,padding:12,background:"#FFFBEB",borderRadius:8,fontSize:13}}>📝 {selA.notes}</div>}
                <div style={{marginTop:16}}>
                  <Btn sm onClick={()=>exportPDF(selA,p,d,null)}>📄 Export PDF รายการนี้</Btn>
                </div>
              </>);
            })()}
          </Card>
        </div>):(<Card>
          <h3 style={{margin:"0 0 16px",color:C.text}}>การประเมินทั้งหมด ({assessments.length} ครั้ง)</h3>
          {[...assessments].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(a=>{
            const p=getPat(a.patientId); const d=getDoc(a.doctorId); const interp=getInterp(Number(a.totalScore));
            return(<div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,background:"#F8FEFF",marginBottom:8,border:`1px solid ${C.border}`,cursor:"pointer"}}
              onClick={()=>setSelA(a)} onMouseEnter={e=>e.currentTarget.style.background="#EFF9FC"} onMouseLeave={e=>e.currentTarget.style.background="#F8FEFF"}>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,color:C.text}}>{p.firstName} {p.lastName}</div>
                <div style={{fontSize:12,color:C.textLight}}>แพทย์: {d.firstName} {d.lastName} · {fmtDate(a.date)}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:18,fontWeight:900,color:interp.color}}>{a.totalScore}/{MAX_TOTAL}</div>
                <div style={{fontSize:11,background:interp.bg,color:interp.color,padding:"2px 8px",borderRadius:99}}>{interp.label}</div>
              </div>
              <div style={{color:C.textLight}}>›</div>
            </div>);
          })}
        </Card>))}
      </div>
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================
export default function App(){
  const [screen,setScreen]=useState("landing");
  const [doctor,setDoctor]=useState(null);
  const [patient,setPatient]=useState(null);
  const [assessment,setAssessment]=useState(null);
  const [prevAssessment,setPrevAssessment]=useState(null);
  useEffect(()=>{
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;600;700;900&display=swap";
    document.head.appendChild(link);
    document.body.style.fontFamily="'Noto Sans Thai',sans-serif";
    document.body.style.margin="0";
    document.body.style.background=C.bg;
  },[]);
  const go=sc=>setScreen(sc);
  if(screen==="landing") return <Landing onLogin={()=>go("login")} onRegister={()=>go("register")} onAdmin={()=>go("adminLogin")}/>;
  if(screen==="register") return <Register onBack={()=>go("landing")} onSuccess={d=>{setDoctor(d);go("dashboard");}}/>;
  if(screen==="login") return <Login onBack={()=>go("landing")} onSuccess={d=>{setDoctor(d);go("dashboard");}}/>;
  if(screen==="adminLogin") return <AdminLogin onBack={()=>go("landing")} onSuccess={()=>go("admin")}/>;
  if(screen==="admin") return <AdminDash onBack={()=>go("landing")}/>;
  if(screen==="dashboard") return <Dashboard doctor={doctor} onLogout={()=>{setDoctor(null);go("landing");}} onNewPatient={()=>go("newPatient")} onSelectPatient={p=>{setPatient(p);go("patientDetail");}} onAdmin={()=>go("adminLogin")}/>;
  if(screen==="newPatient") return <NewPatient doctor={doctor} onBack={()=>go("dashboard")} onSuccess={p=>{setPatient(p);go("assessment");}}/>;
  if(screen==="patientDetail") return <PatientDetail patient={patient} doctor={doctor} onBack={()=>go("dashboard")} onNewAssessment={()=>go("assessment")} onViewAssessment={(a,prev)=>{setAssessment(a);setPrevAssessment(prev);go("results");}}/>;
  if(screen==="assessment") return <AssessmentForm patient={patient} doctor={doctor} onBack={()=>go("patientDetail")} onSave={async(rec)=>{const as=await api.getAssessments(patient.id);const sorted=(as.data||[]).filter(a=>a.id!==rec.id).sort((a,b)=>new Date(b.date)-new Date(a.date));setAssessment(rec);setPrevAssessment(sorted[0]||null);go("results");}}/>;
  if(screen==="results") return <Results assessment={assessment} prevAssessment={prevAssessment} patient={patient} doctor={doctor} onBack={()=>go("patientDetail")}/>;
  return null;
}

