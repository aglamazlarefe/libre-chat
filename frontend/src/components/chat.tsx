/* eslint-disable solid/no-innerhtml */
import { createSignal, For, onMount } from 'solid-js';
import { useStore } from '@nanostores/solid';
import { $chatConfig, apiUrl } from '../components/nanostores';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export default function Chat() {
  const chatConfig = useStore($chatConfig);

  const [messages, setMessages] = createSignal([
    { message: "How can I help you today?", type: "bot", sources: [] }
  ]);
  const [prompt, setPrompt] = createSignal("");
  const [warningMsg, setWarningMsg] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  let chatContainer: HTMLDivElement | undefined;

  const appendMessage = (message: string, type = "bot") => {
    setMessages(messages => [...messages, { message, type, sources: [] }]);
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  const handleInput = (event: any) => setPrompt(event.target.innerText);
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitInput();
    }
  };
  const handleSubmit = (event: Event) => {
    event.preventDefault();
    submitInput();
  };

  const submitInput = async () => {
    if (loading()) {
      setWarningMsg("⏳ Thinking...");
      return;
    }
    if (!prompt().trim()) return;

    appendMessage(prompt(), "user");
    setLoading(true);
    const userPrompt = prompt();
    setPrompt("");

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b:free",
          messages: [{ role: "user", content: userPrompt }]
        })
      });

      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();
      const botReply = data?.choices?.[0]?.message?.content || "No response";
      appendMessage(botReply, "bot");
    } catch (err) {
      console.error(err);
      appendMessage("An error happened, please retry.", "bot");
    } finally {
      setLoading(false);
      setWarningMsg("");
    }
  };

  return (
    <main class="flex flex-col overflow-y-auto flex-grow">
      <div
        ref={el => chatContainer = el!}
        id="chat-container"
        class="flex-grow overflow-y-auto"
      >
        <div class="container mx-auto px-2 max-w-5xl">
          <div
            class="py-4 text-center font-thin"
            innerHTML={DOMPurify.sanitize(
              marked.parse(chatConfig().info.description).toString()
            )}
          />
        </div>

        <div id="chat-thread" class="w-full border-t border-slate-500">
          <For each={messages()}>{(msg) =>
            <div class={`border-b border-slate-500 ${msg.type === "user" ? "bg-accent" : "bg-secondary"}`}>
              <div class="px-2 py-8 mx-auto max-w-5xl">
                <article
                  class="prose max-w-full"
                  innerHTML={DOMPurify.sanitize(marked.parse(msg.message).toString())}
                />
              </div>
            </div>
          }</For>
        </div>
      </div>

      <div>
        {warningMsg() && (
          <div class="text-center text-orange-900 bg-orange-300 p-2 text-sm rounded-lg mb-2">
            {warningMsg()}
          </div>
        )}

        <form class="p-2 flex" onSubmit={handleSubmit}>
          <div class="container flex mx-auto max-w-5xl">
            <div
              id="user-input"
              contentEditable
              style="height: max-content;"
              class="flex-grow px-4 py-2 border border-slate-500 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              data-placeholder="Ask something..."
              onInput={handleInput}
              onKeyDown={handleKeyPress}
            />
            <button
              type="submit"
              id="submit-btn"
              class="ml-2 px-4 py-2 rounded-lg text-slate-400 bg-slate-600 hover:bg-slate-700"
            >
              {loading() ? (
                <i class="fas fa-spinner fa-spin"/>
              ) : (
                <i class="fas fa-paper-plane"/>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
