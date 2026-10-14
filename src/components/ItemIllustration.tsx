import React from 'react';

interface Props {
  illustrationId: string;
  className?: string;
}

export const ItemIllustration: React.FC<Props> = ({ illustrationId, className = 'w-40 h-40' }) => {
  const [imageError, setImageError] = React.useState(false);

  // Check if illustrationId is a URL or file path
  const isUrl =
    illustrationId &&
    (illustrationId.startsWith('http://') ||
      illustrationId.startsWith('https://') ||
      illustrationId.startsWith('data:') ||
      illustrationId.startsWith('/') ||
      /\.(png|jpe?g|svg|webp|gif)$/i.test(illustrationId));

  if (isUrl && !imageError) {
    return (
      <img
        src={illustrationId}
        alt="Ilustrasi Soal"
        className={`${className} object-contain rounded-2xl drop-shadow-md`}
        onError={() => setImageError(true)}
      />
    );
  }

  // Check if illustrationId is an emoji or short symbol
  const isEmoji =
    illustrationId &&
    !illustrationId.includes('-') &&
    (illustrationId.length <= 4 || /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u.test(illustrationId));

  if (isEmoji) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-tr from-amber-400/20 to-sky-400/20 rounded-2xl border-2 border-white/20 shadow-inner`}>
        <span className="text-5xl sm:text-6xl drop-shadow select-none animate-float">
          {illustrationId}
        </span>
      </div>
    );
  }

  switch (illustrationId) {
    case 'wheel':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="88" fill="#334155" stroke="#1E293B" strokeWidth="8" />
          <circle cx="100" cy="100" r="70" fill="#94A3B8" stroke="#CBD5E1" strokeWidth="6" />
          {/* Spokes */}
          {[0, 30, 60, 90, 120, 150].map(deg => (
            <line
              key={deg}
              x1="100"
              y1="100"
              x2={100 + 70 * Math.cos((deg * Math.PI) / 180)}
              y2={100 + 70 * Math.sin((deg * Math.PI) / 180)}
              stroke="#E2E8F0"
              strokeWidth="4"
            />
          ))}
          {[0, 30, 60, 90, 120, 150].map(deg => (
            <line
              key={`opp-${deg}`}
              x1="100"
              y1="100"
              x2={100 - 70 * Math.cos((deg * Math.PI) / 180)}
              y2={100 - 70 * Math.sin((deg * Math.PI) / 180)}
              stroke="#E2E8F0"
              strokeWidth="4"
            />
          ))}
          {/* Hub */}
          <circle cx="100" cy="100" r="22" fill="#E2E8F0" stroke="#0EA5E9" strokeWidth="6" />
          <circle cx="100" cy="100" r="10" fill="#0284C7" />
          {/* Sparkle */}
          <circle cx="70" cy="70" r="6" fill="#F8FAFC" opacity="0.8" />
        </svg>
      );

    case 'pizza':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Crust */}
          <path d="M25 45 C100 15 100 15 175 45 L100 185 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="6" />
          {/* Cheese surface */}
          <path d="M35 52 C100 28 100 28 165 52 L100 170 Z" fill="#FDE047" />
          {/* Pepperoni slices */}
          <circle cx="100" cy="80" r="14" fill="#DC2626" stroke="#991B1B" strokeWidth="3" />
          <circle cx="75" cy="115" r="12" fill="#DC2626" stroke="#991B1B" strokeWidth="3" />
          <circle cx="125" cy="120" r="12" fill="#DC2626" stroke="#991B1B" strokeWidth="3" />
          {/* Basil herbs */}
          <ellipse cx="90" cy="135" rx="5" ry="9" fill="#16A34A" transform="rotate(-30 90 135)" />
          <ellipse cx="115" cy="95" rx="5" ry="8" fill="#16A34A" transform="rotate(40 115 95)" />
          {/* Cheese highlight */}
          <path d="M45 58 Q100 40 155 58" stroke="#FEF08A" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'blackboard':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Wood frame */}
          <rect x="20" y="45" width="160" height="110" rx="10" fill="#B45309" stroke="#78350F" strokeWidth="6" />
          {/* Green board */}
          <rect x="30" y="55" width="140" height="90" rx="4" fill="#065F46" />
          {/* Board drawings (ABC 123) */}
          <text x="45" y="90" fill="#A7F3D0" fontSize="24" fontWeight="bold" fontFamily="sans-serif">A B C</text>
          <text x="45" y="125" fill="#FEF08A" fontSize="20" fontWeight="bold" fontFamily="sans-serif">1 + 2 = 3</text>
          {/* Chalk ledge */}
          <rect x="40" y="145" width="120" height="8" rx="3" fill="#D97706" />
          {/* White chalk piece */}
          <rect x="110" y="143" width="16" height="5" rx="2" fill="#F8FAFC" />
          {/* Yellow chalk */}
          <rect x="132" y="143" width="14" height="5" rx="2" fill="#FDE047" />
        </svg>
      );

    case 'bread':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Toast crust */}
          <path
            d="M50 70 C35 60 40 30 70 35 C85 20 115 20 130 35 C160 30 165 60 150 70 L150 160 C150 168 142 172 135 172 L65 172 C58 172 50 168 50 160 Z"
            fill="#B45309"
            stroke="#78350F"
            strokeWidth="6"
          />
          {/* Toast inside soft crumb */}
          <path
            d="M60 75 C48 68 52 45 74 48 C88 35 112 35 126 48 C148 45 152 68 140 75 L140 155 C140 160 135 163 130 163 L70 163 C65 163 60 160 60 155 Z"
            fill="#FEF3C7"
          />
          {/* Butter melt on toast */}
          <rect x="85" y="85" width="30" height="28" rx="6" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2" />
          <ellipse cx="98" cy="118" rx="14" ry="5" fill="#FDE047" opacity="0.7" />
        </svg>
      );

    case 'can':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Bottom ellipse */}
          <ellipse cx="100" cy="155" rx="45" ry="16" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="5" />
          {/* Cylinder Body */}
          <path d="M55 55 L55 155 C55 165 145 165 145 155 L145 55 Z" fill="#2563EB" stroke="#1E40AF" strokeWidth="5" />
          {/* Front shading */}
          <path d="M65 57 L65 157 Q100 165 135 157 L135 57 Z" fill="#3B82F6" opacity="0.6" />
          {/* Bright reflection stripe */}
          <rect x="75" y="58" width="12" height="98" fill="#93C5FD" opacity="0.6" rx="4" />
          {/* Logo star */}
          <circle cx="100" cy="110" r="18" fill="#FDE047" />
          <text x="94" y="116" fill="#1E40AF" fontSize="16" fontWeight="bold">★</text>
          {/* Top Lid */}
          <ellipse cx="100" cy="55" rx="45" ry="16" fill="#94A3B8" stroke="#64748B" strokeWidth="5" />
          <ellipse cx="100" cy="55" rx="38" ry="12" fill="#CBD5E1" />
          <ellipse cx="100" cy="55" rx="8" ry="4" fill="#64748B" />
        </svg>
      );

    case 'dice':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Isometric 3D Cube Dice */}
          {/* Top face */}
          <polygon points="100,35 155,65 100,95 45,65" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="4" />
          {/* Left face */}
          <polygon points="45,65 100,95 100,165 45,135" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="4" />
          {/* Right face */}
          <polygon points="100,95 155,65 155,135 100,165" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="4" />
          {/* Red dot on top (1 dot) */}
          <ellipse cx="100" cy="65" rx="8" ry="5" fill="#EF4444" />
          {/* Black dots on left (2 dots) */}
          <ellipse cx="65" cy="95" rx="5" ry="6" fill="#1E293B" />
          <ellipse cx="80" cy="135" rx="5" ry="6" fill="#1E293B" />
          {/* Black dots on right (3 dots) */}
          <ellipse cx="115" cy="135" rx="5" ry="6" fill="#1E293B" />
          <ellipse cx="128" cy="115" rx="5" ry="6" fill="#1E293B" />
          <ellipse cx="140" cy="95" rx="5" ry="6" fill="#1E293B" />
        </svg>
      );

    case 'clock':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="85" fill="#EC4899" stroke="#BE185D" strokeWidth="8" />
          <circle cx="100" cy="100" r="70" fill="#FFF1F2" stroke="#FDA4AF" strokeWidth="4" />
          {/* Numbers 12, 3, 6, 9 */}
          <text x="94" y="52" fill="#881337" fontSize="16" fontWeight="bold">12</text>
          <text x="148" y="106" fill="#881337" fontSize="16" fontWeight="bold">3</text>
          <text x="96" y="156" fill="#881337" fontSize="16" fontWeight="bold">6</text>
          <text x="44" y="106" fill="#881337" fontSize="16" fontWeight="bold">9</text>
          {/* Hands */}
          <line x1="100" y1="100" x2="100" y2="60" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" />
          <line x1="100" y1="100" x2="135" y2="100" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
          <line x1="100" y1="100" x2="80" y2="125" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
          <circle cx="100" cy="100" r="6" fill="#E11D48" />
        </svg>
      );

    case 'party-hat':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Cone body */}
          <path d="M100 35 L40 160 Q100 175 160 160 Z" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="6" />
          {/* Stripes */}
          <path d="M85 70 Q100 76 115 70 L123 90 Q100 98 77 90 Z" fill="#FBBF24" />
          <path d="M68 110 Q100 122 132 110 L142 132 Q100 148 58 132 Z" fill="#10B981" />
          {/* Polka dots */}
          <circle cx="90" cy="150" r="5" fill="#F43F5E" />
          <circle cx="115" cy="148" r="5" fill="#38BDF8" />
          {/* Pom pom at top */}
          <circle cx="100" cy="30" r="14" fill="#F59E0B" stroke="#D97706" strokeWidth="3" />
          <circle cx="96" cy="27" r="4" fill="#FEF3C7" />
        </svg>
      );

    case 'door':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Wall/doorframe */}
          <rect x="45" y="25" width="110" height="155" rx="4" fill="#78350F" stroke="#451A03" strokeWidth="6" />
          {/* Main door panel */}
          <rect x="53" y="32" width="94" height="148" rx="2" fill="#D97706" />
          {/* Recessed panels */}
          <rect x="62" y="42" width="76" height="55" rx="4" fill="#B45309" stroke="#92400E" strokeWidth="3" />
          <rect x="62" y="110" width="76" height="60" rx="4" fill="#B45309" stroke="#92400E" strokeWidth="3" />
          {/* Gold handle */}
          <circle cx="128" cy="108" r="7" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
          <rect x="124" y="105" width="12" height="6" rx="2" fill="#FEF08A" />
        </svg>
      );

    case 'coin':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="#F59E0B" stroke="#B45309" strokeWidth="7" />
          <circle cx="100" cy="100" r="66" fill="#FBBF24" stroke="#FDE047" strokeWidth="4" />
          <circle cx="100" cy="100" r="54" stroke="#D97706" strokeWidth="2" strokeDasharray="4 4" />
          <text x="65" y="115" fill="#78350F" fontSize="42" fontWeight="900" fontFamily="sans-serif">Rp</text>
          {/* Sparkles */}
          <circle cx="68" cy="65" r="5" fill="#FFFBEB" />
          <circle cx="132" cy="135" r="4" fill="#FFFBEB" />
        </svg>
      );

    case 'chessboard':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="30" y="30" width="140" height="140" rx="10" fill="#78350F" stroke="#451A03" strokeWidth="6" />
          <rect x="40" y="40" width="120" height="120" fill="#FEF3C7" />
          {/* 4x4 sample chess grid */}
          {[0, 1, 2, 3].map(row =>
            [0, 1, 2, 3].map(col => {
              if ((row + col) % 2 === 1) {
                return (
                  <rect
                    key={`${row}-${col}`}
                    x={40 + col * 30}
                    y={40 + row * 30}
                    width="30"
                    height="30"
                    fill="#475569"
                  />
                );
              }
              return null;
            })
          )}
        </svg>
      );

    case 'soccer-ball':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="#F8FAFC" stroke="#0F172A" strokeWidth="7" />
          {/* Center black pentagon */}
          <polygon points="100,75 120,90 112,112 88,112 80,90" fill="#0F172A" />
          {/* Neighboring seams and outer patches */}
          <line x1="100" y1="75" x2="100" y2="40" stroke="#0F172A" strokeWidth="5" />
          <line x1="120" y1="90" x2="155" y2="80" stroke="#0F172A" strokeWidth="5" />
          <line x1="112" y1="112" x2="140" y2="145" stroke="#0F172A" strokeWidth="5" />
          <line x1="88" y1="112" x2="60" y2="145" stroke="#0F172A" strokeWidth="5" />
          <line x1="80" y1="90" x2="45" y2="80" stroke="#0F172A" strokeWidth="5" />
          {/* Outer patches */}
          <polygon points="90,25 110,25 100,40" fill="#0F172A" />
          <polygon points="155,80 172,95 165,115 145,110" fill="#0F172A" />
          <polygon points="45,80 28,95 35,115 55,110" fill="#0F172A" />
        </svg>
      );

    case 'starfish':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M100 25 L118 72 L168 76 L130 110 L142 160 L100 134 L58 160 L70 110 L32 76 L82 72 Z"
            fill="#FB923C"
            stroke="#EA580C"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          {/* Starfish cute face */}
          <circle cx="90" cy="98" r="5" fill="#7C2D12" />
          <circle cx="110" cy="98" r="5" fill="#7C2D12" />
          <path d="M94 110 Q100 118 106 110" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" />
          {/* Texture dots */}
          <circle cx="100" cy="55" r="3" fill="#FED7AA" />
          <circle cx="140" cy="85" r="3" fill="#FED7AA" />
          <circle cx="125" cy="140" r="3" fill="#FED7AA" />
          <circle cx="75" cy="140" r="3" fill="#FED7AA" />
          <circle cx="60" cy="85" r="3" fill="#FED7AA" />
        </svg>
      );

    case 'ruler':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer triangle */}
          <polygon points="40,160 160,160 40,40" fill="#38BDF8" stroke="#0284C7" strokeWidth="6" strokeLinejoin="round" />
          {/* Hollow inner triangle */}
          <polygon points="58,142 130,142 58,70" fill="#F0F9FF" stroke="#0284C7" strokeWidth="4" />
          {/* Measurement tick marks */}
          {[50, 70, 90, 110, 130, 150].map((x, i) => (
            <line key={`bot-${x}`} x1={x} y1="160" x2={x} y2={i % 2 === 0 ? "148" : "152"} stroke="#0369A1" strokeWidth="3" />
          ))}
          {[50, 70, 90, 110, 130, 150].map((y, i) => (
            <line key={`left-${y}`} x1="40" y1={y} x2={i % 2 === 0 ? "52" : "48"} y2={y} stroke="#0369A1" strokeWidth="3" />
          ))}
        </svg>
      );

    case 'giftbox':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Box base */}
          <rect x="45" y="75" width="110" height="95" rx="6" fill="#EC4899" stroke="#BE185D" strokeWidth="6" />
          {/* Lid */}
          <rect x="38" y="60" width="124" height="25" rx="5" fill="#F43F5E" stroke="#BE185D" strokeWidth="6" />
          {/* Yellow ribbon vertical */}
          <rect x="90" y="60" width="20" height="110" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
          {/* Yellow ribbon horizontal */}
          <rect x="45" y="112" width="110" height="20" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
          {/* Bow ribbons */}
          <path d="M100 60 C80 30 55 45 90 60 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="3" />
          <path d="M100 60 C120 30 145 45 110 60 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="3" />
          <circle cx="100" cy="60" r="8" fill="#F59E0B" />
        </svg>
      );

    case 'donut':
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dough */}
          <circle cx="100" cy="100" r="80" fill="#FBBF24" stroke="#D97706" strokeWidth="6" />
          {/* Strawberry Frosting */}
          <path
            d="M100 25 C140 25 175 60 175 100 C175 140 140 175 100 175 C60 175 25 140 25 100 C25 60 60 25 100 25 Z"
            fill="#FB7185"
          />
          {/* Center hole */}
          <circle cx="100" cy="100" r="32" fill="#0F172A" stroke="#D97706" strokeWidth="5" />
          {/* Colorful Sprinkles */}
          <rect x="60" y="60" width="12" height="4" rx="2" fill="#38BDF8" transform="rotate(25 60 60)" />
          <rect x="130" y="65" width="12" height="4" rx="2" fill="#FACC15" transform="rotate(-35 130 65)" />
          <rect x="145" y="110" width="12" height="4" rx="2" fill="#4ADE80" transform="rotate(45 145 110)" />
          <rect x="110" y="150" width="12" height="4" rx="2" fill="#A855F7" transform="rotate(15 110 150)" />
          <rect x="55" y="125" width="12" height="4" rx="2" fill="#FDE047" transform="rotate(-20 55 125)" />
          <rect x="90" y="45" width="12" height="4" rx="2" fill="#FFFFFF" transform="rotate(10 90 45)" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="70" fill="#6366F1" />
          <text x="75" y="115" fill="#FFFFFF" fontSize="48" fontWeight="bold">?</text>
        </svg>
      );
  }
};
