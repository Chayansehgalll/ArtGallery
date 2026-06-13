import app from "./app.js";
import { env } from "./config/env.js";

const PORT = process.env.PORT || env.port || 8080;

app.listen(Number(PORT),"0.0.0.0", () => {
  console.log(`\n🎨 Yashika Gallery API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${env.nodeEnv}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
