
  <img alt="Next.js 14 and App Router-ready AI chatbot." src="app/(chat)/opengraph-image.png">
  <h1 align="center">Next.js AI Chatbot</h1>


<p align="center">
  An Open-Source AI Chatbot Template Built With Next.js and the AI SDK by Vercel. Supporting multiple AI Providers like OpenAI, Anthropic, and Google Gemini.
</p>

## Tools
- AI Image Generation
- Weather Checker
- Memory

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PNPM package manager
- A Cloudinary account for file uploads
- API keys for the AI providers you want to use

### Installation Steps

1. Clone the repository
```bash
git clone https://github.com/the-asad-iqbal/ai-chatbot.git
cd ai-chatbot
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables:
   - Copy the `.env.example` file to `.env.local`
   ```bash
   cp .env.example .env.local
   ```
   - Fill in all required environment variables in `.env.local`

4. Set up Cloudinary (for file uploads):
   - Create a Cloudinary account at https://cloudinary.com/
   - Get your Cloud Name, API Key, and API Secret from your dashboard
   - Add these to your `.env.local` file

5. Start the development server
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### 📁 File Upload Configuration

This project uses Cloudinary for file uploads. The integration allows users to:
- Upload images and files directly to Cloudinary
- Get secure URLs for uploaded files
- Manage uploads through Cloudinary's dashboard

To configure Cloudinary:
1. Add your Cloudinary credentials to `.env.local`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
2. The upload functionality is automatically configured once environment variables are set

### 🤖 Supported AI Providers

This chatbot template supports multiple AI providers:
- OpenAI (GPT-4o)
- Anthropic (Claude)
- Google (Gemini)
- Together AI - For Image Generation
- Mistral AI

Configure the providers you want to use by adding their respective API keys to your `.env.local` file.
