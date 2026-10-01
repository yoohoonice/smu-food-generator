# smu-food-generator

A random generator for food spots near SMU, with filters for preferences, diet, and location.

## App

The frontend uses React, Vite, and TypeScript. Venue data lives in `data/food-spots.ts`; there is no backend or live venue API yet.

The flow has two steps: choose filters, then select **Next** to get a random matching spot. **Back to filters** returns to the first step with the current choices preserved. Cuisine lock categories match the section headers in the source PDF.

The vibe filter groups similar source tags into eight choices: Casual & Convenient, Cozy & Quiet, Lively & Social, Trendy & Stylish, Classic & Local, Healthy & Eco-conscious, Desserts & Treats, and Special Occasion. Original venue tags remain unchanged in the data.

Run `npm install`, then `npm run dev` to start the local app. Use `npm run build` to type-check and create a production build.

## Venue data

`data/food-spots.ts` exports the typed `foodSpots` dataset, transcribed from the source PDF in `data/source`. It contains 100 venues and preserves multiple Google Maps links for venues with multiple listed locations.

The source's venue details and dietary labels have not been independently verified. Walking times are not included because the PDF does not provide estimates from specific SMU hubs.

## Next steps

1. Verify venue details, price tiers, and dietary labels against current sources.
2. Test the dietary filters against the source statuses, especially uncertified options.
3. Add verified walking times only if that feature is brought back into scope.
