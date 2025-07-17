import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function GeminiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [type, setType] = useState<'wish' | 'quote' | 'invitation'>('wish');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, type }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-4">
      <div className="flex gap-2 mb-4">
        <Button
          variant={type === 'wish' ? 'default' : 'outline'}
          onClick={() => setType('wish')}
        >
          Lời chúc
        </Button>
        <Button
          variant={type === 'quote' ? 'default' : 'outline'}
          onClick={() => setType('quote')}
        >
          Ngạn ngữ
        </Button>
        <Button
          variant={type === 'invitation' ? 'default' : 'outline'}
          onClick={() => setType('invitation')}
        >
          Lời mời
        </Button>
      </div>

      <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập yêu cầu của bạn..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Đang xử lý...' : 'Gửi'}
        </Button>
      </form>
    </Card>
  );
} 