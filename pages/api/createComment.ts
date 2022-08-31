import sanityClient from '@sanity/client'
import { NextApiRequest, NextApiResponse } from 'next';

const config = { 
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    useCdn: process.env.NODE_ENV === 'production',
    token: process.env.SANITY_API_TOKEN,
 }

const previewClient = sanityClient(config);

export default async function createComment(req: NextApiRequest, res: NextApiResponse) {
  const { _id, name, email, comment} = JSON.parse(req.body)
  console.log(req.body)
  try {
    await previewClient.create({
      _type: 'comment',
      post: {
        _type: 'reference',
        _ref: _id,
      },
      name,
      email,
      comment
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({message: `Couldn't submit comment`, err})
  }
  return res.status(200).json({ message: 'Comment submitted' })
}