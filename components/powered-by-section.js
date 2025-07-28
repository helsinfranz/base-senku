"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

// Array of partner/sponsor logo URLs - you can replace these with your actual URLs
const PARTNER_LOGOS = [
    {
        url: "https://www.dcodeblock.com/assets/dcb-logo-YdUy8tsw.png",
        name: "DcodeBlock",
        width: 140,
        height: 60,
    },
    {
        url: "/placeholder.svg?height=60&width=120&text=Base",
        name: "Base",
        width: 120,
        height: 60,
    },
    {
        url: "/placeholder.svg?height=60&width=100&text=Virtuals",
        name: "Virtuals",
        width: 100,
        height: 60,
    },
    {
        url: "/placeholder.svg?height=60&width=110&text=Partner4",
        name: "Partner 4",
        width: 110,
        height: 60,
    },
    {
        url: "/placeholder.svg?height=60&width=130&text=Partner5",
        name: "Partner 5",
        width: 130,
        height: 60,
    },
    {
        url: "/placeholder.svg?height=60&width=90&text=Partner6",
        name: "Partner 6",
        width: 90,
        height: 60,
    },
]

export default function PoweredBySection() {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % Math.ceil(PARTNER_LOGOS.length / 3))
        }, 4000)

        return () => clearInterval(interval)
    }, [])

    const getVisibleLogos = () => {
        const logosPerSlide = 3
        const start = currentIndex * logosPerSlide
        const end = start + logosPerSlide
        return PARTNER_LOGOS.slice(start, end)
    }

    return (
        <div className="w-full py-8 md:py-12">
            <div className="text-center mb-8 md:mb-10">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">Ecosystem Partners</h3>
                <div className="w-20 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 mx-auto rounded-full"></div>
                <p className="text-gray-400 text-sm md:text-base mt-3">Building the future of science together</p>
            </div>

            {/* Desktop View - All logos visible with better spacing */}
            <div className="hidden md:flex items-center justify-center gap-8 lg:gap-12 xl:gap-16">
                {PARTNER_LOGOS.map((logo, index) => (
                    <div
                        key={index}
                        className="group relative flex items-center justify-center p-4 rounded-xl bg-gray-800/20 backdrop-blur-sm border border-gray-700/30 hover:border-green-500/50 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2"
                        style={{ minWidth: "120px", minHeight: "80px" }}
                    >
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10">
                            <Image
                                src={logo.url || "/placeholder.svg"}
                                alt={logo.name}
                                width={logo.width}
                                height={logo.height}
                                className="object-contain transition-all duration-500 group-hover:brightness-110"
                                style={{
                                    width: "auto",
                                    height: "auto",
                                    maxWidth: `${logo.width}px`,
                                    maxHeight: `${logo.height}px`,
                                    filter: logo.url.includes("dcodeblock") ? "none" : "brightness(0) invert(1) opacity(0.8)",
                                }}
                            />
                        </div>

                        {/* Partner name tooltip */}
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-xs text-gray-400 whitespace-nowrap bg-gray-900/80 px-2 py-1 rounded">
                                {logo.name}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile View - Enhanced sliding carousel */}
            <div className="md:hidden">
                <div className="flex items-center justify-center gap-4 min-h-[100px] px-4">
                    {getVisibleLogos().map((logo, index) => (
                        <div
                            key={`${currentIndex}-${index}`}
                            className="relative flex items-center justify-center p-3 rounded-lg bg-gray-800/20 backdrop-blur-sm border border-gray-700/30 animate-fade-in"
                            style={{ minWidth: "80px", minHeight: "60px" }}
                        >
                            <Image
                                src={logo.url || "/placeholder.svg"}
                                alt={logo.name}
                                width={logo.width * 0.8}
                                height={logo.height * 0.8}
                                className="object-contain"
                                style={{
                                    width: "auto",
                                    height: "auto",
                                    maxWidth: `${logo.width * 0.8}px`,
                                    maxHeight: `${logo.height * 0.8}px`,
                                    filter: logo.url.includes("dcodeblock") ? "none" : "brightness(0) invert(1) opacity(0.8)",
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Enhanced dots indicator */}
                <div className="flex justify-center space-x-2 mt-6">
                    {Array.from({ length: Math.ceil(PARTNER_LOGOS.length / 3) }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex
                                    ? "bg-gradient-to-r from-green-400 to-blue-400 scale-125"
                                    : "bg-gray-600 hover:bg-gray-500"
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom decorative line */}
            <div className="mt-8 md:mt-12 flex justify-center">
                <div className="w-32 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
            </div>
        </div>
    )
}
