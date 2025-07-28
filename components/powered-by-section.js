"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

// Array of partner/sponsor logo URLs - you can replace these with your actual URLs
const PARTNER_LOGOS = [
    "/placeholder.svg?height=60&width=120&text=Base",
    "/placeholder.svg?height=60&width=100&text=Virtuals",
    "/placeholder.svg?height=60&width=140&text=DcodeBlock",
    "/placeholder.svg?height=60&width=110&text=Partner4",
    "/placeholder.svg?height=60&width=130&text=Partner5",
    "/placeholder.svg?height=60&width=90&text=Partner6",
]

export default function PoweredBySection() {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % Math.ceil(PARTNER_LOGOS.length / 3))
        }, 3000)

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
            <div className="text-center mb-6 md:mb-8">
                <h3 className="text-lg md:text-xl font-semibold text-gray-400 mb-2">Powered By</h3>
                <div className="w-16 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 mx-auto"></div>
            </div>

            {/* Desktop View - All logos visible */}
            <div className="hidden md:flex items-center justify-center space-x-8 lg:space-x-12">
                {PARTNER_LOGOS.map((logo, index) => (
                    <div
                        key={index}
                        className="relative h-12 lg:h-16 flex items-center justify-center opacity-60 hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                        style={{ width: "auto", minWidth: "80px", maxWidth: "160px" }}
                    >
                        <Image
                            src={logo || "/placeholder.svg"}
                            alt={`Partner ${index + 1}`}
                            width={120}
                            height={60}
                            className="object-contain filter brightness-0 invert opacity-70 hover:opacity-100 transition-all duration-300"
                            style={{ width: "auto", height: "100%" }}
                        />
                    </div>
                ))}
            </div>

            {/* Mobile View - Sliding carousel */}
            <div className="md:hidden">
                <div className="flex items-center justify-center space-x-6 min-h-[60px]">
                    {getVisibleLogos().map((logo, index) => (
                        <div
                            key={`${currentIndex}-${index}`}
                            className="relative h-10 flex items-center justify-center opacity-60 animate-fade-in"
                            style={{ width: "auto", minWidth: "60px", maxWidth: "120px" }}
                        >
                            <Image
                                src={logo || "/placeholder.svg"}
                                alt={`Partner ${index + 1}`}
                                width={100}
                                height={50}
                                className="object-contain filter brightness-0 invert opacity-70"
                                style={{ width: "auto", height: "100%" }}
                            />
                        </div>
                    ))}
                </div>

                {/* Dots indicator */}
                <div className="flex justify-center space-x-2 mt-4">
                    {Array.from({ length: Math.ceil(PARTNER_LOGOS.length / 3) }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-green-400" : "bg-gray-600"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
