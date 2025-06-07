export function Banner() {
  return (
    <div className="w-full relative pt-32 flex flex-col items-center bg-dark-blue">
      <img 
        src="/assets/images/banner.png" 
        alt="LitRPG Academy Banner"
        className="w-full h-auto object-contain"
      />
      <a 
        href="/genre-familiarity"
        className="absolute bottom-8 px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold 
          transition-all duration-300 hover:bg-blue-600
          animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]
          hover:shadow-[0_0_25px_rgba(59,130,246,0.8)]"
      >
        Start Your Journey
      </a>
    </div>
  );
} 