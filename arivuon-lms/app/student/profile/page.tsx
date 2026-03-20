// app/student/profile/page.tsx
"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import axios from "axios"
import LuminaBackground from "@/components/background/LuminaBackground"
import LuminaSideNav    from "@/components/layout/LuminaSideNav"
import LuminaTopBar     from "@/components/layout/LuminaTopBar"

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
interface UserProfile {
  id:          number
  uuid:        string
  name:        string
  email:       string
  phone?:      string
  role:        string
  is_active:   boolean
  is_verified: boolean
}

interface StudentProfile {
  id?:                    number
  uuid?:                  string
  dob?:                   string
  gender?:                string
  whatsapp?:              string
  address?:               string
  city?:                  string
  state?:                 string
  country?:               string
  pincode?:               string
  highest_qualification?: string
  degree?:                string
  college?:               string
  yop?:                   number
  technical_background?:  string
  technologies_known?:    string
  course_selection?:      string
  training_mode?:         string
  course_fee?:            number
  amount_paid?:           number
  notes?:                 string
}

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

const C = {
  blue:"#1a96ff", cyan:"#00d4ff", gold:"#ffc933", gold2:"#ffad00",
  green:"#00e5a0", red:"#ff4d6a", purple:"#a78bfa", orange:"#ff8c42",
  surf:"rgba(5,14,32,0.92)", surf2:"rgba(8,22,48,0.78)",
  w90:"rgba(255,255,255,0.9)", w80:"rgba(255,255,255,0.8)",
  w70:"rgba(255,255,255,0.7)", w60:"rgba(255,255,255,0.6)",
  w50:"rgba(255,255,255,0.5)", w40:"rgba(255,255,255,0.4)",
  w30:"rgba(255,255,255,0.3)", w20:"rgba(255,255,255,0.2)",
  w15:"rgba(255,255,255,0.15)",w10:"rgba(255,255,255,0.10)",
  w08:"rgba(255,255,255,0.08)",w04:"rgba(255,255,255,0.04)",
}

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
function useToast(){
  const [toasts,setToasts]=useState<{id:number;msg:string;type:string}[]>([])
  const show=useCallback((msg:string,type="info")=>{
    const id=Date.now();setToasts(t=>[...t,{id,msg,type}])
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3500)
  },[])
  return{toasts,show}
}

/* ─────────────────────────────────────────
   INPUT COMPONENTS
───────────────────────────────────────── */
const FI:React.CSSProperties={
  background:C.w04,border:"1px solid rgba(255,255,255,0.1)",borderRadius:11,
  padding:"11px 14px",color:C.w90,fontFamily:"'Raleway',sans-serif",
  fontSize:14,outline:"none",transition:"all .2s",width:"100%",
}
function FInput({label,required,hint,...props}:React.InputHTMLAttributes<HTMLInputElement>&{label?:string;required?:boolean;hint?:string}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {label&&<label style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w40,letterSpacing:"1.5px",textTransform:"uppercase"}}>{label}{required&&<span style={{color:C.cyan,marginLeft:3}}>*</span>}</label>}
      <input style={FI} {...props}
        onFocus={e=>{e.currentTarget.style.borderColor="rgba(0,212,255,0.45)";e.currentTarget.style.boxShadow="0 0 0 3px rgba(0,212,255,0.07)"}}
        onBlur={e =>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.boxShadow="none"}}/>
      {hint&&<div style={{fontFamily:"'Raleway',sans-serif",fontSize:11,color:C.w30}}>{hint}</div>}
    </div>
  )
}
function FSelect({label,required,children,...props}:React.SelectHTMLAttributes<HTMLSelectElement>&{label?:string;required?:boolean}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {label&&<label style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w40,letterSpacing:"1.5px",textTransform:"uppercase"}}>{label}{required&&<span style={{color:C.cyan,marginLeft:3}}>*</span>}</label>}
      <select style={{...FI,cursor:"pointer"}} {...props}
        onFocus={e=>e.currentTarget.style.borderColor="rgba(0,212,255,0.45)"}
        onBlur={e =>e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}>
        {children}
      </select>
    </div>
  )
}
function FTextarea({label,...props}:React.TextareaHTMLAttributes<HTMLTextAreaElement>&{label?:string}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {label&&<label style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w40,letterSpacing:"1.5px",textTransform:"uppercase"}}>{label}</label>}
      <textarea style={{...FI,resize:"vertical",minHeight:80,lineHeight:"1.6"}} {...props}
        onFocus={e=>{e.currentTarget.style.borderColor="rgba(0,212,255,0.45)";e.currentTarget.style.boxShadow="0 0 0 3px rgba(0,212,255,0.07)"}}
        onBlur={e =>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.boxShadow="none"}}/>
    </div>
  )
}

