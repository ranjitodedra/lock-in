import Image from "next/image";

import { cn } from "@/lib/utils";

type AppLogoProps = {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function AppLogo({
  className,
  width = 120,
  height = 32,
  priority = false,
}: AppLogoProps) {
  const imageClass = cn(
    "max-w-full object-contain object-left",
    className,
  );

  return (
    <>
      <Image
        src="/logo_light_mode.svg"
        alt="Lock-In"
        width={width}
        height={height}
        priority={priority}
        className={cn("block dark:hidden", imageClass)}
        style={{ height, width: "auto" }}
      />
      <Image
        src="/logo_dark_mode.svg"
        alt="Lock-In"
        width={width}
        height={height}
        priority={priority}
        className={cn("hidden dark:block", imageClass)}
        style={{ height, width: "auto" }}
      />
    </>
  );
}
