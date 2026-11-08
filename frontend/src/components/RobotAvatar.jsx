import React, { useState, useEffect } from 'react';

/**
 * RobotAvatar Component
 * Authentic miniature desktop AI companion robot with glossy white chassis,
 * dark OLED curved visor screen, and glowing digital expressive eyes.
 * Modeled directly after the reference desktop AI robot design.
 * 
 * Moods supported:
 * - 'idle' / 'neutral': Classic pill eyes with natural periodic blinking
 * - 'happy': Cheerful curved upward arc eyes with subtle blush
 * - 'sparkle': Delighted 4-pointed glowing diamond star eyes
 * - 'love': Glowing neon pink heart eyes with heartbeat pulse
 * - 'money': Financial currency symbol eyes (₹ / $)
 * - 'thinking': Curious query eyes (horizontal bar + tilted question mark)
 * - 'wink': Winking face (left wink <, right open pill |)
 * - 'speaking': Dynamic audio-reactive wave / happy talking eyes
 * - 'excited': Squinting excitement (> <)
 * - 'sleepy': Gentle relaxed horizontal bar eyes (- -)
 */
export default function RobotAvatar({
  size = 'md',
  mood = 'idle',
  interactive = false,
  className = '',
  onClick = null,
  currency = '₹'
}) {
  const [internalMood, setInternalMood] = useState(mood);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Synchronize prop mood changes
  useEffect(() => {
    setInternalMood(mood);
  }, [mood]);

  // Periodic natural blinking for idle/neutral mood
  useEffect(() => {
    if (internalMood !== 'idle' && internalMood !== 'neutral') return;

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 220);
    }, 3800 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, [internalMood]);

  // Handle click to cycle expressions if interactive
  const handleClick = (e) => {
    if (interactive) {
      const moods = ['idle', 'happy', 'sparkle', 'money', 'love', 'thinking', 'wink', 'excited'];
      const nextIdx = (moods.indexOf(internalMood) + 1) % moods.length;
      setInternalMood(moods[nextIdx]);
    }
    if (onClick) onClick(e);
  };

  // Determine size in pixels
  const sizeMap = {
    xs: { width: 30, height: 26 },
    sm: { width: 38, height: 33 },
    md: { width: 48, height: 42 },
    lg: { width: 68, height: 59 },
    xl: { width: 96, height: 83 }
  };

  const dimensions = typeof size === 'number' 
    ? { width: size, height: Math.round(size * 0.86) } 
    : (sizeMap[size] || sizeMap.md);

  const activeMood = isHovered && interactive ? (internalMood === 'idle' ? 'sparkle' : internalMood) : internalMood;

  // Eye color glow config
  const isHeart = activeMood === 'love';
  const isMoney = activeMood === 'money';

  const glowColor = isHeart 
    ? '#ff2a85' 
    : isMoney 
      ? '#10b981' 
      : '#00f0ff'; // Electric neon cyan default

  const eyeFillColor = isHeart 
    ? '#ff4d9e' 
    : isMoney 
      ? '#34d399' 
      : '#38bdf8';

  const eyeCoreColor = isHeart
    ? '#ffe4f0'
    : isMoney
      ? '#ecfdf5'
      : '#e0faff';

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={interactive ? `Xpenzic AI (${activeMood}) - Click to interact` : 'Xpenzic AI Assistant'}
      className={`relative inline-flex items-center justify-center select-none transition-transform duration-300 ${
        interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${className}`}
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <svg
        viewBox="0 0 100 86"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible drop-shadow-[0_4px_10px_rgba(0,0,0,0.14)]"
      >
        <defs>
          {/* Chassis White Shell Gradient */}
          <linearGradient id="chassisGrad" x1="50" y1="8" x2="50" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#f3f6f9" />
            <stop offset="100%" stopColor="#d5dbe4" />
          </linearGradient>

          {/* Visor Deep Obsidian Screen Gradient */}
          <linearGradient id="visorGrad" x1="50" y1="15" x2="50" y2="57" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0a0f1d" />
            <stop offset="45%" stopColor="#050811" />
            <stop offset="100%" stopColor="#020408" />
          </linearGradient>

          {/* Torso Stand Gradient */}
          <linearGradient id="torsoGrad" x1="50" y1="68" x2="50" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* High Intensity Cyan / Color Neon Glow Filter */}
          <filter id={`neonGlow-${glowColor.replace('#', '')}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Torso Base / Stand Collar */}
        <g id="torso-stand">
          {/* Curved white shoulder stand */}
          <rect
            x="28"
            y="69"
            width="44"
            height="12"
            rx="6"
            fill="url(#torsoGrad)"
            stroke="#94a3b8"
            strokeWidth="0.8"
          />
          {/* Subtle chest status slot */}
          <rect
            x="44"
            y="74"
            width="12"
            height="2.5"
            rx="1.25"
            fill="#64748b"
            opacity="0.8"
          />
          {/* Stand soft ground contact shadow */}
          <ellipse
            cx="50"
            cy="82"
            rx="26"
            ry="2.5"
            fill="#0f172a"
            opacity="0.12"
          />
        </g>

        {/* 2. Swivel Neck Joint */}
        <g id="neck-joint">
          <rect
            x="44"
            y="63"
            width="12"
            height="8"
            rx="3"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="0.8"
          />
          <line
            x1="46"
            y1="67"
            x2="54"
            y2="67"
            stroke="#475569"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>

        {/* 3. Ear Nubs (Left & Right Head Pivot Caps) */}
        <rect
          x="8.5"
          y="28"
          width="4.5"
          height="16"
          rx="2.25"
          fill="#cbd5e1"
          stroke="#94a3b8"
          strokeWidth="0.8"
        />
        <rect
          x="87"
          y="28"
          width="4.5"
          height="16"
          rx="2.25"
          fill="#cbd5e1"
          stroke="#94a3b8"
          strokeWidth="0.8"
        />

        {/* 4. Main White Robot Head Chassis */}
        <g id="head-chassis">
          {/* Main outer shell with soft 3D bevel */}
          <rect
            x="11"
            y="8"
            width="78"
            height="56"
            rx="21"
            ry="21"
            fill="url(#chassisGrad)"
            stroke="#e2e8f0"
            strokeWidth="1.2"
          />

          {/* Top Chassis Specular Highlight */}
          <ellipse
            cx="50"
            cy="13"
            rx="24"
            ry="2.8"
            fill="#ffffff"
            opacity="0.9"
          />

          {/* Bottom Chassis Rim Shadow */}
          <path
            d="M 28 62 Q 50 64.5 72 62"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>

        {/* 5. Dark Bezel & OLED Glass Screen Visor */}
        <g id="oled-visor">
          {/* Bezel inner recession border */}
          <rect
            x="17.5"
            y="14.5"
            width="65"
            height="43"
            rx="14.5"
            ry="14.5"
            fill="#060913"
            stroke="#1e293b"
            strokeWidth="1"
          />

          {/* Black Glass OLED Screen */}
          <rect
            x="18.5"
            y="15.5"
            width="63"
            height="41"
            rx="13.5"
            ry="13.5"
            fill="url(#visorGrad)"
          />

          {/* Curved Glass Sheen / Specular Gloss Reflection on Visor */}
          <path
            d="M 23 20.5 Q 50 16.5 77 20.5 C 75.5 25.5 72.5 28 67 28 Q 50 24 29 28 C 24.5 28 23 25 23 20.5 Z"
            fill="#ffffff"
            opacity="0.14"
          />
        </g>

        {/* 6. Dynamic Digital OLED Eyes */}
        <g 
          id="digital-eyes" 
          filter={`url(#neonGlow-${glowColor.replace('#', '')})`}
          style={{
            transformOrigin: '50px 36px',
            transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* A. IDLE / NEUTRAL: Classic Pill Rounded Bars with Smooth Natural Blink */}
          {(activeMood === 'idle' || activeMood === 'neutral') && (
            <g
              style={{
                transformOrigin: '50px 36px',
                transform: isBlinking ? 'scaleY(0.08)' : 'scaleY(1)',
                transition: 'transform 0.12s ease-in-out'
              }}
            >
              {/* Left Eye */}
              <rect
                x="32.5"
                y="27"
                width="8.5"
                height="18"
                rx="4.25"
                fill={eyeFillColor}
              />
              <rect
                x="34"
                y="29"
                width="4"
                height="8"
                rx="2"
                fill={eyeCoreColor}
                opacity="0.85"
              />

              {/* Right Eye */}
              <rect
                x="59"
                y="27"
                width="8.5"
                height="18"
                rx="4.25"
                fill={eyeFillColor}
              />
              <rect
                x="60.5"
                y="29"
                width="4"
                height="8"
                rx="2"
                fill={eyeCoreColor}
                opacity="0.85"
              />
            </g>
          )}

          {/* B. HAPPY: Joyful Upward Arcs (◠ ◠) + Soft Cheerful Blush */}
          {activeMood === 'happy' && (
            <g>
              {/* Left Eye Arc */}
              <path
                d="M 31 38.5 Q 36.5 26.5 42 38.5"
                stroke={eyeFillColor}
                strokeWidth="4.2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Right Eye Arc */}
              <path
                d="M 58 38.5 Q 63.5 26.5 69 38.5"
                stroke={eyeFillColor}
                strokeWidth="4.2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Subtle Cute Cheerful Rosy Blush Marks */}
              <ellipse cx="27" cy="44" rx="4" ry="2" fill="#f43f5e" opacity="0.45" />
              <ellipse cx="73" cy="44" rx="4" ry="2" fill="#f43f5e" opacity="0.45" />
            </g>
          )}

          {/* C. SPARKLE: 4-Point Delighted Star Eyes (✦ ✦) */}
          {activeMood === 'sparkle' && (
            <g className="animate-pulse">
              {/* Left Star */}
              <path
                d="M 36.5 25 Q 36.5 36 43 36 Q 36.5 36 36.5 47 Q 36.5 36 30 36 Q 36.5 36 36.5 25 Z"
                fill={eyeFillColor}
              />
              <circle cx="36.5" cy="36" r="2.5" fill={eyeCoreColor} />

              {/* Right Star */}
              <path
                d="M 63.5 25 Q 63.5 36 70 36 Q 63.5 36 63.5 47 Q 63.5 36 57 36 Q 63.5 36 63.5 25 Z"
                fill={eyeFillColor}
              />
              <circle cx="63.5" cy="36" r="2.5" fill={eyeCoreColor} />
            </g>
          )}

          {/* D. LOVE: Glowing Neon Hearts (♥ ♥) with Heartbeat Animation */}
          {activeMood === 'love' && (
            <g className="animate-pulse">
              {/* Left Heart */}
              <path
                d="M 36.5 31 C 34.5 26 27.5 26 27.5 32 C 27.5 37.5 36.5 43.5 36.5 43.5 C 36.5 43.5 45.5 37.5 45.5 32 C 45.5 26 38.5 26 36.5 31 Z"
                fill={eyeFillColor}
              />
              {/* Right Heart */}
              <path
                d="M 63.5 31 C 61.5 26 54.5 26 54.5 32 C 54.5 37.5 63.5 43.5 63.5 43.5 C 63.5 43.5 72.5 37.5 72.5 32 C 72.5 26 65.5 26 63.5 31 Z"
                fill={eyeFillColor}
              />
            </g>
          )}

          {/* E. MONEY: Financial Currency Eyes (₹ ₹ or $ $) */}
          {activeMood === 'money' && (
            <g className="animate-bounce" style={{ animationDuration: '1.2s' }}>
              <text
                x="36.5"
                y="41"
                textAnchor="middle"
                fontSize="18"
                fontWeight="900"
                fontFamily="system-ui, sans-serif"
                fill={eyeFillColor}
              >
                {currency}
              </text>
              <text
                x="63.5"
                y="41"
                textAnchor="middle"
                fontSize="18"
                fontWeight="900"
                fontFamily="system-ui, sans-serif"
                fill={eyeFillColor}
              >
                {currency}
              </text>
            </g>
          )}

          {/* F. THINKING: Computing / Curious Expression (- ?) as shown in row 2 col 2 */}
          {activeMood === 'thinking' && (
            <g>
              {/* Left Eye: Horizontal Thinking Line */}
              <rect
                x="29"
                y="34"
                width="14"
                height="4.5"
                rx="2.25"
                fill={eyeFillColor}
              />

              {/* Right Eye: Tilted Curious Question Mark */}
              <g transform="translate(63.5, 36) rotate(6) translate(-63.5, -36)">
                <text
                  x="63.5"
                  y="42"
                  textAnchor="middle"
                  fontSize="19"
                  fontWeight="900"
                  fontFamily="system-ui, sans-serif"
                  fill={eyeFillColor}
                  className="animate-pulse"
                >
                  ?
                </text>
              </g>

              {/* Small thinking bubble dot */}
              <circle cx="72" cy="24" r="1.5" fill={eyeCoreColor} className="animate-ping" />
            </g>
          )}

          {/* G. WINK: Mischievous Wink (| <) */}
          {activeMood === 'wink' && (
            <g>
              {/* Left Eye: Cheeky Wink Chevron (<) */}
              <path
                d="M 42 30 L 32 36 L 42 42"
                stroke={eyeFillColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Right Eye: Open Happy Pill Bar */}
              <rect
                x="59"
                y="27"
                width="8.5"
                height="18"
                rx="4.25"
                fill={eyeFillColor}
              />
              <rect
                x="60.5"
                y="29"
                width="4"
                height="8"
                rx="2"
                fill={eyeCoreColor}
              />
            </g>
          )}

          {/* H. SPEAKING: Lively Voice Audio Reactive Cheerful Waves */}
          {activeMood === 'speaking' && (
            <g>
              {/* Left Eye: Sound Bars */}
              <rect x="29" y="32" width="3" height="8" rx="1.5" fill={eyeFillColor} className="animate-pulse" />
              <rect x="35" y="27" width="3" height="18" rx="1.5" fill={eyeCoreColor} />
              <rect x="41" y="31" width="3" height="10" rx="1.5" fill={eyeFillColor} className="animate-pulse" />

              {/* Right Eye: Sound Bars */}
              <rect x="56" y="31" width="3" height="10" rx="1.5" fill={eyeFillColor} className="animate-pulse" />
              <rect x="62" y="27" width="3" height="18" rx="1.5" fill={eyeCoreColor} />
              <rect x="68" y="32" width="3" height="8" rx="1.5" fill={eyeFillColor} className="animate-pulse" />
            </g>
          )}

          {/* I. EXCITED: Laughing / Victorious Squint (> <) as in row 3 col 4 */}
          {activeMood === 'excited' && (
            <g>
              {/* Left Eye: > */}
              <path
                d="M 31 29 L 41 36 L 31 43"
                stroke={eyeFillColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Right Eye: < */}
              <path
                d="M 69 29 L 59 36 L 69 43"
                stroke={eyeFillColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </g>
          )}

          {/* J. SLEEPY: Quiet horizontal bars (- -) */}
          {activeMood === 'sleepy' && (
            <g>
              <rect x="30" y="35" width="13" height="3.5" rx="1.75" fill={eyeFillColor} opacity="0.75" />
              <rect x="57" y="35" width="13" height="3.5" rx="1.75" fill={eyeFillColor} opacity="0.75" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}

