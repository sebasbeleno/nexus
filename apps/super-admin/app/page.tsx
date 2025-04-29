import { FormMessage, Message } from "@/components/form-message";
import { LoginForm } from "@/components/login-form";
import { GalleryVerticalEnd } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default async function Home(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 relative">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            H2C.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
            <FormMessage message={searchParams} />
          </div>
        </div>
        
        {/* Theme Switcher positioned at the bottom left */}
        <div className="absolute bottom-6 left-6">
          <ThemeSwitcher />
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/loginform.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
