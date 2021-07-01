import './setup.js'; 
import app from "./app.js";

const port = process.env.PORT;
const nodeEnv = process.env.NODE_ENV;
app.listen(port, () => console.log(`Server is Running on port ${port} with NODE_ENV ${nodeEnv}`));
