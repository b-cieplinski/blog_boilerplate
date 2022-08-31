import { GetStaticProps } from 'next'
import React, { useState } from 'react'
import Header from '../../components/Header'
import { sanityClient, urlFor } from '../../sanity'
import { Post } from '../../typings'
import PortableText from "react-portable-text"
import { useForm, SubmitHandler} from "react-hook-form"

interface Props {
    post: Post;
}

interface IFormInput {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

const Post = ({post}: Props) => {

  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: {errors},} = useForm<IFormInput>()

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    fetch ('/api/createComment', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    .then(() => {
      console.log(data)
      setSubmitted(true)
    })
    .catch((err) => {
    console.log(err)
    setSubmitted(false)

  })
  }

  return (
    <main className="">
        <Header/>

        
        <img src={urlFor(post.mainImage).url()!} className="w-full h-40 object-cover" alt=""/>
        <article className="max-3-xl mx-auto">
        <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
        <h2 className="text-xl font-light text-gray-500 mb-2">{post.description}</h2>
        <div className="flex items-center space-x-2">
          <img src={urlFor(post.author.image).url()!} className="w-10 h-10 object-cover rounded-full"/>
          <p className="text-sm font-extralight">Post by <span className="text-green-600">{post.author.name}</span> - Published at {new Date(post._createdAt).toLocaleString()}</p>
        </div>
<div className="mt-10">

  <PortableText
  dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
  projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
  content={post.body}
  className=""
  serializers={{
            h1: (props: any) => <h1 className="text-xl font-bold" {...props} />,
            h2: (props: any) => <h1 className="text-xl" {...props} />,
            li: ({ children }: any) => <li className="special-list-item">{children}</li>,
            link: ({href ,children }: any) => <a className="special-list-item" href={href}>{children}</a>,
          }}/>
</div>

        </article>
        <hr className="max-w-lg my-5 mx-auto border border-yellow-600"/>

          {submitted ? (
            <div className="flex flex-col py-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto px-4">
              <h1 className="text-3xl font-bold">Thank you for Submitting</h1>
              </div>
          ):(
            <form className="flex flex-col p-5 my-10 max-w-2xl mb-10 mx-auto" onSubmit={handleSubmit(onSubmit)}>

            <input
            {...register("_id")}
            type="hidden"
            name="_id"
            value={post._id}/>
  
  
            <label className="block mb-5 ">
              <span>Name</span>
              <input {...register("name", {required: true})} type="text" placeholder="Your name" className="shadow border rounded py-2 px-3 form-input mt-1 block w-full outline-none focus:ring ring-yellow-500"/>
            </label>
            <label  className="block mb-5 ">
              <span>Email</span>
              <input  {...register("email", {required: true})}  type="text" placeholder="Your name" className="shadow border rounded py-2 px-3 form-input mt-1 block w-full outline-none focus:ring ring-yellow-500"/>
            </label>
            <label  className="block mb-5 ">
              <span>Comment</span>
              <textarea  {...register("comment", {required: true})}  placeholder="Your name" rows={8} className="shadow border rounded py-2 px-3 form-textarea mt-1 block w-full outline-none focus:ring ring-yellow-500"/>
            </label>
  
            {/* errors will return when validation failed */}
            <div className="flex flex-col p-5">
              {errors.name && (
                <span className="text-red-500">- Name field is required</span>
              )}
              
              {errors.name && (
                <span className="text-red-500">- The email must be entered to submit.</span>
              )}
  
              {errors.email && (
                <span className="text-red-500">- The comment must be entered to submit.</span>
              )}
            </div>
  
            <input type="submit" onSubmit={handleSubmit(onSubmit)} className="px-4 py-2 bg-yellow-500 hover:opacity-40 cursor-pointer"/>
          </form>
          )}
    {/* Comments */}
          <div className="flex flex-col p-10 my-10 max-w-2xl mx-auto shadow-yellow-500 shadow space-y-2">
                  <h3 className="text-4xl">Comments</h3>
                  <hr/>
                  {post.comments.map((comment) => (
                    <div className="" key={comment._id}>
                      
                      <p>
                          <span className="text-yellow-500">{comment.name}:</span>
                          {comment.comment}
                      </p>
                    </div>
                  ))}
          </div>


       
    </main>
  )
}

export default Post

export const getStaticPaths = async () => {
    const query = `*[_type == "post"]
    {
        _id,
        slug {
      current
  }    
}`;

  const posts = await sanityClient.fetch(query);

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current
    }
  }))

    return {
      paths,
      fallback: 'blocking',

    }

}

export const getStaticProps: GetStaticProps = async ({params}) => {
  const query = `*[_type == "post" && slug.current  == $slug][0]{
    _id,
    _createdAt,
    title,
    author-> {
    name,
    image
  },
  'comments': *[
    _type == "comment" &&
    post._ref == ^._id &&
    approved == true
  ],
  description,
  mainImage,
  slug,
  body
  }`

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  })

    if (!post) { 
      return {
        notFound: true
      }
    }

    return {
      props: {
        post,
        revalidate: 1800, // after 60 sec it will update the old cached version
      }
    }

}