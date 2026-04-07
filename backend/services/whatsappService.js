const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

let client = null;

// Initialize Twilio client
function initializeClient() {
  if (!accountSid || !authToken || 
      accountSid === 'your_twilio_sid_here' || 
      authToken === 'your_twilio_auth_token_here') {
    // Silently skip if not configured
    return false;
  }
  
  try {
    client = twilio(accountSid, authToken);
    console.log('✅ Twilio WhatsApp client initialized');
    return true;
  } catch (error) {
    console.error('❌ Twilio initialization error:', error.message);
    return false;
  }
}

/**
 * Send WhatsApp message
 * @param {string} to - Recipient phone number (with country code)
 * @param {string} message - Message text
 */
async function sendWhatsAppMessage(to, message) {
  if (!client && !initializeClient()) {
    return {
      success: false,
      error: 'WhatsApp service not configured'
    };
  }

  try {
    const result = await client.messages.create({
      from: whatsappNumber,
      to: `whatsapp:${to}`,
      body: message
    });

    return {
      success: true,
      messageId: result.sid,
      status: result.status
    };
  } catch (error) {
    console.error('WhatsApp send error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send news digest via WhatsApp
 */
async function sendNewsDigest(to, digest) {
  return await sendWhatsAppMessage(to, digest);
}

/**
 * Handle incoming WhatsApp messages (webhook)
 */
function handleIncomingMessage(req, res) {
  const { Body, From } = req.body;
  
  console.log(`WhatsApp message from ${From}: ${Body}`);
  
  // You can process the message and respond
  // This is handled by your webhook endpoint
  
  res.status(200).send('Message received');
}

module.exports = {
  initializeClient,
  sendWhatsAppMessage,
  sendNewsDigest,
  handleIncomingMessage
};
