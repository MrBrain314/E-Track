import Navbar from "@/components/layout/Navbar";
import Link from "next/link";


export default function Home() {
  return (
    <div>
      <Navbar />
      <div className = "flex items-center justify-center flex-col py-10 w-full">
        <div>
          <div className = "flex flex-col">
            <h1 className = "text-4xl md:text-5xl font-bold text-center">Prenez le controle <br /> de vos fiances</h1>
            <p className = "py-6 text-gray-600 text-center ">
              Suivez vos budget et vos depenses <br /> en toute simplicité ave Etrack!
            </p>
            <div className = "flex items-center justify-center">
              <Link href="/sign-in" className="btn btn-sm md:btn-md btn-outline btn-accent"> 
                Se connecter
              </Link>

              <Link href="/sign-up" className="btn btn-sm md:btn-md ml-2 btn-accent"> 
                S&apos;inscrire
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
