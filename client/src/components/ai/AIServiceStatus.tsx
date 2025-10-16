import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface AIServiceStatusProps {
  isAvailable: boolean;
  error?: string;
}

const AIServiceStatus: React.FC<AIServiceStatusProps> = ({ isAvailable, error }) => {
  if (isAvailable) return null;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-amber-700">
            <span className="font-medium">AI Features Unavailable</span>
          </p>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              The AI-powered features require a Google Gemini API key to be configured.
              {error && ` Error: ${error}`}
            </p>
          </div>
          <div className="mt-4">
            <div className="flex">
              <button
                type="button"
                className="bg-amber-100 px-2 py-1.5 rounded-md text-sm font-medium text-amber-800 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                onClick={() => {
                  const setupGuide = `
# AI Features Setup

To enable AI features, you need to:

1. Get a Google Gemini API key from: https://makersuite.google.com/app/apikey
2. Create a .env file in the server folder
3. Add: GEMINI_API_KEY=your_api_key_here
4. Restart the server

See AI_SETUP_GUIDE.md for detailed instructions.
                  `.trim();
                  navigator.clipboard.writeText(setupGuide);
                  alert('Setup instructions copied to clipboard!');
                }}
              >
                Copy Setup Instructions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIServiceStatus;