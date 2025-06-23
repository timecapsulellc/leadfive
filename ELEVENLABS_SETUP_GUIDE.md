# ElevenLabs Conversational AI Setup Guide

## Step 1: Create an ElevenLabs Conversational AI Agent

1. Go to [ElevenLabs Conversational AI](https://elevenlabs.io/app/conversational-ai)
2. Sign in with your ElevenLabs account
3. Click "Create New Agent" or similar button
4. Configure your agent:
   - **Name**: LeadFive Assistant
   - **Description**: AI assistant for LeadFive platform users
   - **Voice**: Choose a professional voice (or use the voice ID you already have)
   - **Language**: English
   - **Personality**: Professional, helpful, knowledgeable about business and blockchain

5. Set up the agent prompt:
```
You are an AI assistant for LeadFive, a blockchain-based business platform. 
You help users understand their earnings, team growth, and platform features. 
Be friendly, helpful, and knowledgeable about business and blockchain concepts.
Always maintain a professional yet approachable tone.

When users ask about their stats, refer to the contextual information provided.
Help them understand how to grow their team, increase earnings, and use platform features effectively.
```

6. After creating the agent, copy the **Agent ID** from the agent settings

## Step 2: Update Environment Variables

1. Open your `.env` file
2. Find the line: `VITE_ELEVENLABS_AGENT_ID=your-agent-id-here`
3. Replace `your-agent-id-here` with your actual Agent ID
4. Save the file

## Step 3: Test the Integration

1. Restart your development server: `npm run dev`
2. Navigate to a page with the AI assistant
3. Click the "Start AI Conversation" button
4. Grant microphone permissions when prompted
5. Start talking to test the conversation

## Troubleshooting

- **"Agent ID not configured"**: Make sure you've added the correct agent ID to your `.env` file
- **"API key not configured"**: Verify your ElevenLabs API key is correct
- **Microphone issues**: Check browser permissions and ensure HTTPS is used
- **Connection fails**: Check your ElevenLabs account limits and API key validity

## Alternative: Use Signed URLs (For Production)

For production environments, consider using signed URLs instead of exposing the agent ID:

1. Create a server endpoint that generates signed URLs
2. Use the `url` parameter instead of `agentId` in `startSession`
3. This provides better security for production applications

Example server endpoint:
```javascript
const response = await fetch(
  `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
  {
    method: "GET",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY
    }
  }
);
const { signed_url } = await response.json();
```

Then use:
```javascript
await conversation.startSession({ url: signed_url });
```
