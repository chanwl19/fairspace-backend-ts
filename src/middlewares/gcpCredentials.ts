import dotenv from 'dotenv';

dotenv.config();

export default function getGCPCredentials(){
    return process.env.GCP_PRIVATE_KEY
      ? {
          credentials: {
            client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GCP_PRIVATE_KEY?.split(String.raw`\n`).join('\n'),
          },
          projectId: process.env.GCP_PROJECT_ID,
        }
      : {};
  };