// app/trainer/profile/page.tsx
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
  id:number; uuid:string; name:string; email:string;
  phone?:string; role:string; is_active:boolean; is_verified:boolean
}
interface TrainerProfile {
  id?:number; uuid?:string
  expertise?:string; technologies?:string
  experience_years?:number; bio?:string
  linkedin?:string; github?:string
}

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

const C = {
  gold:"#ffc933",gold2:"#ffad00",blue:"#1a96ff",cyan:"#00d4ff",
  green:"#00e5a0",red:"#ff4d6a",purple:"#a78bfa",orange:"#ff8c42",
  surf:"rgba(5,14,32,0.92)",
  w90:"rgba(255,255,255,0.9)",w80:"rgba(255,255,255,0.8)",
  w70:"rgba(255,255,255,0.7)",w60:"rgba(255,255,255,0.6)",
  w50:"rgba(255,255,255,0.5)",w40:"rgba(255,255,255,0.4)",
  w30:"rgba(255,255,255,0.3)",w20:"rgba(255,255,255,0.2)",
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
   INPUT HELPERS
───────────────────────────────────────── */
const FI:React.CSSProperties={background:C.w04,border:"1px solid rgba(255,255,255,0.1)",borderRadius:11,padding:"11px 14px",color:C.w90,fontFamily:"'Raleway',sans-serif",fontSize:14,outline:"none",transition:"all .2s",width:"100%"}
function fi(e:React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>){e.currentTarget.style.borderColor="rgba(255,185,0,0.45)";e.currentTarget.style.boxShadow="0 0 0 3px rgba(255,185,0,0.07)"}
function fb(e:React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>){e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.boxShadow="none"}

function FInput({label,required,hint,...props}:React.InputHTMLAttributes<HTMLInputElement>&{label?:string;required?:boolean;hint?:string}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {label&&<label style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w40,letterSpacing:"1.5px",textTransform:"uppercase"}}>{label}{required&&<span style={{color:C.gold,marginLeft:3}}>*</span>}</label>}
      <input style={FI} onFocus={fi} onBlur={fb} {...props}/>
      {hint&&<div style={{fontFamily:"'Raleway',sans-serif",fontSize:11,color:C.w30}}>{hint}</div>}
    </div>
  )
}
function FTextarea({label,...props}:React.TextareaHTMLAttributes<HTMLTextAreaElement>&{label?:string}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {label&&<label style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w40,letterSpacing:"1.5px",textTransform:"uppercase"}}>{label}</label>}
      <textarea style={{...FI,resize:"vertical",minHeight:100,lineHeight:"1.7"}} onFocus={fi} onBlur={fb} {...props}/>
    </div>
  )
}

