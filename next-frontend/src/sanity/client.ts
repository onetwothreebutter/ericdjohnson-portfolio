import { createClient } from 'next-sanity'

console.log('Sanity Client Init - Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
console.log('Sanity Client Init - Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET)

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to false for fresh data during dev, true for prod
})
