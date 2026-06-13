import app from "./app.js";
import { env } from "./config/env.js";

const PORT = env.port || 8080;

app.listen(PORT,"0.0.0.0", () => {
  console.log(`\n🎨 Yashika Gallery API running on http://localhost:${port}`);
  console.log(`   Environment: ${env.nodeEnv}`);
  console.log(`   Health: http://localhost:${port}/api/health\n`);
});
