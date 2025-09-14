/* eslint-disable solid/no-innerhtml */
import { createSignal, For, onMount } from 'solid-js';
import { useStore } from '@nanostores/solid';
import { $chatConfig, apiUrl } from '../components/nanostores';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface Source {
  metadata: { filename: string, page?: number };
  page_content?: string;
}

interface Message {
  message: string;
  type: "user" | "bot";
  sources: Source[];
}

export default function Chat() {
  const chatConfig = useStore($chatConfig);

  const [messages, setMessages] = createSignal<Message[]>([
    { message: "Size bugün nasıl yardımcı olabilirim?", type: "bot", sources: [] }
  ]);
  const [prompt, setPrompt] = createSignal("");
  const [warningMsg, setWarningMsg] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  let chatContainer: HTMLDivElement | undefined;

  const appendMessage = (message: string, type: "user" | "bot" = "bot") => {
    setMessages(messages => [...messages, { message, type, sources: [] }]);
    setTimeout(() => {
      chatContainer?.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
    }, 50);
  };

  function handleSubmit(event: Event) {
    event.preventDefault();
    submitInput();
  }

  function handleInput(event: any) {
    setPrompt(event.target.innerText);
  }

  function handleKeyPress(event: any) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitInput();
    }
  }

  async function submitInput() {
    if (loading()) {
      setWarningMsg("⏳ Thinking...");
      return;
    }
    if (prompt().trim() !== "") {
      appendMessage(prompt(), "user");
      const params = { prompt: prompt() };

      try {
        setLoading(true);
        setPrompt("");
        setWarningMsg("");

        const response = await fetch(apiUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: prompt() })
});
const data = await response.json();
console.log("Backend yanıtı:", data); // buraya bak
appendMessage(data?.message || data?.result || "No response", "bot");
      } catch (err) {
        console.error(err);
        appendMessage("An error happened, please retry.", "bot");
      } finally {
        setLoading(false);
      }
    }
  }

  onMount(() => {
    chatContainer?.scrollTo({ top: chatContainer.scrollHeight });
  });

  return (
    <main class="flex flex-col h-full overflow-hidden p-4 bg-gray-50 dark:bg-gray-900">
      <div ref={chatContainer} class="flex-grow overflow-y-auto p-4 bg-gray-100 dark:bg-gray-800 rounded-md shadow-inner mb-4">
        <div class="max-w-3xl mx-auto">
          
          <For each={messages()}>
            {(msg) =>
              <div class={`mb-2 p-3 rounded-lg max-w-[75%] break-words ${msg.type === "user" ? "bg-blue-500 text-white ml-auto" : "bg-gray-200 text-gray-900 mr-auto"}`}>
                <article class="prose max-w-full" innerHTML={DOMPurify.sanitize(marked.parse(msg.message).toString())} />
                {msg.sources.length > 0 &&
                  <For each={msg.sources}>{(source: Source) =>
                    <button class="text-xs px-2 py-1 rounded bg-gray-300 hover:bg-gray-400 m-1">
                      {source.metadata.filename}
                    </button>
                  }</For>
                }
              </div>
            }
          </For>
        </div>
      </div>

      {warningMsg() && 
        <div class="text-center text-orange-900 font-semibold mb-2">
          {warningMsg()}
        </div>
      }

      <div class="flex flex-wrap gap-2 justify-center mb-2">
        <For each={chatConfig().info.examples}>{example =>
          <button onClick={() => { setPrompt(example); submitInput(); }} 
                  class="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 text-sm text-black ">
            {example}
          </button>
        }</For>
      </div>

      <form class="flex items-center max-w-3xl mx-auto" onSubmit={handleSubmit}>
        <div id="user-input" contentEditable={true} 
             class="flex-grow px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
             onInput={handleInput} onKeyDown={handleKeyPress} 
             role="textbox" aria-multiline="true" />
        <button type="submit" class="ml-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">
          {loading() ? "..." : "Send"}
        </button>
      </form>
    </main>
  );
}
