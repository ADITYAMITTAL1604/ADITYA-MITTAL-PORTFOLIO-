import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface ContactDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContactDrawer({ open, onOpenChange }: ContactDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="!w-full sm:!max-w-lg !bg-[#0d2924] !border-l-white/10 overflow-y-auto"
      >
        <SheetHeader className="px-8 pt-8 pb-4">
          <SheetTitle className="heading-3 font-instrument-serif italic text-[#EDEAF5]">
            Contact
          </SheetTitle>
          <SheetDescription className="body-md text-[#9C94B5]">
            Got a project in mind? Let's talk.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-8 px-8 py-6">
          {/* Display email */}
          <div className="flex flex-col gap-2">
            <label className="eyebrow text-[#9C94B5]">Email</label>
            <a href="mailto:adityamittal568@gmail.com" className="body-lg text-[#EDEAF5] font-instrument-serif italic hover:opacity-70 transition-opacity">
              adityamittal568@gmail.com
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
