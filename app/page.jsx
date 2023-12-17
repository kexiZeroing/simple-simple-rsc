import React, { Suspense } from 'react';

async function getAll() {
	const response = await fetch('https://jsonplaceholder.typicode.com/posts')
  return await response.json()
}

async function Posts() {
  const posts = await getAll();
  return (
    <ul>
      {posts.map((a) => (
        <li key={a.id}>
          <h3>{a.title}</h3>
          <p>{a.body}</p>
        </li>
      ))}
    </ul>
  );
}

export default async function Page() {
  return (
    <>
      <h1>My Posts</h1>
      <Suspense fallback="Loading data...">
        <Posts />
      </Suspense>
    </>
  );
}
