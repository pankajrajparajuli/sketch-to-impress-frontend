import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tone = "green" | "yellow" | "red" | "blue" | "plain";

export function PixelButton({ className, tone = "green", ...props }: ButtonProps & { tone?: Tone }) {
  const tones: Record<Tone, string> = {
    green: "bg-primary text-primary-foreground hover:bg-primary/90",
    yellow: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    red: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    blue: "bg-accent text-accent-foreground hover:bg-accent/90",
    plain: "bg-card text-card-foreground hover:bg-muted",
  };
  return <Button className={cn("pixel-shadow h-12 rounded-none border-4 border-foreground px-5 font-display text-[11px] uppercase tracking-tight transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none", tones[tone], className)} {...props} />;
}