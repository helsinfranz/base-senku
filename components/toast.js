"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

const ToastContext = createContext()

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = (message, type = "info", duration = 5000) => {
        const id = Date.now() + Math.random()
        const toast = { id, message, type, duration }

        setToasts((prev) => [...prev, toast])

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }

    const toast = {
        success: (message, duration) => addToast(message, "success", duration),
        error: (message, duration) => addToast(message, "error", duration),
        warning: (message, duration) => addToast(message, "warning", duration),
        info: (message, duration) => addToast(message, "info", duration),
    }

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider")
    }
    return context
}

function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed top-20 right-4 z-[100] space-y-2 max-w-sm w-full">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    )
}

function Toast({ toast, onRemove }) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setIsVisible(true)
    }, [])

    const handleRemove = () => {
        setIsVisible(false)
        setTimeout(() => onRemove(toast.id), 300)
    }

    const getToastStyles = () => {
        switch (toast.type) {
            case "success":
                return "bg-green-900/90 border-green-500/50 text-green-100"
            case "error":
                return "bg-red-900/90 border-red-500/50 text-red-100"
            case "warning":
                return "bg-yellow-900/90 border-yellow-500/50 text-yellow-100"
            default:
                return "bg-blue-900/90 border-blue-500/50 text-blue-100"
        }
    }

    const getIcon = () => {
        switch (toast.type) {
            case "success":
                return <CheckCircle className="w-5 h-5 text-green-400" />
            case "error":
                return <AlertCircle className="w-5 h-5 text-red-400" />
            case "warning":
                return <AlertTriangle className="w-5 h-5 text-yellow-400" />
            default:
                return <Info className="w-5 h-5 text-blue-400" />
        }
    }

    return (
        <div
            className={`
        ${getToastStyles()}
        backdrop-blur-md border rounded-lg p-4 shadow-2xl
        transform transition-all duration-300 ease-out
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
        >
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">{getIcon()}</div>
                <div className="flex-1 text-sm font-medium">{toast.message}</div>
                <button onClick={handleRemove} className="flex-shrink-0 text-gray-400 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
