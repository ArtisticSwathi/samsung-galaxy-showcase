import { useState, useRef, useEffect } from 'react'

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Welcome to Samsung Elite Services. I am your concierge. How may I assist you with your Galaxy S23 Ultra purchase today?' }
  ])
  const [inputVal, setInputVal] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputVal.trim()) return

    const userText = inputVal
    setMessages((prev) => [...prev, { sender: 'user', text: userText }])
    setInputVal('')
    setIsTyping(true)

    // Simulate AI response delay
    setTimeout(() => {
      let botResponse = "I would be delighted to assist you with that request. Please let me know if you would like info on our 200MP camera, battery performance, pricing options, or express shipping."
      
      const query = userText.toLowerCase()
      if (query.includes('camera') || query.includes('lens') || query.includes('photo') || query.includes('night')) {
        botResponse = "The Galaxy S23 Ultra boasts an incredible 200 Megapixel Adaptive Pixel camera. It combines 16 pixels into one super-pixel for revolutionary low-light 'Nightography' details."
      } else if (query.includes('battery') || query.includes('charge') || query.includes('power')) {
        botResponse = "It features a long-lasting 5000 mAh intelligent battery that optimizes power usage based on your routines, paired with 45W Super Fast Charging 2.0."
      } else if (query.includes('price') || query.includes('cost') || query.includes('buy') || query.includes('storage')) {
        botResponse = "The S23 Ultra starts at $1,199.99 (256GB). The 512GB upgrade is +$150, and the extreme 1TB storage edition is +$350. Selected options are added straight to your cart!"
      } else if (query.includes('ship') || query.includes('deliver') || query.includes('delivery')) {
        botResponse = "We offer complimentary express white-glove shipping on all elite orders. Delivery usually takes 2-3 business days with full real-time tracking."
      } else if (query.includes('hi') || query.includes('hello') || query.includes('hey')) {
        botResponse = "Greetings! I am here to ensure you have a premium buying experience. Let me know if you have questions about device specs or order placements."
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }])
      setIsTyping(false)
    }, 1200)
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      
      {/* ── Chat Toggle Button ── */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-xl shadow-cyan-500/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer z-50 relative"
        aria-label="Open Chat assistant"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* ── Chat Window Overlay ── */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 md:w-96 h-[480px] bg-[#08080d]/90 border border-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-fade-in">
          
          {/* Concierge Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border-b border-white/5 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Galaxy Concierge</h3>
              <p className="text-[9px] text-white/50 tracking-wider font-light">Online • Premium Support</p>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-cyan-500/20">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-semibold rounded-tr-none' 
                      : 'bg-white/5 border border-white/5 text-white/90 rounded-tl-none font-light'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/5 text-white/50 rounded-2xl rounded-tl-none px-4 py-3 text-[10px] tracking-widest font-mono">
                  CONCIERGE IS TYPING...
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form 
            onSubmit={handleSendMessage}
            className="p-4 border-t border-white/5 bg-black/40 flex gap-2"
          >
            <input 
              type="text" 
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask about camera, battery, pricing..."
              className="flex-1 px-4 py-3 bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 focus:border-cyan-500/50 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none transition-colors font-light"
            />
            <button 
              type="submit"
              className="px-4 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer"
            >
              Send
            </button>
          </form>

        </div>
      )}

    </div>
  )
}
