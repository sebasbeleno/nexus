import { FormMessage, Message } from "@/components/form-message";
import { LoginForm } from "@/components/login-form";
import { GalleryVerticalEnd } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default async function Home(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Sensia. | Nexus
        </a>
        <LoginForm />
      </div>
      {/* Theme Switcher positioned at the bottom left */}
      <div className="absolute bottom-6 left-6">
        <ThemeSwitcher />
      </div>
    </div>
  )

}
