import { useState, useEffect } from 'react';
import { Loader, Send, X } from 'lucide-react';
import { LLMConfig, Prompt } from '../types';

interface TestPromptModalProps {
  prompt: Prompt;
  llmConfig: LLMConfig;
  onClose: () => void;
}

const TestPromptModal = ({ prompt, llmConfig, onClose }: TestPromptModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [systemPrompt, setSystemPrompt] = useState<string>('You are a helpful assistant.');
  const [temperature, setTemperature] = useState<number>(0.7); // Default temperature

  // Extract variables from the prompt content
  useEffect(() => {
    const regex = /\{([^}]+)\}/g;
    const vars: Record<string, string> = {};
    let match;

    while ((match = regex.exec(prompt.content))) {
      vars[match[1]] = ''; // Initialize variables with empty strings
    }

    setVariables(vars);
  }, [prompt.content]);

  // Apply variables to the prompt content
  const applyVariables = () => {
    let content = prompt.content;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });
    return content;
  };

  // Update variable value
  const handleVariableChange = (key: string, value: string) => {
    setVariables({ ...variables, [key]: value });
  };

  const handleTest = async () => {
    setIsLoading(true);
    setError('');
    const content = applyVariables();

    try {
      let response;

      if (llmConfig.provider === 'ollama') {
        response = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: llmConfig.model || 'llama',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: content },
            ],
            options:{
              temperature, // Include temperature in the request
            },
            stream: false,
          }),
        });
      } else if (llmConfig.provider === 'openai') {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${llmConfig.apiKey}`,
          },
          body: JSON.stringify({
            model: llmConfig.model || 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: content },
            ],
            temperature, // Include temperature in the request
            stream: false,
          }),
        });
      } else {
        // Custom provider
        response = await fetch(llmConfig.endpoint || '', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(llmConfig.apiKey ? { Authorization: `Bearer ${llmConfig.apiKey}` } : {}),
          },
          body: JSON.stringify({
            model: llmConfig.model || '',
            messages: [
              { role: 'system', content: systemPrompt || '' },
              { role: 'user', content: content },
            ],
            temperature, // Include temperature in the request
            stream: false,
          }),
        });
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (llmConfig.provider === 'ollama') {
        setResult(data.message?.content || 'No response content received');
      } else {
        setResult(data.choices[0].message.content);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 dark:bg-gray-900 dark:bg-opacity-80">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-3xl max-h-[90vh] flex flex-col dark:bg-gray-800">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className=" font-semibold">
            <span className="text-md text-gray-800 dark:text-gray-200">Test Prompt: </span> <span className="text-xl text-green-700">{prompt.name}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-grow">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* System Prompt Field */}
            <div className="col-span-2">
              <h3 className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">System Prompt</h3>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Enter system instructions for the LLM"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={2}
              />
            </div>

            {/* Temperature Slider */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Temperature</h3>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
                {temperature.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Prompt Content Field */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Prompt Content</h3>
            <textarea
              value={prompt.content}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={4}
            />
          </div>

          {/* Variables Section */}
          {Object.keys(variables).length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Variables</h3>
              <div className="space-y-3">
                {Object.keys(variables).map((varName) => (
                  <div key={varName} className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1 dark:text-gray-400">{`{{${varName}}}`}</label>
                    <input
                      type="text"
                      value={variables[varName]}
                      onChange={(e) => handleVariableChange(varName, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={`Value for ${varName}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <button
              onClick={handleTest}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed "
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send size={18} className="mr-2" />
                  Test Prompt
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md dark:bg-red-900 dark:border-red-800">
              <p className="text-red-600 text-sm dark:text-red-200">{error}</p>
            </div>
          )}

          {result && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Result</h3>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200 max-h-64 overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
                <p className="text-gray-800 whitespace-pre-wrap dark:text-gray-200">{result}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPromptModal;
