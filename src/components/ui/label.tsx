import * as React from "react";
import { Label } from "radix-ui";
import { cn } from "@/lib/utils";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label.Root>,
  React.ComponentPropsWithoutRef<typeof Label.Root>
>(({ className, ...props }, ref) => (
  <Label.Root
    ref={ref}
    className={cn("text-sm font-medium leading-none", className)}
    {...props}
  />
));

FormLabel.displayName = "Label";

export { FormLabel as Label };
