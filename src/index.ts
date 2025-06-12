import cors from 'cors';
import express, { Request, Response } from 'express';
import { connectDB } from './config/db';
import swaggerJsdoc from './config/swagger';
import routes from './routes';
import dotenv from 'dotenv';
import { bookingModel } from './models';
import mongoose from 'mongoose';

dotenv.config();

const startApp = async () => {
  // Connect to MongoDB
  await connectDB();
  // Create default data
  import('./seeders');
testmodel()
};
startApp();


async function testmodel() {
 const dsy = await bookingModel.aggregate(
  [
  // {
  //   $match: {
  //     _id: new mongoose.Types.ObjectId("683599e983d17d83b45c37f7")
  //   }
  // },
  {
    $lookup: {
      from: "serviceitems",
      localField: "serviceItemId",
      foreignField: "_id",
      as: "serviceItemData"
    }
  },
  {
    $set: {
      amount: {
        $ifNull: [
          { $getField: { field: "discountedAmount", input: { $first: "$serviceItemData" } } },
          0
        ]
      }
    }
  },
  {
    $unset: "serviceItemData"
  },
  {
    $merge: {
      into: "bookings",
      whenMatched: "merge",
      whenNotMatched: "discard"
    }
  }
]
  )
  console.log("🚀 ~ testmodel ~ dsy:", dsy)
  console.log('updst...');
  
}

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS
app.use(cors());

// Parse JSON requests
app.use(express.json({ limit: '50mb'}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Routes
app.use('/api', routes);

// Serve Swagger JSON specification
app.get('/api-docs/swagger.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerJsdoc);
});

// Serve Swagger UI static files
app.get('/api-docs', (_req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Swagger UI</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css">
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = () => {
            const ui = SwaggerUIBundle({
              url: '/api-docs/swagger.json',
              dom_id: '#swagger-ui',
              presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
              layout: 'StandaloneLayout',
            });
          };
        </script>
      </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
