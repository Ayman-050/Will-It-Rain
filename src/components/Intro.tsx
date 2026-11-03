import { useEffect, useState } from 'react';

interface IntroProps {
  onComplete: () => void;
}

const Intro = ({ onComplete }: IntroProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [phase, setPhase] = useState<'flash' | 'animate' | 'initializing' | 'system-online' | 'exit' | 'complete'>('flash');
  const [showInitializing, setShowInitializing] = useState(false);
  const [showSystemOnline, setShowSystemOnline] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reducedMotion = mediaQuery.matches;
    setPrefersReducedMotion(reducedMotion);
    
    if (reducedMotion) {
      // Skip animations entirely for accessibility
      setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 100);
      return;
    }

    // Phase 1: 0-0.2s - Quick fade from black (film flash)
    setTimeout(() => {
      setPhase('animate');
    }, 200);

    // Phase 2: 0.2-1.5s - Headline animates
    // Phase 3: 1.5-3.5s - First text fades, "Initializing..." appears (2 seconds)
    setTimeout(() => {
      setPhase('initializing');
      setShowInitializing(true);
    }, 1500);

    // Phase 4: 3.5-4.5s - "System online." appears (1 second)
    setTimeout(() => {
      setPhase('system-online');
      setShowSystemOnline(true);
    }, 3500);

    // Phase 5: 4.5-5.0s - Letterbox bars slide out, overlay fades
    setTimeout(() => {
      setPhase('exit');
    }, 4500);

    // Complete intro after 5 seconds
    setTimeout(() => {
      setPhase('complete');
      setIsVisible(false);
      setTimeout(onComplete, 100);
    }, 5000);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
      {/* Film grain effect */}
      <div className="absolute inset-0 opacity-20 z-15" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundSize: '200px 200px',
        animation: phase === 'animate' ? 'grain 0.1s infinite' : 'none'
      }} />
      
      {/* Letterbox bars - slide up/down during exit phase */}
      <div 
        className={`absolute top-0 left-0 w-full h-8 bg-black z-20 transition-transform duration-400 ease-in-out ${
          phase === 'exit' ? '-translate-y-full' : 'translate-y-0'
        }`}
      />
      <div 
        className={`absolute bottom-0 left-0 w-full h-8 bg-black z-20 transition-transform duration-400 ease-in-out ${
          phase === 'exit' ? 'translate-y-full' : 'translate-y-0'
        }`}
      />
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30 z-10" />
      
      {/* Main content */}
      <div className="relative z-25 text-center">
        {/* Original headline and subheadline */}
        <div 
          className={`transform transition-all duration-1300 ease-out ${
            phase === 'flash' 
              ? 'opacity-0 scale-95' 
              : phase === 'animate' 
                ? 'opacity-100 scale-110' 
                : phase === 'initializing' || phase === 'system-online' || phase === 'exit'
                  ? 'opacity-0 scale-110'
                  : 'opacity-0 scale-100'
          }`}
        >
          {/* Main headline */}
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 tracking-wider">
            BAROONAUTS
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-300 font-light tracking-wide">
            Will it rain on my parade?
          </p>
        </div>

        {/* Initializing text */}
        {showInitializing && (
          <div 
            className={`transform transition-all duration-500 ease-out ${
              phase === 'initializing' 
                ? 'opacity-100 scale-100' 
                : phase === 'system-online' || phase === 'exit'
                  ? 'opacity-0 scale-95'
                  : 'opacity-0 scale-95'
            }`}
          >
            <p className="text-2xl md:text-3xl text-cyan-400 font-mono tracking-wider">
              Initializing...
            </p>
          </div>
        )}

        {/* System online text */}
        {showSystemOnline && (
          <div 
            className={`transform transition-all duration-500 ease-out ${
              phase === 'system-online' 
                ? 'opacity-100 scale-100' 
                : phase === 'exit'
                  ? 'opacity-0 scale-95'
                  : 'opacity-0 scale-95'
            }`}
          >
            <p className="text-xl md:text-2xl text-green-400 font-mono tracking-wider">
              System online.
            </p>
          </div>
        )}
      </div>

      {/* Film flash effect - only during flash phase */}
      {phase === 'flash' && (
        <div className="absolute inset-0 bg-white z-30 animate-pulse" style={{ animationDuration: '0.1s' }} />
      )}

      <style jsx>{`
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1px, -1px); }
          20% { transform: translate(1px, 1px); }
          30% { transform: translate(-1px, 1px); }
          40% { transform: translate(1px, -1px); }
          50% { transform: translate(-1px, -1px); }
          60% { transform: translate(1px, 1px); }
          70% { transform: translate(-1px, 1px); }
          80% { transform: translate(1px, -1px); }
          90% { transform: translate(-1px, -1px); }
        }
      `}</style>
    </div>
  );
};

export default Intro;
