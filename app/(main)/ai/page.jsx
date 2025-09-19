// app/(main)/ai/page.jsx
import AiChatClient from "@/components/AiChatClient";

export const metadata = {
  title: "AI Assistant - Trackify",
};

export default function AiPage() {
  return (
    <div className="pt-20"> {/* pad for fixed header */}
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-semibold mb-4">Trackify AI Assistant</h1>
        <p className="text-gray-600 mb-6">Ask the assistant to analyze balances, prepare transfers, or explain transactions.</p>
        <AiChatClient />
      </div>
    </div>
  );
}
