export default function DeploymentTest() {
  const timestamp = new Date().toISOString();
  
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">🚀 Deployment Test</h1>
        <div className="bg-green-900/20 border border-green-600 p-4 rounded">
          <p className="text-green-400">
            <strong>Build Time:</strong> {timestamp}
          </p>
          <p className="text-green-400 mt-2">
            If you can see this page, the latest code is deployed!
          </p>
        </div>
        
        <div className="mt-8 bg-blue-900/20 border border-blue-600 p-4 rounded">
          <h2 className="text-blue-400 font-bold mb-2">Profile Page Debug Status:</h2>
          <p className="text-blue-100">
            The profile page should now show a red debug box with user information.
          </p>
          <p className="text-blue-100 mt-2">
            <strong>Test URL:</strong> <code>/people/68cc0104c0499850b09f1672</code>
          </p>
        </div>
      </div>
    </div>
  );
}