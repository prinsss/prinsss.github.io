// Hide old posts from homepage (still visible in archives, categories, tags, etc.)
const deadline = '2017-01-01';

hexo.extend.filter.register('after_init', function () {
  const originalGeneratorIndex = hexo.extend.generator.get('index');

  // Wrap and overwrite generators to inject our codes
  hexo.extend.generator.register('index', async function (locals) {
    const fg = originalGeneratorIndex.bind(this);

    return fg(Object.assign({}, locals, {
      posts: locals.posts.filter(post => {
        if (post['date'] === undefined)
          return true;

        // Except posts marked as `hidden: false` explicitly
        return post['date'].isAfter(deadline) || post['hidden'] === false;
      })
    }));
  });

  hexo.log.debug('Initialized wrapper generator for hiding old posts');
});
