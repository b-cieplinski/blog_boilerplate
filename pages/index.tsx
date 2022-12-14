import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Header from '../components/Header'
import { sanityClient, urlFor } from '../sanity'
import { Post } from '../typings'

interface Props {
  posts: [Post]
}

export default function Home ({posts}: Props) {
  console.log(posts)
  return (
    <div className="max-w-7xl mx-auto">
      <Head>
        <title>Medium</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>


    <Header/>
    <div className="flex justify-between items-center bg-yellow-400 border-black border-y py-10 lg:py-0">
<div className="px-10 space-y-5">
<h1 className="text-6xl m-w-xl font-serif"><span className="underline decoration-black decoration-4">Medium</span> is the place to write read and connect</h1>
<h2>
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s when an unknown printer took a galley of type and scrambled it to make a type specimen book.
</h2>
</div>

<div>
    <img className="hidden md:inline-flex h-32 lg:h-full" src="https://images.unsplash.com/photo-1661469900195-a78296678db4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"></img>
</div>
    </div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-2 md:p-6">
{/* Posts */}
{posts.map((post) => (
  <Link key={post._id} href={`/post/${post.slug.current}`}>
    <div className="group border rounded-lg cursor-pointer overflow-hidden">
      <img src={
        urlFor(post.mainImage).url()!
      } alt="" className="h-60 w-full object-cover group-hover:scale-105 transition-transform duration-200 ease-in-out"></img>
      <div className="flex justify-between p-5 bg-white">
        <div>
        <h1 className="text-lg font-bold">{post.title}</h1>
        <p>{post.description} by {post.author.name}</p>
        </div>
        {post.author.image && (
        <img src={urlFor(post.author.image).url()!} className="h-12 w-12 rounded-full "/>
)} 
      </div>

    </div>
  </Link>
))}
</div>
    </div>
  )
}

export const getServerSideProps = async () => {
  const query = `*[_type == "post"]
  {
      _id,
    title,
    author->{
    name,
    image
  },
description,
mainImage,
slug
    
  }`;

  const posts = await sanityClient.fetch(query)

  return {
    props: {
      posts,
    }
  }
}
