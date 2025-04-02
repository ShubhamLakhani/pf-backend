import swaggerJsdoc, { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Booking API Documentation',
      version: '1.0.0',
      description: 'API documentation for booking',
      contact: {
        name: 'Developer',
        email: 'developer@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3003',
        description: 'Local server',
      },
      {
        url: 'https://per-first-backend.vercel.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          name: 'authorization',
          bearerFormat: 'JWT',
          description:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzgwYjg5NDE0ODEwMDhjYzEyNjQwOWMiLCJpYXQiOjE3MzY1MDE0NjUsImV4cCI6MTczOTA5MzQ2NX0.aodL5JKCbuFn3KaXs7t9TJJSmWwJhi0OWx561prK9I8',
        },
      },
    },
  },
  apis: [
    './dist/routes/*.js' /* Remove if no use */,
    './dist/routes/web/*.js',
    './dist/routes/admin/*.js',
    './src/routes/web/*.ts',
    './src/routes/admin/*.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
