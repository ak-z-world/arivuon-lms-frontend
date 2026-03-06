import CosmosEngine from "@/components/background/CosmosEngine"
import LoginForm from "@/components/auth/LoginForm"

export default function LoginPage() {

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 bg-[#020408]">

      <CosmosEngine/>

      {/* nebula glow */}
      <div className="absolute w-[600px] h-[600px] bg-cyan-500/10 blur-[200px] rounded-full top-[-200px] left-[40%]" />

      <LoginForm/>

    </div>
  )

}