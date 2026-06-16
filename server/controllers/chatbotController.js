// @desc    Process chatbot message
// @route   POST /api/chatbot
// @access  Public
export const handleChatMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      res.status(400);
      throw new Error('Message is required');
    }

    const lowerMessage = message.toLowerCase();
    let reply = "I'm not sure about that. Try asking about S26 Ultra specs, price, colors, or checkout details!";

    if (lowerMessage.includes('spec') || lowerMessage.includes('feature') || lowerMessage.includes('camera') || lowerMessage.includes('screen')) {
      reply = "The Galaxy S26 Ultra features an aerospace-grade Titanium frame, standard S Pen, Snapdragon 8 Gen 5 processor, a 6.9-inch Dynamic AMOLED 2X display, and a quad-lens 200MP camera system.";
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      reply = "The Galaxy S26 pricing starts at $799.99 for S26 standard, $999.99 for S26+, and $1299.99 for the Galaxy S26 Ultra.";
    } else if (lowerMessage.includes('color') || lowerMessage.includes('finish') || lowerMessage.includes('variant')) {
      reply = "The Galaxy S26 Ultra is available in Titanium Gray, Titanium Black, Titanium Violet, and Titanium Yellow. You can preview these in our 3D configurator!";
    } else if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      reply = "We offer free standard shipping on all Galaxy S26 devices. Standard shipping takes 3-5 business days. Express shipping options are available at checkout.";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      reply = "Hello! I am your Samsung Galaxy chatbot assistant. Ask me anything about specs, prices, or order info.";
    }

    res.json({ reply });
  } catch (error) {
    next(error);
  }
};
