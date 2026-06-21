export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Email Service</h1>
        <p className="text-gray-600 mb-8">
          Send emails via API endpoint
        </p>
        
        <div className="bg-gray-100 p-6 rounded-lg text-left max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">API Endpoint</h2>
          <p className="mb-2"><strong>POST</strong> /api/send-email</p>
          
          <h3 className="text-lg font-semibold mt-4 mb-2">Request Body:</h3>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
{`{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "body": "<h1>Email Content</h1>",
  "isHtml": true
}`}
          </pre>
          
          <h3 className="text-lg font-semibold mt-4 mb-2">Example cURL:</h3>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm">
{`curl -X POST http://localhost:3000/api/send-email \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "recipient@example.com",
    "subject": "Test Email",
    "body": "<h1>Hello!</h1><p>This is a test email.</p>",
    "isHtml": true
  }'`}
          </pre>
        </div>
      </div>
    </main>
  )
}
