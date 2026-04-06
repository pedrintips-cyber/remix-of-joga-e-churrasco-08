const LoadingScreen = () => (
  <div className="fixed inset-0 z-[100] bg-brasil-dark flex flex-col items-center justify-center gap-4">
    <div className="relative w-20 h-20">
      {/* Diamond shape like Brazil flag */}
      <div className="absolute inset-0 bg-brasil-yellow rotate-45 rounded-md animate-pulse" />
      <div className="absolute inset-3 bg-brasil-green rotate-45 rounded-sm" />
      <div className="absolute inset-[18px] bg-brasil-blue rotate-45 rounded-sm animate-pulse" style={{ animationDelay: '0.5s' }} />
    </div>
    <div className="flex items-center gap-1.5 mt-2">
      <div className="w-2 h-2 rounded-full bg-brasil-green animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-brasil-yellow animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-brasil-blue animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
    <p className="font-display text-lg text-foreground/60 tracking-widest">CARREGANDO...</p>
  </div>
);

export default LoadingScreen;
