# Deployment Guide

## Database Setup

The database migration needs to be applied to your Supabase project:

1. The migration file is located at: `supabase/migrations/001_create_forecast_tables.sql`
2. This creates two tables:
   - `forecast_queries`: Stores user query history
   - `forecast_cache`: Caches weather API responses

## Edge Function Deployment

The weather forecast API is implemented as a Supabase Edge Function:

- **Function Name**: `forecast`
- **Location**: `supabase/functions/forecast/index.ts`
- **Endpoint**: `https://[your-project].supabase.co/functions/v1/forecast`

### Parameters

The function accepts the following query parameters:

- `lat` (required): Latitude (-90 to 90)
- `lon` (required): Longitude (-180 to 180)
- `date` (required): Date in YYYY-MM-DD format

### Example Request

```bash
curl "https://[your-project].supabase.co/functions/v1/forecast?lat=37.7749&lon=-122.4194&date=2025-10-15" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Response Format

```json
{
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "date": "2025-10-15",
  "rainRisk": {
    "probability": 25,
    "level": "low",
    "color": "green",
    "emoji": "☀️"
  },
  "heatRisk": {
    "temperatureMax": 72,
    "temperatureMin": 58,
    "temperatureMaxC": 22,
    "temperatureMinC": 14,
    "level": "low",
    "color": "green",
    "emoji": "😊"
  }
}
```

## Frontend Deployment

The frontend can be deployed to any static hosting service:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Ensure environment variables are configured:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Notes

- The edge function uses the free Open-Meteo API (no API key required)
- Weather data is available for up to 14 days in the future
- API responses are cached in the database to optimize performance
- All queries are logged for analytics purposes