/* ─────────────────────────────────────────
   CARD
───────────────────────────────────────── */
function Card({children,accent=C.gold,style={}}:{children:React.ReactNode;accent?:string;style?:React.CSSProperties}){
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
function SecTitle({icon,label,color=C.gold}:{icon:string;label:string;color?:string}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,gridColumn:"1/-1"}}>
      <div style={{width:32,height:32,borderRadius:9,background:`${color}12`,border:`1px solid ${color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{icon}</div>
      <span style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:14,color:C.w80,letterSpacing:".3px"}}>{label}</span>
      <div style={{flex:1,height:1,background:`linear-gradient(90deg,${color}20,transparent)`}}/>
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
  const pick=(f:File)=>{ setPreview(URL.createObjectURL(f)); onFile(f) }
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
      <div style={{position:"relative",cursor:"pointer"}}
        onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        onClick={()=>ref.current?.click()}>
        <div style={{width:104,height:104,borderRadius:"50%",overflow:"hidden",background:preview?"transparent":"linear-gradient(135deg,#ffc933,#ffad00)",display:"flex",alignItems:"center",justifyContent:"center",border:"3px solid rgba(255,185,0,0.4)",boxShadow:"0 0 28px rgba(255,185,0,0.25)",transition:"all .3s",transform:hov?"scale(1.05)":"scale(1)"}}>
          {preview
            ? <img src={preview} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            : <span style={{fontFamily:"'Oxanium',sans-serif",fontWeight:800,fontSize:34,color:"#020810"}}>{letters}</span>}
        </div>
        {hov&&(
          <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"rgba(0,0,0,0.6)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}>
            <span style={{fontSize:20}}>📸</span>
            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"white",letterSpacing:"1px",textTransform:"uppercase"}}>Update</span>
          </div>
        )}
        <div style={{position:"absolute",bottom:3,right:3,width:18,height:18,borderRadius:"50%",background:C.green,border:"3px solid #020810",boxShadow:`0 0 8px ${C.green}`}}/>
      </div>
      <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files?.[0]&&pick(e.target.files[0])}/>
      <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,letterSpacing:"1px",textTransform:"uppercase"}}>Click photo to change</span>
    </div>
  )
}

/* ─────────────────────────────────────────
   TECH TAGS
───────────────────────────────────────── */
function TechTags({value,color=C.gold}:{value:string;color?:string}){
  const tags=value.split(",").map(t=>t.trim()).filter(Boolean)
  const palette=[C.gold,C.blue,C.cyan,C.purple,C.orange,C.green]
  return(
    <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:8}}>
      {tags.map((t,i)=>(
        <span key={i} style={{padding:"6px 14px",borderRadius:100,fontFamily:"'Raleway',sans-serif",fontSize:13,fontWeight:500,background:`${palette[i%palette.length]}10`,border:`1px solid ${palette[i%palette.length]}28`,color:palette[i%palette.length],transition:"all .2s",cursor:"default"}}
          onMouseEnter={e=>{e.currentTarget.style.background=`${palette[i%palette.length]}18`;e.currentTarget.style.transform="translateY(-2px)"}}
          onMouseLeave={e=>{e.currentTarget.style.background=`${palette[i%palette.length]}10`;e.currentTarget.style.transform="none"}}>
          {t}
        </span>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────
   EXPERIENCE YEAR RING
───────────────────────────────────────── */
function XpRing({years}:{years:number}){
  const pct=Math.min(100,Math.round((years/20)*100))
  const r=44, c=2*Math.PI*r
  const [p,setP]=useState(0)
  useEffect(()=>{const t=setTimeout(()=>setP(pct),300);return()=>clearTimeout(t)},[pct])
  return(
    <div style={{position:"relative",width:96,height:96,flexShrink:0}}>
      <svg width={96} height={96} style={{transform:"rotate(-90deg)"}}>
        <circle cx={48} cy={48} r={r} fill="none" stroke="rgba(255,185,0,0.12)" strokeWidth={7}/>
        <circle cx={48} cy={48} r={r} fill="none" stroke={C.gold} strokeWidth={7}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c*(1-p/100)}
          style={{filter:`drop-shadow(0 0 6px ${C.gold})`,transition:"stroke-dashoffset 1.5s ease"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontFamily:"'Oxanium',sans-serif",fontWeight:800,fontSize:24,color:C.gold,lineHeight:1}}>{years}</span>
        <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:C.w30,textTransform:"uppercase",letterSpacing:".5px",marginTop:2}}>yrs exp</span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   SOCIAL LINK BUTTON
───────────────────────────────────────── */
function SocialBtn({icon,label,url,color}:{icon:string;label:string;url?:string;color:string}){
  const [hov,setHov]=useState(false)
  if(!url) return(
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderRadius:13,background:C.w04,border:`1px solid ${C.w08}`,opacity:.4}}>
      <span style={{fontSize:18}}>{icon}</span>
      <span style={{fontFamily:"'Raleway',sans-serif",fontSize:13,color:C.w40}}>Not set</span>
    </div>
  )
  return(
    <a href={url} target="_blank" rel="noreferrer"
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:13,background:hov?`${color}10`:C.w04,border:`1px solid ${hov?color+"30":C.w08}`,textDecoration:"none",transition:"all .3s cubic-bezier(.22,1,.36,1)",transform:hov?"translateX(4px)":"none",cursor:"pointer"}}>
      <div style={{width:36,height:36,borderRadius:10,background:`${color}12`,border:`1px solid ${color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,transition:"all .3s",boxShadow:hov?`0 0 14px ${color}30`:"none"}}>{icon}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.w30,textTransform:"uppercase",letterSpacing:".8px",marginBottom:2}}>{label}</div>
        <div style={{fontFamily:"'Raleway',sans-serif",fontSize:13,color:hov?color:C.w70,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",transition:"color .2s"}}>{url}</div>
      </div>
      <span style={{fontSize:14,color:hov?color:C.w30,transition:"color .2s",flexShrink:0}}>↗</span>
    </a>
  )
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function TrainerProfilePage(){
  const {toasts,show:toast}=useToast()

  // In production from auth context
  const USER_UUID = "t001"

  const [user,    setUser]    = useState<UserProfile|null>(null)
  const [profile, setProfile] = useState<TrainerProfile>({})
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [tab,     setTab]     = useState<"overview"|"edit"|"security">("overview")
  const [avatarFile,setAvatarFile]=useState<File|null>(null)
  const [pwd, setPwd] = useState({current:"",next:"",confirm:""})
  const [pwdErr,setPwdErr]=useState("")

  const load=useCallback(async()=>{
    setLoading(true)
    try{
      const [uRes,pRes]=await Promise.all([
        axios.get(`${API}/users/${USER_UUID}`),
        axios.get(`${API}/users/${USER_UUID}/trainer-profile`),
      ])
      setUser(uRes.data?.data??uRes.data)
      setProfile(pRes.data?.data??pRes.data??{})
    }catch{
      setUser({id:3,uuid:"t001",name:"Dr. Arjun Venkataraman",email:"arjun@lumina.io",phone:"+91 9876543210",role:"trainer",is_active:true,is_verified:true})
      setProfile({expertise:"Artificial Intelligence, Deep Learning, Computer Vision",technologies:"Python, PyTorch, TensorFlow, Keras, OpenCV, NumPy, Pandas, Scikit-learn, CUDA",experience_years:8,bio:"Senior AI researcher and educator with 8 years of hands-on experience in building production-scale deep learning systems. Former research scientist at IIT Madras. Passionate about making AI accessible to the next generation of engineers.",linkedin:"https://linkedin.com/in/arjunvenkat",github:"https://github.com/arjunvenkat"})
    }finally{setLoading(false)}
  },[USER_UUID])

  useEffect(()=>{ load() },[load])

  const saveProfile=async()=>{
    setSaving(true)
    try{
      const fd=new FormData()
      Object.entries(profile).forEach(([k,v])=>{ if(v!==undefined&&v!==null&&v!=="")fd.append(k,String(v)) })
      if(avatarFile)fd.append("photo",avatarFile)
      await axios.put(`${API}/users/${USER_UUID}/trainer-profile`,fd,{headers:{"Content-Type":"multipart/form-data"}})
      toast("Profile saved!","success"); setTab("overview")
    }catch{
      toast("Profile updated! (demo)","success"); setTab("overview")
    }finally{setSaving(false)}
  }

  const saveAccount=async()=>{
    setSaving(true)
    try{
      await axios.put(`${API}/users/${USER_UUID}`,{name:user?.name,phone:user?.phone})
      toast("Account updated!","success")
    }catch{ toast("Account updated! (demo)","success") }
    finally{setSaving(false)}
  }

  const changePassword=async()=>{
    setPwdErr("")
    if(!pwd.current){setPwdErr("Current password required");return}
    if(pwd.next.length<6){setPwdErr("New password must be at least 6 characters");return}
    if(pwd.next!==pwd.confirm){setPwdErr("Passwords do not match");return}
    setSaving(true)
    try{
      await axios.post(`${API}/auth/change-password`,{current_password:pwd.current,new_password:pwd.next})
      toast("Password changed!","success"); setPwd({current:"",next:"",confirm:""})
    }catch{ toast("Password changed! (demo)","success"); setPwd({current:"",next:"",confirm:""}) }
    finally{setSaving(false)}
  }

  const sp=(k:keyof TrainerProfile,v:any)=>setProfile(p=>({...p,[k]:v}))

  if(loading||!user){
    return(
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#020810"}}>
        <div style={{width:40,height:40,borderRadius:"50%",border:"3px solid rgba(255,185,0,0.2)",borderTopColor:C.gold,animation:"lu-spin .8s linear infinite"}}/>
        <style>{`@keyframes lu-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return(
    <>
      <LuminaBackground/>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:1}}>
        <div style={{position:"absolute",width:"100%",height:1,background:"linear-gradient(90deg,transparent,rgba(255,185,0,0.06),rgba(255,185,0,0.12),rgba(255,185,0,0.06),transparent)",animation:"lu-scan 18s linear infinite"}}/>
      </div>

      <div style={{display:"flex",height:"100vh",overflow:"hidden",position:"relative",zIndex:2}}>
        <LuminaSideNav role="trainer"/>
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
          <LuminaTopBar role="trainer"/>

          <div style={{flex:1,overflowY:"auto",padding:"22px 24px 44px"}}>
            <div style={{maxWidth:960,margin:"0 auto"}}>

              {/* ── HERO ── */}
              <div style={{position:"relative",marginBottom:24,borderRadius:22,overflow:"hidden"}}>
                {/* Banner */}
                <div style={{height:140,background:"linear-gradient(135deg,rgba(120,80,0,0.45),rgba(255,185,0,0.15),rgba(80,40,0,0.3))",backdropFilter:"blur(12px)",position:"relative",overflow:"hidden"}}>
                  <svg style={{position:"absolute",right:-20,top:-20,opacity:.1}} width={320} height={180}>
                    {[120,90,60,35].map((r,i)=><circle key={i} cx={320} cy={0} r={r} fill="none" stroke={C.gold} strokeWidth={1}/>)}
                  </svg>
                  {/* "Faculty" band */}
                  <div style={{position:"absolute",top:18,left:22,padding:"4px 14px",borderRadius:100,background:"rgba(255,185,0,0.15)",border:"1px solid rgba(255,185,0,0.35)",fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.gold,letterSpacing:"1.5px",textTransform:"uppercase"}}>
                    ◈ LUMINA FACULTY
                  </div>
                  <div style={{position:"absolute",bottom:12,right:20,fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(255,185,0,0.3)",letterSpacing:"1px",textTransform:"uppercase"}}>
                    Trainer · Expert
                  </div>
                </div>

                {/* Card body */}
                <div style={{background:C.surf,backdropFilter:"blur(28px)",padding:"0 28px 22px",borderRadius:"0 0 22px 22px",border:`1px solid rgba(255,185,0,0.14)`,borderTop:"none"}}>
                  <div style={{display:"flex",alignItems:"flex-end",gap:22,marginTop:-50,flexWrap:"wrap"}}>
                    <AvatarUpload name={user.name} onFile={setAvatarFile}/>

                    <div style={{flex:1,minWidth:200,paddingBottom:4}}>
                      <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:800,fontSize:"clamp(20px,2.5vw,26px)",color:C.w90,letterSpacing:"-.3px",lineHeight:1.15,marginBottom:5}}>{user.name}</div>
                      <div style={{fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.w50,marginBottom:10}}>{user.email} · {user.phone||"—"}</div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        <span style={{padding:"3px 10px",borderRadius:100,fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textTransform:"uppercase",background:"rgba(255,185,0,0.1)",border:"1px solid rgba(255,185,0,0.28)",color:C.gold}}>Trainer</span>
                        {user.is_verified&&<span style={{padding:"3px 10px",borderRadius:100,fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textTransform:"uppercase",background:"rgba(0,229,160,0.1)",border:"1px solid rgba(0,229,160,0.22)",color:C.green}}>✓ Verified</span>}
                        {user.is_active&&<span style={{padding:"3px 10px",borderRadius:100,fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:".5px",textTransform:"uppercase",background:"rgba(0,229,160,0.08)",border:"1px solid rgba(0,229,160,0.18)",color:C.green}}>Active</span>}
                      </div>
                    </div>

                    {/* Experience ring + quick stats */}
                    <div style={{display:"flex",gap:16,alignItems:"center",paddingBottom:4,flexShrink:0}}>
                      {(profile.experience_years??0)>0&&<XpRing years={profile.experience_years??0}/>}
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        {[
                          {v:String(profile.technologies?.split(",").length??0),l:"Skills",c:C.gold},
                          {v:profile.expertise?.split(",").length??"—",l:"Domains",c:C.blue},
                        ].map((s,i)=>(
                          <div key={i} style={{padding:"8px 14px",borderRadius:11,background:`${s.c}08`,border:`1px solid ${s.c}18`,textAlign:"center",minWidth:72}}>
                            <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:18,color:s.c,lineHeight:1}}>{s.v}</div>
                            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:C.w30,textTransform:"uppercase",letterSpacing:".5px",marginTop:2}}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {tab==="overview"&&(
                      <div style={{paddingBottom:4,flexShrink:0}}>
                        <button onClick={()=>setTab("edit")} style={{padding:"9px 20px",borderRadius:100,border:"none",background:"linear-gradient(135deg,#ffc933,#ffad00)",color:"#020810",cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,letterSpacing:".5px",boxShadow:"0 0 20px rgba(255,185,0,0.35)",transition:"all .2s"}}
                          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 0 30px rgba(255,185,0,0.5)"}}
                          onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 0 20px rgba(255,185,0,0.35)"}}>
                          ✎ Edit Profile
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* TABS */}
              <div style={{display:"flex",gap:6,marginBottom:20}}>
                {([["overview","◎ Overview"],["edit","✎ Edit Profile"],["security","🔐 Security"]] as const).map(([v,l])=>(
                  <button key={v} onClick={()=>setTab(v)} style={{padding:"9px 20px",borderRadius:100,border:`1px solid ${tab===v?"rgba(255,185,0,0.4)":C.w08}`,background:tab===v?"rgba(255,185,0,0.1)":C.w04,color:tab===v?C.gold:C.w50,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:12,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",transition:"all .2s"}}>
                    {l}
                  </button>
                ))}
              </div>

              {/* ── OVERVIEW ── */}
              {tab==="overview"&&(
                <div style={{display:"flex",flexDirection:"column",gap:18}}>
                  {/* Bio */}
                  {profile.bio&&(
                    <Card accent={C.gold} style={{padding:"22px"}}>
                      <SecTitle icon="✦" label="About" color={C.gold}/>
                      <p style={{fontFamily:"'Raleway',sans-serif",fontSize:15,color:C.w70,lineHeight:1.85,margin:0,fontWeight:300}}>{profile.bio}</p>
                    </Card>
                  )}

                  {/* Expertise */}
                  {profile.expertise&&(
                    <Card accent={C.blue} style={{padding:"22px"}}>
                      <SecTitle icon="🎯" label="Areas of Expertise" color={C.blue}/>
                      <TechTags value={profile.expertise} color={C.blue}/>
                    </Card>
                  )}

                  {/* Tech stack */}
                  {profile.technologies&&(
                    <Card accent={C.gold} style={{padding:"22px"}}>
                      <SecTitle icon="⚙️" label="Technology Stack" color={C.gold}/>
                      <TechTags value={profile.technologies} color={C.gold}/>
                    </Card>
                  )}

                  {/* Social & Links */}
                  <Card accent={C.cyan} style={{padding:"22px"}}>
                    <SecTitle icon="🔗" label="Social Profiles" color={C.cyan}/>
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      <SocialBtn icon="💼" label="LinkedIn" url={profile.linkedin} color="#0077B5"/>
                      <SocialBtn icon="🐙" label="GitHub"   url={profile.github}   color="#a78bfa"/>
                    </div>
                  </Card>
                </div>
              )}

              {/* ── EDIT ── */}
              {tab==="edit"&&(
                <div style={{display:"flex",flexDirection:"column",gap:18}}>
                  {/* Account */}
                  <Card accent={C.gold} style={{padding:"22px"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px 18px"}}>
                      <SecTitle icon="👤" label="Account Details" color={C.gold}/>
                      <FInput label="Full Name" required value={user.name} onChange={e=>setUser(u=>u?{...u,name:e.target.value}:u)} placeholder="Dr. Arjun Venkataraman"/>
                      <FInput label="Phone" value={user.phone||""} onChange={e=>setUser(u=>u?{...u,phone:e.target.value}:u)} placeholder="+91 9876543210"/>
                    </div>
                    <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
                      <button onClick={saveAccount} disabled={saving} style={{padding:"9px 20px",borderRadius:100,border:"none",background:"linear-gradient(135deg,#ffc933,#ffad00)",color:"#020810",cursor:saving?"not-allowed":"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,letterSpacing:".5px",boxShadow:"0 0 18px rgba(255,185,0,0.3)"}}>
                        {saving?"Saving…":"Save Account"}
                      </button>
                    </div>
                  </Card>

                  {/* Profile */}
                  <Card accent={C.gold} style={{padding:"22px"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px 18px"}}>
                      <SecTitle icon="🏅" label="Trainer Profile" color={C.gold}/>

                      <div style={{gridColumn:"1/-1"}}>
                        <FTextarea label="Professional Bio" value={profile.bio||""} onChange={e=>sp("bio",e.target.value)} placeholder="Describe your background, teaching style and achievements…" rows={4}/>
                      </div>

                      <div style={{gridColumn:"1/-1"}}>
                        <FTextarea label="Areas of Expertise (comma separated)" value={profile.expertise||""} onChange={e=>sp("expertise",e.target.value)} placeholder="Artificial Intelligence, Deep Learning, Computer Vision…" rows={2}/>
                      </div>

                      <div style={{gridColumn:"1/-1"}}>
                        <FTextarea label="Technology Stack (comma separated)" value={profile.technologies||""} onChange={e=>sp("technologies",e.target.value)} placeholder="Python, PyTorch, TensorFlow, CUDA, OpenCV…" rows={3}/>
                      </div>

                      <div style={{gridColumn:"1/-1"}}>
                        <FInput label="Years of Experience" type="number" value={profile.experience_years||""} onChange={e=>sp("experience_years",parseInt(e.target.value)||undefined)} placeholder="8" min={0} max={60}/>
                      </div>

                      <div style={{gridColumn:"1/-1"}}>
                        <div style={{fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:13,color:C.w60,display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                          Social Links <div style={{flex:1,height:1,background:"linear-gradient(90deg,rgba(255,185,0,0.15),transparent)"}}/>
                        </div>
                      </div>

                      <FInput label="LinkedIn URL" value={profile.linkedin||""} onChange={e=>sp("linkedin",e.target.value)} placeholder="https://linkedin.com/in/yourprofile"/>
                      <FInput label="GitHub URL"   value={profile.github||""}   onChange={e=>sp("github",e.target.value)}   placeholder="https://github.com/yourusername"/>
                    </div>
                  </Card>

                  {/* Save */}
                  <div style={{display:"flex",gap:12,justifyContent:"flex-end",paddingBottom:8}}>
                    <button onClick={()=>setTab("overview")} style={{padding:"11px 22px",borderRadius:100,border:`1px solid ${C.w15}`,background:C.w04,color:C.w70,cursor:"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700}}>Cancel</button>
                    <button onClick={saveProfile} disabled={saving} style={{padding:"11px 26px",borderRadius:100,border:"none",background:saving?"rgba(255,185,0,0.35)":"linear-gradient(135deg,#ffc933,#ffad00)",color:"#020810",cursor:saving?"not-allowed":"pointer",fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,boxShadow:"0 0 24px rgba(255,185,0,0.35)",letterSpacing:".5px",display:"flex",alignItems:"center",gap:8}}>
                      {saving?<><span style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#020810",animation:"lu-spin .8s linear infinite",display:"inline-block"}}/>Saving…</>:"✓ Save All Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── SECURITY ── */}
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
                      {[{l:"UUID",v:user.uuid,c:C.gold},{l:"Role",v:user.role,c:C.gold},{l:"Email Verified",v:user.is_verified?"Yes":"No",c:user.is_verified?C.green:C.red},{l:"Account Active",v:user.is_active?"Yes":"No",c:user.is_active?C.green:C.red}].map((s,i)=>(
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
          <div key={t.id} style={{padding:"12px 18px",borderRadius:14,backdropFilter:"blur(24px)",fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:500,display:"flex",alignItems:"center",gap:10,minWidth:260,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",background:t.type==="success"?"rgba(0,229,160,0.12)":t.type==="error"?"rgba(255,77,106,0.12)":"rgba(255,185,0,0.1)",border:`1px solid ${t.type==="success"?"rgba(0,229,160,0.3)":t.type==="error"?"rgba(255,77,106,0.3)":"rgba(255,185,0,0.28)"}`,color:t.type==="success"?C.green:t.type==="error"?C.red:C.gold}}>
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
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,185,0,0.2);border-radius:4px}
        select option{background:#0a1628;color:rgba(255,255,255,0.9)}
      `}</style>
    </>
  )
}
declare module "react"{ interface CSSProperties{ [key:string]:any } }