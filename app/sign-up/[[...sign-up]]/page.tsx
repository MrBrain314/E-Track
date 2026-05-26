import Image from "next/image";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <section className="grid min-h-screen lg:grid-cols-2">
      {/* LEFT SIDE */}
      <div className="relative hidden lg:block">
        <Image
          src="https://images.unsplash.com/photo-1603382606058-d01d337dbabd?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Background"
          fill
          priority
          className="object-cover"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-end p-12 text-white">
          <div className="mb-6 text-4xl">💰</div>

          <h1 className="text-5xl font-bold leading-tight">
            Welcome to <span className="text-accent">E-Track</span>
          </h1>

          <p className="mt-5 max-w-md text-lg text-white/80">
            Suivez facilement vos budgets et vos dépenses au quotidien.
            Avec E-Track, gardez une vision claire de votre argent et prenez 
            de meilleures décisions financières en toute simplicité.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center bg-[#f7f7f8] px-6 py-10">
        <div className="w-full max-w-md">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-2xl border border-gray-200 rounded-3xl",
                footer: "hidden",
                footerAction: "hidden",
                footerActionText: "hidden",
                socialButtonsBlockButton:
                  "shadow-none border border-gray-300 hover:bg-gray-50 transition",
                formButtonPrimary:
                  "bg-[#2b2d38] hover:bg-black text-white shadow-md",
              },
            }}
          />
        </div>
      </div>
    </section>
  );
}