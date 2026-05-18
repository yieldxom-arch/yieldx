import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SpaceCharacterProps {
  focusedField: 'email' | 'password' | 'fullName' | 'confirmPassword' | null;
  showPassword: boolean;
  isTyping: boolean;
  success: boolean;
}

export function SpaceCharacter({ 
  focusedField, 
  showPassword,
  isTyping,
  success
}: SpaceCharacterProps) {
  const shouldCoverEyes = focusedField === 'password' && !showPassword;
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = React.useState(false);
  const [particles, setParticles] = React.useState<Array<{ id: number; angle: number }>>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const particleIdRef = React.useRef(0);

  // Random blinking
  React.useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.7 && !shouldCoverEyes) {
        blink();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [shouldCoverEyes]);

  // Success particle burst
  React.useEffect(() => {
    if (success) {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: particleIdRef.current++,
        angle: (i / 12) * 360,
      }));
      setParticles(newParticles);
      
      setTimeout(() => setParticles([]), 1500);
    }
  }, [success]);

  // Track mouse movement
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        setMousePosition({
          x: e.clientX - centerX,
          y: e.clientY - centerY,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate pupil position based on mouse
  const getPupilPosition = (eyeCenterX: number, eyeCenterY: number, maxDistance: number = 5) => {
    if (focusedField === 'email' || focusedField === 'fullName') {
      return { x: eyeCenterX, y: eyeCenterY + 4 };
    }

    if (!containerRef.current) return { x: eyeCenterX, y: eyeCenterY };

    const angle = Math.atan2(mousePosition.y, mousePosition.x);
    const distance = Math.min(
      Math.sqrt(mousePosition.x ** 2 + mousePosition.y ** 2) / 100,
      1
    );

    const offsetX = Math.cos(angle) * maxDistance * distance;
    const offsetY = Math.sin(angle) * maxDistance * distance;

    return {
      x: eyeCenterX + offsetX,
      y: eyeCenterY + offsetY,
    };
  };

  const leftPupilPos = getPupilPosition(75, 95);
  const rightPupilPos = getPupilPosition(125, 95);

  return (
    <motion.div
      ref={containerRef}
      className="relative w-36 h-36 md:w-44 md:h-44 mx-auto mb-8"
      initial={{ scale: 0, rotate: -180, opacity: 0 }}
      animate={{ 
        scale: success ? [1, 1.15, 1] : 1, 
        rotate: success ? [0, 360] : 0,
        opacity: 1,
        y: success ? [0, -10, 0] : [0, -8, 0],
      }}
      transition={{
        scale: { duration: 0.6, delay: 0.1 },
        rotate: success ? { duration: 0.8, ease: 'easeInOut' } : { duration: 0 },
        opacity: { duration: 0.4 },
        y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      {/* Orbital Rings */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-[#4ECDC4]/30"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
          scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-[#5DD9C1]/20"
        animate={{
          rotate: -360,
          scale: [1, 1.15, 1],
        }}
        transition={{
          rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
          scale: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
        }}
        style={{ borderStyle: 'dashed' }}
      />

      {/* Success Particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-[#4ECDC4]"
            initial={{ 
              x: 0, 
              y: 0,
              scale: 0,
              opacity: 1 
            }}
            animate={{
              x: Math.cos((particle.angle * Math.PI) / 180) * 80,
              y: Math.sin((particle.angle * Math.PI) / 180) * 80,
              scale: [0, 1.5, 0],
              opacity: [1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Main Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-[#4ECDC4]/30 via-[#5DD9C1]/20 to-transparent blur-2xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: success ? [0.5, 1, 0.5] : [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: success ? 1 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Astronaut Helmet Container */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#1A1A2E] via-[#2A2A3E] to-[#1A1A2E] shadow-2xl flex items-center justify-center overflow-hidden border-4 border-[#4ECDC4]/30">
        {/* Glass Reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-full" />
        <div className="absolute top-4 right-8 w-16 h-16 bg-white/10 rounded-full blur-xl" />
        
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full relative z-10"
          style={{ transform: 'scale(1.2)' }}
        >
          <defs>
            {/* Gradients */}
            <radialGradient id="helmetGradient">
              <stop offset="0%" stopColor="#2A3F5F" />
              <stop offset="100%" stopColor="#1A2A3F" />
            </radialGradient>
            <radialGradient id="visorGradient">
              <stop offset="0%" stopColor="#4ECDC4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#5DD9C1" stopOpacity="0.1" />
            </radialGradient>
            <radialGradient id="glowGradient">
              <stop offset="0%" stopColor="#4ECDC4" />
              <stop offset="100%" stopColor="#5DD9C1" />
            </radialGradient>
            <linearGradient id="antennaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4ECDC4" />
              <stop offset="100%" stopColor="#5DD9C1" />
            </linearGradient>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Helmet Shadow */}
          <ellipse cx="100" cy="130" rx="70" ry="15" fill="#000" opacity="0.2" />

          {/* Helmet Base */}
          <circle cx="100" cy="100" r="75" fill="url(#helmetGradient)" opacity="0.9" />
          
          {/* Helmet Details - Panel Lines */}
          <path 
            d="M 40 100 Q 100 95 160 100" 
            stroke="#4ECDC4" 
            strokeWidth="1" 
            opacity="0.3" 
            fill="none"
          />
          <path 
            d="M 45 120 Q 100 118 155 120" 
            stroke="#4ECDC4" 
            strokeWidth="1" 
            opacity="0.3" 
            fill="none"
          />

          {/* Antenna */}
          <motion.g
            animate={{
              rotate: [0, -5, 5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: '100px 40px' }}
          >
            <line x1="100" y1="25" x2="100" y2="45" stroke="url(#antennaGradient)" strokeWidth="3" strokeLinecap="round" />
            <motion.circle
              cx="100"
              cy="20"
              r="5"
              fill="#4ECDC4"
              initial={{ opacity: 1, scale: 1 }}
              animate={{
                opacity: [1, 0.5, 1],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              filter="url(#softGlow)"
            />
          </motion.g>

          {/* Visor Frame */}
          <ellipse 
            cx="100" 
            cy="95" 
            rx="55" 
            ry="42" 
            fill="none" 
            stroke="#4ECDC4" 
            strokeWidth="3"
            opacity="0.6"
          />
          
          {/* Visor Background */}
          <ellipse cx="100" cy="95" rx="52" ry="39" fill="url(#visorGradient)" />
          
          {/* Visor Glass Shine */}
          <ellipse 
            cx="85" 
            cy="85" 
            rx="25" 
            ry="18" 
            fill="white" 
            opacity="0.15"
          />

          {/* Eyes Container - Animated */}
          <AnimatePresence mode="wait">
            {!shouldCoverEyes ? (
              <motion.g
                key="eyes-open"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Left Eye Glow */}
                <motion.circle
                  cx="75"
                  cy="95"
                  fill="url(#glowGradient)"
                  opacity="0.4"
                  initial={{ r: 12, opacity: 0.4 }}
                  animate={{
                    r: isTyping ? [12, 14, 12] : 12,
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                  filter="url(#softGlow)"
                />

                {/* Right Eye Glow */}
                <motion.circle
                  cx="125"
                  cy="95"
                  fill="url(#glowGradient)"
                  opacity="0.4"
                  initial={{ r: 12, opacity: 0.4 }}
                  animate={{
                    r: isTyping ? [12, 14, 12] : 12,
                  }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.1 }}
                  filter="url(#softGlow)"
                />

                {/* Left Eye */}
                <motion.circle
                  cx={leftPupilPos.x}
                  cy={leftPupilPos.y}
                  r={isBlinking ? 1 : 8}
                  fill="#4ECDC4"
                  initial={{ opacity: 1 }}
                  animate={{
                    opacity: success ? [1, 0.5, 1] : 1,
                  }}
                  transition={{ 
                    r: { duration: 0.1 },
                    opacity: { duration: 0.3, repeat: success ? Infinity : 0 },
                  }}
                  filter="url(#softGlow)"
                />
                <motion.circle
                  cx={leftPupilPos.x}
                  cy={leftPupilPos.y}
                  r={isBlinking ? 0.5 : 4}
                  fill="white"
                  initial={{ opacity: 1 }}
                  animate={{
                    opacity: success ? [1, 0.7, 1] : 1,
                  }}
                  transition={{ 
                    r: { duration: 0.1 },
                    opacity: { duration: 0.3, repeat: success ? Infinity : 0 },
                  }}
                />
                
                {/* Right Eye */}
                <motion.circle
                  cx={rightPupilPos.x}
                  cy={rightPupilPos.y}
                  r={isBlinking ? 1 : 8}
                  fill="#4ECDC4"
                  initial={{ opacity: 1 }}
                  animate={{
                    opacity: success ? [1, 0.5, 1] : 1,
                  }}
                  transition={{ 
                    r: { duration: 0.1 },
                    opacity: { duration: 0.3, repeat: success ? Infinity : 0, delay: 0.1 },
                  }}
                  filter="url(#softGlow)"
                />
                <motion.circle
                  cx={rightPupilPos.x}
                  cy={rightPupilPos.y}
                  r={isBlinking ? 0.5 : 4}
                  fill="white"
                  initial={{ opacity: 1 }}
                  animate={{
                    opacity: success ? [1, 0.7, 1] : 1,
                  }}
                  transition={{ 
                    r: { duration: 0.1 },
                    opacity: { duration: 0.3, repeat: success ? Infinity : 0, delay: 0.1 },
                  }}
                />
              </motion.g>
            ) : (
              // Hands covering eyes
              <motion.g
                key="eyes-covered"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Left Hand */}
                <ellipse 
                  cx="75" 
                  cy="95" 
                  rx="18" 
                  ry="14" 
                  fill="#5DD9C1" 
                  opacity="0.8"
                />
                {/* Right Hand */}
                <ellipse 
                  cx="125" 
                  cy="95" 
                  rx="18" 
                  ry="14" 
                  fill="#5DD9C1" 
                  opacity="0.8"
                />
                {/* Fingers */}
                <rect x="70" y="88" width="3" height="12" rx="1.5" fill="#4ECDC4" opacity="0.6" />
                <rect x="77" y="88" width="3" height="12" rx="1.5" fill="#4ECDC4" opacity="0.6" />
                <rect x="120" y="88" width="3" height="12" rx="1.5" fill="#4ECDC4" opacity="0.6" />
                <rect x="127" y="88" width="3" height="12" rx="1.5" fill="#4ECDC4" opacity="0.6" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Smile - Changes based on state */}
          <motion.path
            d={success 
              ? "M 70 118 Q 100 130, 130 118"
              : (isTyping 
                ? "M 70 120 Q 100 125, 130 120"
                : "M 70 120 Q 100 128, 130 120")
            }
            stroke="#4ECDC4"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            initial={{ opacity: 0.8 }}
            animate={{
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Breathing Indicator - Side LEDs */}
          <motion.circle
            cx="45"
            cy="100"
            r="3"
            fill="#4ECDC4"
            initial={{ opacity: 0.3 }}
            animate={{
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            filter="url(#softGlow)"
          />
          <motion.circle
            cx="155"
            cy="100"
            r="3"
            fill="#5DD9C1"
            initial={{ opacity: 0.3 }}
            animate={{
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
            filter="url(#softGlow)"
          />

          {/* Bottom Collar */}
          <ellipse 
            cx="100" 
            cy="165" 
            rx="40" 
            ry="12" 
            fill="#2A3F5F"
            opacity="0.8"
          />
          <ellipse 
            cx="100" 
            cy="165" 
            rx="38" 
            ry="10" 
            fill="none"
            stroke="#4ECDC4"
            strokeWidth="2"
            opacity="0.4"
          />
        </svg>
      </div>

      {/* Status Indicator */}
      <motion.div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[#4ECDC4] to-[#5DD9C1] text-white text-xs font-bold shadow-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: success ? 1 : (isTyping ? 1 : 0),
          y: success ? 0 : (isTyping ? 0 : 10),
        }}
        transition={{ duration: 0.3 }}
      >
        {success ? '✓ Ready!' : 'Processing...'}
      </motion.div>
    </motion.div>
  );
}