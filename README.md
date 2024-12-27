Link Prefetch -

1. intent - if hover or focus the link
2. none - if no need to prefetch the link
3. render - if the as soon as the link is visible on the screen
4. intent - if the as soon as the link is in the viewport

Cache Control headers -

1. maxage - cache the data on browser for the given time
2. s-maxage - cache the data on CDN for the given time
3. stale-while-revalidate - cache the data on browser for the given time and revalidate the data in the background

Pre-rendering -

1. Can pre-render the page at build time
2. Can pre-render some slug pages at build time and some at runtime

```
  prerender: ["/", "/blog", "/blog/popular-post"],

  // async function for dependencies like a CMS
  async prerender({ getStaticPaths }) {
    let posts = await fakeGetPostsFromCMS();
    return ["/", "/blog"].concat(
      posts.map((post) => post.href)
    );
  },
```
