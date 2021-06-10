export default (document) => {
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(`${document}`, 'application/xml');
  const channel = doc.querySelector('channel');
  const title = channel.querySelector('title').textContent;
  const description = channel.querySelector('description').textContent;
  const posts = channel.querySelectorAll('item');
  const postsList = [...posts].map((post) => {
    const pubDate = new Date(post.querySelector('pubDate').textContent);
    const postTitle = post.querySelector('title').textContent;
    const postDescription = post.querySelector('description').textContent;
    const postLink = post.querySelector('link').textContent;
    return {
      pubDate, postTitle, postDescription, postLink,
    };
  });
  return { title, description, postsList };  
};
