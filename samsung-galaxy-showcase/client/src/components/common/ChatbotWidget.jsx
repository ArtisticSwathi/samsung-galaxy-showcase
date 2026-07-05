import { useState, useRef, useEffect, useCallback } from 'react'
import { sendChatMessage } from '../../services/chatbotService'

// Samsung-style SVG icons (inline, no dependencies)
const SamsungIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <circle cx="20" cy="20" r="20" fill="url(#sg)" />
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="system-ui">S</text>
    <defs>
      <linearGradient id="sg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1428A0" />
        <stop offset="100%" stopColor="#0077FF" />
      </linearGradient>
    </defs>
  </svg>
)

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
    <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.531v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
  </svg>
)

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
)

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
)

const WELCOME_MESSAGE = {
  role: 'model',
  text: "👋 Hi! I'm your Samsung Store Assistant. I'm here to help you find the perfect Samsung phone!\n\nAsk me anything about our latest models — specs, prices, storage options, or which phone suits your needs best. 📱",
}

// Convert display messages to Gemini history format for the API
function toGeminiHistory(messages) {
  return messages
    .filter((m) => m !== WELCOME_MESSAGE)
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }))
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const hasOpenedOnce = useRef(false)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading, isOpen])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !hasOpenedOnce.current) {
      hasOpenedOnce.current = true
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSend = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMessage = { role: 'user', text: trimmed }
    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const history = toGeminiHistory(nextMessages.slice(0, -1)) // history before current msg
      const reply = await sendChatMessage(trimmed, history)
      setMessages((prev) => [...prev, { role: 'model', text: reply }])
    } catch (err) {
      setError(err.message)
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: `⚠️ ${err.message}`, isError: true },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    setMessages([WELCOME_MESSAGE])
    setError(null)
    inputRef.current?.focus()
  }

  // Render markdown-lite: bold **text** and newlines
  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return part.split('\n').map((line, j) => (
        <span key={`${i}-${j}`}>
          {line}
          {j < part.split('\n').length - 1 && <br />}
        </span>
      ))
    })
  }

  return (
    <>
      {/* ── Floating Toggle Button ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

        {/* Tooltip label */}
        {!isOpen && (
          <div
            className="bg-[#1428A0] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg
                       opacity-0 translate-x-2 animate-[fadeSlideIn_0.4s_1.5s_ease_forwards] whitespace-nowrap pointer-events-none"
          >
            Ask our AI Assistant
          </div>
        )}

        <button
          id="chatbot-toggle-btn"
          onClick={() => setIsOpen((o) => !o)}
          aria-label={isOpen ? 'Close chat assistant' : 'Open chat assistant'}
          className="relative w-14 h-14 rounded-full flex items-center justify-center
                     bg-gradient-to-br from-[#1428A0] to-[#0077FF] text-white shadow-2xl
                     hover:scale-110 active:scale-95 transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-[#0077FF] focus:ring-offset-2 focus:ring-offset-black"
        >
          {/* Pulse ring */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-[#1428A0] opacity-30 animate-ping pointer-events-none" />
          )}
          <span className="relative z-10 transition-all duration-200">
            {isOpen ? <CloseIcon /> : <ChatIcon />}
          </span>
        </button>
      </div>

      {/* ── Chat Panel ── */}
      <div
        id="chatbot-panel"
        className={`fixed bottom-24 right-6 z-50 flex flex-col
                   w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)]
                   rounded-2xl overflow-hidden shadow-2xl border border-white/10
                   transition-all duration-300 origin-bottom-right
                   ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'}`}
        style={{
          background: 'linear-gradient(160deg, rgba(10,12,30,0.97) 0%, rgba(5,8,20,0.99) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b border-white/10 flex-shrink-0"
          style={{ background: 'linear-gradient(90deg, #0D1240 0%, #0a1060 100%)' }}
        >
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#0077FF]/60">
            <SamsungIcon />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold leading-tight truncate">Samsung Assistant</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-[10px] font-medium">Online · Powered by Gemini</span>
            </div>
          </div>
          <button
            id="chatbot-clear-btn"
            onClick={handleClear}
            title="Clear conversation"
            className="text-white/40 hover:text-white/80 text-[10px] font-medium transition-colors px-2 py-1 rounded hover:bg-white/10"
          >
            Clear
          </button>
          <button
            id="chatbot-close-btn"
            onClick={() => setIsOpen(false)}
            className="text-white/40 hover:text-white/80 transition-colors p-1 rounded hover:bg-white/10"
            aria-label="Close chat"
          >
            <CloseIcon />
          </button>
        </div>

        {/* ── Messages Area ── */}
        <div
          id="chatbot-messages"
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {msg.role === 'model' && (
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-1 ring-1 ring-[#0077FF]/40">
                  <SamsungIcon />
                </div>
              )}

              {/* Bubble */}
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-[#1428A0] to-[#0055CC] text-white rounded-tr-sm'
                    : msg.isError
                      ? 'bg-red-950/60 border border-red-500/30 text-red-200 rounded-tl-sm'
                      : 'bg-white/8 border border-white/10 text-gray-100 rounded-tl-sm'
                  }`}
              >
                {renderText(msg.text)}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-2.5 flex-row">
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-1 ring-1 ring-[#0077FF]/40">
                <SamsungIcon />
              </div>
              <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Quick Prompts ── */}
        {messages.length <= 1 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2 flex-shrink-0">
            {[
              'What phones do you have?',
              'Best phone under ₹1L?',
              'Compare S25 Ultra & Z Fold7',
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => { setInput(prompt); setTimeout(() => inputRef.current?.focus(), 50) }}
                className="text-xs px-3 py-1.5 rounded-full border border-[#1428A0]/60 text-blue-300
                           hover:bg-[#1428A0]/30 hover:border-[#1428A0] transition-all duration-150"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* ── Input Bar ── */}
        <div className="flex items-end gap-2 px-3 pb-3 pt-2 border-t border-white/10 flex-shrink-0">
          <textarea
            id="chatbot-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about specs, prices, or recommendations…"
            rows={1}
            className="flex-1 bg-white/8 border border-white/15 text-white placeholder-white/30 text-sm
                       rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:border-[#1428A0]/80
                       focus:ring-1 focus:ring-[#1428A0]/40 transition-all duration-150
                       min-h-[42px] max-h-[100px] leading-5"
            style={{ scrollbarWidth: 'none' }}
            disabled={isLoading}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
            }}
          />
          <button
            id="chatbot-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center
                       bg-gradient-to-br from-[#1428A0] to-[#0077FF] text-white
                       disabled:opacity-30 disabled:cursor-not-allowed
                       hover:opacity-90 active:scale-95 transition-all duration-150 shadow-lg"
          >
            <SendIcon />
          </button>
        </div>

        {/* Gemini badge */}
        <div className="text-center pb-2 flex-shrink-0">
          <span className="text-[9px] text-white/20 font-medium tracking-wide">
            Powered by Google Gemini · Samsung Galaxy Showcase
          </span>
        </div>
      </div>

      {/* Keyframe for tooltip fade-in */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
