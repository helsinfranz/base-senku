"use client"

export default function GameBoard({ tubes, selectedTube, onTubeClick }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8 px-2">
      {tubes.map((tube, index) => (
        <div
          key={index}
          className={`relative cursor-pointer transition-all duration-300 ${selectedTube === index
              ? "transform -translate-y-2 drop-shadow-[0_0_20px_rgba(34,197,94,0.6)]"
              : "hover:transform hover:-translate-y-1"
            }`}
          onClick={() => onTubeClick(index)}
        >
          {/* Test Tube Container */}
          <div className="relative w-12 h-36 md:w-16 md:h-48">
            {/* Glass Tube */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-300/20 via-gray-100/30 to-gray-300/20 rounded-b-full border-2 border-gray-400/50 backdrop-blur-sm">
              {/* Measurement Markings */}
              <div className="absolute left-0 top-3 md:top-4 w-1.5 md:w-2 h-px bg-gray-400/50"></div>
              <div className="absolute left-0 top-9 md:top-12 w-1.5 md:w-2 h-px bg-gray-400/50"></div>
              <div className="absolute left-0 top-15 md:top-20 w-1.5 md:w-2 h-px bg-gray-400/50"></div>
              <div className="absolute left-0 top-21 md:top-28 w-1.5 md:w-2 h-px bg-gray-400/50"></div>

              {/* Liquid Layers */}
              <div className="absolute bottom-1.5 md:bottom-2 left-1.5 md:left-2 right-1.5 md:right-2 flex flex-col-reverse">
                {tube.map((liquid, liquidIndex) => (
                  <div
                    key={liquidIndex}
                    className="h-7 md:h-10 rounded-sm relative overflow-hidden"
                    style={{
                      background: `linear-gradient(to bottom, ${liquid.color}E6, ${liquid.color}CC, ${liquid.color})`,
                    }}
                  >
                    {/* Liquid shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </div>
                ))}
              </div>

              {/* Glass reflection */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5 rounded-b-full pointer-events-none"></div>
            </div>

            {/* Selection Glow */}
            {selectedTube === index && (
              <div className="absolute inset-0 rounded-b-full border-2 border-green-400 animate-pulse pointer-events-none"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
