import app from "./app.js";

const port = 4000;
const nodeEnv = process.env.NODE_ENV;
app.listen(port, () => console.log(`Server is Running on port ${port} with NOVE_ENV ${nodeEnv}`));
