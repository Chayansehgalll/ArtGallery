import app from "./app.js";
import { env } from "./config/env.js";

const port = env.port;

app.listen(port, () => {
  console.log(`\n🎨 Yashika Gallery API running on http://localhost:${port}`);
  console.log(`   Environment: ${env.nodeEnv}`);
  console.log(`   Health: http://localhost:${port}/api/health\n`);
});
