import { useState } from 'react';
import { aiApi } from '@/api/ai';
import { SparklesIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AITestComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const testAPI = async () => {
    setIsLoading(true);
    setResponse(null);
    
    try {
      console.log('Testing AI API...');
      
      const testData = {
        title: "Test AI Project",
        description: "This is a test project to verify that our AI features are working correctly. It should analyze this description and provide suggestions.",
        category: "WEB"
      };

      console.log('Sending request:', testData);
      
      const result = await aiApi.analyzeIdea(testData);
      
      console.log('AI API Response:', result);
      setResponse(result);
      toast.success('AI API test successful!');
      
    } catch (error: any) {
      console.error('AI API Error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      toast.error(`AI API test failed: ${error.message}`);
      setResponse({ error: error.message, details: error.response?.data });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <SparklesIcon className="w-5 h-5 mr-2" />
        AI API Test
      </h3>
      
      <button
        type="button"
        onClick={testAPI}
        disabled={isLoading}
        className="btn btn-primary mb-4"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            Testing...
          </>
        ) : (
          'Test AI API'
        )}
      </button>

      {response && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">API Response:</h4>
          <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AITestComponent;