hexo.config.hide_posts.acl_function_per_post = function (post, generatorName) {
  if (post.date.year() < 2016 && post.hidden !== false) {
    return false;
  }

  return true;
}