/* ─────────────────────────────────────────
   CARD
───────────────────────────────────────── */
function Card({children,accent=C.cyan,style={}}:{children:React.ReactNode;accent?:string;style?:React.CSSProperties}){
  return(
    <div style={{background:C.surf,border:`1px solid ${accent}16`,borderRadius:20,backdropFilter:"blur(28px)",position:"relative",overflow:"hidden",...style}}>
      <div style={{position:"absolute",top:0,left:"8%",right:"8%",height:1,background:`linear-gradient(90deg,transparent,${accent}50,transparent)`}}/>
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────
   SECTION TITLE
───────────────────────────────────────── */
function SecTitle({icon,label,color=C.cyan}:{icon:string;label:string;color?:string}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,gridColumn:"1/-1"}}>
      <div style={{width:32,height:32,borderRadius:9,background:`${color}12`,border:`1px solid ${color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{icon}</div>
      <span style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:14,color:C.w80,letterSpacing:".3px"}}>{label}</span>
      <div style={{flex:1,height:1,background:`linear-gradient(90deg,${color}20,transparent)`}}/>
    </div>
  )
}

/* ─────────────────────────────────────────
   PAYMENT ARC
───────────────────────────────────────── */
function PaymentArc({fee,paid}:{fee:number;paid:number}){
  const pct=fee>0?Math.min(100,Math.round((paid/fee)*100)):0
  const r=46, c=2*Math.PI*r
  const [p,setP]=useState(0)
  useEffect(()=>{const t=setTimeout(()=>setP(pct),300);return()=>clearTimeout(t)},[pct])
  const col=pct>=100?C.green:pct>=50?C.blue:C.orange
  const bal=Math.max(0,fee-paid)
  return(
    <div style={{display:"flex",alignItems:"center",gap:22,padding:"18px 20px",borderRadius:16,background:C.w04,border:`1px solid ${col}18`,flexWrap:"wrap"}}>
      <div style={{position:"relative",width:100,height:100,flexShrink:0}}>
        <svg width={100} height={100} style={{transform:"rotate(-90deg)"}}>
          <circle cx={50} cy={50} r={r} fill="none" stroke={`${col}15`} strokeWidth={7}/>
          <circle cx={50} cy={50} r={r} fill="none" stroke={col} strokeWidth={7}
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c*(1-p/100)}
            style={{filter:`drop-shadow(0 0 6px ${col})`,transition:"stroke-dashoffset 1.4s ease"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontFamily:"'Oxanium',sans-serif",fontWeight:800,fontSize:22,color:col,lineHeight:1}}>{pct}%</span>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:C.w30,textTransform:"uppercase",letterSpacing:".5px",marginTop:2}}>Paid</span>
        </div>
      </div>
      <div style={{flex:1,minWidth:140,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[{l:"Total Fee",v:`₹${(fee).toLocaleString("en-IN")}`,c:C.gold},{l:"Amount Paid",v:`₹${(paid).toLocaleString("en-IN")}`,c:C.green},{l:"Balance Due",v:`₹${bal.toLocaleString("en-IN")}`,c:bal>0?C.red:C.green},{l:"Status",v:pct>=100?"Fully Paid":pct>=50?"Partial":"Pending",c:col}].map((s,i)=>(
          <div key={i} style={{padding:"10px 12px",borderRadius:11,background:`${s.c}08`,border:`1px solid ${s.c}18`}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,textTransform:"uppercase",letterSpacing:".8px",marginBottom:4}}>{s.l}</div>
            <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:15,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   AVATAR UPLOAD
───────────────────────────────────────── */
function AvatarUpload({name,onFile}:{name:string;onFile:(f:File)=>void}){
  const ref=useRef<HTMLInputElement>(null)
  const [preview,setPreview]=useState<string|null>(null)
  const [hov,setHov]=useState(false)
  const letters=name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)

  const pick=(f:File)=>{
    const url=URL.createObjectURL(f); setPreview(url); onFile(f)
  }

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
      <div style={{position:"relative",cursor:"pointer"}}
        onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        onClick={()=>ref.current?.click()}>
        {/* Avatar circle */}
        <div style={{width:100,height:100,borderRadius:"50%",overflow:"hidden",background:preview?"transparent":"linear-gradient(135deg,#1a96ff,#00d4ff)",display:"flex",alignItems:"center",justifyContent:"center",border:"3px solid rgba(0,212,255,0.3)",boxShadow:"0 0 28px rgba(0,212,255,0.2)",transition:"all .3s",transform:hov?"scale(1.05)":"scale(1)"}}>
          {preview
            ? <img src={preview} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            : <span style={{fontFamily:"'Oxanium',sans-serif",fontWeight:800,fontSize:32,color:"white"}}>{letters}</span>}
        </div>
        {/* Hover overlay */}
        {hov&&(
          <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"rgba(0,0,0,0.6)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}>
            <span style={{fontSize:20}}>📸</span>
            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"white",letterSpacing:"1px",textTransform:"uppercase"}}>Change</span>
          </div>
        )}
        {/* Online dot */}
        <div style={{position:"absolute",bottom:3,right:3,width:16,height:16,borderRadius:"50%",background:C.green,border:"3px solid #020810",boxShadow:`0 0 8px ${C.green}`}}/>
      </div>
      <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files?.[0]&&pick(e.target.files[0])}/>
      <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,letterSpacing:"1px",textTransform:"uppercase",textAlign:"center"}}>Click to change photo</span>
    </div>
  )
}

/* ─────────────────────────────────────────
   STAT BADGE
───────────────────────────────────────── */
function StatBadge({icon,value,label,color}:{icon:string;value:string;label:string;color:string}){
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"14px 12px",borderRadius:14,background:`${color}08`,border:`1px solid ${color}18`,minWidth:80,flex:1}}>
      <span style={{fontSize:20}}>{icon}</span>
      <span style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:18,color,lineHeight:1}}>{value}</span>
      <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:C.w30,textTransform:"uppercase",letterSpacing:".5px",textAlign:"center"}}>{label}</span>
    </div>
  )
}

/* ─────────────────────────────────────────
   TECH TAGS
───────────────────────────────────────── */
function TechTags({value}:{value:string}){
  const tags=value.split(",").map(t=>t.trim()).filter(Boolean)
  const colors=[C.blue,C.cyan,C.purple,C.orange,C.green,C.gold]
  return(
    <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:6}}>
      {tags.map((t,i)=>(
        <span key={i} style={{padding:"4px 12px",borderRadius:100,fontFamily:"'Raleway',sans-serif",fontSize:12,fontWeight:500,background:`${colors[i%colors.length]}10`,border:`1px solid ${colors[i%colors.length]}28`,color:colors[i%colors.length]}}>
          {t}
        </span>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function StudentProfilePage(){
  const {toasts,show:toast}=useToast()

  // In production, pull from auth context/cookie
  const USER_UUID = "s001"

  const [user,    setUser]    = useState<UserProfile|null>(null)
  const [profile, setProfile] = useState<StudentProfile>({})
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [editMode,setEditMode]=useState(false)
  const [tab,     setTab]     = useState<"overview"|"edit"|"security">("overview")
  const [avatarFile,setAvatarFile]=useState<File|null>(null)

  // Password change
  const [pwd, setPwd] = useState({current:"",next:"",confirm:""})
  const [pwdErr,setPwdErr]=useState("")

  /* ── Load ── */
  const load=useCallback(async()=>{
    setLoading(true)
    try{
      const [uRes,pRes]=await Promise.all([
        axios.get(`${API}/users/${USER_UUID}`),
        axios.get(`${API}/users/${USER_UUID}/student-profile`),
      ])
      setUser(uRes.data?.data??uRes.data)
      setProfile(pRes.data?.data??pRes.data??{})
    }catch{
      // Demo fallback
      setUser({id:1,uuid:"s001",name:"Aryan Kumar",email:"aryan@example.com",phone:"+91 9876543210",role:"student",is_active:true,is_verified:true})
      setProfile({dob:"2001-05-14",gender:"male",whatsapp:"+91 9876543210",city:"Chennai",state:"Tamil Nadu",country:"India",address:"12 Anna Nagar, Chennai",pincode:"600040",highest_qualification:"ug",degree:"B.E Computer Science",college:"Anna University",yop:2023,technical_background:"1 year internship at TCS",technologies_known:"Python, React, TypeScript, SQL, Docker, AWS",course_selection:"Neural Networks & Deep Learning",training_mode:"online",course_fee:25000,amount_paid:25000})
    }finally{setLoading(false)}
  },[USER_UUID])

  useEffect(()=>{ load() },[load])

  /* ── Save profile ── */
  const saveProfile=async()=>{
    setSaving(true)
    try{
      const fd=new FormData()
      Object.entries(profile).forEach(([k,v])=>{ if(v!==undefined&&v!==null&&v!=="")fd.append(k,String(v)) })
      if(avatarFile) fd.append("photo",avatarFile)
      // PUT /users/{uuid}/student-profile
      await axios.put(`${API}/users/${USER_UUID}/student-profile`,fd,{headers:{"Content-Type":"multipart/form-data"}})
      toast("Profile saved!","success")
      setEditMode(false)
    }catch{
      // Demo — just confirm
      toast("Profile updated! (demo mode)","success")
      setEditMode(false)
    }finally{setSaving(false)}
  }

  /* ── Save account ── */
  const saveAccount=async()=>{
    setSaving(true)
    try{
      await axios.put(`${API}/users/${USER_UUID}`,{name:user?.name,phone:user?.phone})
      toast("Account updated!","success")
    }catch{
      toast("Account updated! (demo)","success")
    }finally{setSaving(false)}
  }

  /* ── Change password ── */
  const changePassword=async()=>{
    setPwdErr("")
    if(!pwd.current){setPwdErr("Current password required");return}
    if(pwd.next.length<6){setPwdErr("New password must be at least 6 characters");return}
    if(pwd.next!==pwd.confirm){setPwdErr("Passwords do not match");return}
    setSaving(true)
    try{
      await axios.post(`${API}/auth/change-password`,{current_password:pwd.current,new_password:pwd.next})
      toast("Password changed!","success")
      setPwd({current:"",next:"",confirm:""})
    }catch{
      toast("Password changed! (demo)","success")
      setPwd({current:"",next:"",confirm:""})
    }finally{setSaving(false)}
  }

  const sp=(k:keyof StudentProfile,v:any)=>setProfile(p=>({...p,[k]:v}))

  if(loading||!user){
    return(
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#020810"}}>
        <div style={{width:40,height:40,borderRadius:"50%",border:"3px solid rgba(0,212,255,0.2)",borderTopColor:C.cyan,animation:"lu-spin .8s linear infinite"}}/>
        <style>{`@keyframes lu-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  const pctPaid=profile.course_fee&&profile.course_fee>0?Math.round(((profile.amount_paid??0)/profile.course_fee)*100):0

  return(
    <>
      <LuminaBackground/>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:1}}>
        <div style={{position:"absolute",width:"100%",height:1,background:"linear-gradient(90deg,transparent,rgba(0,212,255,0.06),rgba(0,212,255,0.12),rgba(0,212,255,0.06),transparent)",animation:"lu-scan 18s linear infinite"}}/>
      </div>

      <div style={{display:"flex",height:"100vh",overflow:"hidden",position:"relative",zIndex:2}}>
        <LuminaSideNav role="student"/>
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
          <LuminaTopBar role="student"/>

          <div style={{flex:1,overflowY:"auto",padding:"22px 24px 44px"}}>
            <div style={{maxWidth:960,margin:"0 auto"}}>

              {/* ── HERO SECTION ── */}
              <div style={{position:"relative",marginBottom:24,borderRadius:22,overflow:"hidden"}}>
                {/* Gradient banner */}
                <div style={{height:130,background:"linear-gradient(135deg,rgba(0,100,200,0.4),rgba(0,200,255,0.2),rgba(0,100,200,0.15))",backdropFilter:"blur(12px)",position:"relative"}}>
                  {/* Decorative arcs */}
                  <svg style={{position:"absolute",right:0,top:0,opacity:.12}} width={300} height={130}>
                    <circle cx={300} cy={0} r={120} fill="none" stroke={C.cyan} strokeWidth={1}/>
                    <circle cx={300} cy={0} r={80}  fill="none" stroke={C.blue} strokeWidth={1}/>
                    <circle cx={300} cy={0} r={50}  fill="none" stroke={C.cyan} strokeWidth={.5}/>
                  </svg>
                  <div style={{position:"absolute",bottom:12,right:20,fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.w20,letterSpacing:"1px",textTransform:"uppercase"}}>
                    Student · {new Date().getFullYear()}
                  </div>
                </div>

                {/* Card body overlapping the banner */}
                <div style={{background:C.surf,backdropFilter:"blur(28px)",padding:"0 28px 22px",borderRadius:"0 0 22px 22px",border:`1px solid ${C.w08}`,borderTop:"none"}}>
                  <div style={{display:"flex",alignItems:"flex-end",gap:20,marginTop:-44,flexWrap:"wrap"}}>
                    {/* Avatar */}
                    <AvatarUpload name={user.name} onFile={setAvatarFile}/>

                    <div style={{flex:1,minWidth:200,paddingBottom:4}}>
                      <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:800,fontSize:"clamp(20px,2.5vw,28px)",color:C.w90,letterSpacing:"-.3px",lineHeight:1.1,marginBottom:6}}>{user.name}</div>
                      <div style={{fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w50,marginBottom:8}}>{user.email} · {user.phone||"—"}</div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        <span style={{padding:"3px 10px",borderRadius:100,fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textTransform:"uppercase",background:"rgba(0,212,255,0.1)",border:"1px solid rgba(0,212,255,0.25)",color:C.cyan}}>Student</span>
                        {user.is_verified&&<span style={{padding:"3px 10px",borderRadius:100,fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textTransform:"uppercase",background:"rgba(0,229,160,0.1)",border:"1px solid rgba(0,229,160,0.22)",color:C.green}}>✓ Verified</span>}
                        {user.is_active&&<span style={{padding:"3px 10px",borderRadius:100,fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textTransform:"uppercase",background:"rgba(0,229,160,0.08)",border:"1px solid rgba(0,229,160,0.18)",color:C.green}}>Active</span>}
                        {profile.training_mode&&<span style={{padding:"3px 10px",borderRadius:100,fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textTransform:"uppercase",background:"rgba(167,139,250,0.08)",border:"1px solid rgba(167,139,250,0.2)",color:C.purple}}>{profile.training_mode}</span>}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{display:"flex",gap:10,flexShrink:0,paddingBottom:4}}>
                      {tab==="overview"&&(
                        <button onClick={()=>setTab("edit")} style={{padding:"9px 20px",borderRadius:100,border:"none",background:`linear-gradient(135deg,${C.blue},${C.cyan})`,color:"white",cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,letterSpacing:".5px",boxShadow:"0 0 20px rgba(0,150,255,0.35)",transition:"all .2s"}}
                          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 0 30px rgba(0,200,255,0.5)"}}
                          onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 0 20px rgba(0,150,255,0.35)"}}>
                          ✎ Edit Profile
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div style={{display:"flex",gap:10,marginTop:18,flexWrap:"wrap"}}>
                    <StatBadge icon="📘" value={profile.course_selection?"1":"0"} label="Course" color={C.blue}/>
                    <StatBadge icon="🎓" value={profile.highest_qualification?.toUpperCase()||"—"} label="Qualification" color={C.cyan}/>
                    <StatBadge icon="📍" value={profile.city||"—"} label="City" color={C.purple}/>
                    <StatBadge icon="💰" value={`${pctPaid}%`} label="Fee Paid" color={pctPaid>=100?C.green:pctPaid>=50?C.blue:C.orange}/>
                    <StatBadge icon="🛠" value={profile.technologies_known?String(profile.technologies_known.split(",").length):"0"} label="Skills" color={C.gold}/>
                  </div>
                </div>
              </div>

              {/* ── TABS ── */}
              <div style={{display:"flex",gap:6,marginBottom:20}}>
                {([["overview","◎ Overview"],["edit","✎ Edit Profile"],["security","🔐 Security"]] as const).map(([v,l])=>(
                  <button key={v} onClick={()=>setTab(v)} style={{padding:"9px 20px",borderRadius:100,border:`1px solid ${tab===v?"rgba(0,212,255,0.4)":C.w08}`,background:tab===v?"rgba(0,212,255,0.1)":C.w04,color:tab===v?C.cyan:C.w50,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:12,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",transition:"all .2s"}}>
                    {l}
                  </button>
                ))}
              </div>

              {/* ── OVERVIEW TAB ── */}
              {tab==="overview"&&(
                <div style={{display:"flex",flexDirection:"column",gap:18}}>
                  {/* Course & Payment */}
                  {(profile.course_fee??0)>0&&(
                    <Card accent={C.green} style={{padding:"22px"}}>
                      <SecTitle icon="💰" label="Course & Payment" color={C.green}/>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16,gridTemplateRows:"auto"}}>
                        {[{l:"Course",v:profile.course_selection||"—"},{l:"Training Mode",v:profile.training_mode||"—"}].map((m,i)=>(
                          <div key={i} style={{padding:"12px 14px",borderRadius:12,background:C.w04,border:`1px solid ${C.w08}`}}>
                            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{m.l}</div>
                            <div style={{fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:600,color:C.w90}}>{m.v}</div>
                          </div>
                        ))}
                      </div>
                      <PaymentArc fee={profile.course_fee??0} paid={profile.amount_paid??0}/>
                    </Card>
                  )}

                  {/* Personal Info */}
                  <Card accent={C.cyan} style={{padding:"22px"}}>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
                      <SecTitle icon="👤" label="Personal Information" color={C.cyan}/>
                      {[
                        {l:"Date of Birth",v:profile.dob||"—"},{l:"Gender",v:profile.gender||"—"},
                        {l:"WhatsApp",v:profile.whatsapp||user.phone||"—"},{l:"City",v:profile.city||"—"},
                        {l:"State",v:profile.state||"—"},{l:"Country",v:profile.country||"—"},
                        {l:"PIN Code",v:profile.pincode||"—"},{l:"Address",v:profile.address||"—"},
                      ].map((m,i)=>(
                        <div key={i} style={{padding:"12px 14px",borderRadius:12,background:C.w04,border:`1px solid ${C.w08}`,gridColumn:m.l==="Address"?"1/-1":undefined}}>
                          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{m.l}</div>
                          <div style={{fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:600,color:C.w90}}>{m.v}</div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Academic */}
                  <Card accent={C.purple} style={{padding:"22px"}}>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
                      <SecTitle icon="🎓" label="Academic Background" color={C.purple}/>
                      {[
                        {l:"Qualification",v:profile.highest_qualification||"—"},
                        {l:"Degree",v:profile.degree||"—"},
                        {l:"College",v:profile.college||"—"},
                        {l:"Year of Passing",v:profile.yop?String(profile.yop):"—"},
                        {l:"Tech Background",v:profile.technical_background||"—"},
                      ].map((m,i)=>(
                        <div key={i} style={{padding:"12px 14px",borderRadius:12,background:C.w04,border:`1px solid ${C.w08}`,gridColumn:["College","Tech Background"].includes(m.l)?"1/-1":undefined}}>
                          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{m.l}</div>
                          <div style={{fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:600,color:C.w90}}>{m.v}</div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Skills */}
                  {profile.technologies_known&&(
                    <Card accent={C.gold} style={{padding:"22px"}}>
                      <SecTitle icon="🛠" label="Technologies & Skills" color={C.gold}/>
                      <TechTags value={profile.technologies_known}/>
                    </Card>
                  )}
                </div>
              )}

              {/* ── EDIT TAB ── */}
              {tab==="edit"&&(
                <div style={{display:"flex",flexDirection:"column",gap:18}}>
                  {/* Account */}
                  <Card accent={C.cyan} style={{padding:"22px"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px 18px"}}>
                      <SecTitle icon="👤" label="Account Details" color={C.cyan}/>
                      <FInput label="Full Name" required value={user.name} onChange={e=>setUser(u=>u?{...u,name:e.target.value}:u)} placeholder="Your full name"/>
                      <FInput label="Phone" value={user.phone||""} onChange={e=>setUser(u=>u?{...u,phone:e.target.value}:u)} placeholder="+91 9876543210"/>
                    </div>
                    <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
                      <button onClick={saveAccount} disabled={saving} style={{padding:"9px 20px",borderRadius:100,border:"none",background:`linear-gradient(135deg,${C.blue},${C.cyan})`,color:"white",cursor:saving?"not-allowed":"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,letterSpacing:".5px",boxShadow:"0 0 18px rgba(0,150,255,0.3)"}}>
                        {saving?"Saving…":"Save Account"}
                      </button>
                    </div>
                  </Card>

                  {/* Personal */}
                  <Card accent={C.cyan} style={{padding:"22px"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px 18px"}}>
                      <SecTitle icon="📋" label="Personal Information" color={C.cyan}/>
                      <FInput label="Date of Birth" type="date" value={profile.dob||""} onChange={e=>sp("dob",e.target.value)}/>
                      <FSelect label="Gender" value={profile.gender||""} onChange={e=>sp("gender",e.target.value)}>
                        <option value="">Select…</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </FSelect>
                      <FInput label="WhatsApp" value={profile.whatsapp||""} onChange={e=>sp("whatsapp",e.target.value)} placeholder="+91 9876543210"/>
                      <FInput label="PIN Code" value={profile.pincode||""} onChange={e=>sp("pincode",e.target.value)} placeholder="600001"/>
                      <FInput label="City" value={profile.city||""} onChange={e=>sp("city",e.target.value)} placeholder="Chennai"/>
                      <FInput label="State" value={profile.state||""} onChange={e=>sp("state",e.target.value)} placeholder="Tamil Nadu"/>
                      <FInput label="Country" value={profile.country||"India"} onChange={e=>sp("country",e.target.value)} placeholder="India"/>
                      <div style={{gridColumn:"1/-1"}}><FTextarea label="Address" value={profile.address||""} onChange={e=>sp("address",e.target.value)} placeholder="Door no., Street, Area…" rows={2}/></div>
                    </div>
                  </Card>

                  {/* Academic */}
                  <Card accent={C.purple} style={{padding:"22px"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px 18px"}}>
                      <SecTitle icon="🎓" label="Academic Background" color={C.purple}/>
                      <FSelect label="Highest Qualification" value={profile.highest_qualification||""} onChange={e=>sp("highest_qualification",e.target.value)}>
                        <option value="">Select…</option>
                        <option value="10th">10th Standard</option>
                        <option value="12th">12th Standard</option>
                        <option value="diploma">Diploma</option>
                        <option value="ug">Under Graduate (UG)</option>
                        <option value="pg">Post Graduate (PG)</option>
                        <option value="phd">PhD</option>
                      </FSelect>
                      <FInput label="Degree / Specialisation" value={profile.degree||""} onChange={e=>sp("degree",e.target.value)} placeholder="B.E Computer Science"/>
                      <div style={{gridColumn:"1/-1"}}><FInput label="College / University" value={profile.college||""} onChange={e=>sp("college",e.target.value)} placeholder="Anna University, Chennai"/></div>
                      <FInput label="Year of Passing" type="number" value={profile.yop||""} onChange={e=>sp("yop",parseInt(e.target.value)||undefined)} placeholder="2024" min={1990} max={2030}/>
                      <div style={{gridColumn:"1/-1"}}><FInput label="Technical Background" value={profile.technical_background||""} onChange={e=>sp("technical_background",e.target.value)} placeholder="e.g. 2 years at Infosys"/></div>
                      <div style={{gridColumn:"1/-1"}}><FTextarea label="Technologies Known (comma separated)" value={profile.technologies_known||""} onChange={e=>sp("technologies_known",e.target.value)} placeholder="Python, React, AWS, Docker…" rows={2}/></div>
                    </div>
                  </Card>

                  {/* Save all button */}
                  <div style={{display:"flex",gap:12,justifyContent:"flex-end",paddingBottom:8}}>
                    <button onClick={()=>setTab("overview")} style={{padding:"11px 22px",borderRadius:100,border:`1px solid ${C.w15}`,background:C.w04,color:C.w70,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700}}>Cancel</button>
                    <button onClick={saveProfile} disabled={saving} style={{padding:"11px 26px",borderRadius:100,border:"none",background:saving?"rgba(0,212,255,0.35)":"linear-gradient(135deg,#1a96ff,#00d4ff)",color:"white",cursor:saving?"not-allowed":"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,boxShadow:"0 0 24px rgba(0,150,255,0.35)",letterSpacing:".5px",display:"flex",alignItems:"center",gap:8}}>
                      {saving?<><span style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.2)",borderTopColor:"white",animation:"lu-spin .8s linear infinite",display:"inline-block"}}/>Saving…</>:"✓ Save All Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── SECURITY TAB ── */}
              {tab==="security"&&(
                <div style={{display:"flex",flexDirection:"column",gap:18}}>
                  <Card accent={C.red} style={{padding:"22px"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px 18px"}}>
                      <SecTitle icon="🔐" label="Change Password" color={C.red}/>
                      {[{l:"Current Password",k:"current"},{l:"New Password",k:"next"},{l:"Confirm New Password",k:"confirm"}].map(f=>(
                        <div key={f.k} style={{gridColumn:f.k==="confirm"?"1/-1":undefined}}>
                          <FInput label={f.l} required type="password" value={(pwd as any)[f.k]} onChange={e=>setPwd(p=>({...p,[f.k]:e.target.value}))} placeholder="••••••••"/>
                        </div>
                      ))}
                      {pwdErr&&<div style={{gridColumn:"1/-1",padding:"9px 14px",borderRadius:10,background:"rgba(255,77,106,0.1)",border:"1px solid rgba(255,77,106,0.25)",color:C.red,fontFamily:"'Raleway',sans-serif",fontSize:13}}>⚠ {pwdErr}</div>}
                    </div>
                    <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
                      <button onClick={changePassword} disabled={saving} style={{padding:"10px 22px",borderRadius:100,border:"1px solid rgba(255,77,106,0.3)",background:"rgba(255,77,106,0.1)",color:C.red,cursor:saving?"not-allowed":"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,transition:"all .2s"}}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,77,106,0.18)"}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,77,106,0.1)"}}>
                        {saving?"Updating…":"Update Password"}
                      </button>
                    </div>
                  </Card>

                  <Card accent={C.w30} style={{padding:"22px"}}>
                    <SecTitle icon="ℹ" label="Account Status" color={C.w50}/>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
                      {[{l:"UUID",v:user.uuid,c:C.gold},{l:"Role",v:user.role,c:C.blue},{l:"Email Verified",v:user.is_verified?"Yes":"No",c:user.is_verified?C.green:C.red},{l:"Account Active",v:user.is_active?"Yes":"No",c:user.is_active?C.green:C.red}].map((s,i)=>(
                        <div key={i} style={{padding:"12px 14px",borderRadius:12,background:C.w04,border:`1px solid ${C.w08}`}}>
                          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{s.l}</div>
                          <div style={{fontFamily:"'Raleway',sans-serif",fontSize:13,fontWeight:600,color:s.c,wordBreak:"break-all"}}>{s.v}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* TOASTS */}
      <div style={{position:"fixed",bottom:28,right:28,zIndex:1000,display:"flex",flexDirection:"column",gap:10}}>
        {toasts.map(t=>(
          <div key={t.id} style={{padding:"12px 18px",borderRadius:14,backdropFilter:"blur(24px)",fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:500,display:"flex",alignItems:"center",gap:10,minWidth:260,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",background:t.type==="success"?"rgba(0,229,160,0.12)":t.type==="error"?"rgba(255,77,106,0.12)":"rgba(0,212,255,0.1)",border:`1px solid ${t.type==="success"?"rgba(0,229,160,0.3)":t.type==="error"?"rgba(255,77,106,0.3)":"rgba(0,212,255,0.28)"}`,color:t.type==="success"?C.green:t.type==="error"?C.red:C.cyan}}>
            <span>{t.type==="success"?"✅":t.type==="error"?"⛔":"◉"}</span><span>{t.msg}</span>
          </div>
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800&family=Raleway:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');
        *,*::before,*::after{box-sizing:border-box}html,body{background:#020810;margin:0;height:100%}
        input::placeholder,textarea::placeholder{color:rgba(200,220,255,0.22);font-family:'Raleway',sans-serif}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(.4);cursor:pointer}
        @keyframes lu-scan{from{transform:translateY(-100vh)}to{transform:translateY(200vh)}}
        @keyframes lu-spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.2);border-radius:4px}
        select option{background:#0a1628;color:rgba(255,255,255,0.9)}
        @media(max-width:640px){
          .form-grid-2{grid-template-columns:1fr!important}
        }
      `}</style>
    </>
  )
}
declare module "react"{ interface CSSProperties{ [key:string]:any } }