export const DigitBox = ({ digit }: { digit: string }) => (
  <div className="h-full aspect-[7/10] border-2 border-primary rounded-xl flex items-center justify-center bg-light text-2xl sm:text-3xl md:text-5xl font-slant text-dark shadow-sm">
    {digit}
  </div>
)
